const pool = require('../config/db');

const ExamenOcupacional = {

  async crear({ usuario_id, tipo_examen, fecha_realizacion, periodicidad_meses, soporte_url, reportado_por }) {
    const fechaProximoQuery = await pool.query(
      `SELECT ($1::date + ($2 || ' months')::interval)::date AS fecha_proximo`,
      [fecha_realizacion, periodicidad_meses]
    );
    const fecha_proximo = fechaProximoQuery.rows[0].fecha_proximo;

    const result = await pool.query(
      `INSERT INTO examenes_ocupacionales
        (usuario_id, tipo_examen, fecha_realizacion, periodicidad_meses, fecha_proximo, soporte_url, reportado_por, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pendiente_validacion')
       RETURNING *`,
      [usuario_id, tipo_examen, fecha_realizacion, periodicidad_meses, fecha_proximo, soporte_url || null, reportado_por || 'empleado']
    );
    return result.rows[0];
  },

  async listarPorUsuario(usuario_id) {
    const result = await pool.query(
      `SELECT * FROM examenes_ocupacionales WHERE usuario_id = $1 ORDER BY fecha_realizacion DESC`,
      [usuario_id]
    );
    return result.rows;
  },

  async listarTodos({ estado } = {}) {
    let query = `
      SELECT e.*, u.nombre AS funcionario, u.email
      FROM examenes_ocupacionales e
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (estado) { params.push(estado); query += ` AND e.estado = $${params.length}`; }
    query += ' ORDER BY e.fecha_proximo ASC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async validar(id, { estado, resultado }) {
    const result = await pool.query(
      `UPDATE examenes_ocupacionales SET estado = $1, resultado = $2 WHERE id = $3 RETURNING *`,
      [estado, resultado || null, id]
    );
    return result.rows[0];
  },

  // Igual en espíritu a Incidente.obtenerSinSeguimiento(): detecta vencidos o por vencer en 30 días
  async obtenerProximosAVencer() {
    const result = await pool.query(`
      SELECT e.*, u.nombre AS funcionario, u.email,
        CASE
          WHEN e.fecha_proximo < CURRENT_DATE THEN 'vencido'
          WHEN e.fecha_proximo <= CURRENT_DATE + INTERVAL '30 days' THEN 'proximo_a_vencer'
          ELSE 'vigente'
        END AS estado_vigencia
      FROM examenes_ocupacionales e
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.estado != 'pendiente_validacion'
        AND e.fecha_proximo <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY e.fecha_proximo ASC
    `);
    return result.rows;
  }
};

module.exports = ExamenOcupacional;
