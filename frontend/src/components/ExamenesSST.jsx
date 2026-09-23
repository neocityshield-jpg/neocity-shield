import { useState, useEffect } from 'react';
import { examenService } from '../services/api';

const ESTADO_INFO = {
  vigente:              { color: 'var(--teal)',  dim: 'var(--teal-dim)', border: 'rgba(62,207,181,0.3)', label: 'Vigente' },
  proximo_a_vencer:     { color: 'var(--gold)',  dim: 'var(--gold-dim)', border: 'var(--rim-accent)',    label: 'Próximo a vencer' },
  vencido:              { color: 'var(--ember)', dim: 'var(--ember-dim)', border: 'rgba(224,92,58,0.3)', label: 'Vencido' },
  pendiente_validacion: { color: 'rgba(240,232,210,0.6)', dim: 'var(--surface-2)', border: 'var(--rim)', label: 'Pendiente de validación' },
  rechazado:            { color: 'var(--ember)', dim: 'var(--ember-dim)', border: 'rgba(224,92,58,0.3)', label: 'Rechazado' }
};

// Calcula el estado "real" de vigencia a partir de la fecha_proximo,
// salvo que aún esté pendiente de validación por SGSST.
function calcularEstado(examen) {
  if (examen.estado === 'pendiente_validacion') return 'pendiente_validacion';
  if (examen.estado === 'rechazado') return 'rechazado';
  const dias = Math.ceil((new Date(examen.fecha_proximo) - new Date()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'vencido';
  if (dias <= 30) return 'proximo_a_vencer';
  return 'vigente';
}

export default function ExamenesSST() {
  const [todos, setTodos]             = useState([]);
  const [filtrados, setFiltrados]     = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [seleccionado, setSeleccionado] = useState(null);
  const [resultado, setResultado]     = useState('apto');
  const [guardando, setGuardando]     = useState(false);

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    let data = [...todos];
    if (filtroEstado !== 'all') {
      data = data.filter(e => calcularEstado(e) === filtroEstado);
    }
    if (busqueda) {
      const b = busqueda.toLowerCase();
      data = data.filter(e =>
        e.funcionario?.toLowerCase().includes(b) ||
        e.email?.toLowerCase().includes(b) ||
        e.tipo_examen?.toLowerCase().includes(b)
      );
    }
    setFiltrados(data);
  }, [todos, filtroEstado, busqueda]);

  const cargar = async () => {
    try {
      const res = await examenService.listarTodos();
      setTodos(res.data);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = (ex) => {
    setSeleccionado(ex);
    setResultado(ex.resultado || 'apto');
  };

  const cerrarDetalle = () => setSeleccionado(null);

  const validar = async (estadoNuevo) => {
    setGuardando(true);
    try {
      await examenService.validar(seleccionado.id, { estado: estadoNuevo, resultado });
      await cargar();
      cerrarDetalle();
    } catch {
      alert('Error al validar el examen');
    } finally {
      setGuardando(false);
    }
  };

  // Contadores rápidos para el resumen de arriba
  const resumen = todos.reduce((acc, e) => {
    const est = calcularEstado(e);
    acc[est] = (acc[est] || 0) + 1;
    return acc;
  }, {});

  if (cargando) {
    return <div className="page-bg"><div className="dashboard">Cargando exámenes...</div></div>;
  }

  return (
    <div className="page-bg">
      <div className="dashboard">

        {/* Título */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', fontFamily: 'var(--font-d)' }}>
            Exámenes ocupacionales
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(240,232,210,0.45)', marginTop: '4px' }}>
            Control de exámenes de ingreso, periódicos y de egreso de todo el personal
          </div>
        </div>

        {/* Resumen tipo KPI */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {['pendiente_validacion', 'vigente', 'proximo_a_vencer', 'vencido'].map(key => (
            <div key={key} style={{
              flex: '1 1 150px', padding: '14px 18px', borderRadius: '14px',
              background: ESTADO_INFO[key].dim, border: `1px solid ${ESTADO_INFO[key].border}`
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: ESTADO_INFO[key].color, fontFamily: 'var(--font-d)' }}>
                {resumen[key] || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(240,232,210,0.55)', marginTop: '2px' }}>
                {ESTADO_INFO[key].label}
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            placeholder="Buscar por funcionario, correo o tipo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              flex: '1 1 260px', padding: '10px 14px', borderRadius: '10px',
              background: 'var(--surface-2)', border: '1px solid var(--rim)', color: 'var(--cream)'
            }}
          />
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '10px',
              background: 'var(--surface-2)', border: '1px solid var(--rim)', color: 'var(--cream)'
            }}
          >
            <option value="all" style={{ background: '#0e1424', color: '#f0e8d2' }}>Todos los estados</option>
            <option value="pendiente_validacion" style={{ background: '#0e1424', color: '#f0e8d2' }}>Pendiente de validación</option>
            <option value="vigente" style={{ background: '#0e1424', color: '#f0e8d2' }}>Vigente</option>
            <option value="proximo_a_vencer" style={{ background: '#0e1424', color: '#f0e8d2' }}>Próximo a vencer</option>
            <option value="vencido" style={{ background: '#0e1424', color: '#f0e8d2' }}>Vencido</option>
            <option value="rechazado" style={{ background: '#0e1424', color: '#f0e8d2' }}>Rechazado</option>
          </select>
        </div>

        {/* Tabla */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--rim)' }}>
          {filtrados.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(240,232,210,0.4)', background: 'var(--surface-2)' }}>
              No hay exámenes que coincidan con el filtro.
            </div>
          )}
          {filtrados.map(ex => {
            const estado = calcularEstado(ex);
            return (
              <div
                key={ex.id}
                onClick={() => abrirDetalle(ex)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: 'var(--surface-2)',
                  borderBottom: '1px solid var(--rim)', cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cream)' }}>
                    {ex.funcionario}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(240,232,210,0.45)' }}>
                    {ex.tipo_examen} · realizado {new Date(ex.fecha_realizacion).toLocaleDateString('es-CO')} · próximo {new Date(ex.fecha_proximo).toLocaleDateString('es-CO')}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px',
                  color: ESTADO_INFO[estado].color, background: ESTADO_INFO[estado].dim,
                  border: `1px solid ${ESTADO_INFO[estado].border}`, textTransform: 'uppercase', letterSpacing: '.4px'
                }}>
                  {ESTADO_INFO[estado].label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal de validación */}
        {seleccionado && (
          <div
            onClick={cerrarDetalle}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(5,9,22,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--surface)', border: '1px solid var(--rim-accent)', borderRadius: '18px',
                padding: '24px', maxWidth: '420px', width: '100%'
              }}
            >
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cream)', marginBottom: '4px', fontFamily: 'var(--font-d)' }}>
                {seleccionado.funcionario}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(240,232,210,0.5)', marginBottom: '18px' }}>
                {seleccionado.email}
              </div>

              <div style={{ fontSize: '13px', color: 'rgba(240,232,210,0.6)', marginBottom: '14px', lineHeight: 1.6 }}>
                Tipo: <b style={{ color: 'var(--cream)' }}>{seleccionado.tipo_examen}</b><br />
                Fecha realizada: <b style={{ color: 'var(--cream)' }}>{new Date(seleccionado.fecha_realizacion).toLocaleDateString('es-CO')}</b><br />
                Próximo vencimiento: <b style={{ color: 'var(--cream)' }}>{new Date(seleccionado.fecha_proximo).toLocaleDateString('es-CO')}</b>
                {seleccionado.soporte_url && (
                  <><br />Soporte: <a href={seleccionado.soporte_url} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>ver documento</a></>
                )}
              </div>

              <label style={{ fontSize: '13px', color: 'rgba(240,232,210,0.6)', display: 'block', marginBottom: '18px' }}>
                Resultado del examen
                                <select
                  value={resultado}
                  onChange={e => setResultado(e.target.value)}
                  style={{
                    display: 'block', width: '100%', marginTop: '6px', padding: '10px', borderRadius: '8px',
                    background: 'var(--surface-2)', color: 'var(--cream)', border: '1px solid var(--rim)'
                  }}
                >
                  <option value="apto" style={{ background: '#0e1424', color: '#f0e8d2' }}>Apto</option>
                  <option value="apto_con_recomendaciones" style={{ background: '#0e1424', color: '#f0e8d2' }}>Apto con recomendaciones</option>
                  <option value="no_apto" style={{ background: '#0e1424', color: '#f0e8d2' }}>No apto</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={guardando}
                  onClick={() => validar('vigente')}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
                    background: 'var(--teal)', color: '#04140f', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {guardando ? 'Guardando...' : 'Validar'}
                </button>
                <button
                  disabled={guardando}
                  onClick={() => validar('rechazado')}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(224,92,58,0.3)',
                    background: 'var(--ember-dim)', color: 'var(--ember)', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Rechazar
                </button>
              </div>
              <button
                onClick={cerrarDetalle}
                style={{ marginTop: '10px', width: '100%', padding: '9px', borderRadius: '10px', border: '1px solid var(--rim)', background: 'transparent', color: 'rgba(240,232,210,0.5)', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
