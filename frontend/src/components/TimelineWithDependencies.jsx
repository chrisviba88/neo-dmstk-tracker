import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Link2 } from "lucide-react";

// Esta es una versión mejorada del TimelineView con visualización de dependencias
// Para usar: reemplazar TimelineView en App.jsx con este componente

export function TimelineWithDependencies({
  tasks,
  expandedWs,
  setExpandedWs,
  PALETTE,
  WORKSTREAMS,
  WS_COLORS,
  SERIF,
  RANGE_START,
  RANGE_END,
  RANGE_DAYS,
  TODAY,
  Badge,
  formatDate,
  toDate,
  BACKEND_URL
}) {
  const [depImpactModal, setDepImpactModal] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [taskPositions, setTaskPositions] = useState({});

  const months = [];
  for (let m = 3; m <= 10; m++) months.push(new Date(2026, m, 1));

  const todayPct = ((TODAY - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
  const grouped = WORKSTREAMS.map((ws, i) => ({
    ws,
    color: WS_COLORS[i],
    tasks: tasks.filter(t => t.ws === ws)
  })).filter(g => g.tasks.length > 0);

  const NAME_W = 300;

  function getPos(start, end) {
    const a = Math.max(0, (toDate(start) - RANGE_START) / 864e5);
    const b = Math.max(a + 2, (toDate(end) - RANGE_START) / 864e5);
    return { left: (a / RANGE_DAYS) * 100, width: ((b - a) / RANGE_DAYS) * 100 };
  }

  function getDependencyColor(depTask) {
    if (!depTask) return PALETTE.lagune;
    if (depTask.status === "Hecho") return PALETTE.menthe;
    if (depTask.status === "Bloqueado" || toDate(depTask.endDate) < TODAY) return PALETTE.danger;
    if (depTask.status === "En curso") return PALETTE.mostaza;
    return PALETTE.lagune;
  }

  async function analyzeImpact(taskId, newEndDate) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dependencies/analyze-impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newEndDate })
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing impact:', error);
      return null;
    }
  }

  async function propagateDependencies(taskId, newEndDate) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dependencies/propagate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newEndDate })
      });
      return await response.json();
    } catch (error) {
      console.error('Error propagating dependencies:', error);
      return null;
    }
  }

  // Calcular posiciones de las barras de tareas para dibujar líneas
  useEffect(() => {
    const positions = {};
    grouped.forEach(g => {
      if (expandedWs[g.ws] !== false) {
        g.tasks.forEach(t => {
          const elem = document.getElementById(`task-bar-${t.id}`);
          if (elem) {
            const rect = elem.getBoundingClientRect();
            const container = elem.closest('.timeline-container');
            if (container) {
              const containerRect = container.getBoundingClientRect();
              positions[t.id] = {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2,
                endX: rect.right - containerRect.left
              };
            }
          }
        });
      }
    });
    setTaskPositions(positions);
  }, [tasks, expandedWs, grouped]);

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <div className="timeline-container" style={{ minWidth: 1100, position: "relative" }}>
          {/* SVG overlay para líneas de dependencias */}
          <svg style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1
          }}>
            <defs>
              <marker id="arrowhead-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={PALETTE.menthe} />
              </marker>
              <marker id="arrowhead-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={PALETTE.danger} />
              </marker>
              <marker id="arrowhead-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={PALETTE.lagune} />
              </marker>
              <marker id="arrowhead-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill={PALETTE.mostaza} />
              </marker>
            </defs>
            {tasks.map(t => {
              if (!t.deps || t.deps.length === 0) return null;
              const targetPos = taskPositions[t.id];
              if (!targetPos) return null;

              return t.deps.map(depId => {
                const depTask = tasks.find(dt => dt.id === depId);
                const sourcePos = taskPositions[depId];
                if (!sourcePos || !depTask) return null;

                const color = getDependencyColor(depTask);
                const markerId = color === PALETTE.menthe ? "arrowhead-green" :
                              color === PALETTE.danger ? "arrowhead-red" :
                              color === PALETTE.mostaza ? "arrowhead-yellow" : "arrowhead-blue";

                // Calcular puntos de control para curva Bezier
                const midX = (sourcePos.endX + targetPos.x) / 2;
                const path = `M ${sourcePos.endX} ${sourcePos.y} ` +
                           `Q ${midX} ${sourcePos.y} ${midX} ${(sourcePos.y + targetPos.y) / 2} ` +
                           `T ${targetPos.x - 8} ${targetPos.y}`;

                return (
                  <g key={`${depId}-${t.id}`}>
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.6"
                      markerEnd={`url(#${markerId})`}
                    />
                  </g>
                );
              });
            })}
          </svg>

          <div style={{ display: "flex", borderBottom: `1px solid ${PALETTE.faint}`, paddingBottom: 6, marginBottom: 4, position: "relative", zIndex: 2 }}>
            <div style={{ width: NAME_W, flexShrink: 0, fontSize: 10, fontFamily: "var(--font-mono)", color: PALETTE.muted, letterSpacing: 1, padding: "4px 0", textTransform: "uppercase" }}>Tarea</div>
            <div style={{ flex: 1, position: "relative", height: 20 }}>
              {months.map((mo, i) => {
                const pct = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                return (
                  <div key={i} style={{ position: "absolute", left: `${pct}%`, fontSize: 10, fontFamily: "var(--font-mono)", color: PALETTE.muted, letterSpacing: ".5px", textTransform: "uppercase", top: 2 }}>
                    {mo.toLocaleDateString("es-ES", { month: "short" })}
                  </div>
                );
              })}
            </div>
          </div>

          {grouped.map(g => {
            const isExp = expandedWs[g.ws] !== false;
            const doneCount = g.tasks.filter(t => t.status === "Hecho").length;
            return (
              <div key={g.ws} style={{ marginBottom: 2, position: "relative", zIndex: 2 }}>
                <div
                  onClick={() => setExpandedWs(prev => ({ ...prev, [g.ws]: !isExp }))}
                  style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "8px 0", background: PALETTE.warm, borderRadius: 6, marginBottom: 2 }}
                >
                  <div style={{ width: NAME_W, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, paddingLeft: 10 }}>
                    {isExp ? <ChevronDown size={12} color={PALETTE.muted} /> : <ChevronRight size={12} color={PALETTE.muted} />}
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
                    <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500 }}>{g.ws}</span>
                    <Badge style={{ fontSize: 9 }}>{doneCount}/{g.tasks.length}</Badge>
                  </div>
                </div>

                {isExp && g.tasks.map(t => {
                  const pos = getPos(t.startDate, t.endDate);
                  const isOverdue = t.status !== "Hecho" && toDate(t.endDate) < TODAY;
                  const isDone = t.status === "Hecho";
                  const hasDeps = t.deps && t.deps.length > 0;

                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", padding: "5px 0", borderBottom: `0.5px solid ${PALETTE.faint}08` }}>
                      <div style={{ width: NAME_W, flexShrink: 0, paddingLeft: 36, display: "flex", alignItems: "center", gap: 6, minWidth: 0, paddingRight: 12 }}>
                        {t.isMilestone && <span style={{ color: PALETTE.mostaza, fontSize: 11, flexShrink: 0 }}>◆</span>}
                        {hasDeps && <Link2 size={10} style={{ color: PALETTE.lagune, flexShrink: 0, opacity: 0.6 }} />}
                        <span style={{
                          fontSize: 13,
                          fontWeight: t.isMilestone ? 500 : 400,
                          fontFamily: t.isMilestone ? SERIF : "inherit",
                          color: isOverdue ? PALETTE.danger : isDone ? PALETTE.menthe : PALETTE.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                        title={`${t.name}\n${t.owner} · ${formatDate(t.startDate)} → ${formatDate(t.endDate)}${t.risk ? '\n⚠ ' + t.risk : ''}`}>
                          {t.name}
                        </span>
                        {isOverdue && <span style={{ animation: "pulse 2s infinite", fontSize: 7, color: PALETTE.danger, flexShrink: 0 }}>●</span>}
                        <span style={{ fontSize: 10, color: PALETTE.muted, flexShrink: 0, marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                          {t.owner.split(" ")[0]}
                        </span>
                      </div>

                      <div style={{ flex: 1, position: "relative", height: 22 }}>
                        {months.map((mo, i) => {
                          const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                          return <div key={i} style={{ position: "absolute", left: `${mp}%`, top: 0, bottom: 0, width: "0.5px", background: PALETTE.faint + "50" }} />;
                        })}

                        <div
                          id={`task-bar-${t.id}`}
                          title={`${t.name} — ${formatDate(t.startDate)} → ${formatDate(t.endDate)}`}
                          style={{
                            position: "absolute",
                            left: `${pos.left}%`,
                            width: `${pos.width}%`,
                            top: 5,
                            height: 12,
                            borderRadius: t.isMilestone ? 2 : 6,
                            background: isDone ? PALETTE.menthe + "70" : isOverdue ? PALETTE.danger + "55" : g.color + "45",
                            border: t.isMilestone ? `1.5px solid ${g.color}` : "none",
                            transition: "all .3s",
                            animation: isOverdue ? "pulse 3s infinite" : "none",
                          }}
                        >
                          {isDone && <div style={{ height: "100%", borderRadius: "inherit", background: PALETTE.menthe }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${NAME_W}px + (100% - ${NAME_W}px) * ${todayPct / 100})`,
            width: 2,
            background: PALETTE.nectarine,
            zIndex: 5,
            pointerEvents: "none",
            opacity: 0.85,
          }}>
            <div style={{
              position: "absolute",
              top: -4,
              left: -14,
              fontSize: 9,
              fontWeight: 600,
              color: PALETTE.nectarine,
              fontFamily: "var(--font-mono)",
              background: PALETTE.cream,
              padding: "1px 5px",
              borderRadius: 3,
              border: `1px solid ${PALETTE.nectarine}`
            }}>
              Hoy
            </div>
          </div>
        </div>
      </div>

      {/* Modal de impacto de dependencias */}
      {depImpactModal && (
        <DependencyImpactModal
          task={depImpactModal.task}
          newEndDate={depImpactModal.newEndDate}
          impactData={impactData}
          onConfirm={async () => {
            await propagateDependencies(depImpactModal.task.id, depImpactModal.newEndDate);
            setDepImpactModal(null);
            setImpactData(null);
          }}
          onCancel={() => {
            setDepImpactModal(null);
            setImpactData(null);
          }}
          PALETTE={PALETTE}
          SERIF={SERIF}
          formatDate={formatDate}
        />
      )}
    </>
  );
}

// Modal de impacto de dependencias
function DependencyImpactModal({ task, newEndDate, impactData, onConfirm, onCancel, PALETTE, SERIF, formatDate }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(44,41,38,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: PALETTE.bone,
          borderRadius: 16,
          border: `1px solid ${PALETTE.faint}`,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${PALETTE.faint}`,
          background: PALETTE.warm
        }}>
          <h3 style={{
            fontFamily: SERIF,
            fontSize: 20,
            fontWeight: 400,
            margin: 0,
            color: PALETTE.ink
          }}>
            Impacto en Dependencias
          </h3>
          <p style={{
            fontSize: 13,
            color: PALETTE.soft,
            margin: "8px 0 0 0"
          }}>
            Cambiar fecha de "{task.name}" afectará otras tareas
          </p>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{
            background: PALETTE.warm,
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            border: `1px solid ${PALETTE.faint}`
          }}>
            <div style={{ fontSize: 11, color: PALETTE.muted, marginBottom: 4 }}>Nueva fecha de finalización</div>
            <div style={{ fontSize: 16, fontFamily: SERIF, color: PALETTE.ink }}>
              {formatDate(newEndDate)}
            </div>
          </div>

          {impactData && impactData.affectedTasks && impactData.affectedTasks.length > 0 ? (
            <>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".8px",
                color: PALETTE.muted,
                fontFamily: "var(--font-mono)",
                marginBottom: 12
              }}>
                Tareas afectadas ({impactData.affectedTasks.length})
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {impactData.affectedTasks.map((affectedTask, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      background: PALETTE.warm,
                      borderRadius: 6,
                      marginBottom: 8,
                      border: `1px solid ${PALETTE.faint}`
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {affectedTask.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft }}>
                      {affectedTask.oldEndDate && affectedTask.newEndDate && (
                        <>
                          {formatDate(affectedTask.oldEndDate)} → {formatDate(affectedTask.newEndDate)}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: "center",
              padding: 20,
              color: PALETTE.muted,
              fontSize: 13
            }}>
              No hay tareas dependientes afectadas
            </div>
          )}
        </div>

        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid ${PALETTE.faint}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          background: PALETTE.warm
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              border: `1px solid ${PALETTE.faint}`,
              background: "transparent",
              cursor: "pointer",
              color: PALETTE.soft
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              background: PALETTE.nectarine,
              color: "#fff",
              cursor: "pointer",
              fontFamily: SERIF
            }}
          >
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimelineWithDependencies;
