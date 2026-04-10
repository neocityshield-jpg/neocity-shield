import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Notificaciones() {
  const [notifs, setNotifs]     = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const res = await API.get('/notificaciones/mis-notificaciones');
      setNotifs(res.data);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (id) => {
    await API.put(`/notificaciones/${id}/leer`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const marcarTodas = async () => {
    await Promise.all(notifs.filter(n => !n.leida).map(n => API.put(`/notificaciones/${n.id}/leer`)));
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="page-bg">
      <div className="dashboard">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
          <div>
            <h2>🔔 Notificaciones</h2>
            {noLeidas > 0 && (
              <div style={{ fontSize:'13px', color:'var(--gold)', marginTop:'4px', fontWeight:600 }}>
                {noLeidas} sin leer
              </div>
            )}
          </div>
          {noLeidas > 0 && (
            <button onClick={marcarTodas} style={{
              padding:'9px 18px', borderRadius:'12px',
              background:'var(--gold-dim)', border:'1px solid var(--rim-accent)',
              color:'var(--gold-light)', fontSize:'13px', fontWeight:700,
              cursor:'pointer', fontFamily:'var(--font-d)'
            }}>
              Marcar todas leídas
            </button>
          )}
        </div>

        {cargando && <div style={{ color:'var(--text2)', padding:'40px', textAlign:'center' }}>Cargando...</div>}

        {!cargando && notifs.length === 0 && (
          <div style={{
            textAlign:'center', padding:'60px 20px',
            background:'var(--surface)', borderRadius:'18px',
            border:'1px solid var(--rim)'
          }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔔</div>
            <div style={{ color:'var(--cream)', fontSize:'18px', fontWeight:700, marginFamily:'var(--font-d)', marginBottom:'8px' }}>Sin notificaciones</div>
            <div style={{ color:'rgba(240,232,210,0.4)', fontSize:'14px' }}>Te avisaremos cuando haya novedades</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {notifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.leida && marcarLeida(n.id)}
              style={{
                display:'flex', gap:'14px', padding:'16px 20px',
                background: n.leida ? 'var(--surface)' : 'rgba(201,184,120,0.07)',
                border: `1px solid ${n.leida ? 'var(--rim)' : 'rgba(201,184,120,0.2)'}`,
                borderRadius:'14px', cursor: n.leida ? 'default' : 'pointer',
                transition:'all .2s'
              }}
            >
              <div style={{ fontSize:'22px', flexShrink:0 }}>
                {n.titulo.includes('hurto') ? '⚠️' : n.titulo.includes('seguimiento') ? '✅' : '📋'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:'var(--cream)', marginBottom:'4px', fontFamily:'var(--font-d)' }}>
                  {n.titulo}
                </div>
                <div style={{ fontSize:'13px', color:'rgba(240,232,210,0.5)', lineHeight:1.5, fontWeight:300 }}>
                  {n.mensaje}
                </div>
                <div style={{ fontSize:'11px', color:'rgba(240,232,210,0.25)', marginTop:'6px', fontFamily:'var(--font-m)' }}>
                  {new Date(n.fecha).toLocaleString('es-CO')}
                </div>
              </div>
              {!n.leida && (
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold)', flexShrink:0, marginTop:'6px', boxShadow:'0 0 8px var(--gold)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
