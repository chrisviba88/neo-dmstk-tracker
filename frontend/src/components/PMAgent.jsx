import { useState, useEffect } from 'react';

const GEMINI_API_KEY = 'AIzaSyCK0a7Ke0f8oXtqjb61UdCZCipCQ_jKaIE';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;

function buildProjectContext(tasks, milestones) {
  const today = new Date().toISOString().split('T')[0];
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Hecho').length;
  const overdue = tasks.filter(t => t.status !== 'Hecho' && t.endDate < today);
  const thisWeek = tasks.filter(t => {
    if (t.status === 'Hecho') return false;
    const diff = (new Date(t.endDate) - new Date()) / 864e5;
    return diff >= 0 && diff <= 7;
  });

  const byFamily = {};
  tasks.forEach(t => {
    if (!byFamily[t.family]) byFamily[t.family] = { label: t.familyLabel, total: 0, done: 0, overdue: 0, tasks: [] };
    byFamily[t.family].total++;
    if (t.status === 'Hecho') byFamily[t.family].done++;
    if (t.status !== 'Hecho' && t.endDate < today) byFamily[t.family].overdue++;
    byFamily[t.family].tasks.push(t);
  });

  const familySummary = Object.entries(byFamily).map(([code, data]) => {
    const epic = data.tasks.find(t => t.level === 'epic');
    return `${data.label}: ${data.done}/${data.total} completadas, ${data.overdue} vencidas. Iniciativa: "${epic?.name || '?'}" (${epic?.status || '?'})`;
  }).join('\n');

  const overdueList = overdue.slice(0, 20).map(t =>
    `- ${t.id} "${t.name}" (${t.familyLabel}) | Vencio: ${t.endDate} | Owner: ${t.owner} | Prioridad: ${t.priority}`
  ).join('\n');

  const milestonesSummary = Object.values(milestones).map(ms => {
    const days = Math.ceil((new Date(ms.date) - new Date()) / 864e5);
    const linked = tasks.filter(t => t.milestone === ms.key);
    const linkedDone = linked.filter(t => t.status === 'Hecho').length;
    return `${ms.label}: ${ms.date} (${days} dias) — ${linkedDone}/${linked.length} tareas listas`;
  }).join('\n');

  return `# Proyecto NEO DMSTK — ${today}
Espacios de experiencias creativas (wellness + arte manual). E1 Madrid, E2 Barcelona (Q1 2027).
Metodo PERMA. Piloto de validacion. GO/NO-GO con board inversores.

## Numeros: ${total} tareas, ${done} hechas (${Math.round(done/total*100)}%), ${overdue.length} vencidas, ${thisWeek.length} esta semana

## Hitos
${milestonesSummary}

## Por area
${familySummary}

## Vencidas (${overdue.length})
${overdueList || 'Ninguna'}`;
}

const SYSTEM_PROMPT = `Eres el PM experto del proyecto NEO DMSTK. Analiza datos reales y da respuestas precisas.

Reglas:
- Espanol, directo, sin rodeos, sin emojis
- Cada alerta: QUE pasa + POR QUE importa + QUE HACER concreto + QUIEN debe hacerlo
- Usa nombres reales: David (director), Christian (operaciones), Cristina (legal), Miguel Marquez (contenido)
- Se especifico: "David debe confirmar X antes del viernes" no "hay que resolver X"
- Formato: **negritas** para enfasis, - para listas`;

async function callGemini(context, userMessage) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: context + '\n\n---\n\n' + userMessage }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
    })
  });
  if (!response.ok) throw new Error('API ' + response.status);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
}

