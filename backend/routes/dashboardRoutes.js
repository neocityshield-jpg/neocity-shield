const express       = require('express');
const router        = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.get('/indicadores', verificarToken, verificarRol('sgsst','gerencia'), dashboardCtrl.indicadores);
router.get('/mapa',        verificarToken, verificarRol('sgsst','gerencia'), dashboardCtrl.mapa);

module.exports = router;
