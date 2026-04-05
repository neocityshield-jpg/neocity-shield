const express     = require('express');
const router      = express.Router();
const chatbotCtrl = require('../controllers/chatbotController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/mensaje', chatbotCtrl.enviarMensaje);

module.exports = router;
