import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, List, CalendarRange, Plus, X, Search,
  AlertTriangle, Trash2, RotateCcw, ChevronDown, ChevronRight,
  Save, ArrowUpDown, Link2, Users, ArrowRight, Wifi, WifiOff, MessageCircle, TrendingUp, History, Eye, EyeOff, Check,
  LogOut, User as UserIcon
} from "lucide-react";
import { supabase, BACKEND_URL } from './lib/supabase';
import { dbSelect, dbInsert, dbUpdate, dbDelete, isAuthenticated } from './lib/db';
import { connectRealtime, disconnect as disconnectRealtime } from './lib/realtime';
import { useAuth } from './contexts/AuthContext';
import GlobalSearch from './components/GlobalSearch';
import ViewManager from './components/ViewManager';
import ExcelTasksView from './components/ExcelTasksView';
import SummaryTimelineView from './components/SummaryTimelineView';
import { TASKS_V2, FAMILIES, PILLARS, STAGES, MILESTONES } from './data/tasks-v2';
import PMAgent, { StaticAlerts, DailyBriefing } from './components/PMAgent';
import TaskNotes from './components/TaskNotes';

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

// Family list for iteration (ordered by display priority)
const FAMILY_LIST = Object.values(FAMILIES);
const FAMILY_CODES = Object.keys(FAMILIES);

// Backward-compat: map family code → display name (used as "ws" in legacy views)
const FAMILY_LABELS = Object.fromEntries(FAMILY_LIST.map(f => [f.code, f.label]));
const FAMILY_COLORS = Object.fromEntries(FAMILY_LIST.map(f => [f.code, f.color]));

// Scopes
const SCOPES = ["global", "space"];
const SPACES = ["E1", "E2"];

const STATUSES = ["Pendiente", "En curso", "Hecho"];
const STATUS_COLORS = {
  Pendiente: PALETTE.lagune, "En curso": PALETTE.mostaza, Hecho: PALETTE.menthe,
};
const STATUS_BG = {
  Pendiente: "#6398A918", "En curso": "#E2B93B18", Hecho: "#96C7B318",
};

const PRIORITIES = ["P0", "P1", "P2", "P3"];
const PRIORITY_LABELS = { P0: "Critica", P1: "Alta", P2: "Media", P3: "Baja" };
const PRIORITY_COLORS = { P0: PALETTE.danger, P1: PALETTE.mostaza, P2: PALETTE.muted, P3: PALETTE.faint };

const STAGE_LIST = Object.values(STAGES);
const PILLAR_LIST = Object.values(PILLARS);

const TODAY = new Date(); // Fecha actual
const RANGE_START = new Date("2026-04-01");
const RANGE_END = new Date("2026-11-01");
const RANGE_DAYS = Math.ceil((RANGE_END - RANGE_START) / 864e5);

const INITIAL_OWNERS = [
  "David", "Christian", "Cristina", "Miguel Márquez", "Profesora",
  "Mavi", "Estudio Branding", "Facilitador", "Empresa Reformas",
  "Equipo Tech", "Por asignar",
];

function toDate(s) { return new Date(s + "T00:00:00"); }
function formatDate(s) {
  return toDate(s).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
function daysLeft(s) { return Math.ceil((toDate(s) - TODAY) / 864e5); }
function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

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

function SelectField({ value, onChange, options, placeholder, style: s }) {
  return (
    <select value={value} onChange={function(e) { onChange(e.target.value); }}
      style={{ fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid " + PALETTE.faint, background: PALETTE.bone, color: PALETTE.ink, ...s }}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map(function(o) { return <option key={o} value={o}>{o}</option>; })}
    </select>
  );
}

function FieldLabel({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>{label}</label>
      {children}
    </div>
  );
}

function ConnectionStatus({ isConnected, usersOnline }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 8,
      background: PALETTE.warm,
      border: `1px solid ${PALETTE.faint}`,
      fontSize: 11
    }}>
      {isConnected ? (
        <>
          <Wifi size={14} color={PALETTE.menthe} />
          <span style={{ color: PALETTE.soft }}>En línea</span>
          {usersOnline > 0 && (
            <Badge color={PALETTE.lagune} bg={PALETTE.lagune + "15"}>
              {usersOnline} {usersOnline === 1 ? 'usuario' : 'usuarios'}
            </Badge>
          )}
        </>
      ) : (
        <>
          <WifiOff size={14} color={PALETTE.danger} />
          <span style={{ color: PALETTE.danger }}>Desconectado</span>
        </>
      )}
    </div>
  );
}

function generateAlerts(kpis, allTasks) {
  var alerts = [];
  // P0 tasks still pending
  var p0Pending = allTasks.filter(function(t) { return t.priority === "P0" && t.status === "Pendiente" && !t.deleted; });
  if (p0Pending.length > 0) alerts.push({ severity: "critical", icon: "!!", msg: p0Pending.length + " tarea" + (p0Pending.length > 1 ? "s" : "") + " P0 sin avanzar", detail: p0Pending.map(function(t) { return t.name; }).slice(0, 4).join(" / "), tasks: p0Pending, color: PALETTE.danger });

  // Overdue
  if (kpis.overdue.length > 0) alerts.push({ severity: "high", icon: "!", msg: kpis.overdue.length + " tarea" + (kpis.overdue.length > 1 ? "s" : "") + " vencida" + (kpis.overdue.length > 1 ? "s" : ""), detail: kpis.overdue.slice(0, 4).map(function(t) { return t.name; }).join(" / "), tasks: kpis.overdue, color: PALETTE.danger });

  // Milestones at risk
  Object.values(MILESTONES).forEach(function(ms) {
    var days = daysLeft(ms.date);
    if (days > 0 && days <= 45) {
      var linked = allTasks.filter(function(t) { return t.milestone === ms.key && t.status !== "Hecho"; });
      var pct = allTasks.filter(function(t) { return t.milestone === ms.key; });
      var done = pct.filter(function(t) { return t.status === "Hecho"; }).length;
      var progreso = pct.length > 0 ? Math.round(done / pct.length * 100) : 0;
      alerts.push({ severity: days <= 14 ? "critical" : "high", icon: "H", msg: ms.label + " en " + days + " dias (" + progreso + "% listo)", detail: linked.length + " tareas pendientes vinculadas", tasks: linked, color: ms.color || PALETTE.mostaza });
    }
  });

  // Tasks without owner
  var noOwner = allTasks.filter(function(t) { return t.owner === "Por asignar" && t.status !== "Hecho" && !t.deleted; });
  if (noOwner.length > 0) alerts.push({ severity: "medium", icon: "?", msg: noOwner.length + " tarea" + (noOwner.length > 1 ? "s" : "") + " sin responsable asignado", detail: noOwner.slice(0, 3).map(function(t) { return t.name; }).join(" / "), tasks: noOwner, color: PALETTE.mostaza });

  // This week workload
  if (kpis.thisWeek.length > 0) alerts.push({ severity: "high", icon: "W", msg: kpis.thisWeek.length + " tarea" + (kpis.thisWeek.length > 1 ? "s" : "") + " vence" + (kpis.thisWeek.length > 1 ? "n" : "") + " esta semana", detail: kpis.thisWeek.slice(0, 3).map(function(t) { return t.name; }).join(" / "), tasks: kpis.thisWeek, color: PALETTE.mostaza });

  // Ordenar: critical primero, luego high, luego medium
  var severityOrder = { critical: 0, high: 1, medium: 2 };
  alerts.sort(function(a, b) { return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3); });

  return alerts;
}

