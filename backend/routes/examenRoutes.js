const express     = require('express');
const router      = express.Router();
const examenCtrl  = require('../controllers/examenController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/',                    verificarToken, examenCtrl.crear);
router.get('/mis-examenes',         verificarToken, examenCtrl.misExamenes);
router.get('/',                     verificarToken, verificarRol('sgsst','gerencia'), examenCtrl.listar);
router.get('/alertas/por-vencer',   verificarToken, verificarRol('sgsst'), examenCtrl.proximosAVencer);
router.put('/:id/validar',          verificarToken, verificarRol('sgsst'), examenCtrl.validar);

module.exports = router;
