import { useState, useMemo } from "react";
import { AlertTriangle, Link2, X } from "lucide-react";

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
  danger: "#C0564A",
  bone: "#FFFDF9",
};

const SERIF = "Georgia, 'Times New Roman', serif";

const WORKSTREAMS = [
  "Dirección", "Legal", "Método", "Profesor-Contenido", "Producto",
  "Branding", "Espacio-E1", "Equipo", "Piloto", "Tecnología",
];

const WS_COLORS = [
  PALETTE.lagune, PALETTE.lagune, "#7B6FA0", PALETTE.nectarine, PALETTE.mostaza,
  "#D4727E", PALETTE.menthe, PALETTE.lagune, PALETTE.nectarine, PALETTE.lagune,
];

const STATUS_COLORS = {
  Urgente: PALETTE.danger, "En curso": PALETTE.mostaza, Pendiente: PALETTE.lagune,
  Hecho: PALETTE.menthe, Bloqueado: "#8B7B74",
};

const STATUS_BG = {
  Urgente: "#C0564A18", "En curso": "#E2B93B18", Pendiente: "#6398A918",
  Hecho: "#96C7B318", Bloqueado: "#8B7B7418",
};

const TODAY = new Date("2026-04-10");

function toDate(s) { return new Date(s + "T00:00:00"); }
function formatDate(s) {
  return toDate(s).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
function daysLeft(s) { return Math.ceil((toDate(s) - TODAY) / 864e5); }

function Badge({ children, color, bg, style: extraStyle }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600,
      padding: "2px 7px", borderRadius: 3, background: bg || PALETTE.warm,
      color: color || PALETTE.soft, whiteSpace: "nowrap", letterSpacing: ".4px",
      fontFamily: "var(--font-mono)", ...extraStyle,
    }}>
      {children}
    </span>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 5, background: PALETTE.faint, borderRadius: 5, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color || PALETTE.lagune, borderRadius: 5, transition: "width .5s ease" }} />
    </div>
  );
}

function ProgressRing({ pct, size = 60, color = PALETTE.lagune }) {
  var radius = (size - 8) / 2;
  var circumference = 2 * Math.PI * radius;
  var offset = circumference - (pct / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={PALETTE.faint} strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 50 ? 14 : 10, fontWeight: 600, color: color, fontFamily: "var(--font-mono)" }}>{pct}%</div>
    </div>
  );
}

