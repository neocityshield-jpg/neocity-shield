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

const MAX_LONGITUD_MENSAJE = 1000;
const MAX_HISTORIAL = 10;

const chatbotController = {

  async enviarMensaje(req, res) {
    try {
      const { mensaje, historial = [] } = req.body;

      // 🔒 Validación
      if (typeof mensaje !== "string" || !mensaje.trim()) {
        return res.status(400).json({ error: "El mensaje es obligatorio" });
      }
      if (mensaje.length > MAX_LONGITUD_MENSAJE) {
        return res.status(400).json({ error: "El mensaje es demasiado largo" });
      }

      // 🔒 Solo se aceptan mensajes de usuario o asistente (nunca "system")
      const historialSeguro = Array.isArray(historial)
        ? historial
            .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
            .slice(-MAX_HISTORIAL)
        : [];

      const mensajes = [
        { role: "system", content: SYSTEM_PROMPT },
        ...historialSeguro,
        { role: "user", content: mensaje }
      ];

      // 🤖 Llamada a OpenAI
      const respuesta = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: mensajes,
        max_tokens: 500,
        temperature: 0.7
      });

      const textoRespuesta = respuesta?.choices?.[0]?.message?.content || "No se pudo generar respuesta.";

      // 💾 Guardar la conversación (la ruta ya exige token, por eso hay req.usuario)
      try {
        await pool.query(
          `INSERT INTO chatbot_sesiones (usuario_id, mensaje, respuesta)
           VALUES ($1, $2, $3)`,
          [req.usuario.id, mensaje, textoRespuesta]
        );
      } catch (dbError) {
        console.error("🔥 ERROR BD:", dbError.message);
        // No rompemos la app si falla la BD
      }

      res.json({ respuesta: textoRespuesta });

    } catch (error) {
      console.error("🔥 ERROR OPENAI:", error);

      res.status(500).json({
        error: "Error al procesar mensaje del chatbot"
      });
    }
  }
};

module.exports = chatbotController;
