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

      res.json({
        totales:         totales.rows[0],
        por_tipo:        porTipo.rows,
        por_mes:         porMes.rows,
        tiempo_promedio: tiempoPromedio.rows[0]
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
