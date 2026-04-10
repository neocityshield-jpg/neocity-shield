import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

export default function Dashboard() {
  const [datos, setDatos]           = useState(null);
  const [cargando, setCargando]     = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    dashboardService.indicadores()
      .then(res => setDatos(res.data))
      .finally(() => setCargando(false));
  }, []);

  const exportarPDF = async () => {
    setExportando(true);
    // Cargar jsPDF dinámicamente
    if (!window.jspdf) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.body.appendChild(s);
      });
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        s.onload = res; s.onerror = rej;
        document.body.appendChild(s);
      });
    }

    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    const fecha     = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });

    // Header
    doc.setFillColor(8, 12, 31);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(201, 184, 120);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('NeoCity Shield', 15, 18);
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text('Reporte mensual de incidentes — Evidencia Digital S.A.S.', 15, 28);
    doc.text(`Generado: ${fecha}`, 15, 36);

    // KPIs
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores del período', 15, 55);

    const { totales, tiempo_promedio } = datos;
    doc.autoTable({
      startY: 60,
      head: [['Indicador', 'Valor']],
      body: [
        ['Total incidentes', totales.total],
        ['Pendientes', totales.pendientes],
        ['En gestión', totales.en_gestion],
        ['Cerrados', totales.cerrados],
        ['Último mes', totales.ultimo_mes],
        ['Tiempo promedio de registro', `${tiempo_promedio.promedio_minutos} min`],
      ],
      headStyles: { fillColor: [201, 184, 120], textColor: [26, 20, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 246, 240] },
      styles: { fontSize: 11 }
    });

    // Por tipo
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Incidentes por tipo', 15, doc.lastAutoTable.finalY + 16);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Tipo de incidente', 'Cantidad']],
      body: datos.por_tipo.map(t => [t.tipo_incidente, t.cantidad]),
      headStyles: { fillColor: [62, 207, 181], textColor: [4, 26, 21], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 252, 249] },
      styles: { fontSize: 11 }
    });

    // Por mes
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Tendencia por mes', 15, doc.lastAutoTable.finalY + 16);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Mes', 'Incidentes']],
      body: datos.por_mes.map(m => [m.mes, m.cantidad]),
      headStyles: { fillColor: [79, 142, 247], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      styles: { fontSize: 11 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`NeoCity Shield — Evidencia Digital S.A.S. — Página ${i} de ${pageCount}`, 15, 290);
    }

    doc.save(`neocity-shield-reporte-${new Date().toISOString().slice(0,10)}.pdf`);
    setExportando(false);
  };

  if (cargando) return <div style={{color:'var(--cream)',padding:'40px'}}>Cargando...</div>;
  if (!datos)   return <div style={{color:'var(--cream)',padding:'40px'}}>Error al cargar datos</div>;

  const { totales, por_tipo, por_mes, tiempo_promedio } = datos;

  return (
    <div className="page-bg">
      <div className="dashboard">
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'4px' }}>
          <h2>📊 Dashboard Gerencial</h2>
          <button
            onClick={exportarPDF}
            disabled={exportando}
            style={{
              padding:'10px 20px', borderRadius:'12px',
              background:'linear-gradient(135deg,var(--gold),var(--gold-light))',
              color:'#1a1400', border:'none', fontWeight:800,
              fontFamily:'var(--font-d)', fontSize:'13px',
              cursor:'pointer', transition:'all .2s',
              letterSpacing:'.3px', whiteSpace:'nowrap',
              boxShadow:'0 4px 16px rgba(201,184,120,0.3)'
            }}
          >
            {exportando ? '⏳ Generando...' : '⬇️ Exportar PDF'}
          </button>
        </div>

        <div className="dash-live">
          <div className="live-dot"></div>
          Datos en tiempo real · {new Date().toLocaleDateString('es-CO', {month:'long', year:'numeric'})}
        </div>

        <div className="kpis-grid">
          <div className="kpi-card"><span className="kpi-numero">{totales.total}</span><span className="kpi-label">Total incidentes</span></div>
          <div className="kpi-card alerta"><span className="kpi-numero">{totales.pendientes}</span><span className="kpi-label">Pendientes</span></div>
          <div className="kpi-card proceso"><span className="kpi-numero">{totales.en_gestion}</span><span className="kpi-label">En gestión</span></div>
          <div className="kpi-card ok"><span className="kpi-numero">{totales.cerrados}</span><span className="kpi-label">Cerrados</span></div>
          <div className="kpi-card"><span className="kpi-numero">{tiempo_promedio.promedio_minutos}m</span><span className="kpi-label">Tiempo promedio</span></div>
          <div className="kpi-card"><span className="kpi-numero">{totales.ultimo_mes}</span><span className="kpi-label">Último mes</span></div>
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
    </div>
  );
}
