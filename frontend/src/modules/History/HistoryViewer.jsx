/**
 * HISTORY VIEWER - Visualizador de historial estilo Google Docs
 *
 * Muestra cambios con las 5Ws:
 * - WHO: Quién hizo el cambio (avatar + nombre)
 * - WHAT: Qué cambió (diff visual)
 * - WHEN: Cuándo (timestamp + relativo)
 * - WHERE: En qué campo
 * - WHY: Razón (si está disponible)
 */

import { useState, useEffect } from 'react';
import { History, RotateCcw, User, Calendar, Edit2, Trash2, Plus, X } from 'lucide-react';

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
  danger: "#C0564A",
};

const SERIF = "Georgia, 'Times New Roman', serif";

export default function HistoryViewer({ taskId, apiUrl, onClose, onRestore }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filter, setFilter] = useState('all'); // all, updates, major

  useEffect(() => {
    if (apiUrl) {
      loadHistory();
    } else {
      setError('Backend URL no configurado');
      setLoading(false);
    }
  }, [taskId, apiUrl]);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      // Si hay taskId, obtener historial de esa tarea; sino, historial global del proyecto
      const endpoint = taskId
        ? `${apiUrl}/api/history/task/${taskId}`
        : `${apiUrl}/api/history/project`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading history:', error);
      setError(error.message || 'Error al cargar el historial');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(entryId) {
    const entry = history.find(e => e.id === entryId);
    if (!entry) return;

    const confirmed = confirm(
      `¿Restaurar la tarea al estado del ${entry.formattedTimestamp}?\n\n` +
      `Esto revertirá todos los cambios realizados después de esa fecha.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${apiUrl}/api/history/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskId || entry.task_id,
          snapshotId: entryId,
          user: {
            id: 'web-user',
            name: 'Usuario Web'
          }
        }),
      });

      if (response.ok) {
        const restoredTask = await response.json();
        onRestore && onRestore(restoredTask);
        loadHistory(); // Recargar historial
        alert('✅ Tarea restaurada exitosamente');
      } else {
        throw new Error('Error restaurando tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al restaurar la tarea');
    }
  }

  const filteredHistory = (history || []).filter(entry => {
    if (!entry) return false;
    if (filter === 'all') return true;
    if (filter === 'updates') return entry.action === 'updated';
    if (filter === 'major') return ['created', 'deleted', 'restored'].includes(entry.action);
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '500px',
      height: '100vh',
      background: PALETTE.bone,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${PALETTE.faint}`,
        background: PALETTE.warm,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={24} color={PALETTE.lagune} />
            <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 20, color: PALETTE.ink }}>
              {taskId ? 'Historial de tarea' : 'Historial del proyecto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} color={PALETTE.soft} />
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'all', label: 'Todos' },
            { value: 'updates', label: 'Actualizaciones' },
            { value: 'major', label: 'Cambios mayores' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${filter === f.value ? PALETTE.lagune : PALETTE.faint}`,
                background: filter === f.value ? PALETTE.lagune : PALETTE.bone,
                color: filter === f.value ? '#fff' : PALETTE.soft,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: PALETTE.muted }}>
            Cargando historial...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              background: '#C0564A08',
              border: '1px solid #C0564A25',
              borderRadius: 10,
              padding: '20px',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 16, color: PALETTE.danger, marginBottom: 8 }}>
                ⚠ Error al cargar historial
              </div>
              <div style={{ fontSize: 13, color: PALETTE.soft }}>
                {error}
              </div>
            </div>
            <button
              onClick={() => loadHistory()}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: `1px solid ${PALETTE.lagune}`,
                background: PALETTE.bone,
                color: PALETTE.lagune,
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (!Array.isArray(filteredHistory) || filteredHistory.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: PALETTE.muted }}>
            <History size={48} color={PALETTE.faint} style={{ marginBottom: 12 }} />
            <p>No hay cambios registrados</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Línea vertical del timeline */}
            <div style={{
              position: 'absolute',
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              background: PALETTE.faint,
            }} />

            {/* Entradas */}
            {filteredHistory.map((entry, idx) => {
              if (!entry) return null;
              return (
                <div
                  key={entry.id || idx}
                  style={{
                    position: 'relative',
                    paddingLeft: 50,
                    paddingBottom: idx < filteredHistory.length - 1 ? 24 : 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                >
                  {/* Punto en timeline */}
                  <div style={{
                    position: 'absolute',
                    left: 12,
                    top: 4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: entry.color || PALETTE.lagune,
                    border: `2px solid ${PALETTE.bone}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                  }}>
                    {entry.icon || '•'}
                  </div>

                  {/* Card de cambio */}
                  <div style={{
                    background: selectedEntry === entry.id ? PALETTE.warm : PALETTE.bone,
                    border: `1px solid ${PALETTE.faint}`,
                    borderRadius: 8,
                    padding: 12,
                    transition: 'all 0.2s',
                  }}>
                    {/* Header del cambio */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <User size={14} color={PALETTE.soft} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: PALETTE.ink }}>
                          {entry.user_name || 'Usuario'}
                        </span>
                        <span style={{ fontSize: 11, color: PALETTE.muted }}>•</span>
                        <span style={{ fontSize: 11, color: PALETTE.muted }}>
                          {entry.relativeTime || 'Recientemente'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: PALETTE.soft }}>
                        {entry.description || 'Cambio registrado'}
                      </p>
                    </div>

                    {/* Diff expandible */}
                    {selectedEntry === entry.id && entry.action === 'updated' && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${PALETTE.faint}`,
                      }}>
                        <DiffViewer
                          field={entry.field}
                          oldValue={entry.oldValue}
                          newValue={entry.newValue}
                          visualDiff={entry.visualDiff}
                        />

                        {/* Botón de restaurar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(entry.id);
                          }}
                          style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            borderRadius: 6,
                            border: `1px solid ${PALETTE.lagune}`,
                            background: PALETTE.bone,
                            color: PALETTE.lagune,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        >
                          <RotateCcw size={14} />
                          Restaurar a esta versión
                        </button>
                      </div>
                    )}

                    {/* Timestamp detallado */}
                    <div style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      color: PALETTE.muted,
                    }}>
                      <Calendar size={12} />
                      {entry.formattedTimestamp || new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de visualización de diff
 */
function DiffViewer({ field, oldValue, newValue, visualDiff }) {
  if (visualDiff && typeof visualDiff === 'object' && visualDiff.type === 'date') {
    return (
      <div style={{ fontSize: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, padding: 8, background: '#FFE5E5', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>Antes</div>
            <div style={{ color: PALETTE.danger, fontWeight: 600 }}>
              {visualDiff.oldFormatted || '-'}
            </div>
          </div>
          <div style={{
            padding: '4px 8px',
            background: visualDiff.direction === 'forward' ? '#FFE5CC' : '#E5F3FF',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: visualDiff.direction === 'forward' ? '#D68910' : '#2E7DB8',
          }}>
            {visualDiff.message || '→'}
          </div>
          <div style={{ flex: 1, padding: 8, background: '#E5F8F0', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>Después</div>
            <div style={{ color: PALETTE.menthe, fontWeight: 600 }}>
              {visualDiff.newFormatted || '-'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualDiff && typeof visualDiff === 'object' && visualDiff.type === 'array') {
    return (
      <div style={{ fontSize: 12 }}>
        {Array.isArray(visualDiff.added) && visualDiff.added.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>
              Añadidas ({visualDiff.added.length})
            </div>
            {visualDiff.added.map((item, i) => (
              <div key={item || i} style={{
                padding: '4px 8px',
                background: '#E5F8F0',
                borderRadius: 4,
                marginBottom: 4,
                color: PALETTE.menthe,
              }}>
                + {String(item)}
              </div>
            ))}
          </div>
        )}
        {Array.isArray(visualDiff.removed) && visualDiff.removed.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>
              Eliminadas ({visualDiff.removed.length})
            </div>
            {visualDiff.removed.map((item, i) => (
              <div key={item || i} style={{
                padding: '4px 8px',
                background: '#FFE5E5',
                borderRadius: 4,
                marginBottom: 4,
                color: PALETTE.danger,
              }}>
                - {String(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Diff de texto simple
  let oldStr = oldValue != null ? (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)) : '-';
  let newStr = newValue != null ? (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)) : '-';

  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>Antes</div>
        <div style={{
          padding: 8,
          background: '#FFE5E5',
          borderRadius: 6,
          color: PALETTE.danger,
          wordBreak: 'break-word',
        }}>
          {oldStr}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: PALETTE.muted, marginBottom: 4 }}>Después</div>
        <div style={{
          padding: 8,
          background: '#E5F8F0',
          borderRadius: 6,
          color: PALETTE.menthe,
          wordBreak: 'break-word',
        }}>
          {String(newValue || '-')}
        </div>
      </div>
    </div>
  );
}
