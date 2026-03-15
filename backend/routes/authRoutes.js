const express  = require('express');
const router   = express.Router();
const authCtrl = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/login',    authCtrl.login);
router.post('/registro', verificarToken, verificarRol('gerencia'), authCtrl.registro);
router.get('/perfil',    verificarToken, authCtrl.perfil);

module.exports = router;
