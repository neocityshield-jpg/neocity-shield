const express = require('express');
const router = express.Router();
const chatbotCtrl = require('../controllers/chatbotController');

// 🔥 SIN TOKEN (solo para probar)
router.post('/mensaje', chatbotCtrl.enviarMensaje);

module.exports = router;