function DashboardView({ kpis, setModal, tasks: activeTasks }) {
  var milestones = kpis.milestones.slice(0, 6);
  var [expandedAlert, setExpandedAlert] = useState(null);
  var [calendarExpanded, setCalendarExpanded] = useState(false);
  var [selectedDay, setSelectedDay] = useState(null);
  var alerts = generateAlerts(kpis, activeTasks || []);

  // Calendario: empieza con HOY + proximos N dias habiles
  var calDays = calendarExpanded ? 30 : 5;
  var calendarDays = [];
  var d = new Date(TODAY);
  d.setDate(d.getDate() - 1); // para que el primer push sea HOY
  var isFirstDay = true;
  while (calendarDays.length < calDays) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      var iso = d.toISOString().split("T")[0];
      var dayTasks = (activeTasks || []).filter(function(t) { return t.endDate === iso && t.status !== "Hecho"; });
      var todayIso = TODAY.toISOString().split("T")[0];
      calendarDays.push({ date: new Date(d), iso: iso, tasks: dayTasks, isToday: iso === todayIso, label: iso === todayIso ? "Hoy" : d.toLocaleDateString("es-ES", { weekday: "short" }), dayNum: d.getDate(), month: d.toLocaleDateString("es-ES", { month: "short" }) });
    }
  }

  return (
    <div>
      {/* 1. KPIs — titulares arriba */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          ["Total", kpis.total, kpis.pct + "%", PALETTE.ink],
          ["Hechas", kpis.done, null, PALETTE.menthe],
          ["Vencidas", kpis.overdue.length, null, kpis.overdue.length ? PALETTE.danger : PALETTE.menthe],
          ["Esta semana", kpis.thisWeek.length, null, PALETTE.mostaza],
        ].map(function(item, i) {
          return (
            <div key={i} style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, color: PALETTE.muted, letterSpacing: 1, textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 4 }}>{item[0]}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 400, fontFamily: SERIF, color: item[3], lineHeight: 1 }}>{item[1]}</span>
                {item[2] ? <span style={{ fontSize: 10, color: PALETTE.muted }}>{item[2]}</span> : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Radar del proyecto — todas las alertas */}
      {alerts.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {alerts.map(function(a, i) {
            var isOpen = expandedAlert === i;
            return (
              <div key={i} style={{ background: a.color + "06", border: "1px solid " + a.color + "18", borderRadius: 8, padding: "8px 12px" }}>
                <div onClick={function() { setExpandedAlert(isOpen ? null : i); }} style={{ display: "flex", alignItems: "center", gap: 6, cursor: a.tasks ? "pointer" : "default" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: a.color, fontFamily: "var(--font-mono)", flexShrink: 0 }}>{a.icon}</div>
                  <div style={{ flex: 1, fontSize: 11, fontWeight: 500, color: PALETTE.ink }}>{a.msg}</div>
                  {a.tasks ? <ChevronDown size={10} style={{ color: PALETTE.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} /> : null}
                </div>
                {!isOpen && a.detail ? <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 3, paddingLeft: 24 }}>{a.detail}</div> : null}
                {isOpen && a.tasks ? (
                  <div style={{ marginTop: 4, paddingLeft: 24 }}>
                    {a.tasks.slice(0, 6).map(function(t) {
                      return <div key={t.id} onClick={function(e) { e.stopPropagation(); setModal({ ...t }); }} style={{ fontSize: 10, padding: "2px 0", cursor: "pointer", color: PALETTE.soft, display: "flex", justifyContent: "space-between" }}>
                        <span>{t.name}</span><span style={{ color: PALETTE.muted, fontSize: 9 }}>{t.owner}</span>
                      </div>;
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 3. Calendario — ancho completo, expandible */}
      <div style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>Proximos {calDays} dias habiles</div>
          <button onClick={function() { setCalendarExpanded(!calendarExpanded); setSelectedDay(null); }} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 4, border: "1px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: PALETTE.lagune, fontWeight: 600 }}>
            {calendarExpanded ? "5 dias" : "30 dias"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: calendarExpanded ? "repeat(10, 1fr)" : "repeat(5, 1fr)", gap: 4 }}>
          {calendarDays.map(function(day, i) {
            var count = day.tasks.length;
            var isSelected = selectedDay === day.iso;
            return (
              <div key={i} onClick={function() { setSelectedDay(isSelected ? null : day.iso); }}
                style={{ textAlign: "center", padding: calendarExpanded ? "5px 2px" : "8px 4px", borderRadius: 6, cursor: "pointer",
                  background: isSelected ? PALETTE.lagune + "12" : day.isToday ? PALETTE.nectarine + "08" : PALETTE.warm,
                  border: day.isToday ? "2px solid " + PALETTE.nectarine + "50" : isSelected ? "2px solid " + PALETTE.lagune + "40" : "1px solid " + PALETTE.faint + "30",
                  transition: "all 0.15s" }}>
                {/* Dia de la semana — color destacado */}
                <div style={{ fontSize: calendarExpanded ? 8 : 9, fontWeight: 700, color: day.isToday ? PALETTE.nectarine : PALETTE.lagune, textTransform: "uppercase", letterSpacing: ".5px" }}>{day.label}</div>
                {/* Numero del dia — prominente */}
                <div style={{ fontSize: calendarExpanded ? 14 : 18, fontWeight: 500, fontFamily: SERIF, color: PALETTE.ink, lineHeight: 1, marginTop: 2 }}>{day.dayNum}</div>
                {/* Cantidad de tareas — color suave, diferenciado */}
                <div style={{ fontSize: calendarExpanded ? 9 : 10, color: count > 3 ? PALETTE.danger : count > 0 ? PALETTE.mostaza : PALETTE.faint, fontWeight: count > 0 ? 600 : 400, marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  {count > 0 ? count + " tarea" + (count > 1 ? "s" : "") : "-"}
                </div>
              </div>
            );
          })}
        </div>
        {/* Detalle del dia seleccionado */}
        {selectedDay ? (
          <div style={{ marginTop: 8, padding: "8px 10px", background: PALETTE.warm, borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.soft, marginBottom: 4 }}>{calendarDays.find(function(d) { return d.iso === selectedDay; })?.label || selectedDay}</div>
            {(calendarDays.find(function(d) { return d.iso === selectedDay; })?.tasks || []).length === 0
              ? <div style={{ fontSize: 11, color: PALETTE.muted }}>Sin tareas pendientes</div>
              : (calendarDays.find(function(d) { return d.iso === selectedDay; })?.tasks || []).map(function(t) {
                  return <div key={t.id} onClick={function() { setModal({ ...t }); }} style={{ fontSize: 11, padding: "2px 0", cursor: "pointer", color: PALETTE.soft, display: "flex", justifyContent: "space-between" }}>
                    <span>{t.name}</span><span style={{ color: PALETTE.muted, fontSize: 10 }}>{t.owner} · {t.priority}</span>
                  </div>;
                })
            }
          </div>
        ) : null}
      </div>

      {/* 4. Hitos proyecto + Por etapa — lado a lado */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 6 }}>Hitos del proyecto</div>
          {Object.values(MILESTONES).map(function(ms) {
            var days = daysLeft(ms.date);
            return (
              <div key={ms.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", marginBottom: 3, borderRadius: 5, borderLeft: "3px solid " + ms.color, background: PALETTE.bone }}>
                <span style={{ fontSize: 11 }}>{ms.label}</span>
                <Badge color={days <= 14 ? PALETTE.danger : days <= 30 ? PALETTE.mostaza : PALETTE.lagune} bg={days <= 14 ? "#C0564A12" : "#E2B93B12"} style={{ fontSize: 9, fontWeight: 700 }}>{days}d</Badge>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 6 }}>Por etapa</div>
          {kpis.byStage.map(function(s) {
            return (
              <div key={s.stage} style={{ display: "grid", gridTemplateColumns: "80px 1fr 36px", gap: 6, alignItems: "center", fontSize: 10, marginBottom: 4 }}>
                <span style={{ color: PALETTE.soft }}>{s.label}</span>
                <ProgressBar pct={s.pct} color={s.color} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, textAlign: "right", color: PALETTE.muted }}>{s.done}/{s.total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Estructura — nombres completos */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 6 }}>Estructura del proyecto</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {kpis.byFamily.map(function(f) {
            var epic = (activeTasks || []).find(function(t) { return t.family === f.family && t.level === "epic"; });
            var derivadas = (activeTasks || []).filter(function(t) { return t.family === f.family && t.level === "task"; });
            var hechas = derivadas.filter(function(t) { return t.status === "Hecho"; }).length;
            return (
              <div key={f.family} style={{ background: PALETTE.bone, border: "0.5px solid " + PALETTE.faint, borderRadius: 6, padding: "8px 10px", borderLeft: "3px solid " + f.color }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: PALETTE.ink, lineHeight: 1.2 }}>{f.label}</div>
                  <span style={{ fontSize: 12, fontFamily: SERIF, color: f.pct === 100 ? PALETTE.menthe : PALETTE.ink, flexShrink: 0 }}>{f.pct}%</span>
                </div>
                <ProgressBar pct={f.pct} color={f.color} />
                <div style={{ fontSize: 9, color: PALETTE.muted, marginTop: 3 }}>{hechas}/{derivadas.length} tareas</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TasksView({ tasks, sortKey, sortDir, toggleSort, updateTask, deleteTask, setModal }) {
  function TH({ k, children, w }) {
    return (
      <th onClick={function() { toggleSort(k); }} style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", color: PALETTE.muted, padding: "10px 8px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap", width: w, fontFamily: "var(--font-mono)", borderBottom: "1px solid " + PALETTE.faint, background: PALETTE.warm }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{children}{sortKey === k ? <ArrowUpDown size={9} /> : null}</span>
      </th>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ fontSize: 11, color: PALETTE.muted, marginBottom: 6 }}>{tasks.length} tareas</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <TH k="name">Tarea</TH>
            <TH k="family" w="70px">Area</TH>
            <TH k="stage" w="55px">Etapa</TH>
            <TH k="status" w="105px">Estado</TH>
            <TH k="priority" w="50px">P</TH>
            <TH k="endDate" w="80px">Fin</TH>
            <TH k="owner" w="100px">Owner</TH>
            <th style={{ width: 36, background: PALETTE.warm, borderBottom: "1px solid " + PALETTE.faint }} />
          </tr>
        </thead>
        <tbody>
          {tasks.map(function(t) {
            var isOverdue = t.status !== "Hecho" && toDate(t.endDate) < TODAY;
            var isSoon = !isOverdue && t.status !== "Hecho" && daysLeft(t.endDate) <= 7 && daysLeft(t.endDate) >= 0;
            var famColor = FAMILY_COLORS[t.family] || PALETTE.lagune;
            return (
              <tr key={t.id} onClick={function() { setModal({ ...t }); }}
                style={{ borderBottom: "0.5px solid " + PALETTE.faint, background: isOverdue ? "#C0564A06" : isSoon ? "#E2B93B06" : "transparent", cursor: "pointer" }}>
                <td style={{ padding: "10px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {t.level === "epic" ? <span style={{ color: PALETTE.mostaza, fontSize: 11 }}>★</span> : null}
                    {t.isMilestone && t.level !== "epic" ? <span style={{ color: PALETTE.mostaza, fontSize: 11 }}>◆</span> : null}
                    <span style={{ fontWeight: t.level === "epic" ? 600 : 400, fontFamily: t.level === "epic" ? SERIF : "inherit" }}>{t.name}</span>
                    {isOverdue ? <span style={{ animation: "pulse 2s infinite", fontSize: 7, color: PALETTE.danger }}>●</span> : null}
                  </div>
                  {t.level === "task" && t.parent ? (
                    <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 2 }}>{t.familyLabel}</div>
                  ) : null}
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <Badge color={famColor} bg={famColor + "15"}>{t.family}</Badge>
                </td>
                <td style={{ padding: "10px 8px" }}>
                  <Badge color={STAGES[t.stage]?.color || PALETTE.muted} bg={(STAGES[t.stage]?.color || PALETTE.muted) + "15"} style={{ fontSize: 9 }}>{t.stage}</Badge>
                </td>
                <td style={{ padding: "10px 8px" }} onClick={function(e) { e.stopPropagation(); }}>
                  <select value={t.status} onChange={function(e) { updateTask(t.id, { status: e.target.value }); }}
                    style={{ fontSize: 11, padding: "4px 6px", borderRadius: 5, border: "1.5px solid " + STATUS_COLORS[t.status], background: STATUS_BG[t.status], color: STATUS_COLORS[t.status], fontWeight: 600, cursor: "pointer", width: "100%" }}>
                    {STATUSES.map(function(s) { return <option key={s} value={s}>{s}</option>; })}
                  </select>
                </td>
                <td style={{ padding: "10px 8px" }}><Badge color={PRIORITY_COLORS[t.priority]} bg={(PRIORITY_COLORS[t.priority] || PALETTE.muted) + "15"}>{t.priority}</Badge></td>
                <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono)", fontSize: 11, color: isOverdue ? PALETTE.danger : PALETTE.muted }}>
                  {isOverdue ? "–" + Math.abs(daysLeft(t.endDate)) + "d" : formatDate(t.endDate)}
                </td>
                <td style={{ padding: "10px 8px", fontSize: 12, color: PALETTE.soft }}>{t.owner}</td>
                <td style={{ padding: "10px 8px" }} onClick={function(e) { e.stopPropagation(); }}>
                  <button onClick={function() { deleteTask(t.id); }} style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer", color: PALETTE.faint }}><Trash2 size={13} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: PALETTE.muted, fontFamily: SERIF }}>Sin resultados</div> : null}
    </div>
  );
}

function TimelineView({ tasks, expandedWs, setExpandedWs, updateTask, setModal }) {
  var [depImpactModal, setDepImpactModal] = useState(null);
  var [impactData, setImpactData] = useState(null);
  var [taskPositions, setTaskPositions] = useState({});
  var svgRef = useState(null)[0];
  var [showDependencies, setShowDependencies] = useState(true);
  var [hoveredDep, setHoveredDep] = useState(null);
  var [draggedTask, setDraggedTask] = useState(null);
  var [dependencySearch, setDependencySearch] = useState('');
  var [groupByProject, setGroupByProject] = useState(false); // Nueva: toggle para agrupar por proyecto

  var months = [];
  for (var m = 3; m <= 10; m++) months.push(new Date(2026, m, 1));
  var todayPct = ((TODAY - RANGE_START) / 864e5 / RANGE_DAYS) * 100;

  // Filtrar tareas por búsqueda de dependencias
  var filteredTasks = useMemo(function() {
    if (!dependencySearch.trim()) return tasks;

    var searchLower = dependencySearch.toLowerCase();
    return tasks.filter(function(t) {
      return t.name.toLowerCase().includes(searchLower) ||
             t.ws.toLowerCase().includes(searchLower) ||
             t.owner.toLowerCase().includes(searchLower) ||
             (t.deps && t.deps.length > 0); // También incluir tareas con dependencias
    });
  }, [tasks, dependencySearch]);

  // Agrupar por familia o proyecto
  var grouped = useMemo(function() {
    if (groupByProject) {
      var projectGroups = {};
      filteredTasks.forEach(function(t) {
        var proj = t.project || "Global";
        if (!projectGroups[proj]) projectGroups[proj] = { ws: proj, color: PALETTE.lagune, tasks: [] };
        projectGroups[proj].tasks.push(t);
      });
      return Object.values(projectGroups).filter(function(g) { return g.tasks.length > 0; });
    } else {
      return FAMILY_LIST.map(function(fam) {
        return { ws: fam.label, color: fam.color, tasks: filteredTasks.filter(function(t) { return t.family === fam.code; }) };
      }).filter(function(g) { return g.tasks.length > 0; });
    }
  }, [filteredTasks, groupByProject]);

  var NAME_W = 300;

  function getPos(start, end) {
    var a = Math.max(0, (toDate(start) - RANGE_START) / 864e5);
    var b = Math.max(a + 2, (toDate(end) - RANGE_START) / 864e5);
    return { left: (a / RANGE_DAYS) * 100, width: ((b - a) / RANGE_DAYS) * 100 };
  }

  function getDependencyColor(depTask) {
    if (!depTask) return PALETTE.lagune;
    if (depTask.status === "Hecho") return PALETTE.menthe;
    if (depTask.status === "Bloqueado" || toDate(depTask.endDate) < TODAY) return PALETTE.danger;
    if (depTask.status === "En curso") return PALETTE.mostaza;
    return PALETTE.lagune;
  }

  function handleDragStart(task) {
    setDraggedTask(task);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(targetTask) {
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setDraggedTask(null);
      return;
    }

    // Check if dependency already exists
    if (draggedTask.deps && draggedTask.deps.includes(targetTask.id)) {
      alert("Esta dependencia ya existe");
      setDraggedTask(null);
      return;
    }

    // Check for circular dependency
    var wouldCreateCycle = false;
    var visited = new Set();
    function checkCycle(taskId) {
      if (taskId === draggedTask.id) {
        wouldCreateCycle = true;
        return;
      }
      if (visited.has(taskId)) return;
      visited.add(taskId);
      var t = tasks.find(function(x) { return x.id === taskId; });
      if (t && t.deps) {
        t.deps.forEach(checkCycle);
      }
    }
    checkCycle(targetTask.id);

    if (wouldCreateCycle) {
      alert("No se puede crear esta dependencia: crearía un ciclo");
      setDraggedTask(null);
      return;
    }

    if (confirm("¿" + draggedTask.name + " depende de " + targetTask.name + "?")) {
      var newDeps = [...(draggedTask.deps || []), targetTask.id];
      updateTask(draggedTask.id, { deps: newDeps });
    }
    setDraggedTask(null);
  }

  function handleBreakDependency(depId, targetTask, e) {
    e.stopPropagation();
    var depTask = tasks.find(function(t) { return t.id === depId; });
    if (confirm("¿Romper dependencia " + (depTask ? depTask.name : depId) + " → " + targetTask.name + "?")) {
      var newDeps = (targetTask.deps || []).filter(function(d) { return d !== depId; });
      updateTask(targetTask.id, { deps: newDeps });
    }
  }

  async function analyzeImpact(taskId, newEndDate) {
    try {
      const response = await fetch(BACKEND_URL + '/api/dependencies/analyze-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newEndDate })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing impact:', error);
      return null;
    }
  }

  async function propagateDependencies(taskId, newEndDate) {
    try {
      const response = await fetch(BACKEND_URL + '/api/dependencies/propagate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newEndDate })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error propagating dependencies:', error);
      return null;
    }
  }

  useEffect(function() {
    var positions = {};
    grouped.forEach(function(g) {
      if (expandedWs[g.ws] !== false) {
        g.tasks.forEach(function(t) {
          var elem = document.getElementById('task-bar-' + t.id);
          if (elem) {
            var rect = elem.getBoundingClientRect();
            var containerRect = elem.closest('.timeline-container')?.getBoundingClientRect();
            if (containerRect) {
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
    <div style={{ overflowX: "auto" }}>
      {/* Header con botón de toggle y búsqueda */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        padding: "8px 0",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "var(--font-mono)" }}>
          Arrastra tareas para crear dependencias
        </div>

        {/* Buscador de dependencias */}
        <div style={{ position: "relative", flex: "1 1 auto", maxWidth: 300, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: PALETTE.muted }} />
          <input
            value={dependencySearch}
            onChange={function(e) { setDependencySearch(e.target.value); }}
            placeholder="Buscar tareas, área, owner..."
            style={{
              width: "100%",
              paddingLeft: 32,
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid " + PALETTE.faint,
              padding: "6px 10px 6px 32px",
              background: PALETTE.bone,
              outline: "none"
            }}
          />
          {dependencySearch && (
            <button
              onClick={function() { setDependencySearch(''); }}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={12} color={PALETTE.muted} />
            </button>
          )}
        </div>

        <button
          onClick={function() { setShowDependencies(!showDependencies); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: showDependencies ? PALETTE.lagune : PALETTE.warm,
            color: showDependencies ? "#fff" : PALETTE.soft,
            border: showDependencies ? "none" : "1px solid " + PALETTE.faint,
            cursor: "pointer",
            transition: "all .2s"
          }}
        >
          {showDependencies ? <Eye size={14} /> : <EyeOff size={14} />}
          Dependencias
        </button>

        <button
          onClick={function() { setGroupByProject(!groupByProject); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 500,
            background: groupByProject ? PALETTE.nectarine : PALETTE.warm,
            color: groupByProject ? "#fff" : PALETTE.soft,
            border: groupByProject ? "none" : "1px solid " + PALETTE.faint,
            cursor: "pointer",
            transition: "all .2s"
          }}
        >
          {groupByProject ? "Por Proyecto" : "Por Área"}
        </button>
      </div>

      {/* Contador de resultados */}
      {dependencySearch && (
        <div style={{
          fontSize: 11,
          color: PALETTE.soft,
          marginBottom: 8,
          padding: "6px 12px",
          background: PALETTE.warm,
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }}>
          <Search size={12} />
          {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea encontrada' : 'tareas encontradas'}
          {filteredTasks.length !== tasks.length && (
            <span style={{ color: PALETTE.muted }}>
              (de {tasks.length} totales)
            </span>
          )}
        </div>
      )}

      <div className="timeline-container" style={{ minWidth: 1100, position: "relative" }}>
        <>
        {/* SVG overlay para líneas de dependencias */}
        {showDependencies && (
          <svg style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
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
          {tasks.map(function(t) {
            if (!t.deps || t.deps.length === 0) return null;
            var targetPos = taskPositions[t.id];
            if (!targetPos) return null;

            return t.deps.map(function(depId) {
              var depTask = tasks.find(function(dt) { return dt.id === depId; });
              var sourcePos = taskPositions[depId];
              if (!sourcePos || !depTask) return null;

              var color = getDependencyColor(depTask);
              var markerId = color === PALETTE.menthe ? "arrowhead-green" :
                            color === PALETTE.danger ? "arrowhead-red" :
                            color === PALETTE.mostaza ? "arrowhead-yellow" : "arrowhead-blue";

              // Calcular puntos de control para curva Bezier
              var midX = (sourcePos.endX + targetPos.x) / 2;
              var path = "M " + sourcePos.endX + " " + sourcePos.y +
                        " Q " + midX + " " + sourcePos.y + " " +
                        midX + " " + ((sourcePos.y + targetPos.y) / 2) +
                        " T " + (targetPos.x - 8) + " " + targetPos.y;

              var depKey = depId + "-" + t.id;
              var isHovered = hoveredDep === depKey;

              return (
                <g key={depKey}>
                  {/* Invisible wider path for easier clicking */}
                  <path
                    d={path}
                    stroke="transparent"
                    strokeWidth="10"
                    fill="none"
                    style={{ cursor: "pointer" }}
                    onClick={function(e) { handleBreakDependency(depId, t, e); }}
                    onMouseEnter={function() { setHoveredDep(depKey); }}
                    onMouseLeave={function() { setHoveredDep(null); }}
                  />
                  {/* Visible path */}
                  <path
                    d={path}
                    stroke={color}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    fill="none"
                    opacity={isHovered ? "1.0" : "0.6"}
                    markerEnd={"url(#" + markerId + ")"}
                    style={{ cursor: "pointer", transition: "all .2s", pointerEvents: "none" }}
                  />
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={midX - 60}
                        y={(sourcePos.y + targetPos.y) / 2 - 25}
                        width="120"
                        height="20"
                        rx="4"
                        fill={PALETTE.ink}
                        opacity="0.9"
                      />
                      <text
                        x={midX}
                        y={(sourcePos.y + targetPos.y) / 2 - 12}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                        pointerEvents="none"
                      >
                        {depTask.name.slice(0, 15) + (depTask.name.length > 15 ? "..." : "") + " → " + t.name.slice(0, 15) + (t.name.length > 15 ? "..." : "")}
                      </text>
                    </g>
                  )}
                </g>
              );
            });
          })}
        </svg>
        )}

        <div style={{ display: "flex", borderBottom: "1px solid " + PALETTE.faint, paddingBottom: 6, marginBottom: 4, position: "relative", zIndex: 2 }}>
          <div style={{ width: NAME_W, flexShrink: 0, fontSize: 10, fontFamily: "var(--font-mono)", color: PALETTE.muted, letterSpacing: 1, padding: "4px 0", textTransform: "uppercase" }}>Tarea</div>
          <div style={{ flex: 1, position: "relative", height: 20 }}>
            {months.map(function(mo, i) {
              var pct = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
              return <div key={i} style={{ position: "absolute", left: pct + "%", fontSize: 10, fontFamily: "var(--font-mono)", color: PALETTE.muted, letterSpacing: ".5px", textTransform: "uppercase", top: 2 }}>{mo.toLocaleDateString("es-ES", { month: "short" })}</div>;
            })}
          </div>
        </div>

        {grouped.map(function(g) {
          var isExp = expandedWs[g.ws] !== false;
          var doneCount = g.tasks.filter(function(t) { return t.status === "Hecho"; }).length;
          return (
            <div key={g.ws} style={{ marginBottom: 2, position: "relative", zIndex: 2 }}>
              <div onClick={function() { setExpandedWs(function(prev) { return { ...prev, [g.ws]: !isExp }; }); }}
                style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "8px 0", background: PALETTE.warm, borderRadius: 6, marginBottom: 2 }}>
                <div style={{ width: NAME_W, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, paddingLeft: 10 }}>
                  {isExp ? <ChevronDown size={12} color={PALETTE.muted} /> : <ChevronRight size={12} color={PALETTE.muted} />}
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
                  <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500 }}>{g.ws}</span>
                  <Badge style={{ fontSize: 9 }}>{doneCount}/{g.tasks.length}</Badge>
                </div>
              </div>

              {isExp ? g.tasks.map(function(t) {
                var pos = getPos(t.startDate, t.endDate);
                var isOverdue = t.status !== "Hecho" && toDate(t.endDate) < TODAY;
                var isDone = t.status === "Hecho";
                var hasDeps = t.deps && t.deps.length > 0;
                var isDragging = draggedTask && draggedTask.id === t.id;

                // Resaltar si coincide con la búsqueda
                var searchLower = dependencySearch.toLowerCase();
                var isHighlighted = dependencySearch && (
                  t.name.toLowerCase().includes(searchLower) ||
                  t.ws.toLowerCase().includes(searchLower) ||
                  t.owner.toLowerCase().includes(searchLower)
                );
                return (
                  <div key={t.id} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 0",
                    borderBottom: "0.5px solid " + PALETTE.faint + "08",
                    background: isHighlighted ? PALETTE.mostaza + "08" : "transparent",
                    borderLeft: isHighlighted ? "3px solid " + PALETTE.mostaza : "3px solid transparent",
                    transition: "all 0.2s ease"
                  }}>
                    <div style={{ width: NAME_W, flexShrink: 0, paddingLeft: 36, display: "flex", alignItems: "center", gap: 6, minWidth: 0, paddingRight: 12 }}>
                      {t.isMilestone ? <span style={{ color: PALETTE.mostaza, fontSize: 11, flexShrink: 0 }}>◆</span> : null}
                      {hasDeps ? <Link2 size={10} style={{ color: PALETTE.lagune, flexShrink: 0, opacity: 0.6 }} /> : null}
                      {isHighlighted && <Search size={10} style={{ color: PALETTE.mostaza, flexShrink: 0 }} />}
                      <span style={{
                        fontSize: 13, fontWeight: isHighlighted ? 600 : (t.isMilestone ? 500 : 400),
                        fontFamily: t.isMilestone ? SERIF : "inherit",
                        color: isHighlighted ? PALETTE.mostaza : (isOverdue ? PALETTE.danger : isDone ? PALETTE.menthe : PALETTE.ink),
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        textDecoration: isDone ? "line-through" : "none",
                      }} title={t.name + "\n" + t.owner + " · " + formatDate(t.startDate) + " → " + formatDate(t.endDate) + (t.risk ? "\n⚠ " + t.risk : "")}>
                        {t.name}
                      </span>
                      {isOverdue ? <span style={{ animation: "pulse 2s infinite", fontSize: 7, color: PALETTE.danger, flexShrink: 0 }}>●</span> : null}
                      <span style={{ fontSize: 10, color: PALETTE.muted, flexShrink: 0, marginLeft: "auto", fontFamily: "var(--font-mono)" }}>{t.owner.split(" ")[0]}</span>
                    </div>
                    <div style={{ flex: 1, position: "relative", height: 22 }}>
                      {months.map(function(mo, i) {
                        var mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                        return <div key={i} style={{ position: "absolute", left: mp + "%", top: 0, bottom: 0, width: "0.5px", background: PALETTE.faint + "50" }} />;
                      })}
                      <div
                        id={"task-bar-" + t.id}
                        draggable="true"
                        onDragStart={function() { handleDragStart(t); }}
                        onDragOver={handleDragOver}
                        onDrop={function(e) { e.preventDefault(); handleDrop(t); }}
                        onClick={function(e) {
                          // Click para abrir modal de edición
                          if (!isDragging && setModal) {
                            e.stopPropagation();
                            setModal({ ...t });
                          }
                        }}
                        title={t.name + " — " + formatDate(t.startDate) + " → " + formatDate(t.endDate) + "\nClick para editar • Arrastra para crear dependencia"}
                        style={{
                          position: "absolute", left: pos.left + "%", width: pos.width + "%", top: 5, height: 12,
                          borderRadius: t.isMilestone ? 2 : 6,
                          background: isDone ? PALETTE.menthe + "70" : isOverdue ? PALETTE.danger + "55" : g.color + "45",
                          border: t.isMilestone ? "1.5px solid " + g.color : isDragging ? "2px solid " + PALETTE.ink : "none",
                          transition: "all .3s",
                          animation: isOverdue ? "pulse 3s infinite" : "none",
                          cursor: isDragging ? "grab" : "pointer",
                          opacity: isDragging ? 0.5 : 1,
                          boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none"
                        }}
                        onMouseEnter={function(e) {
                          if (!isDragging) {
                            e.currentTarget.style.transform = "scaleY(1.3)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                          }
                        }}
                        onMouseLeave={function(e) {
                          if (!isDragging) {
                            e.currentTarget.style.transform = "scaleY(1)";
                            e.currentTarget.style.boxShadow = isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none";
                          }
                        }}>
                        {isDone ? <div style={{ height: "100%", borderRadius: "inherit", background: PALETTE.menthe }} /> : null}
                      </div>
                    </div>
                  </div>
                );
              }) : null}
            </div>
          );
        })}

        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: "calc(" + NAME_W + "px + (100% - " + NAME_W + "px) * " + (todayPct / 100) + ")",
          width: 2, background: PALETTE.nectarine, zIndex: 5, pointerEvents: "none", opacity: 0.85,
        }}>
          <div style={{ position: "absolute", top: -4, left: -14, fontSize: 9, fontWeight: 600, color: PALETTE.nectarine, fontFamily: "var(--font-mono)", background: PALETTE.cream, padding: "1px 5px", borderRadius: 3, border: "1px solid " + PALETTE.nectarine }}>{TODAY.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
        </div>
      </>
      </div>
    </div>
  );
}

function DependencyImpactModal({ task, newEndDate, impactData, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(44,41,38,0.6)",
      display: "flex", justifyContent: "center", alignItems: "center", padding: 20
    }} onClick={onCancel}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        background: PALETTE.bone, borderRadius: 16, border: "1px solid " + PALETTE.faint,
        width: "100%", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,0.2)"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid " + PALETTE.faint, background: PALETTE.warm }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, margin: 0, color: PALETTE.ink }}>
            Impacto en Dependencias
          </h3>
          <p style={{ fontSize: 13, color: PALETTE.soft, margin: "8px 0 0 0" }}>
            Cambiar fecha de "{task.name}" afectará otras tareas
          </p>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{
            background: PALETTE.warm, padding: "12px 16px", borderRadius: 8,
            marginBottom: 16, border: "1px solid " + PALETTE.faint
          }}>
            <div style={{ fontSize: 11, color: PALETTE.muted, marginBottom: 4 }}>Nueva fecha de finalización</div>
            <div style={{ fontSize: 16, fontFamily: SERIF, color: PALETTE.ink }}>
              {formatDate(newEndDate)}
            </div>
          </div>

          {impactData && impactData.affectedTasks && impactData.affectedTasks.length > 0 ? (
            <>
              <div style={{
                fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px",
                color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 12
              }}>
                Tareas afectadas ({impactData.affectedTasks.length})
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {impactData.affectedTasks.map(function(affectedTask, i) {
                  return (
                    <div key={i} style={{
                      padding: "10px 12px", background: PALETTE.warm, borderRadius: 6,
                      marginBottom: 8, border: "1px solid " + PALETTE.faint
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                        {affectedTask.name}
                      </div>
                      <div style={{ fontSize: 11, color: PALETTE.soft }}>
                        {affectedTask.oldEndDate && affectedTask.newEndDate ? (
                          <span>{formatDate(affectedTask.oldEndDate)} → {formatDate(affectedTask.newEndDate)}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: PALETTE.muted, fontSize: 13 }}>
              No hay tareas dependientes afectadas
            </div>
          )}
        </div>

        <div style={{
          padding: "16px 24px", borderTop: "1px solid " + PALETTE.faint,
          display: "flex", justifyContent: "flex-end", gap: 10, background: PALETTE.warm
        }}>
          <button onClick={onCancel} style={{
            padding: "10px 20px", borderRadius: 8, fontSize: 13, border: "1px solid " + PALETTE.faint,
            background: "transparent", cursor: "pointer", color: PALETTE.soft
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            border: "none", background: PALETTE.nectarine, color: "#fff",
            cursor: "pointer", fontFamily: SERIF
          }}>
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, owners, addOwner, tasks, onSave, onClose, onDelete, readOnly }) {
  var [form, setForm] = useState({ ...task });
  var isNew = !task.id;
  function set(key, val) { setForm(function(prev) { return { ...prev, [key]: val }; }); }
  function setFamily(code) {
    var fam = FAMILIES[code];
    if (fam) set("family", code); set("familyLabel", fam?.label || code); set("pillar", fam?.pillar || ""); set("milestone", fam?.milestone || "");
  }
  var inputStyle = { fontSize: 14, padding: "10px 14px", borderRadius: 8, border: "1px solid " + PALETTE.faint, background: "#fff", width: "100%", color: PALETTE.ink };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(44,41,38,0.5)", display: "flex", justifyContent: "center", paddingTop: 30 }}
      onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }}
        style={{ background: PALETTE.bone, borderRadius: 16, border: "1px solid " + PALETTE.faint, width: "100%", maxWidth: 620, height: "fit-content", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }}>

        <div style={{ padding: "20px 28px", borderBottom: "1px solid " + PALETTE.faint, display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.warm }}>
          <div>
            <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, margin: 0, color: PALETTE.ink }}>{isNew ? "Nueva tarea" : "Editar tarea"}</h3>
            {!isNew && <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "var(--font-mono)", marginTop: 4 }}>{form.id} · {form.level === "epic" ? "Iniciativa" : "Tarea"} · {form.familyLabel}</div>}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: PALETTE.muted, padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "65vh", overflowY: "auto" }}>

          <FieldLabel label="Nombre">
            <input value={form.name} onChange={function(e) { set("name", e.target.value); }}
              style={{ ...inputStyle, fontFamily: SERIF, fontSize: 16 }} placeholder="Nombre de la tarea…" />
          </FieldLabel>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FieldLabel label="Area">
              <select value={form.family || ""} onChange={function(e) { setFamily(e.target.value); }} style={{ ...inputStyle, fontSize: 13 }}>
                <option value="">Seleccionar...</option>
                {FAMILY_LIST.map(function(f) { return <option key={f.code} value={f.code}>{f.label}</option>; })}
              </select>
            </FieldLabel>
            <FieldLabel label="Responsables">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
                {(form.owner || "").split(",").filter(Boolean).map(function(o, i) {
                  var name = o.trim();
                  return name ? (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: PALETTE.lagune + "12", color: PALETTE.lagune, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                      {name}
                      <span onClick={function() { var parts = form.owner.split(",").map(function(s){return s.trim();}).filter(function(s){return s && s !== name;}); set("owner", parts.join(", ")); }} style={{ cursor: "pointer", opacity: 0.6 }}>x</span>
                    </span>
                  ) : null;
                })}
              </div>
              <select onChange={function(e) { if (e.target.value) { var current = form.owner ? form.owner.split(",").map(function(s){return s.trim();}).filter(Boolean) : []; if (!current.includes(e.target.value)) { set("owner", [...current, e.target.value].join(", ")); } e.target.value = ""; } }} style={{ ...inputStyle, fontSize: 12, color: PALETTE.soft }}>
                <option value="">+ Agregar responsable...</option>
                {owners.map(function(o) { return <option key={o} value={o}>{o}</option>; })}
              </select>
            </FieldLabel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FieldLabel label="Estado">
              <SelectField value={form.status} onChange={function(v) { set("status", v); }} options={STATUSES} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
            <FieldLabel label="Prioridad">
              <select value={form.priority} onChange={function(e) { set("priority", e.target.value); }} style={{ ...inputStyle, fontSize: 13 }}>
                <option value="P0">Critica</option>
                <option value="P1">Alta</option>
                <option value="P2">Media</option>
                <option value="P3">Baja</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Hito">
              <button onClick={function() { set("isMilestone", !form.isMilestone); }}
                style={{ ...inputStyle, cursor: "pointer", textAlign: "center", fontFamily: SERIF, color: form.isMilestone ? PALETTE.mostaza : PALETTE.muted, background: form.isMilestone ? "#E2B93B12" : "#fff", border: "1px solid " + (form.isMilestone ? PALETTE.mostaza : PALETTE.faint), fontWeight: form.isMilestone ? 600 : 400 }}>
                {form.isMilestone ? "Hito" : "No"}
              </button>
            </FieldLabel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FieldLabel label="Etapa">
              <SelectField value={form.stage || ""} onChange={function(v) { set("stage", v); }} options={Object.keys(STAGES)} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
            <FieldLabel label="Alcance">
              <SelectField value={form.scope || ""} onChange={function(v) { set("scope", v); }} options={SCOPES} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
            <FieldLabel label="Riesgo">
              <SelectField value={form.risk || ""} onChange={function(v) { set("risk", v); }} options={["CRITICO","ALTO","MEDIO","BAJO"]} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FieldLabel label="Inicio">
              <input type="date" value={form.startDate} onChange={function(e) { set("startDate", e.target.value); }} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
            <FieldLabel label="Fin">
              <input type="date" value={form.endDate} onChange={function(e) { set("endDate", e.target.value); }} style={{ ...inputStyle, fontSize: 13 }} />
            </FieldLabel>
          </div>

          <FieldLabel label="Notas">
            {readOnly ? (
              <div style={{ fontSize: 13, color: PALETTE.soft, padding: "8px 0" }}>{form.notes || 'Sin notas'}</div>
            ) : (
              <textarea value={form.notes} onChange={function(e) { set("notes", e.target.value); }} rows={2}
                style={{ ...inputStyle, fontSize: 13, resize: "vertical" }} placeholder="Notas…" />
            )}
          </FieldLabel>

          {/* Notas del equipo — todos pueden escribir, incluso viewers */}
          {!isNew && <TaskNotes taskId={form.id} taskName={form.name} />}
        </div>

        <div style={{ padding: "16px 28px", borderTop: "1px solid " + PALETTE.faint, display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.warm }}>
          {!isNew && onDelete ? (
            <button onClick={function() { onDelete(form.id); onClose(); }} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, border: "1px solid " + PALETTE.danger + "40", background: "transparent", cursor: "pointer", color: PALETTE.danger, display: "flex", alignItems: "center", gap: 4 }}>
              <Trash2 size={13} />Eliminar
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, border: "1px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: PALETTE.soft }}>{readOnly ? 'Cerrar' : 'Cancelar'}</button>
            {onSave && <button onClick={function() { if (form.name.trim()) onSave(form); }}
              style={{ padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "none", background: PALETTE.nectarine, color: "#fff", cursor: "pointer", fontFamily: SERIF, display: "flex", alignItems: "center", gap: 6 }}>
              <Save size={14} />Guardar
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ owners, addOwner, mergeOwners, onClose, isAdmin }) {
  var [newName, setNewName] = useState("");
  var [mergeFrom, setMergeFrom] = useState("");
  var [mergeTo, setMergeTo] = useState("");
  var [inviteEmail, setInviteEmail] = useState("");
  var [inviteMsg, setInviteMsg] = useState("");

  var appUrl = window.location.origin;

  function copyInviteLink() {
    var link = appUrl;
    var msg = "Te invito al tracker de DMSTK HOUSES.\n\n1. Abre: " + link + "\n2. Click en 'Crear cuenta'\n3. Usa tu email y elige una contrasena\n4. Listo, podras ver el proyecto";
    if (inviteEmail.trim()) {
      msg = "Hola! " + msg;
    }
    navigator.clipboard.writeText(msg).then(function() {
      setInviteMsg("Link copiado al clipboard");
      setTimeout(function() { setInviteMsg(""); }, 3000);
    }).catch(function() {
      setInviteMsg("Error al copiar");
    });
  }
  var [profiles, setProfiles] = useState([]);
  var [loadingProfiles, setLoadingProfiles] = useState(false);

  // Cargar perfiles si es admin
  useEffect(function() {
    if (!isAdmin) return;
    setLoadingProfiles(true);
    dbSelect('profiles', 'select=id,email,display_name,role,last_seen_at&order=created_at.asc')
      .then(function(data) { setProfiles(data || []); })
      .catch(function() {})
      .finally(function() { setLoadingProfiles(false); });
  }, [isAdmin]);

  function changeRole(profileId, newRole) {
    dbUpdate('profiles', profileId, { role: newRole })
      .then(function() {
        setProfiles(function(prev) { return prev.map(function(p) { return p.id === profileId ? { ...p, role: newRole } : p; }); });
      })
      .catch(function(err) { alert('Error: ' + err.message); });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(44,41,38,0.5)", display: "flex", justifyContent: "center", paddingTop: 60 }}
      onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }}
        style={{ background: PALETTE.bone, borderRadius: 16, border: "1px solid " + PALETTE.faint, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.15)" }}>

        <div style={{ padding: "20px 24px", borderBottom: "1px solid " + PALETTE.faint, display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.warm, position: "sticky", top: 0, zIndex: 1 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, margin: 0 }}>Gestion de equipo</h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: PALETTE.muted }}><X size={18} /></button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Panel de roles — solo admins */}
          {isAdmin && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.lagune, fontFamily: "var(--font-mono)", marginBottom: 10 }}>Usuarios y roles</div>
              {loadingProfiles ? (
                <div style={{ fontSize: 11, color: PALETTE.muted }}>Cargando...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {profiles.map(function(p) {
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: PALETTE.warm, border: "1px solid " + PALETTE.faint + "40" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: PALETTE.ink }}>{p.display_name}</div>
                          <div style={{ fontSize: 10, color: PALETTE.muted }}>{p.email}</div>
                        </div>
                        <select value={p.role} onChange={function(e) { changeRole(p.id, e.target.value); }}
                          style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: "1px solid " + PALETTE.faint, background: PALETTE.bone, color: p.role === 'admin' ? PALETTE.nectarine : p.role === 'pm' ? PALETTE.lagune : PALETTE.muted, fontWeight: 600 }}>
                          <option value="admin">Admin</option>
                          <option value="pm">PM</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Invitar personas */}
          {isAdmin && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.lagune, fontFamily: "var(--font-mono)", marginBottom: 10 }}>Invitar al equipo</div>
              <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>Genera un mensaje con las instrucciones para unirse. Copialo y envialo por WhatsApp, email o Slack.</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={inviteEmail} onChange={function(e) { setInviteEmail(e.target.value); }} placeholder="Email del invitado (opcional)"
                  style={{ flex: 1, fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid " + PALETTE.faint }} />
                <button onClick={copyInviteLink}
                  style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: PALETTE.lagune, color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Copiar invitacion</button>
              </div>
              {inviteMsg && <div style={{ fontSize: 11, color: PALETTE.menthe, marginTop: 6 }}>{inviteMsg}</div>}
              <div style={{ fontSize: 10, color: PALETTE.muted, marginTop: 6 }}>Los nuevos usuarios entran como Viewer. Puedes cambiar su rol arriba.</div>
            </div>
          )}

          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 8 }}>Miembros (owners de tareas)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
            {owners.map(function(o) { return <Badge key={o} color={PALETTE.lagune} bg={PALETTE.lagune + "12"}>{o}</Badge>; })}
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 8 }}>Anadir miembro</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            <input value={newName} onChange={function(e) { setNewName(e.target.value); }} placeholder="Nombre…"
              style={{ flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "1px solid " + PALETTE.faint }} />
            <button onClick={function() { if (newName.trim()) { addOwner(newName.trim()); setNewName(""); } }}
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: PALETTE.lagune, color: "#fff", border: "none", cursor: "pointer" }}>Anadir</button>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".8px", color: PALETTE.muted, fontFamily: "var(--font-mono)", marginBottom: 8 }}>Fusionar</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <SelectField value={mergeFrom} onChange={setMergeFrom} options={owners} placeholder="De…" style={{ flex: 1, minWidth: 80 }} />
            <ArrowRight size={14} style={{ color: PALETTE.muted }} />
            <SelectField value={mergeTo} onChange={setMergeTo} options={owners} placeholder="A…" style={{ flex: 1, minWidth: 80 }} />
            <button onClick={function() { if (mergeFrom && mergeTo && mergeFrom !== mergeTo) { mergeOwners(mergeFrom, mergeTo); setMergeFrom(""); setMergeTo(""); } }}
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: PALETTE.nectarine, color: "#fff", border: "none", cursor: "pointer" }}>Fusionar</button>
          </div>
          <div style={{ fontSize: 11, color: PALETTE.muted, marginTop: 8 }}>
            Tareas de «{mergeFrom || "…"}» pasaran a «{mergeTo || "…"}»
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, profile, signOut, canEdit, isAdmin } = useAuth();
  var [tasks, setTasks] = useState([]);
  var [loading, setLoading] = useState(true);
  var [isConnected, setIsConnected] = useState(false);
  var [usersOnline, setUsersOnline] = useState(0);
  // Persistir vista activa y filtros
  var savedUI = {};
  try { savedUI = JSON.parse(localStorage.getItem("neo-dmstk-ui") || "{}"); } catch(e) {}
  function saveUI(updates) {
    var current = {};
    try { current = JSON.parse(localStorage.getItem("neo-dmstk-ui") || "{}"); } catch(e) {}
    try { localStorage.setItem("neo-dmstk-ui", JSON.stringify({ ...current, ...updates })); } catch(e) {}
  }

  var [view, setViewState] = useState(savedUI.view || "dashboard");
  function setView(v) { setViewState(v); saveUI({ view: v }); }

  var [search, setSearch] = useState("");
  // Multi-select filters: arrays instead of single values
  var [fFamily, setFFamily] = useState(savedUI.fFamily || []);
  var [fStage, setFStage] = useState(savedUI.fStage || []);
  var [fScope, setFScope] = useState(savedUI.fScope || []);
  var [fSt, setFSt] = useState(savedUI.fSt || []);
  var [fOw, setFOw] = useState(savedUI.fOw || []);
  var [fPr, setFPr] = useState(savedUI.fPr || []);
  var [fLevel, setFLevel] = useState(savedUI.fLevel || []);

  // Persist filters on change
  function toggleFilter(setter, key, val) {
    setter(function(prev) {
      var arr = Array.isArray(prev) ? prev : [];
      var next = arr.includes(val) ? arr.filter(function(v) { return v !== val; }) : [...arr, val];
      saveUI({ [key]: next });
      return next;
    });
  }
  var [timelineSummaryMode, setTimelineSummaryMode] = useState(true);
  var [modal, setModal] = useState(null);
  var [sortKey, setSortKey] = useState("endDate");
  var [sortDir, setSortDir] = useState(1);
  var [expandedWs, setExpandedWs] = useState(function() { return Object.fromEntries(FAMILY_CODES.map(function(c) { return [FAMILY_LABELS[c], true]; })); });
  var [owners, setOwners] = useState(INITIAL_OWNERS);
  var [showSettings, setShowSettings] = useState(false);
  var [showHistory, setShowHistory] = useState(false);
  var [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  var [isSaving, setIsSaving] = useState(false);
  var [lastSaved, setLastSaved] = useState(null);
  var [showViewManager, setShowViewManager] = useState(false);
  var [currentView, setCurrentView] = useState(null);

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Y = redo
  useEffect(function() {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return function() { window.removeEventListener('keydown', handleKeyDown); };
  }, [tasks]);

  // Conectar Supabase Realtime + cargar datos
  useEffect(function() {
    // Supabase Realtime — sincronizacion multiusuario
    connectRealtime(
      // onChange: cuando otro usuario modifica una tarea
      function(change) {
        if (!change?.record) return;
        const task = enrichTask(change.record);

        if (change.type === 'INSERT') {
          setTasks(prev => {
            if (prev.find(t => t.id === task.id)) return prev; // ya existe
            return [...prev, task];
          });
        } else if (change.type === 'UPDATE') {
          if (task.deleted) {
            setTasks(prev => prev.filter(t => t.id !== task.id));
          } else {
            setTasks(prev => prev.map(t => t.id === task.id ? task : t));
          }
        } else if (change.type === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== (change.old_record?.id || task.id)));
        }
      },
      // onStatus: estado de conexion
      function(status) {
        setIsConnected(status === 'connected');
      }
    );

    // Cargar datos iniciales
    loadData();

    return () => {
      disconnectRealtime();
    };
  }, []);

  // Map family codes to legacy workstream names (WITH accents for SummaryTimelineView compat)
  const FAMILY_TO_WS = {
    DIR: "Dirección", LEG: "Legal", MET: "Método", CON: "Profesor-Contenido",
    DAR: "Producto", KIT: "Producto", RET: "Producto", BRA: "Branding",
    RED: "Branding", EQU: "Equipo", TEC: "Tecnología", PIL: "Piloto",
    ESP1: "Espacio-E1", OPS1: "Espacio-E1", ESP2: "Espacio-E1",
  };

  // Enrich task: parse JSON fields + add backward-compat fields
  function enrichTask(t) {
    var spaces = t.spaces;
    if (typeof spaces === 'string') { try { spaces = JSON.parse(spaces); } catch(e) { spaces = []; } }
    var deps = t.deps;
    if (typeof deps === 'string') { try { deps = JSON.parse(deps); } catch(e) { deps = []; } }
    return {
      ...t,
      spaces: spaces || [],
      deps: deps || [],
      ws: FAMILY_TO_WS[t.family] || t.familyLabel || t.family,
      project: t.scope === "global" ? "Global" : (spaces || []).includes("E2") ? "E2 Barcelona" : (spaces || []).includes("E1") ? "E1 Madrid" : "Global",
    };
  }

  const STORAGE_KEY = 'neo-dmstk-tasks-v2';
  const HISTORY_KEY = 'neo-dmstk-history';
  const MAX_HISTORY = 30; // maximo 30 snapshots

  // Sistema de historial: guarda snapshots con timestamp
  function saveSnapshot(taskArray, reason) {
    try {
      var historyRaw = localStorage.getItem(HISTORY_KEY);
      var history = historyRaw ? JSON.parse(historyRaw) : [];

      // No guardar si es identico al ultimo snapshot
      if (history.length > 0) {
        var lastData = history[history.length - 1].data;
        if (JSON.stringify(lastData) === JSON.stringify(taskArray)) return;
      }

      history.push({
        timestamp: new Date().toISOString(),
        reason: reason || 'cambio',
        taskCount: taskArray.length,
        data: taskArray
      });

      // Mantener solo los ultimos MAX_HISTORY
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      // Si localStorage esta lleno, borrar los mas viejos
      try {
        var h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        h = h.slice(-5); // mantener solo los 5 mas recientes
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
      } catch(e2) {}
    }
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch(e) { return []; }
  }

  function restoreFromHistory(index) {
    var history = getHistory();
    if (history[index]) {
      var snapshot = history[index];
      setTasks(snapshot.data.map(enrichTask));
      persistTasks(snapshot.data.map(enrichTask));
      return true;
    }
    return false;
  }

  // Persistir tareas — cache local para velocidad
  function persistTasks(taskArray) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskArray));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  // Preparar tarea para Supabase (limpiar campos computed)
  function taskForDB(task) {
    const { ws, project, ...base } = task;
    return { ...base, spaces: JSON.stringify(base.spaces || []), deps: JSON.stringify(base.deps || []) };
  }

  // Undo/Redo stack
  var undoStack = { current: [] };
  var redoStack = { current: [] };
  var MAX_UNDO = 50;

  function persistWithHistory(taskArray, reason) {
    persistTasks(taskArray);

    // Snapshot cada 10 cambios
    changesSinceSnapshot.current++;
    var now = Date.now();
    if (changesSinceSnapshot.current >= 10 || (now - lastSnapshotTime.current) > 300000) {
      saveSnapshot(taskArray, reason || changesSinceSnapshot.current + ' cambios');
      changesSinceSnapshot.current = 0;
      lastSnapshotTime.current = now;
    }
  }

  var lastSnapshotTime = { current: Date.now() };
  var changesSinceSnapshot = { current: 0 };

  // Undo: revertir ultimo cambio
  function undo() {
    if (undoStack.current.length === 0) return;
    var prev = undoStack.current.pop();
    redoStack.current.push(tasks);
    setTasks(prev);
    persistTasks(prev);
  }

  // Redo: rehacer ultimo undo
  function redo() {
    if (redoStack.current.length === 0) return;
    var next = redoStack.current.pop();
    undoStack.current.push(tasks);
    setTasks(next);
    persistTasks(next);
  }

  // Export: descargar JSON del estado actual
  var [showExportMenu, setShowExportMenu] = useState(false);

  function exportCSV() {
    var headers = ['ID','Nombre','Area','Nivel','Estado','Prioridad','Owner','Inicio','Fin','Etapa','Riesgo','Alcance','Hito','Notas'];
    var rows = tasks.map(function(t) {
      return [t.id, t.name, t.familyLabel||t.family, t.level==='epic'?'Iniciativa':'Tarea', t.status, {P0:'Critica',P1:'Alta',P2:'Media',P3:'Baja'}[t.priority]||t.priority, t.owner, t.startDate, t.endDate, t.stage, t.risk, t.scope, t.milestone, t.notes||''].map(function(v) { return '"' + String(v||'').replace(/"/g, '""') + '"'; }).join(',');
    });
    var csv = [headers.join(','), ...rows].join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'DMSTK-tareas-' + new Date().toISOString().split('T')[0] + '.csv'; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  function exportHTML() {
    var today = new Date().toISOString().split('T')[0];
    var total = tasks.length;
    var done = tasks.filter(function(t) { return t.status === 'Hecho'; }).length;
    var inProgress = tasks.filter(function(t) { return t.status === 'En curso'; }).length;
    var overdue = tasks.filter(function(t) { return t.status !== 'Hecho' && t.endDate < today; });
    var p0 = tasks.filter(function(t) { return t.priority === 'P0' && t.status !== 'Hecho'; });

    var byFamily = {};
    tasks.forEach(function(t) {
      var key = t.familyLabel || t.family || 'Otro';
      if (!byFamily[key]) byFamily[key] = { total: 0, done: 0, overdue: 0 };
      byFamily[key].total++;
      if (t.status === 'Hecho') byFamily[key].done++;
      if (t.status !== 'Hecho' && t.endDate < today) byFamily[key].overdue++;
    });

    var familyRows = Object.entries(byFamily).map(function(e) {
      var pct = Math.round(e[1].done / e[1].total * 100);
      return '<tr><td>' + e[0] + '</td><td>' + e[1].done + '/' + e[1].total + '</td><td><div style="background:#e5e5e5;border-radius:4px;height:8px;width:120px"><div style="background:#96C7B3;height:100%;border-radius:4px;width:' + pct + '%"></div></div></td><td style="color:' + (e[1].overdue > 0 ? '#C0564A' : '#9A948C') + '">' + e[1].overdue + '</td></tr>';
    }).join('');

    var overdueRows = overdue.slice(0, 15).map(function(t) {
      var days = Math.abs(Math.ceil((new Date(t.endDate) - new Date()) / 864e5));
      return '<tr><td>' + t.name + '</td><td>' + (t.familyLabel||t.family) + '</td><td>' + t.owner + '</td><td style="color:#C0564A;font-weight:600">' + days + 'd</td></tr>';
    }).join('');

    var p0Rows = p0.map(function(t) {
      return '<tr><td>' + t.name + '</td><td>' + t.owner + '</td><td>' + t.status + '</td><td>' + t.endDate + '</td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DMSTK — Resumen Ejecutivo ' + today + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"DM Sans",-apple-system,sans-serif;background:#FAF8F4;color:#2C2926;padding:40px;max-width:900px;margin:0 auto}h1{font-family:Georgia,serif;font-size:28px;font-weight:400;margin-bottom:4px}h2{font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#9A948C;margin:32px 0 12px;border-bottom:1px solid #D8D2CA;padding-bottom:6px}.subtitle{font-size:13px;color:#9A948C;margin-bottom:32px}.kpi{display:inline-block;text-align:center;padding:16px 24px;background:#fff;border-radius:12px;border:1px solid #D8D2CA30;margin:0 8px 8px 0}.kpi .num{font-size:28px;font-weight:700;font-family:Georgia,serif}.kpi .label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9A948C;margin-top:4px}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#9A948C;padding:8px 10px;border-bottom:1px solid #D8D2CA}td{font-size:12px;padding:6px 10px;border-bottom:1px solid #D8D2CA20}.footer{margin-top:40px;font-size:10px;color:#9A948C;text-align:center}</style></head><body>';
    html += '<h1>DMSTK <span style="color:#D7897F">HOUSES</span></h1><div class="subtitle">Resumen ejecutivo — ' + today + '</div>';
    html += '<div><div class="kpi"><div class="num">' + total + '</div><div class="label">Tareas</div></div>';
    html += '<div class="kpi"><div class="num" style="color:#96C7B3">' + Math.round(done/total*100) + '%</div><div class="label">Completado</div></div>';
    html += '<div class="kpi"><div class="num" style="color:#E2B93B">' + inProgress + '</div><div class="label">En curso</div></div>';
    html += '<div class="kpi"><div class="num" style="color:#C0564A">' + overdue.length + '</div><div class="label">Vencidas</div></div>';
    html += '<div class="kpi"><div class="num" style="color:#D7897F">' + p0.length + '</div><div class="label">Criticas</div></div></div>';
    html += '<h2>Progreso por area</h2><table><tr><th>Area</th><th>Progreso</th><th></th><th>Vencidas</th></tr>' + familyRows + '</table>';
    if (overdue.length > 0) html += '<h2>Tareas vencidas (' + overdue.length + ')</h2><table><tr><th>Tarea</th><th>Area</th><th>Owner</th><th>Retraso</th></tr>' + overdueRows + '</table>';
    if (p0.length > 0) html += '<h2>Criticas pendientes (' + p0.length + ')</h2><table><tr><th>Tarea</th><th>Owner</th><th>Estado</th><th>Fecha fin</th></tr>' + p0Rows + '</table>';
    html += '<div class="footer">Generado desde DMSTK Tracker — ' + new Date().toLocaleString('es-ES') + '</div></body></html>';

    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'DMSTK-resumen-' + today + '.html'; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  // Import: cargar JSON
  function importData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        var imported = data.tasks || data;
        if (Array.isArray(imported) && imported.length > 0) {
          saveSnapshot(tasks, 'antes de importar');
          setTasks(imported.map(enrichTask));
          persistTasks(imported.map(enrichTask));
          alert('Importadas ' + imported.length + ' tareas');
        }
      } catch(err) {
        alert('Error al importar: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Sincronizar datos locales a Supabase (upsert masivo)
  async function syncToSupabase(taskArray) {
    if (!isAuthenticated() || !taskArray?.length) return;
    try {
      const BATCH_SIZE = 50;
      const dbTasks = taskArray.map(taskForDB);
      for (let i = 0; i < dbTasks.length; i += BATCH_SIZE) {
        const batch = dbTasks.slice(i, i + BATCH_SIZE);
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const projRef = url.match(/https:\/\/([^.]+)/)?.[1];
        const raw = localStorage.getItem(`sb-${projRef}-auth-token`);
        const token = raw ? JSON.parse(raw).access_token : key;

        await fetch(`${url}/rest/v1/tasks`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(batch),
        });
      }
      console.log('Sync a Supabase completado:', taskArray.length, 'tareas');
    } catch (err) {
      console.warn('Error sync a Supabase:', err.message);
    }
  }

  async function loadData() {
    try {
      // 1. Intentar Supabase (fuente de verdad)
      let supabaseTasks = null;
      let supabaseHasV2 = false;

      if (isAuthenticated()) {
        try {
          supabaseTasks = await dbSelect('tasks', 'select=*&or=(deleted.is.null,deleted.eq.false)&order=family.asc,level.asc');
          supabaseHasV2 = supabaseTasks?.some(t => t.family);
        } catch (err) {
          console.warn('Error leyendo Supabase:', err.message);
        }
      }

      // 2. Si Supabase tiene datos v2, usarlos como fuente
      if (supabaseHasV2 && supabaseTasks.length > 0) {
        const enriched = supabaseTasks.map(enrichTask);
        setTasks(enriched);
        persistTasks(enriched);
        console.log('Tareas desde Supabase (v2):', enriched.length);
        setLoading(false);
        return;
      }

      // 3. localStorage tiene datos mas ricos — usarlos y sincronizar a Supabase
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.length > 0 && parsed[0].family) {
          const enriched = parsed.map(enrichTask);
          setTasks(enriched);
          console.log('Tareas desde cache local:', enriched.length);

          // Auto-sync: subir datos locales a Supabase (background)
          if (isAuthenticated() && !supabaseHasV2) {
            console.log('Sincronizando datos locales a Supabase...');
            syncToSupabase(enriched);
          }
          setLoading(false);
          return;
        }
      }

      // 4. Ultimo recurso: archivo estatico
      const initial = TASKS_V2.map(enrichTask);
      setTasks(initial);
      persistTasks(initial);
      saveSnapshot(initial, 'carga inicial');
    } catch (error) {
      console.error('Error cargando datos:', error);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) { setTasks(JSON.parse(stored).map(enrichTask)); }
        else { setTasks(TASKS_V2.map(enrichTask)); }
      } catch(e) { setTasks(TASKS_V2.map(enrichTask)); }
    } finally {
      setLoading(false);
    }
  }

  var save = useCallback(async function(newTasks, newOwners) {
    var nt = newTasks || tasks;
    var no = newOwners || owners;
    setTasks(nt);
    if (newOwners) setOwners(no);
  }, [tasks, owners]);

  async function updateTask(id, changes) {
    if (!canEdit) return;
    undoStack.current.push([...tasks]);
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    redoStack.current = [];

    const updated = tasks.map(t => t.id === id ? { ...t, ...changes } : t);
    setTasks(updated);
    persistWithHistory(updated, 'edicion tarea');
    setLastSaved(new Date());

    // Guardar en Supabase (fuente de verdad)
    const task = updated.find(t => t.id === id);
    if (task && isAuthenticated()) {
      dbUpdate('tasks', id, taskForDB(task)).catch(err =>
        console.warn('Supabase update error:', err.message)
      );
    }

    // Realtime: Supabase broadcast automatico via postgres_changes
  }

  async function saveAllChanges() {
    saveSnapshot(tasks, 'guardado manual');
    persistTasks(tasks);
    setHasUnsavedChanges(false);
    setLastSaved(new Date());
  }

  async function deleteTask(id) {
    if (!canEdit) return;
    if (confirm("Eliminar tarea?")) {
      undoStack.current.push([...tasks]);
      redoStack.current = [];
      saveSnapshot(tasks, 'antes de borrar tarea');
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      persistWithHistory(updated, 'tarea eliminada');
      setLastSaved(new Date());

      // Eliminar de Supabase (borrado logico)
      if (isAuthenticated()) {
        dbUpdate('tasks', id, { deleted: true }).catch(err =>
          console.warn('Supabase delete error:', err.message)
        );
      }

      // Realtime: Supabase broadcast automatico via postgres_changes
    }
  }

  function applyView(view) {
    setCurrentView(view);

    if (view.filters) {
      if (view.filters.priority && Array.isArray(view.filters.priority)) {
        setFPr(view.filters.priority.join(','));
      }
      if (view.filters.status && Array.isArray(view.filters.status)) {
        setFSt(view.filters.status.join(','));
      }
    }

    if (view.sortBy) {
      setSortKey(view.sortBy);
    }

    console.log(`✅ Vista aplicada: ${view.name}`);
  }

  async function addTask(t) {
    if (!canEdit) return;
    undoStack.current.push([...tasks]);
    redoStack.current = [];
    const newTask = enrichTask({ ...t, id: makeId(), deleted: false });
    const updated = [...tasks, newTask];
    setTasks(updated);
    persistWithHistory(updated, 'tarea creada');
    setLastSaved(new Date());

    // Crear en Supabase (fuente de verdad)
    if (isAuthenticated()) {
      dbInsert('tasks', taskForDB(newTask)).catch(err =>
        console.warn('Supabase insert error:', err.message)
      );
    }

    // Realtime: Supabase broadcast automatico via postgres_changes
  }

  // Reset a datos originales (borra localStorage y recarga desde archivo)
  function resetToOriginal() {
    if (confirm("Restaurar todas las tareas al estado original? Se perderan todos los cambios.")) {
      localStorage.removeItem(STORAGE_KEY);
      const initial = TASKS_V2.map(enrichTask);
      setTasks(initial);
      persistTasks(initial);
      setLastSaved(new Date());
    }
  }

  function handleMergeOwners(from, to) {
    if (!from || !to || from === to) return;
    var nt = tasks.map(function(t) { return t.owner === from ? { ...t, owner: to } : t; });
    var no = owners.filter(function(o) { return o !== from; });
    save(nt, no); setOwners(no);
  }

  function handleAddOwner(name) {
    if (name && !owners.includes(name)) { var no = [...owners, name]; setOwners(no); save(tasks, no); }
  }

  // Active tasks (not deleted)
  var activeTasks = useMemo(function() {
    return tasks.filter(function(t) { return !t.deleted; });
  }, [tasks]);

  var filtered = useMemo(function() {
    var r = activeTasks;
    if (search) { var s = search.toLowerCase(); r = r.filter(function(t) { return t.name.toLowerCase().includes(s) || t.owner.toLowerCase().includes(s) || (t.id && t.id.toLowerCase().includes(s)); }); }
    if (fFamily.length > 0) r = r.filter(function(t) { return fFamily.includes(t.family); });
    if (fStage.length > 0) r = r.filter(function(t) { return fStage.includes(t.stage); });
    if (fScope.length > 0) r = r.filter(function(t) {
      return fScope.some(function(s) {
        if (s === "global") return t.scope === "global";
        return t.spaces && t.spaces.includes(s);
      });
    });
    if (fSt.length > 0) r = r.filter(function(t) { return fSt.includes(t.status); });
    if (fOw.length > 0) r = r.filter(function(t) { return fOw.some(function(o) { return t.owner && t.owner.includes(o); }); });
    if (fPr.length > 0) r = r.filter(function(t) { return fPr.includes(t.priority); });
    if (fLevel.length > 0) r = r.filter(function(t) { return fLevel.includes(t.level); });
    return [...r].sort(function(a, b) { var av = a[sortKey] || "", bv = b[sortKey] || ""; return av < bv ? -sortDir : av > bv ? sortDir : 0; });
  }, [activeTasks, search, fFamily, fStage, fScope, fSt, fOw, fPr, fLevel, sortKey, sortDir]);

  var kpis = useMemo(function() {
    var overdue = activeTasks.filter(function(t) { return t.status !== "Hecho" && toDate(t.endDate) < TODAY; });
    var thisWeek = activeTasks.filter(function(t) { var d = daysLeft(t.endDate); return t.status !== "Hecho" && d >= 0 && d <= 7; });
    var done = activeTasks.filter(function(t) { return t.status === "Hecho"; }).length;
    var milestones = activeTasks.filter(function(t) { return t.isMilestone && t.status !== "Hecho"; }).sort(function(a, b) { return a.endDate.localeCompare(b.endDate); });
    var byFamily = FAMILY_LIST.map(function(fam) {
      var all = activeTasks.filter(function(t) { return t.family === fam.code; });
      var dn = all.filter(function(t) { return t.status === "Hecho"; }).length;
      return { family: fam.code, label: fam.label, total: all.length, done: dn, pct: all.length ? Math.round(dn / all.length * 100) : 0, color: fam.color };
    }).filter(function(f) { return f.total > 0; });
    var byStage = STAGE_LIST.map(function(stg) {
      var all = activeTasks.filter(function(t) { return t.stage === stg.key; });
      var dn = all.filter(function(t) { return t.status === "Hecho"; }).length;
      return { stage: stg.key, label: stg.label, total: all.length, done: dn, pct: all.length ? Math.round(dn / all.length * 100) : 0, color: stg.color };
    });
    // backward compat: byWs maps to byFamily for legacy views
    var byWs = byFamily.map(function(f) { return { ws: f.label, total: f.total, done: f.done, pct: f.pct, color: f.color }; });
    return { overdue: overdue, thisWeek: thisWeek, done: done, total: activeTasks.length, milestones: milestones, byFamily: byFamily, byStage: byStage, byWs: byWs, pct: activeTasks.length ? Math.round(done / activeTasks.length * 100) : 0 };
  }, [activeTasks]);

  var depsMap = useMemo(function() {
    var m = {};
    tasks.forEach(function(t) { var deps = t.deps; if (typeof deps === 'string') { try { deps = JSON.parse(deps); } catch(e) { deps = []; } } (deps || []).forEach(function(dep) { if (!m[dep]) m[dep] = []; m[dep].push(t.id); }); });
    return m;
  }, [tasks]);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: PALETTE.muted, fontFamily: SERIF, fontSize: 18 }}>Cargando…</div>;

  var newTaskDefaults = { name: "", family: "DIR", familyLabel: "Direccion & Decision", level: "task", parent: "t06", pillar: "direccion", stage: "pre", scope: "global", spaces: [], milestone: "goNoGo", status: "Pendiente", priority: "P1", startDate: "2026-04-16", endDate: "2026-04-23", owner: owners[0] || "", isMilestone: false, risk: "MEDIO", notes: "", deleted: false, ws: "Direccion & Decision" };

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: PALETTE.ink, maxWidth: 1280, margin: "0 auto", padding: "0 16px 80px", position: "relative", minHeight: "100vh" }}>
      <style>{"@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}"}</style>
      <h2 className="sr-only">NEO DMSTK project tracker</h2>

      {modal ? <TaskModal task={modal} owners={owners} addOwner={handleAddOwner} tasks={activeTasks} onSave={canEdit ? function(t) { if (t.id) updateTask(t.id, t); else addTask(t); setModal(null); } : null} onClose={function() { setModal(null); }} onDelete={canEdit ? function(id) { deleteTask(id); } : null} readOnly={!canEdit} /> : null}
      {showSettings ? <SettingsPanel owners={owners} addOwner={handleAddOwner} mergeOwners={handleMergeOwners} onClose={function() { setShowSettings(false); }} isAdmin={isAdmin} /> : null}

      {/* Panel de historial */}
      {showHistory ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(44,41,38,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={function() { setShowHistory(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: PALETTE.bone, borderRadius: 12, width: 500, maxHeight: "70vh", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", border: "1px solid " + PALETTE.faint }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid " + PALETTE.faint, display: "flex", justifyContent: "space-between", alignItems: "center", background: PALETTE.warm }}>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: SERIF }}>Historial de versiones</span>
              <button onClick={function() { setShowHistory(false); }} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: PALETTE.muted }}>x</button>
            </div>
            <div style={{ padding: "12px 18px", overflowY: "auto", maxHeight: "55vh" }}>
              {getHistory().length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: PALETTE.muted, fontSize: 13 }}>
                  No hay versiones guardadas aun. El historial se crea automaticamente cada 10 cambios o cada 5 minutos.
                </div>
              ) : (
                getHistory().slice().reverse().map(function(snap, i, arr) {
                  var date = new Date(snap.timestamp);
                  var timeStr = date.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + PALETTE.faint + "30" }}>
                      <div>
                        <div style={{ fontSize: 12, color: PALETTE.ink }}>{timeStr}</div>
                        <div style={{ fontSize: 10, color: PALETTE.muted }}>{snap.reason} — {snap.taskCount} tareas</div>
                      </div>
                      <button onClick={function() {
                        if (confirm("Restaurar esta version? (" + timeStr + ")\nSe creara un snapshot del estado actual antes de restaurar.")) {
                          saveSnapshot(tasks, "antes de restaurar version " + timeStr);
                          restoreFromHistory(arr.length - 1 - i);
                          setShowHistory(false);
                        }
                      }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 4, border: "1px solid " + PALETTE.lagune + "40", background: "transparent", cursor: "pointer", color: PALETTE.lagune, fontWeight: 600 }}>
                        Restaurar
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ padding: "10px 18px", borderTop: "1px solid " + PALETTE.faint, background: PALETTE.warm }}>
              <button onClick={function() { saveSnapshot(tasks, "snapshot manual"); setShowHistory(false); }} style={{ width: "100%", fontSize: 11, padding: "6px", borderRadius: 6, border: "1px dashed " + PALETTE.faint, background: "transparent", cursor: "pointer", color: PALETTE.lagune, fontWeight: 600 }}>Crear snapshot ahora</button>
            </div>
          </div>
        </div>
      ) : null}

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid " + PALETTE.faint, marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: PALETTE.mostaza }} />
          <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>NEO <span style={{ color: PALETTE.nectarine }}>DMSTK</span></span>
          <span style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "var(--font-mono)", borderLeft: "1px solid " + PALETTE.faint, paddingLeft: 10 }}>Project tracker</span>
        </div>

        {/* Búsqueda global con hashtags */}
        <div style={{ flex: "1 1 auto", maxWidth: 500, minWidth: 250 }}>
          <GlobalSearch tasks={tasks} onTaskClick={function(task) { setModal(task); }} />
        </div>

        <ConnectionStatus isConnected={isConnected} usersOnline={usersOnline} />

        {/* Usuario actual */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: PALETTE.warm, fontSize: 11, color: PALETTE.soft }}>
          <UserIcon size={13} />
          <span style={{ fontWeight: 500 }}>{profile?.display_name || user?.email}</span>
          <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: isAdmin ? PALETTE.nectarine + '30' : canEdit ? PALETTE.lagune + '20' : PALETTE.danger + '15', color: isAdmin ? PALETTE.nectarine : canEdit ? PALETTE.lagune : PALETTE.danger, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {profile?.role}
          </span>
          {!canEdit && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: PALETTE.danger + '12', color: PALETTE.danger, fontWeight: 600, letterSpacing: '0.3px' }}>Solo lectura</span>}
          <button onClick={signOut} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.muted, padding: 2, display: "flex" }} title="Cerrar sesion"><LogOut size={13} /></button>
        </div>

        <nav style={{ display: "flex", gap: 2, background: PALETTE.warm, borderRadius: 8, padding: 2 }}>
          {[["dashboard", LayoutDashboard, "Dashboard"], ["tasks", List, "Tareas"], ["timeline", CalendarRange, "Timeline"]].map(function(item) {
            var v = item[0], Ic = item[1], lb = item[2];
            return (
              <button key={v} onClick={function() { setView(v); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: view === v ? 500 : 400, background: view === v ? PALETTE.bone : "transparent", border: "none", color: view === v ? PALETTE.ink : PALETTE.muted, cursor: "pointer" }}>
                <Ic size={14} />{lb}
              </button>
            );
          })}
        </nav>


        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={function() { setShowHistory(true); }} style={{ display: "flex", alignItems: "center", padding: 7, borderRadius: 6, border: "0.5px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: PALETTE.muted }} title="Historial de versiones"><History size={14} /></button>
          <button onClick={function() { setShowSettings(true); }} style={{ display: "flex", alignItems: "center", padding: 7, borderRadius: 6, border: "0.5px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: PALETTE.muted }}><Users size={14} /></button>
          <button onClick={undo} style={{ display: "flex", alignItems: "center", padding: 7, borderRadius: 6, border: "0.5px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: undoStack.current.length > 0 ? PALETTE.lagune : PALETTE.faint, opacity: undoStack.current.length > 0 ? 1 : 0.4 }} title="Deshacer (Ctrl+Z)"><RotateCcw size={13} /></button>
          <button onClick={redo} style={{ display: "flex", alignItems: "center", padding: 7, borderRadius: 6, border: "0.5px solid " + PALETTE.faint, background: "transparent", cursor: "pointer", color: redoStack.current.length > 0 ? PALETTE.lagune : PALETTE.faint, opacity: redoStack.current.length > 0 ? 1 : 0.4 }} title="Rehacer (Ctrl+Y)"><ArrowRight size={13} /></button>
          <div style={{ position: "relative" }}>
            <button onClick={function() { setShowExportMenu(!showExportMenu); }} style={{ display: "flex", alignItems: "center", padding: 7, borderRadius: 6, border: "0.5px solid " + PALETTE.faint, background: showExportMenu ? PALETTE.warm : "transparent", cursor: "pointer", color: PALETTE.muted }} title="Exportar"><Save size={13} /></button>
            {showExportMenu && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: PALETTE.bone, borderRadius: 8, border: "1px solid " + PALETTE.faint, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 200, overflow: "hidden" }}>
                <button onClick={exportHTML} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", color: PALETTE.ink, fontSize: 12, textAlign: "left" }} onMouseEnter={function(e){e.target.style.background=PALETTE.warm}} onMouseLeave={function(e){e.target.style.background='transparent'}}>
                  <span style={{ fontSize: 14 }}>📊</span> Resumen ejecutivo (HTML)
                </button>
                <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", border: "none", borderTop: "1px solid " + PALETTE.faint + "40", background: "transparent", cursor: "pointer", color: PALETTE.ink, fontSize: 12, textAlign: "left" }} onMouseEnter={function(e){e.target.style.background=PALETTE.warm}} onMouseLeave={function(e){e.target.style.background='transparent'}}>
                  <span style={{ fontSize: 14 }}>📋</span> Tabla completa (CSV)
                </button>
              </div>
            )}
          </div>
          {canEdit && <button onClick={function() { setModal(newTaskDefaults); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: PALETTE.nectarine, color: "#fff", border: "none", cursor: "pointer" }}><Plus size={14} />Nueva tarea</button>}

          {/* Guardado automatico + Reset */}
          {lastSaved ? (
            <span style={{ fontSize: 10, color: PALETTE.menthe, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
              <Check size={12} />Guardado
            </span>
          ) : null}

        </div>
      </header>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {true ? (
        <div style={{ marginBottom: 14 }}>
          {/* Search */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: PALETTE.muted }} />
              <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Buscar por nombre, ID, owner..."
                style={{ width: "100%", fontSize: 12, borderRadius: 6, border: "1px solid " + PALETTE.faint, padding: "7px 12px 7px 30px" }} />
            </div>
            <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "var(--font-mono)", flexShrink: 0 }}>{filtered.length} tareas</div>
            {(fFamily.length + fStage.length + fScope.length + fSt.length + fOw.length + fPr.length + fLevel.length > 0 || search) ? (
              <button onClick={function() { setFFamily([]); setFStage([]); setFScope([]); setFSt([]); setFOw([]); setFPr([]); setFLevel([]); setSearch(""); saveUI({ fFamily:[], fStage:[], fScope:[], fSt:[], fOw:[], fPr:[], fLevel:[] }); }}
                style={{ fontSize: 10, padding: "5px 10px", cursor: "pointer", border: "1px solid " + PALETTE.faint, borderRadius: 4, background: "transparent", color: PALETTE.muted }}>Limpiar filtros</button>
            ) : null}
          </div>
          {/* Filter chips — multi-select */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            {/* Alcance */}
            <span style={{ fontSize: 9, color: PALETTE.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginRight: 2 }}>Alcance</span>
            {["global", "E1", "E2"].map(function(v) {
              var active = fScope.includes(v);
              return <button key={v} onClick={function() { toggleFilter(setFScope, "fScope", v); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid " + (active ? PALETTE.lagune + "60" : PALETTE.faint), background: active ? PALETTE.lagune + "15" : "transparent", color: active ? PALETTE.lagune : PALETTE.muted, cursor: "pointer", fontWeight: active ? 600 : 400 }}>{v === "global" ? "Global" : v}</button>;
            })}
            <span style={{ width: 1, height: 18, background: PALETTE.faint + "40", margin: "0 4px" }} />
            <span style={{ fontSize: 9, color: PALETTE.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginRight: 2 }}>Etapa</span>
            {Object.entries(STAGES).map(function(e) {
              var active = fStage.includes(e[0]);
              return <button key={e[0]} onClick={function() { toggleFilter(setFStage, "fStage", e[0]); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid " + (active ? e[1].color + "60" : PALETTE.faint), background: active ? e[1].color + "15" : "transparent", color: active ? e[1].color : PALETTE.muted, cursor: "pointer", fontWeight: active ? 600 : 400 }}>{e[1].label}</button>;
            })}
            <span style={{ width: 1, height: 18, background: PALETTE.faint + "40", margin: "0 4px" }} />
            <span style={{ fontSize: 9, color: PALETTE.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginRight: 2 }}>Estado</span>
            {STATUSES.map(function(s) {
              var active = fSt.includes(s);
              return <button key={s} onClick={function() { toggleFilter(setFSt, "fSt", s); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid " + (active ? STATUS_COLORS[s] + "60" : PALETTE.faint), background: active ? STATUS_COLORS[s] + "15" : "transparent", color: active ? STATUS_COLORS[s] : PALETTE.muted, cursor: "pointer", fontWeight: active ? 600 : 400 }}>{s}</button>;
            })}
            <span style={{ width: 1, height: 18, background: PALETTE.faint + "40", margin: "0 4px" }} />
            <span style={{ fontSize: 9, color: PALETTE.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginRight: 2 }}>Prioridad</span>
            {[["P0","Critica"],["P1","Alta"],["P2","Media"],["P3","Baja"]].map(function(p) {
              var active = fPr.includes(p[0]);
              return <button key={p[0]} onClick={function() { toggleFilter(setFPr, "fPr", p[0]); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid " + (active ? (PRIORITY_COLORS[p[0]] || PALETTE.muted) + "60" : PALETTE.faint), background: active ? (PRIORITY_COLORS[p[0]] || PALETTE.muted) + "15" : "transparent", color: active ? PRIORITY_COLORS[p[0]] : PALETTE.muted, cursor: "pointer", fontWeight: active ? 600 : 400 }}>{p[1]}</button>;
            })}
            <span style={{ width: 1, height: 18, background: PALETTE.faint + "40", margin: "0 4px" }} />
            <span style={{ fontSize: 9, color: PALETTE.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginRight: 2 }}>Nivel</span>
            {[["epic","Iniciativas"],["task","Tareas"]].map(function(l) {
              var active = fLevel.includes(l[0]);
              return <button key={l[0]} onClick={function() { toggleFilter(setFLevel, "fLevel", l[0]); }} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: "1px solid " + (active ? PALETTE.mostaza + "60" : PALETTE.faint), background: active ? PALETTE.mostaza + "15" : "transparent", color: active ? PALETTE.mostaza : PALETTE.muted, cursor: "pointer", fontWeight: active ? 600 : 400 }}>{l[1]}</button>;
            })}
          </div>
        </div>
      ) : null}

      {view === "dashboard" ? <>
        <DailyBriefing tasks={activeTasks} milestones={MILESTONES} PALETTE={PALETTE} />
        <DashboardView kpis={kpis} setModal={setModal} tasks={activeTasks} />
      </> : null}
      {view === "tasks" ? <ExcelTasksView tasks={filtered} owners={owners} onUpdateTask={canEdit ? updateTask : null} onDeleteTask={canEdit ? deleteTask : null} onTaskClick={function(task) { setModal(task); }} sortKey={sortKey} sortDir={sortDir} onSort={function(k) { if (sortKey === k) setSortDir(-sortDir); else { setSortKey(k); setSortDir(1); } }} readOnly={!canEdit} /> : null}
      {view === "timeline" ? <SummaryTimelineView tasks={filtered} PALETTE={PALETTE} SERIF={SERIF} onUpdateTask={canEdit ? updateTask : null} onDeleteTask={canEdit ? deleteTask : null} readOnly={!canEdit} /> : null}

      {/* PM Inteligente — ventana flotante, disponible en todas las vistas */}
      <PMAgent tasks={activeTasks} milestones={MILESTONES} PALETTE={PALETTE} SERIF={SERIF} />

      {/* View Manager Modal */}
      {showViewManager && (
        <ViewManager
          currentView={currentView}
          currentFilters={{ ws: fWs, status: fSt, owner: fOw, priority: fPr }}
          currentGroupBy="none"
          currentSortBy={sortKey}
          showCompleted={fSt.includes('Hecho')}
          onApplyView={applyView}
          onClose={function() { setShowViewManager(false); }}
        />
      )}
    </div>
  );
}
