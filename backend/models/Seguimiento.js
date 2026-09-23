const pool = require('../config/db');

const ESTADO_LABELS = {
  pendiente:  'Pendiente',
  en_gestion: 'En gestión',
  cerrado:    'Cerrado'
};

const Seguimiento = {

  async crear({ incidente_id, sgsst_id, observacion, estado_nuevo }) {
    const incidenteAnterior = await pool.query(
      'SELECT usuario_id, tipo_incidente, estado FROM incidentes WHERE id = $1',
      [incidente_id]
    );
    const incidente = incidenteAnterior.rows[0];

    await pool.query(
      'UPDATE incidentes SET estado = $1 WHERE id = $2',
      [estado_nuevo, incidente_id]
    );

    const result = await pool.query(
      `INSERT INTO seguimientos (incidente_id, sgsst_id, observacion, estado_nuevo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [incidente_id, sgsst_id, observacion, estado_nuevo]
    );

    // Notificar al funcionario dueño del incidente si su estado cambió
    if (incidente && incidente.estado !== estado_nuevo) {
      const titulo = estado_nuevo === 'cerrado'
        ? 'Tu incidente fue resuelto'
        : 'Tu incidente cambió de estado';

      const mensaje = estado_nuevo === 'cerrado'
        ? `Tu reporte de "${incidente.tipo_incidente}" fue marcado como cerrado por SGSST.${observacion ? ' Observación: ' + observacion : ''}`
        : `Tu reporte de "${incidente.tipo_incidente}" ahora está en estado "${ESTADO_LABELS[estado_nuevo] || estado_nuevo}".${observacion ? ' Observación: ' + observacion : ''}`;

      await pool.query(
        `INSERT INTO notificaciones (usuario_id, titulo, mensaje) VALUES ($1, $2, $3)`,
        [incidente.usuario_id, titulo, mensaje]
      );
    }

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