function FiveWsModal({ milestone, onClose, updateTask, owners }) {
  if (!milestone) return null;
  var [editMode, setEditMode] = useState(false);
  var [editedData, setEditedData] = useState({ ...milestone });

  var days = daysLeft(editedData.endDate);
  var isOverdue = days < 0;
  var isUrgent = days <= 7 && days >= 0;
  var startDate = toDate(editedData.startDate);
  var endDate = toDate(editedData.endDate);
  var duration = Math.ceil((endDate - startDate) / 864e5);

  function handleSave() {
    if (updateTask) {
      updateTask(milestone.id, editedData);
    }
    setEditMode(false);
  }

  function handleCancel() {
    setEditedData({ ...milestone });
    setEditMode(false);
  }

  var inputStyle = {
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1.5px solid " + PALETTE.lagune,
    background: PALETTE.bone,
    color: PALETTE.ink,
    fontFamily: SERIF,
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%"
  };

  var selectStyle = {
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 6,
    border: "1.5px solid " + PALETTE.lagune,
    background: PALETTE.bone,
    color: PALETTE.ink,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s ease"
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(44,41,38,0.6)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }} onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background: PALETTE.bone, borderRadius: 16, border: "1px solid " + PALETTE.faint, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>

        <div style={{ padding: "24px 32px", borderBottom: "1px solid " + PALETTE.faint, background: PALETTE.warm }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: PALETTE.mostaza }}>◆</span>
                <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, margin: 0, color: PALETTE.ink }}>{milestone.name}</h3>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge color={WS_COLORS[WORKSTREAMS.indexOf(milestone.ws)]} bg={WS_COLORS[WORKSTREAMS.indexOf(milestone.ws)] + "15"} style={{ fontSize: 11 }}>{milestone.ws}</Badge>
                <Badge color={STATUS_COLORS[milestone.status]} bg={STATUS_BG[milestone.status]} style={{ fontSize: 11 }}>{milestone.status}</Badge>
                {isOverdue ? <Badge color={PALETTE.danger} bg="#C0564A15" style={{ fontSize: 11, animation: "pulse 2s infinite" }}>VENCIDO</Badge> : isUrgent ? <Badge color={PALETTE.mostaza} bg="#E2B93B15" style={{ fontSize: 11 }}>URGENTE</Badge> : null}
              </div>
            </div>
            <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: PALETTE.muted, padding: 4, flexShrink: 0 }}><X size={20} /></button>
          </div>
        </div>

        <div style={{ padding: "28px 32px", overflowY: "auto", maxHeight: "calc(90vh - 200px)" }}>
          <div style={{ display: "grid", gap: 24 }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE.lagune + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>WHO · Responsable</div>
                </div>
              </div>
              <div style={{ paddingLeft: 40 }}>
                {editMode ? (
                  <select
                    value={editedData.owner || ""}
                    onChange={function(e) { setEditedData({ ...editedData, owner: e.target.value }); }}
                    style={selectStyle}>
                    {!editedData.owner && <option value="">Seleccionar responsable...</option>}
                    {owners && owners.length > 0 ? owners.map(function(o) {
                      return <option key={o} value={o}>{o}</option>;
                    }) : <option value="">No hay responsables disponibles</option>}
                  </select>
                ) : (
                  <div
                    onClick={function() { if (owners && owners.length > 0) setEditMode(true); }}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: PALETTE.ink,
                      fontFamily: SERIF,
                      cursor: owners && owners.length > 0 ? "pointer" : "default",
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "all 0.2s ease",
                      display: "inline-block"
                    }}
                    onMouseEnter={function(e) { if (owners && owners.length > 0) { e.currentTarget.style.background = PALETTE.warm; } }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                    {editedData.owner}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE.mostaza + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>WHAT · Descripción</div>
                </div>
              </div>
              <div style={{ paddingLeft: 40 }}>
                {editMode ? (
                  <textarea
                    value={editedData.notes || ""}
                    onChange={function(e) { setEditedData({ ...editedData, notes: e.target.value }); }}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
                    placeholder="Añade una descripción detallada..." />
                ) : (
                  <div
                    onClick={function() { setEditMode(true); }}
                    style={{
                      fontSize: 14,
                      color: editedData.notes ? PALETTE.soft : PALETTE.muted,
                      lineHeight: 1.6,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "all 0.2s ease",
                      fontStyle: editedData.notes ? "normal" : "italic"
                    }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = PALETTE.warm; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                    {editedData.notes || "Sin descripción detallada disponible. Click para editar."}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE.nectarine + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>WHEN · Timeline</div>
                </div>
              </div>
              <div style={{ paddingLeft: 40 }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 13 }}>
                  <span style={{ color: PALETTE.muted }}>Inicio:</span>
                  {editMode ? (
                    <input
                      type="date"
                      value={editedData.startDate}
                      onChange={function(e) { setEditedData({ ...editedData, startDate: e.target.value }); }}
                      style={{ ...inputStyle, fontSize: 13, padding: "4px 8px" }} />
                  ) : (
                    <span
                      onClick={function() { setEditMode(true); }}
                      style={{
                        fontWeight: 500,
                        color: PALETTE.ink,
                        cursor: "pointer",
                        padding: "2px 6px",
                        borderRadius: 4,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={function(e) { e.currentTarget.style.background = PALETTE.warm; }}
                      onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                      {formatDate(editedData.startDate)}
                    </span>
                  )}
                  <span style={{ color: PALETTE.muted }}>Fin:</span>
                  {editMode ? (
                    <input
                      type="date"
                      value={editedData.endDate}
                      onChange={function(e) { setEditedData({ ...editedData, endDate: e.target.value }); }}
                      style={{ ...inputStyle, fontSize: 13, padding: "4px 8px" }} />
                  ) : (
                    <span
                      onClick={function() { setEditMode(true); }}
                      style={{
                        fontWeight: 500,
                        color: isOverdue ? PALETTE.danger : PALETTE.ink,
                        cursor: "pointer",
                        padding: "2px 6px",
                        borderRadius: 4,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={function(e) { e.currentTarget.style.background = PALETTE.warm; }}
                      onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                      {formatDate(editedData.endDate)}
                    </span>
                  )}
                  <span style={{ color: PALETTE.muted }}>Duración:</span>
                  <span style={{ color: PALETTE.soft }}>{duration} días</span>
                  <span style={{ color: PALETTE.muted }}>Estado:</span>
                  <span style={{ fontWeight: 600, color: isOverdue ? PALETTE.danger : isUrgent ? PALETTE.mostaza : PALETTE.menthe }}>
                    {isOverdue ? `Vencido hace ${Math.abs(days)} días` : days === 0 ? "Vence hoy" : days === 1 ? "Vence mañana" : `${days} días restantes`}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE.menthe + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>WHERE · Workstream</div>
                </div>
              </div>
              <div style={{ paddingLeft: 40 }}>
                {editMode ? (
                  <select
                    value={editedData.ws}
                    onChange={function(e) { setEditedData({ ...editedData, ws: e.target.value }); }}
                    style={selectStyle}>
                    {WORKSTREAMS.map(function(ws) {
                      return <option key={ws} value={ws}>{ws}</option>;
                    })}
                  </select>
                ) : (
                  <div
                    onClick={function() { setEditMode(true); }}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: PALETTE.ink,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 6,
                      transition: "all 0.2s ease",
                      display: "inline-block"
                    }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = PALETTE.warm; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                    {editedData.ws}
                  </div>
                )}
                {!editMode && <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 4 }}>Área de trabajo principal</div>}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: PALETTE.danger + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>WHY · Riesgos y Dependencias</div>
                </div>
              </div>
              <div style={{ paddingLeft: 40 }}>
                {editedData.risk ? (
                  <div style={{ background: "#C0564A08", border: "1px solid #C0564A25", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <AlertTriangle size={12} style={{ color: PALETTE.danger }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.danger, textTransform: "uppercase", letterSpacing: ".5px" }}>Riesgo si se retrasa</span>
                    </div>
                    {editMode ? (
                      <textarea
                        value={editedData.risk || ""}
                        onChange={function(e) { setEditedData({ ...editedData, risk: e.target.value }); }}
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical", minHeight: 50, fontSize: 13, border: "1.5px solid " + PALETTE.danger }}
                        placeholder="¿Qué pasa si se retrasa?" />
                    ) : (
                      <div
                        onClick={function() { setEditMode(true); }}
                        style={{
                          fontSize: 13,
                          color: PALETTE.danger,
                          lineHeight: 1.5,
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: 4,
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = "#C0564A12"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                        {editedData.risk}
                      </div>
                    )}
                  </div>
                ) : (
                  editMode ? (
                    <textarea
                      value={editedData.risk || ""}
                      onChange={function(e) { setEditedData({ ...editedData, risk: e.target.value }); }}
                      rows={2}
                      style={{ ...inputStyle, resize: "vertical", minHeight: 50, fontSize: 13, border: "1.5px solid " + PALETTE.danger }}
                      placeholder="¿Qué pasa si se retrasa?" />
                  ) : (
                    <div
                      onClick={function() { setEditMode(true); }}
                      style={{
                        fontSize: 13,
                        color: PALETTE.muted,
                        fontStyle: "italic",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: 6,
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={function(e) { e.currentTarget.style.background = PALETTE.warm; }}
                      onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                      Sin riesgos identificados. Click para editar.
                    </div>
                  )
                )}
                {milestone.deps && milestone.deps.length > 0 ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: PALETTE.muted, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <Link2 size={11} />DEPENDENCIAS ({milestone.deps.length})
                    </div>
                    <div style={{ fontSize: 12, color: PALETTE.soft }}>Este hito depende de {milestone.deps.length} tarea{milestone.deps.length > 1 ? "s" : ""}</div>
                  </div>
                ) : null}
              </div>
            </div>

          </div>
        </div>

        <div style={{ padding: "16px 32px", borderTop: "1px solid " + PALETTE.faint, background: PALETTE.warm, display: "flex", justifyContent: editMode ? "space-between" : "flex-end", gap: 12 }}>
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid " + PALETTE.faint,
                  background: "transparent",
                  cursor: "pointer",
                  color: PALETTE.soft,
                  transition: "all 0.2s ease"
                }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  background: PALETTE.lagune,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: SERIF,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(99,152,169,0.25)"
                }}>
                Guardar cambios
              </button>
            </>
          ) : (
            <>
              <button
                onClick={function() { setEditMode(true); }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid " + PALETTE.lagune,
                  background: PALETTE.bone,
                  cursor: "pointer",
                  color: PALETTE.lagune,
                  transition: "all 0.2s ease"
                }}>
                Editar
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid " + PALETTE.faint,
                  background: PALETTE.bone,
                  cursor: "pointer",
                  color: PALETTE.ink
                }}>
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnhancedDashboard({ kpis, setModal, tasks, updateTask, owners }) {
  var milestones = kpis.milestones.slice(0, 5);
  var [fiveWsModal, setFiveWsModal] = useState(null);

  var ownerStats = useMemo(function() {
    var ownerMap = {};
    tasks.forEach(function(t) {
      if (!ownerMap[t.owner]) {
        ownerMap[t.owner] = { owner: t.owner, total: 0, done: 0, pending: 0, overdue: 0 };
      }
      ownerMap[t.owner].total++;
      if (t.status === "Hecho") ownerMap[t.owner].done++;
      else if (toDate(t.endDate) < TODAY) ownerMap[t.owner].overdue++;
      else ownerMap[t.owner].pending++;
    });
    return Object.values(ownerMap)
      .map(function(o) { return { ...o, pct: o.total ? Math.round(o.done / o.total * 100) : 0 }; })
      .sort(function(a, b) { return b.total - a.total; })
      .slice(0, 5);
  }, [tasks]);

  var milestoneStats = useMemo(function() {
    var allMilestones = tasks.filter(function(t) { return t.isMilestone; });
    var done = allMilestones.filter(function(m) { return m.status === "Hecho"; }).length;
    var pending = allMilestones.filter(function(m) { return m.status !== "Hecho"; }).length;
    var overdue = allMilestones.filter(function(m) { return m.status !== "Hecho" && toDate(m.endDate) < TODAY; }).length;
    return { total: allMilestones.length, done: done, pending: pending, overdue: overdue, pct: allMilestones.length ? Math.round(done / allMilestones.length * 100) : 0 };
  }, [tasks]);

  return (
    <div>
      {fiveWsModal ? <FiveWsModal milestone={fiveWsModal} onClose={function() { setFiveWsModal(null); }} updateTask={updateTask} owners={owners} /> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          ["Total tareas", kpis.total, kpis.pct + "% completado", PALETTE.ink],
          ["Completadas", kpis.done, null, PALETTE.menthe],
          ["Vencidas", kpis.overdue.length, kpis.overdue.length ? "Atención" : "Al día", kpis.overdue.length ? PALETTE.danger : PALETTE.menthe],
          ["Esta semana", kpis.thisWeek.length, null, PALETTE.mostaza],
        ].map(function(item, i) {
          return (
            <div key={i} style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 10, color: PALETTE.muted, letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 6 }}>{item[0]}</div>
              <div style={{ fontSize: 30, fontWeight: 400, fontFamily: SERIF, color: item[3], lineHeight: 1 }}>{item[1]}</div>
              {item[2] ? <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 6 }}>{item[2]}</div> : null}
            </div>
          );
        })}
      </div>

      {kpis.overdue.length > 0 ? (
        <div style={{ background: "#C0564A08", border: "1px solid #C0564A25", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <AlertTriangle size={14} style={{ color: PALETTE.danger }} />
            <span style={{ fontSize: 14, fontWeight: 400, color: PALETTE.danger, fontFamily: SERIF }}>Tareas vencidas</span>
          </div>
          {kpis.overdue.slice(0, 6).map(function(t) {
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "0.5px solid #C0564A12" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{t.name}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <Badge color={PALETTE.danger} bg="#C0564A15">{Math.abs(daysLeft(t.endDate))}d</Badge>
                  <button onClick={function() { setModal({ ...t }); }} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "0.5px solid " + PALETTE.faint, background: PALETTE.bone, cursor: "pointer", color: PALETTE.soft }}>Ver</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div>
          <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, marginBottom: 14 }}>Próximos hitos</h3>
          {milestones.length > 0 ? milestones.map(function(m) {
            var days = daysLeft(m.endDate);
            return (
              <div key={m.id} onClick={function() { setFiveWsModal(m); }} style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 8, padding: "12px 16px", marginBottom: 8, borderLeft: "3px solid " + (days <= 14 ? PALETTE.nectarine : PALETTE.mostaza), cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={function(e) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }} onMouseLeave={function(e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: SERIF, fontWeight: 500 }}>{m.name}</span>
                  <Badge color={days <= 14 ? PALETTE.danger : PALETTE.mostaza} bg={days <= 14 ? "#C0564A12" : "#E2B93B12"} style={{ fontSize: 12, fontWeight: 700 }}>{days}d</Badge>
                </div>
                <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 3 }}>{formatDate(m.endDate)} · {m.ws} · {m.owner}</div>
              </div>
            );
          }) : <div style={{ fontSize: 13, color: PALETTE.muted, fontStyle: "italic", padding: 20, textAlign: "center" }}>No hay hitos pendientes</div>}
        </div>
        <div>
          <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, marginBottom: 14 }}>Progreso de hitos</h3>
          <div style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 10, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <ProgressRing pct={milestoneStats.pct} size={80} color={milestoneStats.pct >= 70 ? PALETTE.menthe : milestoneStats.pct >= 40 ? PALETTE.mostaza : PALETTE.danger} />
              <div style={{ flex: 1, paddingLeft: 20 }}>
                <div style={{ fontSize: 11, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: ".6px", fontFamily: "var(--font-mono)", marginBottom: 8 }}>Estado de hitos</div>
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: PALETTE.soft }}>Completados</span>
                    <span style={{ fontWeight: 600, color: PALETTE.menthe }}>{milestoneStats.done}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: PALETTE.soft }}>Pendientes</span>
                    <span style={{ fontWeight: 600, color: PALETTE.mostaza }}>{milestoneStats.pending}</span>
                  </div>
                  {milestoneStats.overdue > 0 ? (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: PALETTE.soft }}>Vencidos</span>
                      <span style={{ fontWeight: 600, color: PALETTE.danger }}>{milestoneStats.overdue}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, marginBottom: 14 }}>Progreso por workstream</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {kpis.byWs.filter(function(w) { return w.total > 0; }).map(function(w) {
            return (
              <div key={w.ws} style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: PALETTE.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.ws}</div>
                    <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 2 }}>{w.done}/{w.total} tareas</div>
                  </div>
                  <ProgressRing pct={w.pct} size={50} color={w.color} />
                </div>
                <ProgressBar pct={w.pct} color={w.color} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, marginBottom: 14 }}>Top responsables</h3>
        <div style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 10, padding: "20px 24px" }}>
          {ownerStats.map(function(o, idx) {
            return (
              <div key={o.owner} style={{ display: "grid", gridTemplateColumns: "24px 1fr 60px 50px", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: idx < ownerStats.length - 1 ? "0.5px solid " + PALETTE.faint : "none" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: PALETTE.muted, fontFamily: SERIF }}>#{idx + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: PALETTE.ink }}>{o.owner}</div>
                  <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 2 }}>
                    {o.done} completadas · {o.pending} pendientes
                    {o.overdue > 0 ? <span style={{ color: PALETTE.danger, fontWeight: 600 }}> · {o.overdue} vencidas</span> : null}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ProgressBar pct={o.pct} color={o.pct >= 70 ? PALETTE.menthe : o.pct >= 40 ? PALETTE.mostaza : PALETTE.nectarine} />
                </div>
                <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: o.pct >= 70 ? PALETTE.menthe : o.pct >= 40 ? PALETTE.mostaza : PALETTE.nectarine, fontFamily: "var(--font-mono)" }}>{o.pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
