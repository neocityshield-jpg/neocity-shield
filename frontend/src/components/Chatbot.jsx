import { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/api';

export default function Chatbot() {
  const [abierto, setAbierto]   = useState(false);
  const [mensajes, setMensajes] = useState([
    { rol: 'bot', texto: '¡Hola! Soy NeoBot 🛡️ Tu asistente de seguridad. ¿En qué puedo orientarte?' }
  ]);
  const [input, setInput]       = useState('');
  const [cargando, setCargando] = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async () => {
    if (!input.trim() || cargando) return;
    const nuevoMensaje = { rol: 'usuario', texto: input };
    setMensajes(prev => [...prev, nuevoMensaje]);
    setInput('');
    setCargando(true);
    try {
      const historial = mensajes.map(m => ({
        role:    m.rol === 'usuario' ? 'user' : 'assistant',
        content: m.texto
      }));
      const res = await chatbotService.enviarMensaje({ mensaje: input, historial });
      setMensajes(prev => [...prev, { rol: 'bot', texto: res.data.respuesta }]);
    } catch {
      setMensajes(prev => [...prev, { rol: 'bot', texto: 'Error al conectar. Intenta de nuevo.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setAbierto(!abierto)}>
        🛡️
      </button>
      {abierto && (
        <div className="chatbot-ventana">
          <div className="chatbot-header">
            <span>NeoBot — Asistente de Seguridad</span>
            <button onClick={() => setAbierto(false)}>✕</button>
          </div>
          <div className="chatbot-mensajes">
            {mensajes.map((m, i) => (
              <div key={i} className={`mensaje ${m.rol}`}>
                {m.texto}
              </div>
            ))}
            {cargando && <div className="mensaje bot">Escribiendo...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
            />
            <button onClick={enviar} disabled={cargando}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}
