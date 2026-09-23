import { useState, useEffect } from 'react';
import { examenService } from '../services/api';

const ESTADO_INFO = {
  vigente:               { color: 'var(--teal)',  label: 'Vigente' },
  proximo_a_vencer:      { color: 'var(--gold)',  label: 'Próximo a vencer' },
  vencido:               { color: 'var(--ember)', label: 'Vencido' },
  pendiente_validacion:  { color: 'rgba(240,232,210,0.4)', label: 'Pendiente de validación' },
  rechazado:             { color: 'var(--ember)', label: 'Rechazado por SGSST' }
};

function calcularVigencia(fecha_proximo) {
  const hoy = new Date();
  const limite = new Date(fecha_proximo);
  const dias = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'vencido';
  if (dias <= 30) return 'proximo_a_vencer';
  return 'vigente';
}

export default function MisExamenes() {
  const [examenes, setExamenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ tipo_examen: 'ingreso', fecha_realizacion: '', periodicidad_meses: 12, soporte_url: '' });
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    examenService.misExamenes().then(res => setExamenes(res.data)).finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const ultimo = examenes[0];
  const vigenciaUltimo = ultimo && ultimo.estado !== 'pendiente_validacion'
    ? calcularVigencia(ultimo.fecha_proximo)
    : ultimo?.estado;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await examenService.crear(form);
      setMostrarForm(false);
      setForm({ tipo_examen: 'ingreso', fecha_realizacion: '', periodicidad_meses: 12, soporte_url: '' });
      cargar();
    } catch {
      alert('No se pudo registrar el examen. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="page-bg"><div className="dashboard">Cargando...</div></div>;

  return (
    <div className="page-bg">
      <div className="dashboard">

        {/* Estado actual */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--rim-accent)', borderRadius: '20px',
          padding: '24px 28px', marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(240,232,210,0.5)', fontFamily: 'var(--font-b)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>
            Examen ocupacional — estado actual
          </div>
          {ultimo ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: ESTADO_INFO[vigenciaUltimo]?.color || 'var(--cream)'
                }} />
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cream)', fontFamily: 'var(--font-d)' }}>
                  {ESTADO_INFO[vigenciaUltimo]?.label || vigenciaUltimo}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(240,232,210,0.5)' }}>
                Última vez realizado: {new Date(ultimo.fecha_realizacion).toLocaleDateString('es-CO')} ·
                {' '}Próximo: {new Date(ultimo.fecha_proximo).toLocaleDateString('es-CO')}
              </div>
            </>
          ) : (
            <div style={{ color: 'rgba(240,232,210,0.5)', fontSize: '14px' }}>
              No tienes exámenes ocupacionales registrados todavía.
            </div>
          )}
          <button onClick={() => setMostrarForm(v => !v)} style={{
            marginTop: '16px', padding: '10px 20px', borderRadius: '10px',
            border: '1px solid var(--rim-accent)', background: 'var(--gold-dim)',
            color: 'var(--gold)', fontFamily: 'var(--font-b)', fontSize: '14px', cursor: 'pointer'
          }}>
            {mostrarForm ? 'Cancelar' : '+ Reportar examen realizado'}
          </button>
        </div>

        {/* Formulario de auto-reporte */}
        {mostrarForm && (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--surface-2)', border: '1px solid var(--rim)', borderRadius: '16px',
            padding: '20px', marginBottom: '20px', display: 'grid', gap: '14px'
          }}>
            <label style={{ fontSize: '13px', color: 'rgba(240,232,210,0.6)' }}>
              Tipo de examen
              <select value={form.tipo_examen} onChange={e => setForm({ ...form, tipo_examen: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--cream)', border: '1px solid var(--rim)' }}>
                <option value="ingreso" style={{ background: '#0e1424', color: '#f0e8d2' }}>Ingreso</option>
                <option value="periodico" style={{ background: '#0e1424', color: '#f0e8d2' }}>Periódico</option>
                <option value="egreso" style={{ background: '#0e1424', color: '#f0e8d2' }}>Egreso</option>
              </select>
            </label>
            <label style={{ fontSize: '13px', color: 'rgba(240,232,210,0.6)' }}>
              Fecha en que se realizó
              <input type="date" required value={form.fecha_realizacion}
                onChange={e => setForm({ ...form, fecha_realizacion: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--cream)', border: '1px solid var(--rim)' }} />
            </label>
            <label style={{ fontSize: '13px', color: 'rgba(240,232,210,0.6)' }}>
              Enlace al soporte / certificado (opcional)
              <input type="url" value={form.soporte_url}
                onChange={e => setForm({ ...form, soporte_url: e.target.value })}
                placeholder="https://..."
                style={{ display: 'block', width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px', background: 'var(--surface)', color: 'var(--cream)', border: '1px solid var(--rim)' }} />
            </label>
            <button type="submit" disabled={enviando} style={{
              padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--teal)',
              color: '#04140f', fontWeight: 700, fontFamily: 'var(--font-b)', cursor: 'pointer'
            }}>
              {enviando ? 'Enviando...' : 'Enviar para validación de SGSST'}
            </button>
          </form>
        )}

        {/* Historial */}
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cream)', marginBottom: '10px', fontFamily: 'var(--font-d)' }}>
          Historial
        </div>
        {examenes.map(ex => {
          const vig = ex.estado !== 'pendiente_validacion' ? calcularVigencia(ex.fecha_proximo) : ex.estado;
          return (
            <div key={ex.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)',
              border: '1px solid var(--rim)', marginBottom: '8px'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--cream)', fontWeight: 600 }}>
                  {ex.tipo_examen.charAt(0).toUpperCase() + ex.tipo_examen.slice(1)}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(240,232,210,0.45)' }}>
                  {new Date(ex.fecha_realizacion).toLocaleDateString('es-CO')} → próximo {new Date(ex.fecha_proximo).toLocaleDateString('es-CO')}
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: ESTADO_INFO[vig]?.color }}>
                {ESTADO_INFO[vig]?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
