import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Investigacion({ incidenteId, onCerrar }) {
  const [inv, setInv]           = useState(null);
  const [form, setForm]         = useState({
    causa_raiz: '', acciones_correctivas: '',
    acciones_preventivas: '', fecha_limite: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);

  useEffect(() => {
    API.get(`/investigaciones/${incidenteId}`)
      .then(res => { if (res.data.length > 0) setInv(res.data[0]) })
      .catch(() => {});
  }, [incidenteId]);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await API.post('/investigaciones', {
        incidente_id: incidenteId, ...form
      });
      setInv(res.data);
      setGuardado(true);
    } catch {
      alert('Error al guardar investigación');
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = async () => {
    if (!inv) return;
    await API.put(`/investigaciones/${inv.id}/cerrar`);
    setInv(prev => ({ ...prev, estado: 'cerrada' }));
    if (onCerrar) onCerrar();
  };

  const campo = (label, key, tipo = 'textarea') => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'rgba(240,232,210,0.3)',
        textTransform: 'uppercase', letterSpacing: '1px',
        fontFamily: 'var(--font-b)', marginBottom: '8px'
      }}>
        {label}
      </div>
      {tipo === 'textarea' ? (
        <textarea
          className="fc-textarea"
          style={{ marginBottom: 0, minHeight: '80px' }}
          placeholder={`Describe ${label.toLowerCase()}...`}
          value={inv ? inv[key] || '' : form[key]}
          onChange={e => !inv && setForm(f => ({ ...f, [key]: e.target.value }))}
          readOnly={!!inv}
          rows={3}
        />
      ) : (
        <input
          type="date"
          className="fc-input"
          style={{ marginBottom: 0 }}
          value={inv ? inv[key] || '' : form[key]}
          onChange={e => !inv && setForm(f => ({ ...f, [key]: e.target.value }))}
          readOnly={!!inv}
        />
      )}
    </div>
  );

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--rim)',
      borderRadius: '16px', padding: '24px', marginTop: '16px'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--cream)',
          fontFamily: 'var(--font-d)'
        }}>
          🔍 Investigación del incidente
        </div>
        {inv && (
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '10px',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px',
            background: inv.estado === 'cerrada' ? 'var(--teal-dim)' : 'var(--gold-dim)',
            color: inv.estado === 'cerrada' ? 'var(--teal)' : 'var(--gold-light)',
            border: `1px solid ${inv.estado === 'cerrada' ? 'rgba(62,207,181,0.25)' : 'var(--rim-accent)'}`
          }}>
            {inv.estado}
          </span>
        )}
      </div>

      {campo('Causa raíz', 'causa_raiz')}
      {campo('Acciones correctivas', 'acciones_correctivas')}
      {campo('Acciones preventivas', 'acciones_preventivas')}
      {campo('Fecha límite', 'fecha_limite', 'date')}

      {!inv && (
        <button
          className="submit-btn"
          onClick={guardar}
          disabled={guardando || !form.causa_raiz}
        >
          {guardando ? 'Guardando...' : guardado ? '✅ Guardado' : 'Guardar investigación'}
        </button>
      )}

      {inv && inv.estado !== 'cerrada' && (
        <button
          onClick={cerrar}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'var(--teal-dim)', border: '1px solid rgba(62,207,181,0.25)',
            color: 'var(--teal)', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-d)', fontSize: '14px', marginTop: '8px'
          }}
        >
          ✅ Marcar investigación como cerrada
        </button>
      )}

      {inv && (
        <div style={{
          marginTop: '12px', fontSize: '11px',
          color: 'rgba(240,232,210,0.25)', fontFamily: 'var(--font-m)'
        }}>
          Responsable: {inv.responsable} · {new Date(inv.fecha_creacion).toLocaleDateString('es-CO')}
        </div>
      )}
    </div>
  );
}