function formatText(text, PALETTE) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (line.trim().startsWith('#')) return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, marginTop: 8, marginBottom: 3 }} dangerouslySetInnerHTML={{ __html: html.replace(/^#+\s*/, '') }} />;
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) return <div key={i} style={{ fontSize: 11, color: PALETTE.soft, paddingLeft: 10, marginBottom: 1 }} dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s*/, '· ') }} />;
    if (line.trim() === '') return <div key={i} style={{ height: 4 }} />;
    return <div key={i} style={{ fontSize: 11, color: PALETTE.ink, marginBottom: 1 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

// Alertas estaticas (sin IA, se calculan al instante)
export function StaticAlerts({ tasks, milestones, PALETTE, onTaskClick }) {
  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.status !== 'Hecho' && t.endDate < today && !t.deleted);
  const p0pending = tasks.filter(t => t.priority === 'P0' && t.status === 'Pendiente' && !t.deleted);

  if (overdue.length === 0 && p0pending.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
      {overdue.length > 0 && (
        <div style={{ background: '#C0564A06', border: '1px solid #C0564A18', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: PALETTE.danger, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Vencidas ({overdue.length})</div>
          {overdue.slice(0, 5).map(t => (
            <div key={t.id} onClick={() => onTaskClick?.(t)} style={{ display: 'flex', alignItems: 'center', fontSize: 11, padding: '3px 0', cursor: 'pointer', borderBottom: '0.5px solid #C0564A08', gap: 6 }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: PALETTE.soft }}>{t.name}</span>
              <span style={{ fontSize: 9, color: PALETTE.muted, flexShrink: 0 }}>{t.owner}</span>
              <span style={{ fontSize: 8, color: PALETTE.danger, fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{Math.abs(Math.ceil((new Date(t.endDate) - new Date()) / 864e5))}d</span>
            </div>
          ))}
          {overdue.length > 5 && <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 3 }}>+ {overdue.length - 5} mas</div>}
        </div>
      )}
      {p0pending.length > 0 && (
        <div style={{ background: PALETTE.mostaza + '06', border: '1px solid ' + PALETTE.mostaza + '18', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: PALETTE.mostaza, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Criticas sin avanzar ({p0pending.length})</div>
          {p0pending.slice(0, 5).map(t => (
            <div key={t.id} onClick={() => onTaskClick?.(t)} style={{ display: 'flex', alignItems: 'center', fontSize: 11, padding: '3px 0', cursor: 'pointer', borderBottom: '0.5px solid ' + PALETTE.mostaza + '08', gap: 6 }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: PALETTE.soft }}>{t.name}</span>
              <span style={{ fontSize: 9, color: PALETTE.muted, flexShrink: 0 }}>{t.owner}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// PM flotante (ventana emergente)
export default function PMAgent({ tasks, milestones, PALETTE, SERIF }) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);

  const context = buildProjectContext(tasks || [], milestones || {});

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await callGemini(context,
        'Analiza el proyecto. Dame 3-5 alertas criticas. Para cada una:\n' +
        '1. Que pasa exactamente (tarea, fecha, responsable)\n' +
        '2. Que impacto tiene si no se resuelve\n' +
        '3. Accion concreta para resolverlo (quien, que, cuando)\n' +
        '4. Que debo lograr para que esta alerta desaparezca\n\n' +
        'Empieza con 2 lineas de resumen del estado general.'
      );
      setAnalysis(result);
    } catch (err) {
      setError('Error conectando con Gemini: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function askPM() {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    setConversation(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const result = await callGemini(context, q);
      setConversation(prev => [...prev, { role: 'pm', text: result }]);
    } catch (err) {
      setConversation(prev => [...prev, { role: 'pm', text: 'Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Boton flotante */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !analysis) runAnalysis(); }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 48, height: 48, borderRadius: 12,
          background: PALETTE.lagune, color: '#fff', border: 'none',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontSize: 18, fontWeight: 700, fontFamily: SERIF,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title="PM Inteligente"
      >
        {isOpen ? 'x' : 'PM'}
      </button>

      {/* Ventana flotante */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 999,
          width: 420, maxHeight: '70vh',
          background: PALETTE.bone, borderRadius: 12,
          border: '1px solid ' + PALETTE.faint,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + PALETTE.faint, background: PALETTE.warm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? PALETTE.mostaza : PALETTE.menthe, animation: loading ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.ink }}>PM Inteligente</span>
            </div>
            <button onClick={runAnalysis} disabled={loading} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, border: '1px solid ' + PALETTE.faint, background: 'transparent', cursor: loading ? 'wait' : 'pointer', color: PALETTE.lagune, fontWeight: 600 }}>
              {loading ? 'Analizando...' : 'Actualizar'}
            </button>
          </div>

          {/* Content - scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {error && <div style={{ fontSize: 11, color: PALETTE.danger, marginBottom: 8, padding: '6px 8px', background: PALETTE.danger + '08', borderRadius: 4 }}>{error}</div>}

            {loading && !analysis && (
              <div style={{ textAlign: 'center', padding: 24, color: PALETTE.muted, fontSize: 12 }}>Analizando {tasks?.length || 0} tareas...</div>
            )}

            {analysis && (
              <div style={{ marginBottom: 12 }}>{formatText(analysis, PALETTE)}</div>
            )}

            {conversation.map((msg, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: msg.role === 'user' ? PALETTE.lagune : PALETTE.mostaza, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                  {msg.role === 'user' ? 'Tu' : 'PM'}
                </div>
                <div style={{ padding: '6px 8px', background: msg.role === 'user' ? PALETTE.lagune + '06' : PALETTE.bone, borderRadius: 6, borderLeft: '2px solid ' + (msg.role === 'user' ? PALETTE.lagune : PALETTE.mostaza) }}>
                  {msg.role === 'user' ? <div style={{ fontSize: 11, color: PALETTE.ink }}>{msg.text}</div> : formatText(msg.text, PALETTE)}
                </div>
              </div>
            ))}
          </div>

          {/* Quick questions */}
          <div style={{ padding: '6px 16px', borderTop: '1px solid ' + PALETTE.faint + '40', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
            {['Priorizar esta semana', 'Riesgos del piloto', 'Resumen para el board', 'Tareas bloqueantes'].map((q, i) => (
              <button key={i} onClick={() => { setQuestion(q); }} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid ' + PALETTE.faint + '50', background: 'transparent', cursor: 'pointer', color: PALETTE.muted }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 16px 12px', borderTop: '1px solid ' + PALETTE.faint + '40', display: 'flex', gap: 6, flexShrink: 0 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !loading) askPM(); }}
              placeholder="Pregunta al PM..."
              disabled={loading}
              style={{ flex: 1, fontSize: 12, padding: '8px 10px', borderRadius: 6, border: '1px solid ' + PALETTE.faint, background: '#fff', color: PALETTE.ink, outline: 'none' }}
            />
            <button onClick={askPM} disabled={loading || !question.trim()} style={{ padding: '8px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: PALETTE.lagune, color: '#fff', cursor: loading ? 'wait' : 'pointer', opacity: loading || !question.trim() ? 0.5 : 1 }}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
