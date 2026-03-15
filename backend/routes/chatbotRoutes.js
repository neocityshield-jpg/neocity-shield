const express     = require('express');
const router      = express.Router();
const chatbotCtrl = require('../controllers/chatbotController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/mensaje', verificarToken, chatbotCtrl.enviarMensaje);

module.exports = router;
