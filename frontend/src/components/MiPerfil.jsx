import { useState, useEffect } from 'react';
import { incidenteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MiPerfil() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario, logout }     = useAuth();

  useEffect(() => {
    incidenteService.misReportes()
      .then(res => setReportes(res.data))
      .finally(() => setCargando(false));
  }, []);

  const total     = reportes.length;
  const cerrados  = reportes.filter(r => r.estado === 'cerrado').length;
  const pendientes= reportes.filter(r => r.estado === 'pendiente').length;
  const enGestion = reportes.filter(r => r.estado === 'en_gestion').length;

  // Contar por tipo
  const porTipo = reportes.reduce((acc, r) => {
    acc[r.tipo_incidente] = (acc[r.tipo_incidente] || 0) + 1;
    return acc;
  }, {});

  const maxTipo = Math.max(...Object.values(porTipo), 1);

  const ESTADO_COLOR = {
    pendiente: 'var(--gold)',
    en_gestion: 'var(--teal)',
    cerrado: 'rgba(240,232,210,0.3)'
  };
  const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    en_gestion: 'En gestión',
    cerrado: 'Cerrado'
  };

  return (
    <div className="page-bg">
      <div className="dashboard">

        {/* Hero perfil */}
        <div style={{
          background:'linear-gradient(135deg,rgba(201,184,120,0.1),rgba(62,207,181,0.07))',
          border:'1px solid var(--rim-accent)', borderRadius:'20px',
          padding:'32px', marginBottom:'20px', position:'relative', overflow:'hidden'
        }}>
          <div style={{ position:'absolute', top:'-20px', right:'-20px', width:'120px', height:'120px', borderRadius:'50%', background:'radial-gradient(rgba(201,184,120,0.15),transparent)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:'18px' }}>
            <div style={{
              width:'64px', height:'64px', borderRadius:'18px',
              background:'var(--gold-dim)', border:'1px solid var(--rim-accent)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'24px', fontWeight:900, fontFamily:'var(--font-d)', color:'var(--gold-light)'
            }}>
              {usuario?.nombre?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'22px', fontWeight:800, color:'var(--cream)', fontFamily:'var(--font-d)', letterSpacing:'-.3px' }}>
                {usuario?.nombre}
              </div>
              <div style={{ fontSize:'13px', color:'rgba(240,232,210,0.45)', marginTop:'3px', fontWeight:300 }}>
                {usuario?.email}
              </div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:'6px',
                marginTop:'8px', padding:'4px 12px', borderRadius:'20px',
                background:'var(--teal-dim)', border:'1px solid rgba(62,207,181,0.2)',
                fontSize:'11px', fontWeight:700, color:'var(--teal)',
                fontFamily:'var(--font-d)', letterSpacing:'.5px', textTransform:'uppercase'
              }}>
                {usuario?.rol === 'funcionario' ? '👷 Funcionario' : usuario?.rol === 'sgsst' ? '🔒 SGSST' : '📊 Gerencia'}
              </div>
            </div>
            <button onClick={logout} style={{
              padding:'9px 18px', borderRadius:'12px',
              background:'var(--ember-dim)', border:'1px solid rgba(224,92,58,0.2)',
              color:'var(--ember)', fontSize:'13px', fontWeight:700,
              cursor:'pointer', fontFamily:'var(--font-d)'
            }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
          {[
            { num: total,      label: 'Total reportes',  color: 'var(--cream)' },
            { num: pendientes, label: 'Pendientes',      color: 'var(--gold)' },
            { num: enGestion,  label: 'En gestión',      color: 'var(--teal)' },
            { num: cerrados,   label: 'Cerrados',        color: 'rgba(240,232,210,0.4)' },
          ].map((s, i) => (
            <div key={i} className="kpi-card" style={{ textAlign:'center' }}>
              <span className="kpi-numero" style={{ color: s.color, fontSize:'32px' }}>{s.num}</span>
              <span className="kpi-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Por tipo */}
        {Object.keys(porTipo).length > 0 && (
          <div className="seccion" style={{ marginBottom:'20px' }}>
            <h3>Mis incidentes por tipo</h3>
            {Object.entries(porTipo).sort((a,b) => b[1]-a[1]).map(([tipo, count]) => (
              <div key={tipo} className="barra-row">
                <span>{tipo}</span>
                <div className="barra" style={{ width:`${(count/maxTipo)*100}%` }} />
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Historial */}
        <div className="seccion">
          <h3>Historial de reportes</h3>
          {cargando && <div style={{ color:'rgba(240,232,210,0.4)', padding:'20px', textAlign:'center' }}>Cargando...</div>}
          {!cargando && reportes.length === 0 && (
            <div style={{ color:'rgba(240,232,210,0.4)', padding:'20px', textAlign:'center', fontWeight:300 }}>
              Aún no has reportado ningún incidente
            </div>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {reportes.map(r => (
              <div key={r.id} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'14px 16px', background:'var(--surface-2)',
                border:'1px solid var(--rim)', borderRadius:'12px'
              }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: ESTADO_COLOR[r.estado], flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'var(--cream)', fontFamily:'var(--font-d)' }}>{r.tipo_incidente}</div>
                  <div style={{ fontSize:'11px', color:'rgba(240,232,210,0.35)', marginTop:'2px', fontWeight:300 }}>
                    {new Date(r.fecha_registro).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}
                    {r.direccion_manual && ` · ${r.direccion_manual.split(',').slice(0,2).join(',')}`}
                  </div>
                </div>
                <span className="badge" style={{
                  background: `${ESTADO_COLOR[r.estado]}22`,
                  color: ESTADO_COLOR[r.estado],
                  border: `1px solid ${ESTADO_COLOR[r.estado]}44`
                }}>
                  {ESTADO_LABEL[r.estado]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
