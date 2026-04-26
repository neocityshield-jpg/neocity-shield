import { useState, useEffect } from 'react';
import { incidenteService, sstService } from '../services/api';
import API from '../services/api';

const ESTADO_COLOR = {
  pendiente:  { color:'var(--gold)',  dim:'var(--gold-dim)',  border:'var(--rim-accent)', label:'Pendiente' },
  en_gestion: { color:'var(--teal)',  dim:'var(--teal-dim)',  border:'rgba(62,207,181,0.3)', label:'En gestión' },
  cerrado:    { color:'rgba(240,232,210,0.35)', dim:'var(--surface-2)', border:'var(--rim)', label:'Cerrado' }
};

export default function PanelSST() {
  const [todos, setTodos]               = useState([]);
  const [filtrados, setFiltrados]       = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [busqueda, setBusqueda]         = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [fechaDesde, setFechaDesde]     = useState('');
  const [fechaHasta, setFechaHasta]     = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [historial, setHistorial]       = useState([]);
  const [tab, setTab]                   = useState('seguimiento'); // seguimiento | historial
  const [seguimiento, setSeguimiento]   = useState({ observacion:'', estado_nuevo:'' });
  const [guardando, setGuardando]       = useState(false);
  const [exportando, setExportando]     = useState(false);

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    let data = [...todos];
    if (filtroEstado !== 'all') data = data.filter(i => i.estado === filtroEstado);
    if (busqueda) {
      const b = busqueda.toLowerCase();
      data = data.filter(i =>
        i.tipo_incidente?.toLowerCase().includes(b) ||
        i.funcionario?.toLowerCase().includes(b) ||
        i.descripcion?.toLowerCase().includes(b) ||
        i.direccion_manual?.toLowerCase().includes(b)
      );
    }
    if (fechaDesde) data = data.filter(i => new Date(i.fecha_registro) >= new Date(fechaDesde));
    if (fechaHasta) data = data.filter(i => new Date(i.fecha_registro) <= new Date(fechaHasta + 'T23:59:59'));
    setFiltrados(data);
  }, [todos, filtroEstado, busqueda, fechaDesde, fechaHasta]);

  const cargar = async () => {
    try {
      const res = await incidenteService.listarTodos();
      setTodos(res.data);
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = async (inc) => {
    setSeleccionado(inc);
    setTab('seguimiento');
    setSeguimiento({ observacion:'', estado_nuevo:'' });
    try {
      const res = await sstService.historial(inc.id);
      setHistorial(res.data);
    } catch { setHistorial([]); }
  };

  const registrar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await sstService.registrarSeguimiento({
        incidente_id: seleccionado.id,
        ...seguimiento
      });
      await cargar();
      const res = await sstService.historial(seleccionado.id);
      setHistorial(res.data);
      setSeguimiento({ observacion:'', estado_nuevo:'' });
      setTab('historial');
    } catch {
      alert('Error al registrar seguimiento');
    } finally {
      setGuardando(false);
    }
  };

  const exportarPDF = async (inc) => {
    setExportando(inc.id);
    if (!window.jspdf) {
      await new Promise((res,rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload=res; s.onerror=rej; document.body.appendChild(s);
      });
      await new Promise((res,rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        s.onload=res; s.onerror=rej; document.body.appendChild(s);
      });
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });

    // Header
    doc.setFillColor(8,12,31);
    doc.rect(0,0,210,36,'F');
    doc.setTextColor(201,184,120);
    doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('NeoCity Shield — Caso #' + inc.id, 15, 16);
    doc.setFontSize(10); doc.setTextColor(200,200,200);
    doc.text(`Generado: ${fecha} · Evidencia Digital S.A.S.`, 15, 28);

    // Datos del incidente
    doc.setTextColor(0,0,0);
    doc.setFontSize(13); doc.setFont('helvetica','bold');
    doc.text('Datos del incidente', 15, 50);
    doc.autoTable({
      startY: 55,
      head: [['Campo','Valor']],
      body: [
        ['Tipo', inc.tipo_incidente || '—'],
        ['Funcionario', inc.funcionario || '—'],
        ['Fecha del incidente', inc.fecha_ocurrencia ? new Date(inc.fecha_ocurrencia).toLocaleString('es-CO') : '—'],
        ['Fecha de registro', new Date(inc.fecha_registro).toLocaleString('es-CO')],
        ['Estado', inc.estado],
        ['Ubicación', inc.direccion_manual || `${inc.latitud}, ${inc.longitud}` || '—'],
        ['Descripción', inc.descripcion || '—'],
      ],
      headStyles:{ fillColor:[201,184,120], textColor:[26,20,0], fontStyle:'bold' },
      alternateRowStyles:{ fillColor:[248,246,240] },
      styles:{ fontSize:10, cellPadding:4 },
      columnStyles:{ 0:{ fontStyle:'bold', cellWidth:50 }, 1:{ cellWidth:130 } }
    });

    // Historial
    let hist = historial;
    if (!hist.length) {
      try {
        const r = await sstService.historial(inc.id);
        hist = r.data;
      } catch {}
    }
    if (hist.length > 0) {
      doc.setFontSize(13); doc.setFont('helvetica','bold');
      doc.text('Historial de seguimientos', 15, doc.lastAutoTable.finalY + 16);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Fecha','Responsable','Estado','Observación']],
        body: hist.map(h => [
          new Date(h.fecha_accion).toLocaleString('es-CO'),
          h.responsable_sgsst || '—',
          h.estado_nuevo,
          h.observacion
        ]),
        headStyles:{ fillColor:[62,207,181], textColor:[4,26,21], fontStyle:'bold' },
        alternateRowStyles:{ fillColor:[240,252,249] },
        styles:{ fontSize:9, cellPadding:3 },
        columnStyles:{ 3:{ cellWidth:70 } }
      });
    }

    // Footer
    doc.setFontSize(8); doc.setTextColor(150,150,150);
    doc.text('NeoCity Shield · Evidencia Digital S.A.S. · Documento generado automáticamente', 15, 288);
    doc.save(`caso-${inc.id}-${inc.tipo_incidente?.replace(/\s+/g,'-')}.pdf`);
    setExportando(null);
  };

  const urgentes = todos.filter(i => i.estado === 'pendiente').length;

  if (cargando) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--ink)', color:'var(--cream)' }}>
      Cargando panel...
    </div>
  );

  return (
    <div className="page-bg">
      <div className="panel-sst">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'8px' }}>
          <div>
            <h2>🔒 Panel SGSST</h2>
            <div className="dash-live" style={{ marginBottom:0 }}>
              <div className="live-dot"></div>
              {todos.length} casos · {urgentes} pendientes
            </div>
          </div>
        </div>

        {/* Alerta urgentes */}
        {urgentes > 0 && (
          <div className="alertas-banner" style={{ marginTop:'16px' }}>
            ⚠️ <span><strong>{urgentes} incidente{urgentes > 1 ? 's' : ''}</strong> pendiente{urgentes > 1 ? 's' : ''} de atención</span>
          </div>
        )}

        {/* Buscador */}
        <div style={{ position:'relative', marginBottom:'14px' }}>
          <span style={{
            position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)',
            fontSize:'16px', pointerEvents:'none'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por funcionario, tipo de incidente, descripción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width:'100%', padding:'12px 16px 12px 42px',
              background:'var(--surface)', border:'1px solid var(--rim)',
              borderRadius:'12px', fontSize:'14px', color:'var(--cream)',
              fontFamily:'var(--font-b)', outline:'none', transition:'all .2s'
            }}
            onFocus={e => e.target.style.borderColor='var(--gold)'}
            onBlur={e => e.target.style.borderColor='var(--rim)'}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:'16px' }}
            >✕</button>
          )}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap', alignItems:'center' }}>
          {['all','pendiente','en_gestion','cerrado'].map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`fchip${filtroEstado===e ? ' on' : ''}`}
            >
              {e==='all' ? `Todos (${todos.length})` : e==='pendiente' ? `Pendientes (${todos.filter(i=>i.estado==='pendiente').length})` : e==='en_gestion' ? `En gestión (${todos.filter(i=>i.estado==='en_gestion').length})` : `Cerrados (${todos.filter(i=>i.estado==='cerrado').length})`}
            </button>
          ))}
        </div>

        {/* Filtro fechas */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'12px', color:'rgba(240,232,210,0.4)', fontWeight:600, fontFamily:'var(--font-b)' }}>DESDE</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              style={{
                padding:'8px 12px', background:'var(--surface)', border:'1px solid var(--rim)',
                borderRadius:'10px', fontSize:'13px', color:'var(--cream)',
                fontFamily:'var(--font-b)', outline:'none'
              }}
            />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'12px', color:'rgba(240,232,210,0.4)', fontWeight:600, fontFamily:'var(--font-b)' }}>HASTA</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              style={{
                padding:'8px 12px', background:'var(--surface)', border:'1px solid var(--rim)',
                borderRadius:'10px', fontSize:'13px', color:'var(--cream)',
                fontFamily:'var(--font-b)', outline:'none'
              }}
            />
          </div>
          {(fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
              style={{
                padding:'8px 14px', borderRadius:'10px', background:'var(--ember-dim)',
                border:'1px solid rgba(224,92,58,0.2)', color:'var(--ember)',
                fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'var(--font-b)'
              }}
            >✕ Limpiar fechas</button>
          )}
        </div>

        {/* Resultados */}
        {filtrados.length === 0 ? (
          <div style={{
            textAlign:'center', padding:'60px 20px',
            background:'var(--surface)', borderRadius:'18px', border:'1px solid var(--rim)'
          }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔍</div>
            <div style={{ color:'var(--cream)', fontSize:'16px', fontWeight:700, fontFamily:'var(--font-d)', marginBottom:'6px' }}>Sin resultados</div>
            <div style={{ color:'rgba(240,232,210,0.4)', fontSize:'14px' }}>Intenta con otros filtros o términos de búsqueda</div>
          </div>
        ) : (
          <div className="incidentes-lista">
            {filtrados.map(inc => {
              const est = ESTADO_COLOR[inc.estado] || ESTADO_COLOR.pendiente;
              const tiempoResp = inc.fecha_registro && inc.fecha_ocurrencia
                ? Math.round((new Date(inc.fecha_registro) - new Date(inc.fecha_ocurrencia)) / 60000)
                : null;
              return (
                <div
                  key={inc.id}
                  className={`incidente-card ${inc.estado === 'pendiente' ? 'pend' : inc.estado === 'en_gestion' ? 'mgmt' : 'done'}`}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                    <span style={{
                      padding:'3px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:700,
                      background: est.dim, color: est.color, border:`1px solid ${est.border}`,
                      fontFamily:'var(--font-b)', textTransform:'uppercase', letterSpacing:'.5px'
                    }}>
                      {est.label}
                    </span>
                    <span style={{ fontSize:'11px', color:'rgba(240,232,210,0.3)', fontFamily:'var(--font-m)' }}>
                      #{inc.id}
                    </span>
                  </div>

                  <h4>{inc.tipo_incidente}</h4>

                  <p><strong>👷 Funcionario:</strong> {inc.funcionario}</p>
                  <p><strong>📅 Reportado:</strong> {new Date(inc.fecha_registro).toLocaleString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                  {inc.direccion_manual && <p><strong>📍</strong> {inc.direccion_manual}</p>}
                  <p style={{ marginTop:'6px' }}>{inc.descripcion}</p>

                  {tiempoResp !== null && tiempoResp >= 0 && (
                    <div style={{
                      marginTop:'10px', padding:'6px 10px', borderRadius:'8px',
                      background: tiempoResp <= 10 ? 'var(--teal-dim)' : tiempoResp <= 60 ? 'var(--gold-dim)' : 'var(--ember-dim)',
                      border: `1px solid ${tiempoResp <= 10 ? 'rgba(62,207,181,0.2)' : tiempoResp <= 60 ? 'var(--rim-accent)' : 'rgba(224,92,58,0.2)'}`,
                      fontSize:'11px', fontWeight:600,
                      color: tiempoResp <= 10 ? 'var(--teal)' : tiempoResp <= 60 ? 'var(--gold)' : 'var(--ember)',
                      display:'flex', alignItems:'center', gap:'6px'
                    }}>
                      ⏱️ Tiempo de reporte: {tiempoResp < 60 ? `${tiempoResp} min` : `${Math.floor(tiempoResp/60)}h ${tiempoResp%60}min`}
                    </div>
                  )}

                  <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
                    <button
                      onClick={() => abrirDetalle(inc)}
                      className="btn-gestionar"
                      style={{ flex:1 }}
                    >
                      Gestionar caso
                    </button>
                    <button
                      onClick={() => exportarPDF(inc)}
                      disabled={exportando === inc.id}
                      style={{
                        padding:'9px 14px', borderRadius:'var(--r-md)',
                        background:'var(--gold-dim)', border:'1px solid var(--rim-accent)',
                        color:'var(--gold-light)', fontSize:'13px', fontWeight:700,
                        cursor:'pointer', fontFamily:'var(--font-b)', transition:'.2s',
                        whiteSpace:'nowrap'
                      }}
                    >
                      {exportando === inc.id ? '⏳' : '⬇️ PDF'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {seleccionado && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setSeleccionado(null)}>
          <div className="modal" style={{ maxWidth:'560px', maxHeight:'85vh', overflowY:'auto' }}>

            {/* Header modal */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
              <h3>Caso #{seleccionado.id}</h3>
              <button
                onClick={() => setSeleccionado(null)}
                style={{ background:'none', border:'none', color:'rgba(240,232,210,0.4)', cursor:'pointer', fontSize:'18px' }}
              >✕</button>
            </div>
            <p style={{ marginBottom:'16px' }}>{seleccionado.tipo_incidente} · {seleccionado.funcionario}</p>

            {/* Tabs */}
            <div style={{ display:'flex', gap:'6px', marginBottom:'20px', borderBottom:'1px solid var(--rim)', paddingBottom:'12px' }}>
              {['seguimiento','historial'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding:'7px 16px', borderRadius:'10px', border:'none',
                    background: tab===t ? 'var(--gold-dim)' : 'none',
                    color: tab===t ? 'var(--gold-light)' : 'rgba(240,232,210,0.4)',
                    fontWeight:700, fontSize:'13px', cursor:'pointer',
                    fontFamily:'var(--font-b)',
                    borderBottom: tab===t ? '2px solid var(--gold)' : '2px solid transparent'
                  }}
                >
                  {t==='seguimiento' ? '📝 Nuevo seguimiento' : `📋 Historial (${historial.length})`}
                </button>
              ))}
            </div>

            {/* Tab: nuevo seguimiento */}
            {tab==='seguimiento' && (
              <form onSubmit={registrar}>
                <div style={{ marginBottom:'14px' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(240,232,210,0.3)', textTransform:'uppercase', letterSpacing:'1px', fontFamily:'var(--font-b)', marginBottom:'8px' }}>
                    Nuevo estado
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    {['pendiente','en_gestion','cerrado'].map(e => {
                      const est = ESTADO_COLOR[e];
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setSeguimiento(s => ({ ...s, estado_nuevo:e }))}
                          style={{
                            padding:'10px', borderRadius:'10px',
                            border:`1px solid ${seguimiento.estado_nuevo===e ? est.border : 'var(--rim)'}`,
                            background: seguimiento.estado_nuevo===e ? est.dim : 'var(--surface-2)',
                            color: seguimiento.estado_nuevo===e ? est.color : 'rgba(240,232,210,0.4)',
                            fontWeight:700, fontSize:'12px', cursor:'pointer',
                            fontFamily:'var(--font-b)', transition:'all .2s'
                          }}
                        >
                          {est.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(240,232,210,0.3)', textTransform:'uppercase', letterSpacing:'1px', fontFamily:'var(--font-b)', marginBottom:'8px' }}>
                    Observaciones *
                  </div>
                  <textarea
                    className="modal"
                    style={{
                      width:'100%', padding:'12px', background:'var(--surface-2)',
                      border:'1px solid var(--rim)', borderRadius:'12px',
                      fontSize:'14px', color:'var(--cream)', fontFamily:'var(--font-b)',
                      outline:'none', resize:'vertical', minHeight:'100px'
                    }}
                    placeholder="Describe las acciones tomadas, hallazgos y próximos pasos..."
                    value={seguimiento.observacion}
                    onChange={e => setSeguimiento(s => ({ ...s, observacion:e.target.value }))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={guardando || !seguimiento.estado_nuevo}
                >
                  {guardando ? 'Guardando...' : 'Registrar seguimiento'}
                </button>
              </form>
            )}

            {/* Tab: historial */}
            {tab==='historial' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {historial.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px', color:'rgba(240,232,210,0.35)', fontSize:'14px' }}>
                    Sin seguimientos registrados aún
                  </div>
                ) : (
                  historial.map((h, i) => {
                    const est = ESTADO_COLOR[h.estado_nuevo] || ESTADO_COLOR.pendiente;
                    return (
                      <div key={h.id} style={{
                        display:'flex', gap:'12px',
                        padding:'14px', borderRadius:'12px',
                        background:'var(--surface-2)', border:'1px solid var(--rim)',
                        position:'relative'
                      }}>
                        {/* Línea de tiempo */}
                        {i < historial.length-1 && (
                          <div style={{
                            position:'absolute', left:'22px', top:'48px', bottom:'-12px',
                            width:'2px', background:'var(--rim)'
                          }} />
                        )}
                        <div style={{
                          width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                          background: est.dim, border:`1px solid ${est.border}`,
                          marginTop:'2px'
                        }} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                            <span style={{
                              fontSize:'10px', fontWeight:700, textTransform:'uppercase',
                              letterSpacing:'.5px', color: est.color, fontFamily:'var(--font-b)'
                            }}>
                              → {est.label}
                            </span>
                            <span style={{ fontSize:'11px', color:'rgba(240,232,210,0.25)', fontFamily:'var(--font-m)' }}>
                              {new Date(h.fecha_accion).toLocaleString('es-CO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </span>
                          </div>
                          <div style={{ fontSize:'13px', color:'rgba(240,232,210,0.7)', lineHeight:1.5, marginBottom:'6px' }}>
                            {h.observacion}
                          </div>
                          <div style={{ fontSize:'11px', color:'rgba(240,232,210,0.3)' }}>
                            👤 {h.responsable_sgsst}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
