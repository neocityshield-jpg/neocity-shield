const Seguimiento = require('../models/Seguimiento');

const sstController = {

  async registrarSeguimiento(req, res) {
    try {
      const { incidente_id, observacion, estado_nuevo } = req.body;
      const seguimiento = await Seguimiento.crear({
        incidente_id,
        sgsst_id: req.usuario.id,
        observacion,
        estado_nuevo
      });
      res.status(201).json({
        mensaje: 'Seguimiento registrado exitosamente',
        seguimiento
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar seguimiento' });
    }
  },

  async historial(req, res) {
    try {
      const historial = await Seguimiento.historialPorIncidente(req.params.incidente_id);
      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  }
};

module.exports = sstController;
