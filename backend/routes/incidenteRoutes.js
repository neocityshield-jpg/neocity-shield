const express       = require('express');
const router        = express.Router();
const incidenteCtrl = require('../controllers/incidenteController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/',                        verificarToken, incidenteCtrl.crear);
router.get('/mis-reportes',             verificarToken, incidenteCtrl.misReportes);
router.get('/',                         verificarToken, verificarRol('sgsst','gerencia'), incidenteCtrl.listar);
router.get('/alertas/sin-seguimiento',  verificarToken, verificarRol('sgsst'), incidenteCtrl.sinSeguimiento);
router.get('/:id',                      verificarToken, verificarRol('sgsst','gerencia'), incidenteCtrl.detalle);

module.exports = router;
