import { useState } from 'react';
import { incidenteService } from '../services/api';

const TIPOS_INCIDENTE = [
  'Hurto / raponazo',
  'Intento de hurto',
  'Caída en instalaciones',
  'Caída en zona periférica',
  'Agresión física',
  'Amenaza verbal',
  'Otro'
];

export default function FormReporte() {
  const [form, setForm] = useState({
    tipo_incidente:   '',
    descripcion:      '',
    fecha_ocurrencia: '',
    direccion_manual: '',
    latitud:          null,
    longitud:         null
  });
  const [ubicacionCargando, setUbicacionCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito]       = useState(false);
  const [error, setError]       = useState('');

  const capturarUbicacion = () => {
    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización. Ingresa la dirección manualmente.');
      return;
    }
    setUbicacionCargando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, latitud: pos.coords.latitude, longitud: pos.coords.longitude }));
        setUbicacionCargando(false);
      },
      () => {
        setError('No se pudo obtener tu ubicación. Ingresa la dirección manualmente.');
        setUbicacionCargando(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await incidenteService.crear(form);
      setExito(true);
      setForm({ tipo_incidente:'', descripcion:'', fecha_ocurrencia:'', direccion_manual:'', latitud:null, longitud:null });
    } catch {
      setError('Error al enviar el reporte. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) return (
    <div className="exito-container">
      <h2>✅ Reporte enviado exitosamente</h2>
      <p>El SGSST ha sido notificado. Tu reporte tiene trazabilidad completa en el sistema.</p>
      <button onClick={() => setExito(false)}>Nuevo reporte</button>
    </div>
  );

  return (
    <div className="form-container">
      <h2>📋 Reportar Incidente de Seguridad</h2>
      <form onSubmit={handleSubmit}>
        <label>Tipo de incidente *</label>
        <select
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
          value={form.fecha_ocurrencia}
          onChange={e => setForm({ ...form, fecha_ocurrencia: e.target.value })}
          required
        />

        <label>Descripción del incidente *</label>
        <textarea
          placeholder="Describe brevemente qué ocurrió..."
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          rows={4}
          required
        />

        <label>Ubicación</label>
        <button type="button" onClick={capturarUbicacion} disabled={ubicacionCargando}>
          {ubicacionCargando ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
        </button>
        {form.latitud && <p className="ubicacion-ok">✅ Ubicación capturada</p>}

        <input
          type="text"
          placeholder="O ingresa la dirección manualmente"
          value={form.direccion_manual}
          onChange={e => setForm({ ...form, direccion_manual: e.target.value })}
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </form>
    </div>
  );
}
