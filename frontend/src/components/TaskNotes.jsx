import { useState, useEffect, useRef } from 'react';
import { dbSelect, dbInsert, isAuthenticated } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, Trash2 } from 'lucide-react';

const PALETTE = {
  nectarine: "#D7897F", mostaza: "#E2B93B", menthe: "#96C7B3",
  lagune: "#6398A9", cream: "#FAF8F4", warm: "#F3EDE6",
  ink: "#2C2926", soft: "#5C5650", muted: "#9A948C",
  faint: "#D8D2CA", danger: "#C0564A", bone: "#FFFDF9",
};

export default function TaskNotes({ taskId, taskName }) {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!taskId || !isAuthenticated()) { setLoading(false); return; }
    loadNotes();
  }, [taskId]);

  async function loadNotes() {
    try {
      const data = await dbSelect('task_notes', `task_id=eq.${taskId}&select=*&order=created_at.asc`);
      setNotes(data || []);
    } catch (e) {
      console.warn('[Notes] Error cargando:', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!newNote.trim() || sending) return;
    setSending(true);
    try {
      const note = {
        task_id: taskId,
        user_id: user?.id,
        user_name: profile?.display_name || user?.email?.split('@')[0] || 'Usuario',
        user_email: user?.email,
        content: newNote.trim(),
      };
      await dbInsert('task_notes', note);
      setNewNote('');
      await loadNotes();
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.warn('[Notes] Error enviando:', e.message);
    } finally {
      setSending(false);
    }
  }

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'ahora';
    if (diff < 3600) return Math.floor(diff / 60) + 'min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  }

  // Colores por usuario (consistente por email)
  function userColor(email) {
    const colors = [PALETTE.lagune, PALETTE.nectarine, PALETTE.mostaza, '#8b5cf6', '#10b981', '#f59e0b'];
    const hash = (email || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  return (
    <div style={{ borderTop: '1px solid ' + PALETTE.faint, marginTop: 16, paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <MessageCircle size={14} color={PALETTE.lagune} />
        <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.soft, textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Notas del equipo
        </span>
        {notes.length > 0 && (
          <span style={{ fontSize: 10, color: PALETTE.muted, background: PALETTE.warm, padding: '1px 6px', borderRadius: 10 }}>
            {notes.length}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: 11, color: PALETTE.muted, padding: 8 }}>Cargando notas...</div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
          {notes.length === 0 && (
            <div style={{ fontSize: 11, color: PALETTE.muted, padding: '8px 0', fontStyle: 'italic' }}>
              Sin notas. Se el primero en comentar.
            </div>
          )}
          {notes.map((note) => {
            const color = userColor(note.user_email);
            const isOwn = note.user_id === user?.id;
            return (
              <div key={note.id} style={{ display: 'flex', gap: 8, marginBottom: 8, padding: '6px 0' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: color + '20', color: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {(note.user_name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: color }}>{note.user_name}</span>
                    <span style={{ fontSize: 9, color: PALETTE.muted }}>{timeAgo(note.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: PALETTE.ink, lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {note.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      )}

      {/* Input para nueva nota — todos pueden escribir, incluso viewers */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
          placeholder="Escribe una nota para el equipo..."
          rows={1}
          style={{
            flex: 1, fontSize: 12, padding: '8px 10px', borderRadius: 8,
            border: '1px solid ' + PALETTE.faint, background: PALETTE.cream,
            color: PALETTE.ink, outline: 'none', resize: 'none',
            fontFamily: 'inherit', lineHeight: 1.4,
            minHeight: 36, maxHeight: 80,
          }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim() || sending}
          style={{
            padding: '8px 10px', borderRadius: 8, border: 'none',
            background: newNote.trim() ? PALETTE.lagune : PALETTE.faint,
            color: '#fff', cursor: newNote.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', flexShrink: 0,
            opacity: sending ? 0.5 : 1,
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
