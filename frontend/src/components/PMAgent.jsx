import { useState, useEffect, useRef } from 'react';
import { dbSelect, dbInsert, isAuthenticated } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

// Gemini API key — configurable via env var o hardcoded
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`
  : null;

function buildProjectContext(tasks, milestones) {
  const today = new Date().toISOString().split('T')[0];
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Hecho').length;
  const inProgress = tasks.filter(t => t.status === 'En curso').length;
  const overdue = tasks.filter(t => t.status !== 'Hecho' && t.endDate < today);
  const thisWeek = tasks.filter(t => {
    if (t.status === 'Hecho') return false;
    const diff = (new Date(t.endDate) - new Date()) / 864e5;
    return diff >= 0 && diff <= 7;
  });
  const p0 = tasks.filter(t => t.priority === 'P0' && t.status !== 'Hecho');

  const byFamily = {};
  tasks.forEach(t => {
    if (!byFamily[t.family]) byFamily[t.family] = { label: t.familyLabel || t.family, total: 0, done: 0, overdue: 0 };
    byFamily[t.family].total++;
    if (t.status === 'Hecho') byFamily[t.family].done++;
    if (t.status !== 'Hecho' && t.endDate < today) byFamily[t.family].overdue++;
  });

  const familySummary = Object.entries(byFamily).map(([code, d]) =>
    `${d.label} (${code}): ${d.done}/${d.total} hechas, ${d.overdue} vencidas`
  ).join('\n');

  const overdueTop = overdue.slice(0, 15).map(t =>
    `- [${t.priority}] "${t.name}" | Area: ${t.familyLabel} | Vencio: ${t.endDate} | Owner: ${t.owner}`
  ).join('\n');

  const thisWeekTop = thisWeek.slice(0, 10).map(t =>
    `- [${t.priority}] "${t.name}" | Fin: ${t.endDate} | Owner: ${t.owner} | Estado: ${t.status}`
  ).join('\n');

  const milestonesSummary = milestones ? Object.values(milestones).map(ms => {
    const days = Math.ceil((new Date(ms.date) - new Date()) / 864e5);
    return `${ms.label}: ${ms.date} (${days > 0 ? days + ' dias' : Math.abs(days) + ' dias pasado'})`;
  }).join('\n') : 'Sin hitos definidos';

  return `# Estado del Proyecto NEO DMSTK — ${today}
Espacios de experiencias creativas (wellness + arte manual). Soft opening 1 sept 2026.
E1 Madrid (en construccion), E2 Barcelona (Q1 2027).

## Resumen: ${total} tareas | ${done} hechas (${Math.round(done/total*100)}%) | ${inProgress} en curso | ${overdue.length} vencidas | ${p0.length} criticas pendientes

## Hitos
${milestonesSummary}

## Por area
${familySummary}

## Esta semana (${thisWeek.length})
${thisWeekTop || 'Nada pendiente esta semana'}

## Vencidas (${overdue.length})
${overdueTop || 'Ninguna'}

## Criticas P0 pendientes (${p0.length})
${p0.map(t => `- "${t.name}" | Owner: ${t.owner} | Fin: ${t.endDate}`).join('\n') || 'Ninguna'}`;
}

const SYSTEM_PROMPT = `Eres el PM Senior experto del proyecto NEO DMSTK. Tu trabajo es analizar datos REALES del proyecto y dar recomendaciones concretas.

CONTEXTO DEL NEGOCIO:
- DMSTK HOUSES: espacios de experiencias creativas (taller + retail + comunidad)
- Equipo: David/Dupo (director general), Christian (PM/operaciones), Cristina (legal), Miguel Marquez (contenido)
- Hito critico: soft opening 1 sept 2026, espacio reformado mediados agosto
- Piloto de validacion antes de GO/NO-GO con inversores

REGLAS ABSOLUTAS:
1. Solo espanol. Directo, profesional, sin rodeos, sin emojis
2. Cada recomendacion: QUE hacer + QUIEN lo hace + PARA CUANDO
3. Usa nombres reales del equipo, nunca "alguien deberia..."
4. Prioriza por impacto en el soft opening de septiembre
5. Si algo esta en peligro, dilo claro con datos (X tareas vencidas en area Y)
6. Formato markdown: **negritas**, listas con -, headers con ##`;

async function callGemini(context, userMessage) {
  if (!GEMINI_URL) throw new Error('API key de Gemini no configurada. Agrega VITE_GEMINI_API_KEY en las variables de entorno.');
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: context + '\n\n---\nPREGUNTA: ' + userMessage }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API ${response.status}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta del modelo';
}

