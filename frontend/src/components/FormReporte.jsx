import { useState, useEffect, useRef } from 'react';
import { incidenteService } from '../services/api';

const TIPOS_INCIDENTE = [
  'Hurto / raponazo','Intento de hurto','Caída en instalaciones',
  'Caída en zona periférica','Agresión física','Amenaza verbal','Otro'
];

export default function FormReporte() {
  const [form, setForm] = useState({
    tipo_incidente:'', descripcion:'', fecha_ocurrencia:'',
    direccion_manual:'', latitud:null, longitud:null
  });
  const [geoStatus, setGeoStatus]   = useState('idle'); // idle | loading | ok | error
  const [direccionGPS, setDireccionGPS] = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [exito, setExito]           = useState(false);
  const [error, setError]           = useState('');
  const mapRef                      = useRef(null);
  const markerRef                   = useRef(null);
  const mapInstanceRef              = useRef(null);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap(4.7110, -74.0721);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const initMap = (lat, lng) => {
    if (mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    mapInstanceRef.current = map;
  };

  const updateMapMarker = (lat, lng) => {
    const L = window.L;
    if (!mapInstanceRef.current || !L) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="font-size:28px;transform:translate(-50%,-100%)">📍</div>',
        iconSize: [0,0]
      })
    }).addTo(mapInstanceRef.current);
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
        const { latitude: lat, longitude: lng } = pos.coords;
        setForm(f => ({ ...f, latitud: lat, longitud: lng }));
        updateMapMarker(lat, lng);

        // Reverse geocoding con Nominatim (gratuito)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const data = await res.json();
          const dir = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setDireccionGPS(dir);
          setForm(f => ({ ...f, direccion_manual: dir }));
        } catch {
          setDireccionGPS(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        setGeoStatus('ok');
      },
      () => {
        setGeoStatus('error');
        setError('No se pudo obtener la ubicación.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await incidenteService.crear(form);
      setExito(true);
      setForm({ tipo_incidente:'', descripcion:'', fecha_ocurrencia:'',
                direccion_manual:'', latitud:null, longitud:null });
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
        <h2>✅ Reporte enviado exitosamente</h2>
        <p>El SGSST ha sido notificado. Tu reporte tiene trazabilidad completa.</p>
        <button onClick={() => setExito(false)}>Nuevo reporte</button>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <div className="form-container">
        <h2>📋 Reportar Incidente de Seguridad</h2>

        <form onSubmit={handleSubmit}>
          <label>Tipo de incidente *</label>
          <select
            className="fc-select"
            value={form.tipo_incidente}
            onChange={e => setForm({ ...form, tipo_incidente: e.target.value })}
            required
          >
            <option value="">Selecciona...</option>
            {TIPOS_INCIDENTE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

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

          {/* Mapa en tiempo real */}
          <div
            ref={mapRef}
            style={{
              height:'220px', borderRadius:'12px', marginBottom:'12px',
              border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden'
            }}
          />

          <button type="button" className="geo-btn" onClick={captGeo} disabled={geoStatus==='loading'}>
            {geoStatus==='loading' ? '⏳ Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
          </button>

          {geoStatus === 'ok' && (
            <div className="geo-resultado">
              <span>✅</span>
              <div>
                <div style={{fontWeight:600,fontSize:'13px',color:'#00e676'}}>Ubicación capturada</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)',marginTop:'3px'}}>{direccionGPS}</div>
              </div>
            </div>
          )}

          <label style={{marginTop:'10px'}}>O ingresa la dirección manualmente</label>
          <input
            type="text"
            className="fc-input"
            placeholder="Ej: Cra 14A #42-11, Bogotá"
            value={form.direccion_manual}
            onChange={e => setForm({ ...form, direccion_manual: e.target.value })}
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar reporte al SGSST →'}
          </button>
        </form>
      </div>
    </div>
  );
}
