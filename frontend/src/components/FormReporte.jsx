import { useState, useEffect, useRef } from 'react';
import { incidenteService } from '../services/api';

const TIPOS_INCIDENTE = [
  'Hurto / raponazo', 'Intento de hurto', 'Caída en instalaciones',
  'Caída en zona periférica', 'Agresión física', 'Amenaza verbal', 'Otro'
];

// 🔥 NUEVO — PERÍMETRO
const LAT_OFICINA = 4.6590;
const LNG_OFICINA = -74.0930;
const RADIO_MAX_KM = 0.1; // 100 metros

const distanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

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

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);

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

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const initMap = (lat, lng) => {
    if (mapInstanceRef.current || !mapRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: true })
      .setView([lat, lng], 13);

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

  // 🔥 FUNCIÓN MODIFICADA CON PERÍMETRO
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

        // 🔥 VALIDACIÓN DE DISTANCIA
        const dist = distanciaKm(lat, lng, LAT_OFICINA, LNG_OFICINA);

        if (dist > RADIO_MAX_KM) {
          setGeoStatus('error');
          setError(
            `Estás a ${(dist*1000).toFixed(0)}m de las instalaciones. ` +
            `Solo se aceptan reportes dentro de 100m. Ingresa la dirección manualmente.`
          );
          return;
        }

        setForm(f => ({ ...f, latitud: lat, longitud: lng }));
        updateMarker(lat, lng);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
            {
              headers: {
                'Accept-Language': 'es',
                'User-Agent': 'NeoCity-Shield/1.0'
              }
            }
          );

          const data = await res.json();
          const addr = data.address || {};

          const partes = [
            addr.road || addr.pedestrian,
            addr.house_number,
            addr.neighbourhood || addr.suburb,
            addr.city_district,
            addr.city || addr.town,
            addr.state,
            addr.postcode
          ].filter(Boolean);

          const dirCompleta =
            partes.join(', ') ||
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setDireccionGPS(dirCompleta);
          setForm(f => ({ ...f, direccion_manual: dirCompleta }));

        } catch {
          setDireccionGPS(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }

        setGeoStatus('ok');
      },
      (err) => {
        setGeoStatus('error');
        setError(
          err.code === 1
            ? 'Permiso denegado. Ingresa la dirección manualmente.'
            : 'No se pudo obtener la ubicación.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
        <p>El SGSST fue notificado de inmediato.</p>
        <button onClick={() => setExito(false)}>Nuevo reporte</button>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <div className="form-container">
        <h2>📋 Reportar Incidente</h2>

        <form onSubmit={handleSubmit}>
          {/* resto igual... */}
          <button type="button" onClick={captGeo}>
            📍 Usar mi ubicación actual
          </button>

          {geoStatus === 'error' && (
            <div className="login-error">{error}</div>
          )}

          <button type="submit">
            {enviando ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}
