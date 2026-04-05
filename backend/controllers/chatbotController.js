const OpenAI = require("openai").default;
const pool = require("../config/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Eres NeoBot, el asistente de seguridad física ocupacional de Evidencia Digital S.A.S.
Tu función es orientar a los funcionarios ante incidentes de seguridad física (hurtos,
caídas, agresiones, incidentes en zonas periféricas) con instrucciones claras, empáticas
y breves. Siempre recuerda al usuario que debe registrar el incidente en NeoCity Shield.
Responde únicamente en español, con un tono profesional y tranquilizador.
No diagnostiques lesiones ni brindes asesoría legal o médica especializada.
Si el funcionario está en peligro inmediato, indícale que llame al 123 primero.
`;

const chatbotController = {

  async enviarMensaje(req, res) {
    try {
      const { mensaje, historial = [] } = req.body;

      // 🔒 Validación básica
      if (!mensaje) {
        return res.status(400).json({ error: "El mensaje es obligatorio" });
      }

      const mensajes = [
        { role: "system", content: SYSTEM_PROMPT },
        ...historial,
        { role: "user", content: mensaje }
      ];

      // 🤖 Llamada a OpenAI
      const respuesta = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: mensajes,
        max_tokens: 500,
        temperature: 0.7
      });

      const textoRespuesta = respuesta.choices[0].message.content;

      // 🧠 Verifica si existe usuario antes de guardar
      let usuarioId = null;

      if (req.usuario && req.usuario.id) {
        usuarioId = req.usuario.id;

        await pool.query(
          `INSERT INTO chatbot_sesiones (usuario_id, mensaje, respuesta)
           VALUES ($1, $2, $3)`,
          [usuarioId, mensaje, textoRespuesta]
        );
      } else {
        console.warn("⚠️ No hay usuario autenticado, no se guarda en BD");
      }

      res.json({ respuesta: textoRespuesta });

    } catch (error) {
      console.error("🔥 ERROR OPENAI:", error);

      res.status(500).json({
        error: "Error al procesar mensaje del chatbot",
        detalle: error.message
      });
    }
  }
};

module.exports = chatbotController;
