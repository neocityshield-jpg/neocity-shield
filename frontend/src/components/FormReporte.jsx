import { useState, useEffect, useRef } from 'react';
import { incidenteService } from '../services/api';

const CATEGORIAS = [
  {
    id: 'accidente',
    label: '🏗️ Accidente de trabajo',
    color: 'var(--ember)',
    colorDim: 'rgba(224,92,58,0.12)',
    colorBorder: 'rgba(224,92,58,0.3)',
    tipos: [
      'Caída de altura',
      'Caída al mismo nivel',
      'Golpe o choque con objeto',
      'Atrapamiento',
      'Sobreesfuerzo físico',
      'Contacto con electricidad',
      'Quemadura',
      'Herida o corte',
      'Accidente de tránsito',
    ]
  },
  {
    id: 'seguridad',
    label: '🔒 Incidente de seguridad',
    color: 'var(--gold)',
    colorDim: 'var(--gold-dim)',
    colorBorder: 'var(--rim-accent)',
    tipos: [
      'Hurto / raponazo',
      'Intento de hurto',
      'Agresión física',
      'Amenaza verbal',
      'Presencia de persona sospechosa',
    ]
  },
  {
    id: 'enfermedad',
    label: '🏥 Enfermedad laboral',
    color: 'var(--teal)',
    colorDim: 'var(--teal-dim)',
    colorBorder: 'rgba(62,207,181,0.3)',
    tipos: [
      'Estrés o fatiga',
      'Lesión por movimiento repetitivo',
      'Dolor lumbar o muscular',
    ]
  },
  {
    id: 'otro',
    label: '📋 Otro',
    color: 'rgba(240,232,210,0.5)',
    colorDim: 'var(--surface-2)',
    colorBorder: 'var(--rim-2)',
    tipos: [
      'Casi accidente (sin lesión)',
      'Daño a equipos o instalaciones',
      'Otro',
    ]
  }
];

const LAT_OFICINA = 4.6590;
const LNG_OFICINA = -74.0930;
const RADIO_MAX_KM = 0.1;

const distanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function FormReporte() {
  const [form, setForm] = useState({
    tipo_incidente: '', descripcion: '', fecha_ocurrencia: '',
    direccion_manual: '', latitud: null, longitud: null
  });
  const [categoriaAbierta, setCategoriaAbierta] = useState(null);
  const [geoStatus, setGeoStatus]   = useState('idle');
  const [direccionGPS, setDireccionGPS] = useState('');
  const [enviando, setEnviando]     = useState(false);
  const [exito, setExito]           = useState(false);
  const [error, setError]           = useState('');
  const mapRef                      = useRef(null);
  const mapInstanceRef              = useRef(null);
  const markerRef                   = useRef(null);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap(4.7110, -74.0721);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const initMap = (lat, lng) => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;
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

  const selTipo = (cat, tipo) => {
    const valor = `${cat.label.replace(/^.{2} /, '')} — ${tipo}`;
    setForm(f => ({ ...f, tipo_incidente: valor }));
    setCategoriaAbierta(null);
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
        const dist = distanciaKm(lat, lng, LAT_OFICINA, LNG_OFICINA);
        if (dist > RADIO_MAX_KM) {
          setGeoStatus('error');
          setError(`Estás a ${(dist * 1000).toFixed(0)}m de las instalaciones. Solo se aceptan reportes dentro de 100m. Ingresa la dirección manualmente.`);
          return;
        }
        setForm(f => ({ ...f, latitud: lat, longitud: lng }));
        updateMarker(lat, lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
            { headers: { 'Accept-Language': 'es', 'User-Agent': 'NeoCity-Shield/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const partes = [addr.road || addr.pedestrian, addr.house_number, addr.neighbourhood || addr.suburb, addr.city_district, addr.city || addr.town, addr.state, addr.postcode].filter(Boolean);
          const dir = partes.join(', ') || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setDireccionGPS(dir);
          setForm(f => ({ ...f, direccion_manual: dir }));
        } catch {
          setDireccionGPS(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        setGeoStatus('ok');
      },
      (err) => {
        setGeoStatus('error');
        setError(err.code === 1 ? 'Permiso denegado. Ingresa la dirección manualmente.' : 'No se pudo obtener la ubicación.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true); setError('');
    try {
      await incidenteService.crear(form);
      setExito(true);
      setForm({ tipo_incidente: '', descripcion: '', fecha_ocurrencia: '', direccion_manual: '', latitud: null, longitud: null });
      setDireccionGPS(''); setGeoStatus('idle');
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

  const catSeleccionada = CATEGORIAS.find(c =>
    form.tipo_incidente.startsWith(c.label.replace(/^.{2} /, ''))
  );

  return (
    <div className="page-bg">
      <div className="form-container">
        <h2>📋 Reportar Incidente</h2>

        <form onSubmit={handleSubmit}>

          {/* PASO 1 — Tipo */}
          <div style={{ marginBottom: '24px' }}>
            <label>Paso 1 — Tipo de incidente *</label>

            {/* Categorías */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaAbierta(categoriaAbierta === cat.id ? null : cat.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${categoriaAbierta === cat.id || catSeleccionada?.id === cat.id ? cat.colorBorder : 'var(--rim)'}`,
                    background: categoriaAbierta === cat.id || catSeleccionada?.id === cat.id ? cat.colorDim : 'var(--surface)',
                    color: categoriaAbierta === cat.id || catSeleccionada?.id === cat.id ? cat.color : 'rgba(240,232,210,0.5)',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'var(--font-b)', textAlign: 'left',
                    transition: 'all .2s', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '8px'
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>
                    {categoriaAbierta === cat.id ? '▲' : '▼'}
                  </span>
                </button>
              ))}
            </div>

            {/* Tipos de la categoría abierta */}
            {categoriaAbierta && (() => {
              const cat = CATEGORIAS.find(c => c.id === categoriaAbierta);
              return (
                <div style={{
                  background: 'var(--surface-2)', border: `1px solid ${cat.colorBorder}`,
                  borderRadius: '12px', padding: '14px', display: 'flex',
                  flexWrap: 'wrap', gap: '8px', animation: 'fadeUp .2s ease'
                }}>
                  {cat.tipos.map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => selTipo(cat, tipo)}
                      style={{
                        padding: '7px 14px', borderRadius: '20px',
                        border: `1px solid ${cat.colorBorder}`,
                        background: form.tipo_incidente.includes(tipo) ? cat.colorDim : 'transparent',
                        color: form.tipo_incidente.includes(tipo) ? cat.color : 'rgba(240,232,210,0.6)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'var(--font-b)', transition: 'all .15s'
                      }}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Selección actual */}
            {form.tipo_incidente && (
              <div style={{
                marginTop: '10px', padding: '10px 14px', borderRadius: '10px',
                background: catSeleccionada?.colorDim || 'var(--surface-2)',
                border: `1px solid ${catSeleccionada?.colorBorder || 'var(--rim)'}`,
                fontSize: '13px', color: catSeleccionada?.color || 'var(--cream)',
                fontWeight: 600, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>✓ {form.tipo_incidente}</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipo_incidente: '' }))}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '14px', opacity: 0.6 }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* PASO 2 — Detalles */}
<div style={{ marginBottom: '24px' }}>
  <label>Paso 2 — ¿Cuándo ocurrió? *</label>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
    {/* Fecha */}
    <div>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'rgba(240,232,210,0.3)',
        textTransform: 'uppercase', letterSpacing: '1px',
        fontFamily: 'var(--font-b)', marginBottom: '8px'
      }}>
        📅 Fecha
      </div>
      <input
        type="date"
        className="fc-input"
        style={{ marginBottom: 0 }}
        value={form.fecha_ocurrencia ? form.fecha_ocurrencia.split('T')[0] : ''}
        max={new Date().toISOString().split('T')[0]}
        onChange={e => {
          const hora = form.fecha_ocurrencia ? form.fecha_ocurrencia.split('T')[1] : '00:00';
          setForm({ ...form, fecha_ocurrencia: `${e.target.value}T${hora}` });
        }}
        required
      />
    </div>

    {/* Hora */}
    <div>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'rgba(240,232,210,0.3)',
        textTransform: 'uppercase', letterSpacing: '1px',
        fontFamily: 'var(--font-b)', marginBottom: '8px'
      }}>
        🕐 Hora
      </div>
      <input
        type="time"
        className="fc-input"
        style={{ marginBottom: 0 }}
        value={form.fecha_ocurrencia ? form.fecha_ocurrencia.split('T')[1] || '' : ''}
        onChange={e => {
          const fecha = form.fecha_ocurrencia ? form.fecha_ocurrencia.split('T')[0] : new Date().toISOString().split('T')[0];
          setForm({ ...form, fecha_ocurrencia: `${fecha}T${e.target.value}` });
        }}
        required
      />
    </div>
  </div>

  {/* Botón "ahora" */}
  <button
    type="button"
    onClick={() => {
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora  = now.toTimeString().slice(0, 5);
      setForm({ ...form, fecha_ocurrencia: `${fecha}T${hora}` });
    }}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 16px', borderRadius: '10px',
      background: 'var(--surface-2)', border: '1px solid var(--rim)',
      color: 'rgba(240,232,210,0.5)', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', fontFamily: 'var(--font-b)', transition: 'all .2s',
      marginBottom: '20px'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rim)'; e.currentTarget.style.color = 'rgba(240,232,210,0.5)'; }}
  >
    ⚡ Usar fecha y hora actual
  </button>

          {/* PASO 3 — Ubicación */}
          <div style={{ marginBottom: '24px' }}>
            <label>Paso 3 — Ubicación del incidente</label>
            <div ref={mapRef} style={{ height: '200px', borderRadius: '14px', marginBottom: '12px', border: '1px solid var(--rim)', overflow: 'hidden' }} />

            <button type="button" className="geo-btn" onClick={captGeo} disabled={geoStatus === 'loading'}>
              {geoStatus === 'loading' ? '⏳ Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
            </button>

            {geoStatus === 'ok' && (
              <div className="geo-resultado">
                <span>✅</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--teal)', marginBottom: '3px' }}>Ubicación capturada</div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,232,210,0.6)' }}>{direccionGPS}</div>
                </div>
              </div>
            )}

            {geoStatus === 'error' && (
              <div className="login-error" style={{ marginBottom: '12px' }}>{error}</div>
            )}

            <label style={{ marginTop: '8px' }}>O ingresa la dirección manualmente</label>
            <input
              type="text"
              className="fc-input"
              placeholder="Ej: Cra 14A #42-11, Bogotá"
              value={form.direccion_manual}
              onChange={e => setForm({ ...form, direccion_manual: e.target.value })}
            />
          </div>

          {error && geoStatus !== 'error' && <div className="login-error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={enviando || !form.tipo_incidente}>
            {enviando ? 'Enviando...' : 'Enviar reporte al SGSST →'}
          </button>

        </form>
      </div>
    </div>
  );
}
