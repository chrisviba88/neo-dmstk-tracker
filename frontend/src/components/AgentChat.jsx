import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Bot } from 'lucide-react';

const PALETTE = {
  nectarine: "#D7897F",
  mostaza: "#E2B93B",
  menthe: "#96C7B3",
  lagune: "#6398A9",
  cream: "#FAF8F4",
  warm: "#F3EDE6",
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
};

const SERIF = "Georgia, 'Times New Roman', serif";

export default function AgentChat({ apiUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de NEO DMSTK. Puedo ayudarte con:\n• Estado del proyecto\n• Tareas vencidas o bloqueadas\n• Próximos hitos\n• Recomendaciones\n\n¿En qué puedo ayudarte?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Lo siento, no pude procesar tu pregunta.'
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Por favor intenta de nuevo.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '¿Cuántas tareas están vencidas?',
    '¿Cuál es el próximo hito?',
    'Dame un resumen del proyecto',
    '¿Qué tareas están bloqueadas?'
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${PALETTE.lagune}, ${PALETTE.nectarine})`,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          transition: 'transform 0.2s',
          zIndex: 999
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: isMinimized ? 320 : 400,
        height: isMinimized ? 60 : 600,
        background: PALETTE.bone,
        borderRadius: 16,
        boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        border: `1px solid ${PALETTE.faint}`
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PALETTE.lagune}, ${PALETTE.nectarine})`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bot size={24} />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600 }}>
              Asistente DMSTK
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Agente IA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.role === 'user'
                      ? PALETTE.lagune
                      : PALETTE.warm,
                    color: msg.role === 'user' ? '#fff' : PALETTE.ink,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: PALETTE.warm,
                    fontSize: 13
                  }}
                >
                  <span style={{ animation: 'pulse 1.5s infinite' }}>Pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: '0 20px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>
                Preguntas rápidas:
              </div>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q);
                  }}
                  style={{
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${PALETTE.faint}`,
                    background: PALETTE.bone,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: PALETTE.soft,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = PALETTE.warm;
                    e.currentTarget.style.borderColor = PALETTE.lagune;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = PALETTE.bone;
                    e.currentTarget.style.borderColor = PALETTE.faint;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: `1px solid ${PALETTE.faint}`,
              background: PALETTE.warm
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.faint}`,
                  fontSize: 13,
                  background: PALETTE.bone,
                  color: PALETTE.ink
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: input.trim() && !loading ? PALETTE.lagune : PALETTE.faint,
                  color: '#fff',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
