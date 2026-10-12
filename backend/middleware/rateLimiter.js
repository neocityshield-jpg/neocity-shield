const rateLimit = require('express-rate-limit');

const base = {
  standardHeaders: true,
  legacyHeaders: false
};

// General para la API
const limitadorGeneral = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' }
});

// Login / registro (evita fuerza bruta)
const limitadorAuth = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Demasiados intentos, intenta de nuevo en 15 minutos' }
});

// Chatbot (cada mensaje consume la API de OpenAI)
const limitadorChatbot = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Estás enviando mensajes muy rápido, espera un momento' }
});

module.exports = { limitadorGeneral, limitadorAuth, limitadorChatbot };
