import { useState, useEffect } from 'react';
import { incidenteService, sstService } from '../services/api';
import Investigacion from './Investigacion'; // 🔥 NUEVO

const ESTADOS = ['pendiente', 'en_gestion', 'cerrado'];

const ESTADO_COLOR = {
  pendiente:  '#e74c3c',
  en_gestion: '#f39c12',
  cerrado:    '#27ae60'
};

export default function PanelSST() {
  const [incidentes, setIncidentes]     = useState([]);
  const [alertas, setAlertas]           = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [seguimiento, setSeguimiento]   = useState({ observacion: '', estado_nuevo: '' });
  const [cargando, setCargando]         = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [incRes, alertRes] = await Promise.all([
        incidenteService.listarTodos(),
        incidenteService.sinSeguimiento()
      ]);
      setIncidentes(incRes.data);
      setAlertas(alertRes.data.incidentes);
    } finally {
      setCargando(false);
    }
  };

  const registrarSeguimiento = async (e) => {
    e.preventDefault();
    try {
      await sstService.registrarSeguimiento({
        incidente_id: seleccionado.id,
        ...seguimiento
      });
      setSeleccionado(null);
      setSeguimiento({ observacion: '', estado_nuevo: '' });
      cargarDatos();
    } catch {
      alert('Error al registrar seguimiento');
    }
  };

  // 🔥 NUEVO — función para cerrar modal (como pide tu instrucción)
  const closeSheet = () => setSeleccionado(null);

  if (cargando) return <div>Cargando panel SGSST...</div>;

  return (
    <div className="panel-sst">
      <h2>🔒 Panel SGSST — Gestión de Incidentes</h2>

      {alertas.length > 0 && (
        <div className="alertas-banner">
          ⚠️ {alertas.length} incidente(s) sin seguimiento en más de 48 horas
        </div>
      )}

      <div className="incidentes-lista">
        {incidentes.map(inc => (
          <div key={inc.id} className="incidente-card">
            <span className="estado-badge" style={{ background: ESTADO_COLOR[inc.estado] }}>
              {inc.estado}
            </span>
            <h4>{inc.tipo_incidente}</h4>
            <p><strong>Funcionario:</strong> {inc.funcionario}</p>
            <p><strong>Fecha:</strong> {new Date(inc.fecha_registro).toLocaleString()}</p>
            <p>{inc.descripcion}</p>
            <button onClick={() => setSeleccionado(inc)}>Gestionar</button>
          </div>
        ))}
      </div>

      {seleccionado && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Seguimiento — Incidente #{seleccionado.id}</h3>
            <p><strong>Tipo:</strong> {seleccionado.tipo_incidente}</p>

            <form onSubmit={registrarSeguimiento}>
              <select
                value={seguimiento.estado_nuevo}
                onChange={e => setSeguimiento({ ...seguimiento, estado_nuevo: e.target.value })}
                required
              >
                <option value="">Nuevo estado...</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>

              <textarea
                placeholder="Observaciones del seguimiento..."
                value={seguimiento.observacion}
                onChange={e => setSeguimiento({ ...seguimiento, observacion: e.target.value })}
                rows={3}
                required
              />

              <button type="submit">Registrar seguimiento</button>
              <button type="button" onClick={closeSheet}>Cancelar</button>
            </form>

            {/* 🔥 NUEVO — INVESTIGACIÓN SOLO SI ESTÁ CERRADO */}
            {seleccionado?.estado === 'cerrado' && (
              <Investigacion
                incidenteId={seleccionado.id}
                onCerrar={() => {
                  closeSheet();
                  cargarDatos();
                }}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
}
