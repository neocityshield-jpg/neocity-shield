const Incidente = require('../models/Incidente');

const incidenteController = {

  async crear(req, res) {
    try {
      const {
        tipo_incidente, descripcion, latitud, longitud,
        direccion_manual, fecha_ocurrencia, evidencia_url
      } = req.body;

      const incidente = await Incidente.crear({
        usuario_id: req.usuario.id,
        tipo_incidente,
        descripcion,
        latitud:          latitud          || null,
        longitud:         longitud         || null,
        direccion_manual: direccion_manual || null,
        fecha_ocurrencia,
        evidencia_url:    evidencia_url    || null
      });

      res.status(201).json({ mensaje: 'Incidente reportado exitosamente', incidente });
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar incidente' });
    }
  },

  async listar(req, res) {
    try {
      const { estado, fecha_desde, fecha_hasta } = req.query;
      const incidentes = await Incidente.listarTodos({ estado, fecha_desde, fecha_hasta });
      res.json(incidentes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener incidentes' });
    }
  },

  async misReportes(req, res) {
    try {
      const incidentes = await Incidente.listarPorUsuario(req.usuario.id);
      res.json(incidentes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener tus reportes' });
    }
  },

  async detalle(req, res) {
    try {
      const incidente = await Incidente.buscarPorId(req.params.id);
      if (!incidente) return res.status(404).json({ error: 'Incidente no encontrado' });
      res.json(incidente);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener incidente' });
    }
  },

  async sinSeguimiento(req, res) {
    try {
      const incidentes = await Incidente.obtenerSinSeguimiento();
      res.json({ total: incidentes.length, incidentes });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener alertas' });
    }
  }
};

module.exports = incidenteController;
