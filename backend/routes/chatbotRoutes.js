const express = require('express');
const router = express.Router();
const chatbotCtrl = require('../controllers/chatbotController');
const { verificarToken } = require('../middleware/authMiddleware');
const { limitadorChatbot } = require('../middleware/rateLimiter');

router.use(limitadorChatbot);

router.post('/mensaje', verificarToken, chatbotCtrl.enviarMensaje);

module.exports = router;
