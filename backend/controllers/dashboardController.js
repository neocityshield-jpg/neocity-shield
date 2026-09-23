const Incidente = require('../models/Incidente');
const pool = require('../config/db');

const dashboardController = {

  async indicadores(req, res) {
    try {
      const totales = await pool.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
          COUNT(*) FILTER (WHERE estado = 'en_gestion') AS en_gestion,
          COUNT(*) FILTER (WHERE estado = 'cerrado') AS cerrados,
          COUNT(*) FILTER (WHERE fecha_registro >= NOW() - INTERVAL '30 days') AS ultimo_mes
        FROM incidentes
      `);

      const porTipo = await pool.query(`
        SELECT tipo_incidente, COUNT(*) AS cantidad
        FROM incidentes
        GROUP BY tipo_incidente
        ORDER BY cantidad DESC
      `);

      const porMes = await pool.query(`
        SELECT
          TO_CHAR(fecha_registro, 'YYYY-MM') AS mes,
          COUNT(*) AS cantidad
        FROM incidentes
        WHERE fecha_registro >= NOW() - INTERVAL '6 months'
        GROUP BY mes
        ORDER BY mes ASC
      `);

      const tiempoPromedio = await pool.query(`
        SELECT ROUND(AVG(
          EXTRACT(EPOCH FROM (fecha_registro - fecha_ocurrencia)) / 60
        ), 2) AS promedio_minutos
        FROM incidentes
        WHERE fecha_registro >= NOW() - INTERVAL '30 days'
      `);

      // Personal con exámenes ocupacionales al día
      const examenes = await pool.query(`
        SELECT
          COUNT(*) AS total_personal,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM examenes_ocupacionales e
              WHERE e.usuario_id = u.id
                AND e.estado = 'vigente'
                AND e.fecha_proximo >= CURRENT_DATE
            )
          ) AS al_dia,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM examenes_ocupacionales e
              WHERE e.usuario_id = u.id
                AND e.fecha_proximo < CURRENT_DATE
            )
            AND NOT EXISTS (
              SELECT 1 FROM examenes_ocupacionales e2
              WHERE e2.usuario_id = u.id
                AND e2.estado = 'vigente'
                AND e2.fecha_proximo >= CURRENT_DATE
            )
          ) AS vencidos
        FROM usuarios u
        WHERE u.activo = TRUE
      `);

      const examRow = examenes.rows[0];
      const porcentaje = examRow.total_personal > 0
        ? Math.round((examRow.al_dia / examRow.total_personal) * 100)
        : 0;

      res.json({
        totales:         totales.rows[0],
        por_tipo:        porTipo.rows,
        por_mes:         porMes.rows,
        tiempo_promedio: tiempoPromedio.rows[0],
        examenes: {
          total_personal: Number(examRow.total_personal),
          al_dia:         Number(examRow.al_dia),
          vencidos:       Number(examRow.vencidos),
          porcentaje
        }
      });

    } catch (error) {
      res.status(500).json({ error: 'Error al obtener indicadores' });
    }
  },

  async mapa(req, res) {
    try {
      const result = await pool.query(`
        SELECT id, tipo_incidente, latitud, longitud, direccion_manual, fecha_ocurrencia, estado
        FROM incidentes
        WHERE latitud IS NOT NULL AND longitud IS NOT NULL
        ORDER BY fecha_registro DESC
        LIMIT 200
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener datos del mapa' });
    }
  }
};

module.exports = dashboardController;
