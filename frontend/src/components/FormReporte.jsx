import { useState, useEffect, useRef } from 'react';
import { incidenteService } from '../services/api';

const TIPOS_INCIDENTE = [
  'Hurto / raponazo', 'Intento de hurto', 'Caída en instalaciones',
  'Caída en zona periférica', 'Agresión física', 'Amenaza verbal', 'Otro'
];

export default function FormReporte() {
  const [form, setForm] = useState({
    tipo_incidente: '', descripcion: '', fecha_ocurrencia: '',
    direccion_manual: '', latitud: null, longitud: null
  });
  const [geoStatus, setGeoStatus]       = useState('idle');
  const [direccionGPS, setDireccionGPS] = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [exito, setExito]               = useState(false);
  const [error, setError]               = useState('');
  const mapRef                          = useRef(null);
  const mapInstanceRef                  = useRef(null);
  const markerRef                       = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script    = document.createElement('script');
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload   = () => initMap(4.7110, -74.0721);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const initMap = (lat, lng) => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L   = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    mapInstanceRef.current = map;
  };

  const updateMarker = (lat, lng) => {
    const L = window.L;
    if (!mapInstanceRef.current || !L) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    mapInstanceRef.current.setView([lat, lng], 17);
  };

  const captGeo = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setError('Tu dispositivo no soporta geolocalización.');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setForm(f => ({ ...f, latitud: lat, longitud: lng }));
        updateMarker(lat, lng);

        try {
          // Usar coordenadas reales — NO hardcodeadas
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`,
            {
              headers: {
                'Accept-Language': 'es',
                'User-Agent': 'NeoCity-Shield/1.0'
              }
            }
          );
          const data = await res.json();

          // Construir dirección corta y legible
          const addr = data.address || {};
          const partes = [
            addr.road || addr.pedestrian || addr.footway,
            addr.house_number,
            addr.suburb || addr.neighbourhood || addr.quarter,
            addr.city || addr.town || addr.municipality
          ].filter(Boolean);

          const dirCorta = partes.length > 0
            ? partes.join(', ')
            : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          setDireccionGPS(dirCorta);
          setForm(f => ({ ...f, direccion_manual: dirCorta }));
        } catch {
          const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setDireccionGPS(fallback);
          setForm(f => ({ ...f, direccion_manual: fallback }));
        }
        setGeoStatus('ok');
      },
      (err) => {
        setGeoStatus('error');
        setError(
          err.code === 1
            ? 'Permiso de ubicación denegado. Ingresa la dirección manualmente.'
            : 'No se pudo obtener la ubicación. Intenta de nuevo.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await incidenteService.crear(form);
      setExito(true);
      setForm({
        tipo_incidente: '', descripcion: '', fecha_ocurrencia: '',
        direccion_manual: '', latitud: null, longitud: null
      });
      setDireccionGPS('');
      setGeoStatus('idle');
    } catch {
      setError('Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) return (
    <div className="page-bg">
      <div className="exito-container">
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
        <h2>¡Reporte enviado!</h2>
        <p>El SGSST fue notificado de inmediato. Tu reporte tiene trazabilidad completa en NeoCity Shield.</p>
        <button onClick={() => setExito(false)}>Nuevo reporte</button>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <div className="form-container">
        <h2>📋 Reportar Incidente</h2>

        <form onSubmit={handleSubmit}>
          <label>Tipo de incidente *</label>
          <div className="type-chips">
            {TIPOS_INCIDENTE.map(t => (
              <div
                key={t}
                className={`tchip${form.tipo_incidente === t ? ' on' : ''}`}
                onClick={() => setForm({ ...form, tipo_incidente: t })}
              >
                {t}
              </div>
            ))}
          </div>

          <label>Fecha y hora del incidente *</label>
          <input
            type="datetime-local"
            className="fc-input"
            value={form.fecha_ocurrencia}
            onChange={e => setForm({ ...form, fecha_ocurrencia: e.target.value })}
            required
          />

          <label>Descripción *</label>
          <textarea
            className="fc-textarea"
            placeholder="Describe brevemente qué ocurrió..."
            value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            required
          />

          <label>Ubicación</label>

          <div
            ref={mapRef}
            style={{
              height: '200px', borderRadius: '14px', marginBottom: '12px',
              border: '1px solid var(--rim)', overflow: 'hidden'
            }}
          />

          <button
            type="button"
            className="geo-btn"
            onClick={captGeo}
            disabled={geoStatus === 'loading'}
          >
            {geoStatus === 'loading'
              ? '⏳ Obteniendo ubicación...'
              : '📍 Usar mi ubicación actual'}
          </button>

          {geoStatus === 'ok' && (
            <div className="geo-resultado">
              <span>✅</span>
              <div>
                <div style={{
                  fontWeight: 700, fontSize: '13px',
                  color: 'var(--teal)', marginBottom: '3px'
                }}>
                  Ubicación capturada
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(240,232,210,0.6)' }}>
                  {direccionGPS}
                </div>
              </div>
            </div>
          )}

          {geoStatus === 'error' && (
            <div className="login-error" style={{ marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <label style={{ marginTop: '8px' }}>
            O ingresa la dirección manualmente
          </label>
          <input
            type="text"
            className="fc-input"
            placeholder="Ej: Cra 14A #42-11, Bogotá"
            value={form.direccion_manual}
            onChange={e => setForm({ ...form, direccion_manual: e.target.value })}
          />

          {error && geoStatus !== 'error' && (
            <div className="login-error">{error}</div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar reporte al SGSST →'}
          </button>
        </form>
      </div>
    </div>
  );
}
