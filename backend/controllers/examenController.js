const ExamenOcupacional = require('../models/ExamenOcupacional');

const examenController = {

  // El empleado reporta que ya hizo su examen
  async crear(req, res) {
    try {
      const { tipo_examen, fecha_realizacion, periodicidad_meses, soporte_url } = req.body;
      const examen = await ExamenOcupacional.crear({
        usuario_id: req.usuario.id,
        tipo_examen: tipo_examen || 'ingreso',
        fecha_realizacion,
        periodicidad_meses: periodicidad_meses || 12,
        soporte_url,
        reportado_por: 'empleado'
      });
      res.status(201).json({ mensaje: 'Examen reportado, pendiente de validación por SGSST', examen });
    } catch (error) {
      res.status(500).json({ error: 'Error al reportar el examen' });
    }
  },

  async misExamenes(req, res) {
    try {
      const examenes = await ExamenOcupacional.listarPorUsuario(req.usuario.id);
      res.json(examenes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tus exámenes' });
    }
  },

  async listar(req, res) {
    try {
      const { estado } = req.query;
      const examenes = await ExamenOcupacional.listarTodos({ estado });
      res.json(examenes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener exámenes' });
    }
  },

  // SGSST valida el reporte del empleado
  async validar(req, res) {
    try {
      const { estado, resultado } = req.body; // estado: 'vigente' | 'rechazado'
      const examen = await ExamenOcupacional.validar(req.params.id, { estado, resultado });
      res.json({ mensaje: 'Examen actualizado', examen });
    } catch (error) {
      res.status(500).json({ error: 'Error al validar el examen' });
    }
  },

  async proximosAVencer(req, res) {
    try {
      const examenes = await ExamenOcupacional.obtenerProximosAVencer();
      res.json({ total: examenes.length, examenes });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener alertas de exámenes' });
    }
  }
};

module.exports = examenController;
