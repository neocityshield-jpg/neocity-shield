const pool = require('../config/db');

const Seguimiento = {

  async crear({ incidente_id, sgsst_id, observacion, estado_nuevo }) {
    await pool.query(
      'UPDATE incidentes SET estado = $1 WHERE id = $2',
      [estado_nuevo, incidente_id]
    );
    const result = await pool.query(
      `INSERT INTO seguimientos (incidente_id, sgsst_id, observacion, estado_nuevo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [incidente_id, sgsst_id, observacion, estado_nuevo]
    );
    return result.rows[0];
  },

  async historialPorIncidente(incidente_id) {
    const result = await pool.query(
      `SELECT s.*, u.nombre AS responsable_sgsst
       FROM seguimientos s
       JOIN usuarios u ON s.sgsst_id = u.id
       WHERE s.incidente_id = $1
       ORDER BY s.fecha_accion ASC`,
      [incidente_id]
    );
    return result.rows;
  }
};

module.exports = Seguimiento;