function formatText(text, PALETTE) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (line.trim().startsWith('##')) return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, marginTop: 10, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: html.replace(/^#+\s*/, '') }} />;
    if (line.trim().startsWith('#')) return <div key={i} style={{ fontSize: 14, fontWeight: 700, color: PALETTE.ink, marginTop: 12, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: html.replace(/^#+\s*/, '') }} />;
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) return <div key={i} style={{ fontSize: 11, color: PALETTE.soft, paddingLeft: 10, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: html.replace(/^[-*]\s*/, '· ') }} />;
    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
    return <div key={i} style={{ fontSize: 11, color: PALETTE.ink, marginBottom: 2, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

// Briefing diario — se genera automaticamente si no hay uno de hoy
async function getDailyBriefing(tasks, milestones) {
  if (!isAuthenticated()) return null;

  // Verificar si ya hay briefing de hoy
  const today = new Date().toISOString().split('T')[0];
  try {
    const existing = await dbSelect('pm_briefings', `date=eq.${today}&select=*`);
    if (existing?.length > 0) return existing[0];
  } catch (e) {
    // Tabla puede no existir aun
    return null;
  }

  // Generar nuevo briefing
  try {
    const context = buildProjectContext(tasks, milestones);
    const briefing = await callGemini(context,
      'Genera el briefing diario del proyecto. Estructura:\n' +
      '1. ESTADO GENERAL (2 lineas)\n' +
      '2. LO QUE NECESITA ATENCION HOY (3-5 items concretos)\n' +
      '3. RIESGOS ACTIVOS (que puede salir mal esta semana)\n' +
      '4. RECOMENDACION DEL DIA (1 accion que mas impacto tendria)'
    );

    const overdue = tasks.filter(t => t.status !== 'Hecho' && t.endDate < today);

    // Guardar en Supabase
    try {
      await dbInsert('pm_briefings', {
        date: today,
        summary: briefing,
        task_count: tasks.length,
        overdue_count: overdue.length,
      });
    } catch (e) {
      // Si falla guardar, devolver el briefing igual
    }

    return { date: today, summary: briefing, task_count: tasks.length, overdue_count: overdue.length };
  } catch (e) {
    console.warn('[PM] Error generando briefing:', e.message);
    return null;
  }
}

// Alertas estaticas (sin IA)
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

// Briefing diario (aparece en el dashboard)
export function DailyBriefing({ tasks, milestones, PALETTE }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !tasks?.length) return;
    loaded.current = true;

    getDailyBriefing(tasks, milestones).then(b => {
      setBriefing(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tasks, milestones]);

  if (loading) return (
    <div style={{ padding: '12px 16px', background: PALETTE.lagune + '08', borderRadius: 8, marginBottom: 14, border: '1px solid ' + PALETTE.lagune + '15' }}>
      <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: PALETTE.lagune, fontFamily: 'var(--font-mono)' }}>
        Generando briefing del dia...
      </div>
    </div>
  );

  if (!briefing?.summary) return null;

  return (
    <div style={{ padding: '12px 16px', background: PALETTE.lagune + '06', borderRadius: 8, marginBottom: 14, border: '1px solid ' + PALETTE.lagune + '12' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: PALETTE.lagune, fontFamily: 'var(--font-mono)' }}>
          Briefing del dia — {briefing.date}
        </div>
        <div style={{ fontSize: 9, color: PALETTE.muted }}>{briefing.task_count} tareas | {briefing.overdue_count} vencidas</div>
      </div>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {formatText(briefing.summary, PALETTE)}
      </div>
    </div>
  );
}

// PM flotante (chat)
export default function PMAgent({ tasks, milestones, PALETTE, SERIF }) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const context = buildProjectContext(tasks || [], milestones || {});

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await callGemini(context,
        'Analiza el proyecto para ' + (profile?.display_name || 'el equipo') + '. Dame:\n' +
        '1. Estado general en 2 lineas\n' +
        '2. Las 3-5 cosas mas urgentes (con responsable y fecha)\n' +
        '3. Riesgos que veo esta semana\n' +
        '4. Mi recomendacion principal para hoy'
      );
      setAnalysis(result);
    } catch (err) {
      setError('Error: ' + err.message);
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
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  return (
    <>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen && !analysis) runAnalysis(); }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 48, height: 48, borderRadius: 12,
          background: PALETTE.lagune, color: '#fff', border: 'none',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontSize: 18, fontWeight: 700, fontFamily: SERIF,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="PM Inteligente"
      >
        {isOpen ? 'x' : 'PM'}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 999,
          width: 440, maxHeight: '75vh',
          background: PALETTE.bone, borderRadius: 12,
          border: '1px solid ' + PALETTE.faint,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + PALETTE.faint, background: PALETTE.warm, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? PALETTE.mostaza : PALETTE.menthe }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE.ink }}>PM Inteligente</span>
              <span style={{ fontSize: 9, color: PALETTE.muted }}>Gemini</span>
            </div>
            <button onClick={runAnalysis} disabled={loading} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, border: '1px solid ' + PALETTE.faint, background: 'transparent', cursor: loading ? 'wait' : 'pointer', color: PALETTE.lagune, fontWeight: 600 }}>
              {loading ? 'Analizando...' : 'Actualizar'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {error && <div style={{ fontSize: 11, color: PALETTE.danger, marginBottom: 8, padding: '6px 8px', background: PALETTE.danger + '08', borderRadius: 4 }}>{error}</div>}

            {loading && !analysis && (
              <div style={{ textAlign: 'center', padding: 24, color: PALETTE.muted, fontSize: 12 }}>Analizando {tasks?.length || 0} tareas...</div>
            )}

            {analysis && <div style={{ marginBottom: 12 }}>{formatText(analysis, PALETTE)}</div>}

            {conversation.map((msg, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: msg.role === 'user' ? PALETTE.lagune : PALETTE.mostaza, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                  {msg.role === 'user' ? (profile?.display_name || 'Tu') : 'PM'}
                </div>
                <div style={{ padding: '6px 8px', background: msg.role === 'user' ? PALETTE.lagune + '06' : PALETTE.bone, borderRadius: 6, borderLeft: '2px solid ' + (msg.role === 'user' ? PALETTE.lagune : PALETTE.mostaza) }}>
                  {msg.role === 'user' ? <div style={{ fontSize: 11, color: PALETTE.ink }}>{msg.text}</div> : formatText(msg.text, PALETTE)}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '6px 16px', borderTop: '1px solid ' + PALETTE.faint + '40', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
            {['Que priorizo hoy?', 'Estado del piloto', 'Riesgos esta semana', 'Resumen para Dupo'].map((q, i) => (
              <button key={i} onClick={() => { setQuestion(q); }} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid ' + PALETTE.faint + '50', background: 'transparent', cursor: 'pointer', color: PALETTE.muted }}>{q}</button>
            ))}
          </div>

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
