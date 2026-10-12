const express  = require('express');
const router   = express.Router();
const authCtrl = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const { limitadorAuth } = require('../middleware/rateLimiter');

router.use(limitadorAuth);

router.post('/login',    authCtrl.login);
router.post('/registro', verificarToken, verificarRol('gerencia'), authCtrl.registro);
router.get('/perfil',    verificarToken, authCtrl.perfil);

module.exports = router;
