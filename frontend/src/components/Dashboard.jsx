import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

export default function Dashboard() {
  const [datos, setDatos]       = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService.indicadores()
      .then(res => setDatos(res.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div>Cargando indicadores...</div>;
  if (!datos)   return <div>Error al cargar datos</div>;

  const { totales, por_tipo, por_mes, tiempo_promedio } = datos;

  return (
    <div className="dashboard">
      <h2>📊 Panel Gerencial — NeoCity Shield</h2>

      <div className="kpis-grid">
        <div className="kpi-card">
          <span className="kpi-numero">{totales.total}</span>
          <span className="kpi-label">Total incidentes</span>
        </div>
        <div className="kpi-card alerta">
          <span className="kpi-numero">{totales.pendientes}</span>
          <span className="kpi-label">Pendientes</span>
        </div>
        <div className="kpi-card proceso">
          <span className="kpi-numero">{totales.en_gestion}</span>
          <span className="kpi-label">En gestión</span>
        </div>
        <div className="kpi-card ok">
          <span className="kpi-numero">{totales.cerrados}</span>
          <span className="kpi-label">Cerrados</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-numero">{tiempo_promedio.promedio_minutos} min</span>
          <span className="kpi-label">Tiempo promedio de registro</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-numero">{totales.ultimo_mes}</span>
          <span className="kpi-label">Incidentes último mes</span>
        </div>
      </div>

      <div className="seccion">
        <h3>Incidentes por tipo</h3>
        {por_tipo.map(t => (
          <div key={t.tipo_incidente} className="barra-row">
            <span>{t.tipo_incidente}</span>
            <div className="barra" style={{ width: `${Math.min(t.cantidad * 20, 100)}%` }} />
            <span>{t.cantidad}</span>
          </div>
        ))}
      </div>

      <div className="seccion">
        <h3>Tendencia últimos 6 meses</h3>
        <div className="chart-barras">
          {por_mes.map(m => (
            <div key={m.mes} className="chart-col">
              <div className="chart-barra" style={{ height: `${Math.min(m.cantidad * 15, 120)}px` }} />
              <span>{m.mes}</span>
              <span>{m.cantidad}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
