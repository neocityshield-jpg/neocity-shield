const pool = require('../config/db');

const Incidente = {

  async crear({ usuario_id, tipo_incidente, descripcion, latitud, longitud, direccion_manual, fecha_ocurrencia, evidencia_url }) {
    const result = await pool.query(
      `INSERT INTO incidentes 
        (usuario_id, tipo_incidente, descripcion, latitud, longitud, direccion_manual, fecha_ocurrencia, evidencia_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [usuario_id, tipo_incidente, descripcion, latitud, longitud, direccion_manual, fecha_ocurrencia, evidencia_url]
    );
    return result.rows[0];
  },

  async listarTodos({ estado, fecha_desde, fecha_hasta } = {}) {
    let query = `
      SELECT i.*, u.nombre AS funcionario, u.email
      FROM incidentes i
      JOIN usuarios u ON i.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (estado) { params.push(estado); query += ` AND i.estado = $${params.length}`; }
    if (fecha_desde) { params.push(fecha_desde); query += ` AND i.fecha_registro >= $${params.length}`; }
    if (fecha_hasta) { params.push(fecha_hasta); query += ` AND i.fecha_registro <= $${params.length}`; }
    query += ' ORDER BY i.fecha_registro DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async listarPorUsuario(usuario_id) {
    const result = await pool.query(
      `SELECT * FROM incidentes WHERE usuario_id = $1 ORDER BY fecha_registro DESC`,
      [usuario_id]
    );
    return result.rows;
  },

  async buscarPorId(id) {
    const result = await pool.query(
      `SELECT i.*, u.nombre AS funcionario
       FROM incidentes i
       JOIN usuarios u ON i.usuario_id = u.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async actualizarEstado(id, estado) {
    const result = await pool.query(
      `UPDATE incidentes SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, id]
    );
    return result.rows[0];
  },

  async obtenerIndicadores() {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_gestion') AS en_gestion,
        COUNT(*) FILTER (WHERE estado = 'cerrado') AS cerrados,
        COUNT(*) FILTER (WHERE fecha_registro >= NOW() - INTERVAL '30 days') AS ultimo_mes
      FROM incidentes
    `);
    return result.rows[0];
  },

  async obtenerSinSeguimiento() {
    const result = await pool.query(`
      SELECT i.*, u.nombre AS funcionario
      FROM incidentes i
      JOIN usuarios u ON i.usuario_id = u.id
      LEFT JOIN seguimientos s ON i.id = s.incidente_id
      WHERE i.estado != 'cerrado'
        AND (s.id IS NULL OR s.fecha_accion < NOW() - INTERVAL '48 hours')
      ORDER BY i.fecha_registro ASC
    `);
    return result.rows;
  }
};

module.exports = Incidente;
