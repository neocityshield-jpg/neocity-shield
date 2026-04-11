import { useState, useEffect } from 'react';
import { incidenteService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MiPerfil() {
  const [reportes, setReportes]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [tabActiva, setTabActiva] = useState('stats');
  const { usuario, logout }       = useAuth();
  const navigate                  = useNavigate();

  useEffect(() => {
    incidenteService.misReportes()
      .then(res => setReportes(res.data))
      .finally(() => setCargando(false));
  }, []);

  const total      = reportes.length;
  const cerrados   = reportes.filter(r => r.estado==='cerrado').length;
  const pendientes = reportes.filter(r => r.estado==='pendiente').length;
  const enGestion  = reportes.filter(r => r.estado==='en_gestion').length;

  const porTipo = reportes.reduce((acc, r) => {
    const key = r.tipo_incidente || 'Sin tipo';
    acc[key] = (acc[key]||0) + 1;
    return acc;
  }, {});
  const maxTipo = Math.max(...Object.values(porTipo), 1);

  const ESTADO_COLOR = {
    pendiente:  { color:'var(--gold)',   label:'Pendiente' },
    en_gestion: { color:'var(--teal)',   label:'En gestión' },
    cerrado:    { color:'rgba(240,232,210,0.35)', label:'Cerrado' }
  };

  const iniciales = usuario?.nombre?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'US';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="page-bg">
      <div className="dashboard">

        {/* Hero */}
        <div style={{
          background:'linear-gradient(135deg,rgba(201,184,120,0.08),rgba(62,207,181,0.05))',
          border:'1px solid var(--rim-accent)', borderRadius:'20px',
          padding:'28px 32px', marginBottom:'20px', position:'relative', overflow:'hidden'
        }}>
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'150px', height:'150px', borderRadius:'50%', background:'radial-gradient(rgba(201,184,120,0.1),transparent)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <div style={{
              width:'68px', height:'68px', borderRadius:'18px',
              background:'var(--gold-dim)', border:'1px solid var(--rim-accent)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'22px', fontWeight:900, fontFamily:'var(--font-d)',
              color:'var(--gold-light)', flexShrink:0
            }}>
              {iniciales}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'22px', fontWeight:700, color:'var(--cream)', fontFamily:'var(--font-d)', letterSpacing:'-.2px' }}>
                {usuario?.nombre}
              </div>
              <div style={{ fontSize:'13px', color:'rgba(240,232,210,0.4)', marginTop:'3px', fontWeight:300 }}>
                {usuario?.email}
              </div>
              <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'5px',
                  padding:'4px 12px', borderRadius:'20px',
                  background:'var(--teal-dim)', border:'1px solid rgba(62,207,181,0.2)',
                  fontSize:'11px', fontWeight:700, color:'var(--teal)',
                  fontFamily:'var(--font-b)', textTransform:'uppercase', letterSpacing:'.5px'
                }}>
                  {usuario?.rol === 'funcionario' ? '👷 Funcionario' : usuario?.rol === 'sgsst' ? '🔒 SGSST' : '📊 Gerencia'}
                </span>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'5px',
                  padding:'4px 12px', borderRadius:'20px',
                  background:'var(--surface-2)', border:'1px solid var(--rim)',
                  fontSize:'11px', fontWeight:600, color:'rgba(240,232,210,0.4)',
                  fontFamily:'var(--font-m)'
                }}>
                  Evidencia Digital S.A.S.
                </span>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              padding:'9px 18px', borderRadius:'12px',
              background:'var(--ember-dim)', border:'1px solid rgba(224,92,58,0.2)',
              color:'var(--ember)', fontSize:'13px', fontWeight:700,
              cursor:'pointer', fontFamily:'var(--font-b)', flexShrink:0
            }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { num:total,      label:'Total reportes',  color:'var(--cream)' },
            { num:pendientes, label:'Pendientes',      color:'var(--gold)' },
            { num:enGestion,  label:'En gestión',      color:'var(--teal)' },
            { num:cerrados,   label:'Resueltos',       color:'rgba(240,232,210,0.4)' },
          ].map((s,i) => (
            <div key={i} style={{
              background:'var(--surface)', border:'1px solid var(--rim)',
              borderRadius:'16px', padding:'20px 16px', textAlign:'center',
              transition:'all .25s', cursor:'default',
              position:'relative', overflow:'hidden'
            }}>
              <div style={{
                position:'absolute', bottom:0, left:0, right:0, height:'2px',
                background:`linear-gradient(90deg,${s.color},transparent)`
              }} />
              <div style={{
                fontSize:'32px', fontWeight:700, letterSpacing:'-1px',
                color: s.color, fontFamily:'var(--font-d)', lineHeight:1, marginBottom:'6px'
              }}>{s.num}</div>
              <div style={{ fontSize:'10px', color:'rgba(240,232,210,0.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px', fontFamily:'var(--font-b)' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px', borderBottom:'1px solid var(--rim)', paddingBottom:'12px' }}>
          {[
            { id:'stats',    label:'📊 Estadísticas' },
            { id:'historial',label:'📋 Mis reportes' },
            { id:'config',   label:'⚙️ Configuración' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTabActiva(t.id)}
              style={{
                padding:'8px 18px', borderRadius:'10px', border:'none',
                background: tabActiva===t.id ? 'var(--gold-dim)' : 'none',
                color: tabActiva===t.id ? 'var(--gold-light)' : 'rgba(240,232,210,0.4)',
                fontWeight:700, fontSize:'13px', cursor:'pointer',
                fontFamily:'var(--font-b)', transition:'all .2s',
                borderBottom: tabActiva===t.id ? '2px solid var(--gold)' : '2px solid transparent'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab estadísticas */}
        {tabActiva==='stats' && (
          <div>
            {Object.keys(porTipo).length > 0 ? (
              <div style={{
                background:'var(--surface)', border:'1px solid var(--rim)',
                borderRadius:'16px', padding:'24px', marginBottom:'16px'
              }}>
                <h3 style={{ fontFamily:'var(--font-d)', fontSize:'16px', color:'var(--cream)', marginBottom:'20px', fontWeight:700 }}>
                  Mis incidentes por tipo
                </h3>
                {Object.entries(porTipo).sort((a,b)=>b[1]-a[1]).map(([tipo,count]) => (
                  <div key={tipo} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                    <span style={{ fontSize:'13px', color:'rgba(240,232,210,0.5)', fontWeight:300, minWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {tipo}
                    </span>
                    <div style={{ flex:1, height:'6px', background:'var(--surface-3)', borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:'4px',
                        background:'linear-gradient(90deg,var(--gold),var(--teal))',
                        width:`${(count/maxTipo)*100}%`,
                        transition:'width .8s cubic-bezier(.4,0,.2,1)'
                      }} />
                    </div>
                    <span style={{ fontSize:'13px', fontWeight:800, color:'var(--gold-light)', fontFamily:'var(--font-d)', minWidth:'20px' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign:'center', padding:'48px',
                background:'var(--surface)', borderRadius:'16px', border:'1px solid var(--rim)'
              }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
                <div style={{ color:'var(--cream)', fontSize:'16px', fontWeight:700, fontFamily:'var(--font-d)', marginBottom:'6px' }}>
                  Aún no tienes reportes
                </div>
                <div style={{ color:'rgba(240,232,210,0.4)', fontSize:'14px', fontWeight:300 }}>
                  Cuando reportes tu primer incidente aparecerá aquí
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab historial */}
        {tabActiva==='historial' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {cargando && <div style={{ color:'rgba(240,232,210,0.4)', padding:'20px', textAlign:'center' }}>Cargando...</div>}
            {!cargando && reportes.length === 0 && (
              <div style={{ textAlign:'center', padding:'48px', background:'var(--surface)', borderRadius:'16px', border:'1px solid var(--rim)' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
                <div style={{ color:'var(--cream)', fontSize:'16px', fontWeight:700, fontFamily:'var(--font-d)' }}>Sin reportes</div>
              </div>
            )}
            {reportes.map(r => {
              const est = ESTADO_COLOR[r.estado] || ESTADO_COLOR.pendiente;
              return (
                <div key={r.id} style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  padding:'16px 18px',
                  background:'var(--surface)', border:'1px solid var(--rim)',
                  borderRadius:'14px', transition:'all .2s'
                }}>
                  <div style={{
                    width:'10px', height:'10px', borderRadius:'50%',
                    background: est.color, flexShrink:0,
                    boxShadow:`0 0 8px ${est.color}`
                  }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'var(--cream)', fontFamily:'var(--font-d)', marginBottom:'4px' }}>
                      {r.tipo_incidente}
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(240,232,210,0.35)', fontWeight:300, display:'flex', gap:'12px', flexWrap:'wrap' }}>
                      <span>📅 {new Date(r.fecha_registro).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}</span>
                      {r.direccion_manual && <span>📍 {r.direccion_manual.split(',').slice(0,2).join(',')}</span>}
                    </div>
                  </div>
                  <span style={{
                    padding:'4px 12px', borderRadius:'20px', fontSize:'10px',
                    fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px',
                    background:`${est.color}18`, color: est.color,
                    border:`1px solid ${est.color}33`, fontFamily:'var(--font-b)'
                  }}>
                    {est.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab configuración */}
        {tabActiva==='config' && (
          <div style={{
            background:'var(--surface)', border:'1px solid var(--rim)',
            borderRadius:'16px', overflow:'hidden'
          }}>
            {[
              { icon:'🔔', label:'Notificaciones push', sub:'Recibir alertas en tiempo real', action:() => alert('Disponible próximamente') },
              { icon:'🔄', label:'Sincronizar datos', sub:'Actualizar información del servidor', action:() => window.location.reload() },
              { icon:'🌙', label:'Versión del sistema', sub:'NeoCity Shield v1.0 — Evidencia Digital S.A.S.', action:null },
            ].map((item, i, arr) => (
              <div
                key={i}
                onClick={item.action || undefined}
                style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  padding:'16px 20px',
                  borderBottom: i < arr.length-1 ? '1px solid var(--rim)' : 'none',
                  cursor: item.action ? 'pointer' : 'default',
                  transition:'background .15s'
                }}
                onMouseEnter={e => item.action && (e.currentTarget.style.background='var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background='transparent')}
              >
                <span style={{ fontSize:'20px', width:'24px', textAlign:'center' }}>{item.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'var(--cream)', fontFamily:'var(--font-d)' }}>{item.label}</div>
                  <div style={{ fontSize:'12px', color:'rgba(240,232,210,0.35)', fontWeight:300, marginTop:'2px' }}>{item.sub}</div>
                </div>
                {item.action && <span style={{ color:'rgba(240,232,210,0.25)', fontSize:'14px' }}>›</span>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
