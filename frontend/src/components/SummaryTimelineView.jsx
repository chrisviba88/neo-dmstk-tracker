import { useState, useMemo, Component } from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';

class TimelineErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#C0564A', fontFamily: 'monospace', fontSize: 13, background: '#C0564A08', borderRadius: 12, margin: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Error en Timeline:</div>
          <div>{this.state.error.message}</div>
          <pre style={{ fontSize: 11, marginTop: 10, whiteSpace: 'pre-wrap' }}>{this.state.error.stack?.split('\n').slice(0, 5).join('\n')}</pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid #C0564A', background: 'transparent', cursor: 'pointer', color: '#C0564A' }}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SummaryTimelineInner({ tasks, PALETTE, SERIF, onUpdateTask, onDeleteTask, readOnly = false }) {
  // Workstreams - MISMA lista que en ExcelTasksView
  const WORKSTREAMS = [
    "Dirección", "Legal", "Método", "Profesor-Contenido", "Producto",
    "Branding", "Espacio-E1", "Equipo", "Piloto", "Tecnología",
  ];
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [showPlanningNotes, setShowPlanningNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compactMode, setCompactMode] = useState(function() {
    try { const s = localStorage.getItem('neo-dmstk-timeline-compact'); return s !== null ? JSON.parse(s) : true; } catch(e) { return true; }
  });
  const [milestoneVisibility, setMilestoneVisibility] = useState(function() {
    try { const s = localStorage.getItem('neo-dmstk-milestone-vis'); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
  });

  function updateCompactMode(val) { setCompactMode(val); try { localStorage.setItem('neo-dmstk-timeline-compact', JSON.stringify(val)); } catch(e) {} }
  function updateMilestoneVisibility(val) { setMilestoneVisibility(val); try { localStorage.setItem('neo-dmstk-milestone-vis', JSON.stringify(val)); } catch(e) {} }
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filtros de proyecto
  const defaultProjectFilters = { global: true, e1: true, e2: true, e3: true };
  const [projectFilters, setProjectFiltersState] = useState(function() {
    try { const s = localStorage.getItem('neo-dmstk-timeline-projfilters'); return s ? { ...defaultProjectFilters, ...JSON.parse(s) } : defaultProjectFilters; } catch(e) { return defaultProjectFilters; }
  });
  function setProjectFilters(v) { setProjectFiltersState(v); try { localStorage.setItem('neo-dmstk-timeline-projfilters', JSON.stringify(v)); } catch(e) {} }

  // Selector de Hitos visibles
  const [visibleMilestones, setVisibleMilestones] = useState({
    softOpening: true,
    openingOficial: true
  });

  // Modo de agrupación: 'workstream' | 'project' | 'subproject'
  const [groupBy, setGroupByState] = useState(function() {
    try { return localStorage.getItem('neo-dmstk-timeline-groupby') || 'workstream'; } catch(e) { return 'workstream'; }
  });
  function setGroupBy(v) { setGroupByState(v); try { localStorage.setItem('neo-dmstk-timeline-groupby', v); } catch(e) {} }

  // Zoom continuo: controla px/dia (NO cambia el rango de fechas)
  const [zoomLevel, setZoomLevelState] = useState(function() {
    try { const s = localStorage.getItem('neo-dmstk-timeline-zoom'); return s !== null ? parseFloat(s) : 0; } catch(e) { return 0; }
  });
  function setZoomLevel(v) { setZoomLevelState(v); try { localStorage.setItem('neo-dmstk-timeline-zoom', String(v)); } catch(e) {} }

  const TODAY = new Date();
  const FULL_START = new Date(2026, 3, 1); // Abril 2026
  const FULL_END = new Date(2027, 2, 31); // Marzo 2027 (incluye Q1 2027 para E2)

  // Rango SIEMPRE fijo: abril-diciembre. Zoom solo afecta escala visual.
  const RANGE_START = FULL_START;
  const RANGE_END = FULL_END;
  const RANGE_DAYS = Math.ceil((RANGE_END - RANGE_START) / 864e5);
  const todayPct = ((TODAY - RANGE_START) / 864e5 / RANGE_DAYS) * 100;

  // Px por dia segun zoom: de 5px (zoom 0) a 80px (zoom 1)
  const pxPerDay = 5 + zoomLevel * 75;
  const timelineWidth = Math.max(1200, RANGE_DAYS * pxPerDay);

  // Hitos del proyecto con fechas ancla
  const CRITICAL_MILESTONES = [
    { name: 'Piloto', date: new Date(2026, 4, 19), color: '#8b5cf6' },
    { name: 'GO/NO-GO', date: new Date(2026, 5, 20), color: '#e74c3c' },
    { name: 'Reforma E1', date: new Date(2026, 5, 25), color: '#f97316' },
    { name: 'Soft Opening E1', date: new Date(2026, 8, 1), color: '#10b981' },
    { name: 'Grand Opening E1', date: new Date(2026, 9, 1), color: '#3b82f6' },
    { name: 'Apertura E2 BCN', date: new Date(2027, 2, 1), color: '#10b981' },
  ];

  // Generar meses dinámicamente según el rango
  const months = [];
  const startMonth = RANGE_START.getMonth();
  const endMonth = RANGE_END.getMonth();
  const startYear = RANGE_START.getFullYear();
  const endYear = RANGE_END.getFullYear();

  for (let y = startYear; y <= endYear; y++) {
    const firstMonth = y === startYear ? startMonth : 0;
    const lastMonth = y === endYear ? endMonth : 11;
    for (let m = firstMonth; m <= lastMonth; m++) {
      months.push(new Date(y, m, 1));
    }
  }

  // Generar días para el grid (incluyendo fines de semana)
  const allDays = [];
  const currentDay = new Date(RANGE_START);
  currentDay.setHours(0, 0, 0, 0);

  while (currentDay <= RANGE_END) {
    allDays.push({
      date: new Date(currentDay),
      isWeekend: currentDay.getDay() === 0 || currentDay.getDay() === 6, // Domingo=0, Sábado=6
      dayNumber: currentDay.getDate()
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Generar semanas para el grid
  const allWeeks = [];
  let weekStart = new Date(RANGE_START);
  weekStart.setHours(0, 0, 0, 0);

  // Ajustar al lunes más cercano
  while (weekStart.getDay() !== 1) {
    weekStart.setDate(weekStart.getDate() - 1);
  }

  let weekNum = 1;
  while (weekStart <= RANGE_END) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Domingo

    allWeeks.push({
      start: new Date(weekStart),
      end: weekEnd,
      weekNum: weekNum,
      label: `S${weekNum}`
    });

    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }

  const NAME_W = 420;

  function toDate(str) {
    return str ? new Date(str) : new Date();
  }

  function formatDate(str) {
    if (!str) return '';
    return new Date(str).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Filtrar tareas según los filtros de proyecto
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const proj = task.project ? task.project.toLowerCase() : '';

      if (proj.includes('global') && !projectFilters.global) return false;
      if (proj.includes('e1') && !projectFilters.e1) return false;
      if (proj.includes('e2') && !projectFilters.e2) return false;
      if (proj.includes('e3') && !projectFilters.e3) return false;

      return true;
    });
  }, [tasks, projectFilters]);

  // Colores y labels de las 15 areas (DEBE estar antes de los useMemo que lo usan)
  const AREA_CONFIG = {
    DIR: { label: 'Direccion & Decision', color: '#fbbf24' },
    LEG: { label: 'Legal & Licencias', color: '#94a3b8' },
    MET: { label: 'Metodo PERMA', color: '#a78bfa' },
    CON: { label: 'Contenido Video', color: '#14b8a6' },
    DAR: { label: 'Daruma Ritual', color: '#f97316' },
    KIT: { label: 'Kits Experiencia', color: '#eab308' },
    RET: { label: 'Retail & Merch', color: '#a3a3a3' },
    BRA: { label: 'Marca & Branding', color: '#ec4899' },
    RED: { label: 'Redes & Marketing', color: '#f472b6' },
    EQU: { label: 'Equipo & Formacion', color: '#60a5fa' },
    TEC: { label: 'Tecnologia & Web', color: '#34d399' },
    PIL: { label: 'Piloto & Validacion', color: '#ef4444' },
    ESP1: { label: 'Espacio E1 Madrid', color: '#fb923c' },
    OPS1: { label: 'Operaciones E1', color: '#818cf8' },
    ESP2: { label: 'E2 Barcelona', color: '#10b981' },
  };

  const AREA_ORDER = ['DIR','LEG','MET','CON','DAR','KIT','RET','BRA','RED','EQU','TEC','PIL','ESP1','OPS1','ESP2'];

  function groupByWorkstream(tasksList) {
    const categories = {};

    // Agrupar por Area (family) con jerarquia recursiva.
    // - Caso simple (1 epic raiz): Iniciativa + Tareas (comportamiento original).
    // - Caso profundo (varios epics raiz, ej. fases Retail): cada epic raiz es una subcategoria con sus descendientes.
    AREA_ORDER.forEach(code => {
      const cfg = AREA_CONFIG[code];
      if (!cfg) return;

      const areaTasks = tasksList.filter(t => t.family === code);
      if (areaTasks.length === 0) return;

      const ids = new Set(areaTasks.map(t => t.id));
      const epics = areaTasks.filter(t => t.level === 'epic');
      const nonEpics = areaTasks.filter(t => t.level !== 'epic');
      const rootEpics = epics.filter(e => !e.parent || !ids.has(e.parent));

      categories[code] = {
        name: cfg.label,
        color: cfg.color,
        icon: '',
        subcategories: {}
      };

      const descendantsOf = (epicId) => {
        const out = [];
        const visit = (id) => {
          areaTasks.forEach(t => {
            if (t.parent === id) {
              if (t.level !== 'epic') out.push(t);
              visit(t.id);
            }
          });
        };
        visit(epicId);
        return out;
      };

      if (rootEpics.length <= 1 && epics.length <= 1) {
        // Caso simple (compat): como antes
        const epic = rootEpics[0] || epics[0];
        if (epic) {
          categories[code].subcategories['__iniciativa__'] = {
            name: '★ ' + epic.name,
            tasks: [epic]
          };
        }
        if (nonEpics.length > 0) {
          categories[code].subcategories['__tareas__'] = {
            name: nonEpics.length + ' tareas',
            tasks: nonEpics
          };
        }
      } else {
        // Jerarquia profunda: un subcategoria por epic raiz, con todos sus descendientes (tasks)
        rootEpics.forEach(re => {
          const desc = descendantsOf(re.id);
          categories[code].subcategories[re.id] = {
            name: re.name,
            tasks: [re, ...desc]
          };
        });
        // Tareas huerfanas sin fase asignable
        const orphans = nonEpics.filter(t => !ids.has(t.parent));
        if (orphans.length > 0) {
          categories[code].subcategories['__otros__'] = {
            name: 'Otras tareas',
            tasks: orphans
          };
        }
      }
    });

    // Tareas sin area al final
    const noArea = tasksList.filter(t => !t.family || !AREA_CONFIG[t.family]);
    if (noArea.length > 0) {
      categories['_other'] = {
        name: 'Otras',
        color: PALETTE.muted,
        icon: '',
        subcategories: { all: { name: 'Sin area', tasks: noArea } }
      };
    }

    return categories;
  }

  // OPCION 2: Agrupar por ALCANCE (Global, E1 Madrid, E2 Barcelona)
  function groupByProject(tasksList) {
    const categories = {
      'Global': { name: 'Global', color: PALETTE.ink, icon: '', subcategories: {} },
      'E1': { name: 'Espacio E1 Madrid', color: PALETTE.nectarine, icon: '', subcategories: {} },
      'E2': { name: 'Espacio E2 Barcelona', color: PALETTE.lagune, icon: '', subcategories: {} },
    };

    tasksList.forEach(task => {
      let mainScope = 'Global';
      if ((task.spaces || []).includes('E1') || task.scope === 'space' && task.family && ['ESP1','OPS1','PIL'].includes(task.family)) mainScope = 'E1';
      else if ((task.spaces || []).includes('E2') || task.family === 'ESP2') mainScope = 'E2';

      const areaLabel = (task.familyLabel || task.family || 'Sin area');

      if (!categories[mainScope].subcategories[areaLabel]) {
        categories[mainScope].subcategories[areaLabel] = {
          name: areaLabel,
          tasks: []
        };
      }

      categories[mainScope].subcategories[areaLabel].tasks.push(task);
    });

    // Eliminar categorias vacias
    Object.keys(categories).forEach(key => {
      if (Object.keys(categories[key].subcategories).length === 0) delete categories[key];
    });

    return categories;
  }

  // OPCION 3: Agrupar por ETAPA DE PRODUCCION
  function groupBySubproject(tasksList) {
    const STAGE_CONFIG = {
      pre: { label: 'Pre-produccion', color: '#64748b' },
      prod: { label: 'Produccion', color: '#f59e0b' },
      pilot: { label: 'Piloto', color: '#8b5cf6' },
      launch: { label: 'Lanzamiento', color: '#10b981' },
      post: { label: 'Post / Ops', color: '#3b82f6' },
    };

    const categories = {};

    Object.entries(STAGE_CONFIG).forEach(([key, cfg]) => {
      const stageTasks = tasksList.filter(t => t.stage === key);
      if (stageTasks.length === 0) return;

      categories[key] = {
        name: cfg.label,
        color: cfg.color,
        icon: '',
        subcategories: {}
      };

      // Subcategorias por area dentro de cada etapa
      AREA_ORDER.forEach(areaCode => {
        const areaCfg = AREA_CONFIG[areaCode];
        const areaTasks = stageTasks.filter(t => t.family === areaCode);
        if (areaTasks.length === 0) return;

        categories[key].subcategories[areaCode] = {
          name: areaCfg.label,
          tasks: areaTasks
        };
      });
    });

    return categories;
  }

  // Funciones auxiliares para colores e íconos
  // Organizar tareas segun el modo de agrupacion seleccionado
  const groupedCategories = useMemo(() => {
    if (groupBy === 'workstream') {
      return groupByWorkstream(filteredTasks);
    } else if (groupBy === 'project') {
      return groupByProject(filteredTasks);
    } else {
      return groupBySubproject(filteredTasks);
    }
  }, [filteredTasks, groupBy]);

  function getProjectColor(project) {
    const projLower = project.toLowerCase();
    if (projLower.includes('global')) return PALETTE.ink;
    if (projLower.includes('e1')) return PALETTE.nectarine;
    if (projLower.includes('e2')) return PALETTE.lagune;
    if (projLower.includes('e3')) return PALETTE.menthe;
    return PALETTE.soft;
  }

  function getProjectIcon(project) {
    const projLower = project.toLowerCase();
    if (projLower.includes('global')) return '🌍';
    if (projLower.includes('e1')) return '🏫';
    if (projLower.includes('e2')) return '🏢';
    if (projLower.includes('e3')) return '🏛️';
    return '📁';
  }

  // Calcular estadísticas agregadas
  function getGroupStats(tasksList) {
    if (!tasksList || tasksList.length === 0) {
      return { startDate: null, endDate: null, progress: 0, total: 0, done: 0, blocked: 0, overdue: 0 };
    }

    const dates = tasksList
      .filter(t => t.startDate && t.endDate)
      .map(t => ({ start: toDate(t.startDate), end: toDate(t.endDate) }));

    const startDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.start))) : null;
    const endDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.end))) : null;

    const done = tasksList.filter(t => t.status === 'Hecho').length;
    const blocked = tasksList.filter(t => t.status === 'Bloqueado').length;
    const overdue = tasksList.filter(t =>
      t.status !== 'Hecho' && t.endDate && toDate(t.endDate) < TODAY
    ).length;

    const progress = tasksList.length > 0 ? Math.round((done / tasksList.length) * 100) : 0;

    return { startDate, endDate, progress, total: tasksList.length, done, blocked, overdue };
  }

  function getPos(start, end) {
    if (!start || !end) return { left: 0, width: 0 };
    const a = Math.max(0, (start - RANGE_START) / 864e5);
    const b = Math.max(a + 0.5, (end - RANGE_START) / 864e5);
    return { left: (a / RANGE_DAYS) * 100, width: Math.max(0.15, ((b - a) / RANGE_DAYS) * 100) };
  }

  // SISTEMA DE SEMÁFORO: Analizar próxima semana y próximo mes (usando tareas filtradas)
  const getTrafficLight = () => {
    const nextWeek = new Date(TODAY);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(TODAY);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Tareas que vencen en la próxima semana
    const tasksThisWeek = filteredTasks.filter(t => {
      if (t.status === 'Hecho') return false;
      const endDate = new Date(t.endDate);
      return endDate >= TODAY && endDate <= nextWeek;
    });

    // Tareas que vencen en el próximo mes
    const tasksThisMonth = filteredTasks.filter(t => {
      if (t.status === 'Hecho') return false;
      const endDate = new Date(t.endDate);
      return endDate > nextWeek && endDate <= nextMonth;
    });

    // Tareas críticas o bloqueadas
    const criticalTasks = filteredTasks.filter(t =>
      t.status !== 'Hecho' && (t.priority === 'Crítica' || t.status === 'Bloqueado')
    );

    // Tareas vencidas
    const overdueTasks = filteredTasks.filter(t => {
      if (t.status === 'Hecho') return false;
      const endDate = new Date(t.endDate);
      return endDate < TODAY;
    });

    // Análisis de carga de trabajo
    const totalTasksNearDeadline = tasksThisWeek.length + tasksThisMonth.length;
    const workloadPerWeek = totalTasksNearDeadline / 4; // Promedio por semana

    // Determinar nivel de alerta
    let level = 'green'; // 🟢 Todo bien
    let message = 'Buen ritmo, carga manejable';

    if (overdueTasks.length > 5 || criticalTasks.length > 3 || tasksThisWeek.length > 15) {
      level = 'red'; // 🔴 Alerta crítica
      message = 'Situación crítica: Considerar contratar más personal';
    } else if (overdueTasks.length > 2 || criticalTasks.length > 1 || tasksThisWeek.length > 8) {
      level = 'yellow'; // 🟡 Precaución
      message = 'Carga alta: Redistribuir tareas o evaluar recursos';
    }

    return {
      level,
      message,
      tasksThisWeek,
      tasksThisMonth,
      criticalTasks,
      overdueTasks,
      workloadPerWeek: Math.round(workloadPerWeek)
    };
  };

  const trafficLight = getTrafficLight();

  // Funciones para editar tareas
  const handleEditTask = (task) => {
    if (readOnly) return;
    setEditingTask(task);
    setEditForm({
      name: task.name || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      status: task.status || 'Pendiente',
      owner: task.owner || '',
      priority: task.priority || 'Media'
    });
  };

  const handleSaveTask = async () => {
    if (!editingTask || readOnly || !onUpdateTask) return;
    try {
      await onUpdateTask(editingTask.id, editForm);
      setEditingTask(null);
      setEditForm({});
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar la tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (readOnly || !onDeleteTask) return;
    if (!confirm('Estas seguro de eliminar esta tarea?')) return;
    try {
      await onDeleteTask(taskId);
      setEditingTask(null);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea');
    }
  };

  return (
    <div style={{
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
      background: PALETTE.bone,
      borderRadius: isFullscreen ? 0 : 12,
      overflow: 'hidden',
      border: isFullscreen ? 'none' : `1px solid ${PALETTE.faint}`,
      height: isFullscreen ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header minimalista y compacto */}
      <div style={{
        padding: '12px 20px',
        background: PALETTE.bone,
        borderBottom: `1px solid ${PALETTE.faint}20`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{
            fontFamily: SERIF,
            fontSize: 16,
            fontWeight: 500,
            margin: 0,
            color: PALETTE.ink
          }}>
            Timeline
          </h2>

          {/* Toggle Compacto / Detallado */}
          <div style={{
            display: 'flex',
            background: PALETTE.warm,
            borderRadius: 6,
            border: `1px solid ${PALETTE.faint}40`,
            overflow: 'hidden'
          }}>
            {[
              { value: true, label: 'Compacto' },
              { value: false, label: 'Detallado' },
            ].map(({ value, label }) => (
              <button
                key={label}
                onClick={() => {
                  updateCompactMode(value);
                  if (value) {
                    setExpandedCategories({});
                    setExpandedSubcategories({});
                  } else {
                    const allExpanded = {};
                    Object.keys(groupedCategories).forEach(k => { allExpanded[k] = true; });
                    setExpandedCategories(allExpanded);
                  }
                }}
                style={{
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  background: compactMode === value ? PALETTE.ink : 'transparent',
                  color: compactMode === value ? PALETTE.bone : PALETTE.muted,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <span style={{
            fontSize: 10,
            color: PALETTE.muted,
            fontFamily: 'var(--font-mono)',
            background: PALETTE.warm,
            padding: '3px 8px',
            borderRadius: 4
          }}>
            {Object.keys(groupedCategories).length} grupos
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Control de Zoom con Slider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: PALETTE.warm,
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${PALETTE.faint}30`
          }}>
            <ZoomOut size={14} color={PALETTE.muted} />
            <input
              type="range"
              min="0"
              max="100"
              value={zoomLevel * 100}
              onChange={(e) => setZoomLevel(e.target.value / 100)}
              style={{
                width: 120,
                height: 4,
                background: `linear-gradient(to right, ${PALETTE.lagune} 0%, ${PALETTE.lagune} ${zoomLevel * 100}%, ${PALETTE.faint} ${zoomLevel * 100}%, ${PALETTE.faint} 100%)`,
                borderRadius: 2,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            />
            <ZoomIn size={14} color={PALETTE.muted} />
          </div>

          {/* Zoom presets */}
          <div style={{ display: 'flex', gap: 2, background: PALETTE.warm, borderRadius: 6, border: `1px solid ${PALETTE.faint}30`, overflow: 'hidden' }}>
            {[
              { label: 'Todo', zoom: 0 },
              { label: '15 dias', zoom: 0.85 },
              { label: '1 mes', zoom: 0.7 },
              { label: 'Q', zoom: 0.35 },
            ].map(({ label, zoom }) => (
              <button key={label} onClick={() => setZoomLevel(zoom)} style={{
                padding: '4px 10px', fontSize: 10, fontWeight: 600, border: 'none',
                background: Math.abs(zoomLevel - zoom) < 0.05 ? PALETTE.ink : 'transparent',
                color: Math.abs(zoomLevel - zoom) < 0.05 ? PALETTE.bone : PALETTE.muted,
                cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>

          {/* Botón de Semáforo */}
          <button
            onClick={() => setShowPlanningNotes(!showPlanningNotes)}
            style={{
              padding: '6px 10px',
              background: showPlanningNotes ? PALETTE.nectarine + '15' : 'transparent',
              border: `1px solid ${showPlanningNotes ? PALETTE.nectarine : PALETTE.faint}30`,
              borderRadius: 6,
              fontSize: 18,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={showPlanningNotes ? 'Ocultar Semáforo' : 'Mostrar Semáforo'}
          >
            {trafficLight.level === 'red' ? '🔴' : trafficLight.level === 'yellow' ? '🟡' : '🟢'}
          </button>

          {/* Botón Pantalla Completa */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              padding: '6px',
              background: 'transparent',
              border: `1px solid ${PALETTE.faint}30`,
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
          >
            {isFullscreen ? <Minimize2 size={14} color={PALETTE.soft} /> : <Maximize2 size={14} color={PALETTE.soft} />}
          </button>
        </div>
      </div>

      {/* Controles de Filtros, Agrupación y Hitos */}
      <div style={{
        padding: '10px 20px',
        background: PALETTE.warm,
        borderBottom: `1px solid ${PALETTE.faint}20`,
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        flexShrink: 0,
        flexWrap: 'wrap'
      }}>
        {/* Selector de Modo de Agrupación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Agrupar por:
          </span>
          <div style={{
            display: 'flex',
            background: PALETTE.bone,
            borderRadius: 6,
            border: `1px solid ${PALETTE.faint}40`,
            overflow: 'hidden'
          }}>
            {[
              { value: 'workstream', label: 'Por area', icon: '' },
              { value: 'project', label: 'Por alcance', icon: '' },
              { value: 'subproject', label: 'Por etapa', icon: '' }
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setGroupBy(value)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  border: 'none',
                  background: groupBy === value ? PALETTE.lagune : 'transparent',
                  color: groupBy === value ? PALETTE.bone : PALETTE.soft,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRight: value !== 'workstream' ? `1px solid ${PALETTE.faint}40` : 'none'
                }}
              >
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: PALETTE.faint + '40' }} />

        {/* Filtros de Proyecto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filtrar:
          </span>
          {[
            { key: 'global', label: 'Global' },
            { key: 'e1', label: 'E1' },
            { key: 'e2', label: 'E2' },
            { key: 'e3', label: 'E3' }
          ].map(({ key, label }) => (
            <label key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontSize: 11,
              color: PALETTE.soft,
              padding: '4px 8px',
              borderRadius: 4,
              background: projectFilters[key] ? PALETTE.lagune + '15' : 'transparent',
              border: `1px solid ${projectFilters[key] ? PALETTE.lagune : PALETTE.faint}30`,
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={projectFilters[key]}
                onChange={(e) => setProjectFilters({ ...projectFilters, [key]: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Indicador de hitos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: PALETTE.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {CRITICAL_MILESTONES.length} hitos
          </span>
        </div>
      </div>

      {/* Semáforo Compacto */}
      {showPlanningNotes && (
        <div style={{
          margin: '12px 20px',
          background: PALETTE.bone,
          border: `1px solid ${PALETTE.faint}20`,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr',
            gap: 1,
            background: PALETTE.faint + '20',
            alignItems: 'center'
          }}>
            <div style={{
              background: PALETTE.bone,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 16 }}>
                {trafficLight.level === 'red' ? '🔴' : trafficLight.level === 'yellow' ? '🟡' : '🟢'}
              </span>
              <span style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 500 }}>
                {trafficLight.message}
              </span>
            </div>

            <div style={{ background: PALETTE.bone, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: trafficLight.tasksThisWeek.length > 10 ? PALETTE.danger : PALETTE.ink, fontFamily: 'var(--font-mono)' }}>
                {trafficLight.tasksThisWeek.length}
              </div>
              <div style={{ fontSize: 9, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>
                Semana
              </div>
            </div>

            <div style={{ background: PALETTE.bone, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: PALETTE.ink, fontFamily: 'var(--font-mono)' }}>
                {trafficLight.tasksThisMonth.length}
              </div>
              <div style={{ fontSize: 9, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>
                Mes
              </div>
            </div>

            <div style={{ background: PALETTE.bone, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: trafficLight.overdueTasks.length > 0 ? PALETTE.danger : PALETTE.menthe, fontFamily: 'var(--font-mono)' }}>
                {trafficLight.overdueTasks.length}
              </div>
              <div style={{ fontSize: 9, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>
                Vencidas
              </div>
            </div>

            <div style={{ background: PALETTE.bone, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: trafficLight.criticalTasks.length > 0 ? PALETTE.mostaza : PALETTE.menthe, fontFamily: 'var(--font-mono)' }}>
                {trafficLight.criticalTasks.length}
              </div>
              <div style={{ fontSize: 9, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>
                Críticas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        flex: isFullscreen ? 1 : 'auto',
        overflowX: 'auto',
        overflowY: isFullscreen ? 'auto' : 'visible',
        position: 'relative'
      }}>
        <div style={{ minWidth: timelineWidth, position: 'relative' }}>
          {/* Header STICKY: meses + barra de hitos */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: PALETTE.warm,
            borderBottom: `2px solid ${PALETTE.faint}`,
            marginBottom: 4
          }}>
            {/* Barra de HITOS — siempre visible, con toggles */}
            <div style={{ display: 'flex', position: 'relative', minHeight: 28, borderBottom: `1px solid ${PALETTE.faint}30` }}>
              <div style={{ width: NAME_W, flexShrink: 0, fontSize: 8, fontFamily: 'var(--font-mono)', color: PALETTE.muted, padding: '6px 20px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 4, flexWrap: 'wrap' }}>
                {CRITICAL_MILESTONES.map((ms, idx) => (
                  <span key={'toggle'+idx} onClick={() => {
                    const newVisible = {...(milestoneVisibility || {})};
                    newVisible[idx] = !(newVisible[idx] !== false);
                    updateMilestoneVisibility(newVisible);
                  }} style={{ cursor: 'pointer', fontSize: 7, padding: '1px 4px', borderRadius: 2, background: (milestoneVisibility || {})[idx] !== false ? ms.color + '20' : PALETTE.faint + '20', color: (milestoneVisibility || {})[idx] !== false ? ms.color : PALETTE.muted, border: `1px solid ${(milestoneVisibility || {})[idx] !== false ? ms.color + '40' : PALETTE.faint}`, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {ms.name.substring(0, 12)}
                  </span>
                ))}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                {/* HOY marker */}
                {todayPct >= 0 && todayPct <= 100 && (
                  <div style={{ position: 'absolute', left: `${todayPct}%`, top: 4, transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: '#fff', background: PALETTE.nectarine, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', zIndex: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>HOY</div>
                )}
                {/* Milestone markers — solo los visibles */}
                {CRITICAL_MILESTONES.map((ms, idx) => {
                  if ((milestoneVisibility || {})[idx] === false) return null;
                  const pct = ((ms.date - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                  if (pct < 0 || pct > 100) return null;
                  const mDate = ms.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                  return (
                    <div key={'mh'+idx} style={{ position: 'absolute', left: `${pct}%`, top: 4, transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: '#fff', background: ms.color, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', zIndex: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                      {ms.name} · {mDate}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Fila de MESES (siempre visible en zoom detallado) */}
            {zoomLevel > 0.5 && (
              <div style={{
                display: 'flex',
                borderBottom: `1px solid ${PALETTE.faint}40`,
                background: PALETTE.cream
              }}>
                <div style={{
                  width: NAME_W,
                  flexShrink: 0,
                  fontSize: 9,
                  fontFamily: 'var(--font-mono)',
                  color: PALETTE.muted,
                  letterSpacing: 1,
                  padding: '6px 20px',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Mes
                </div>
                <div style={{ flex: 1, position: 'relative', height: 28 }}>
                  {months.map((mo, i) => {
                    const monthStart = mo;
                    const nextMonth = new Date(mo.getFullYear(), mo.getMonth() + 1, 1);
                    const monthEnd = new Date(nextMonth.getTime() - 864e5); // Último día del mes

                    const startPct = Math.max(0, ((monthStart - RANGE_START) / 864e5 / RANGE_DAYS) * 100);
                    const endPct = Math.min(100, ((monthEnd - RANGE_START) / 864e5 / RANGE_DAYS) * 100);
                    const monthWidth = endPct - startPct;

                    if (monthWidth <= 0) return null;

                    const monthName = mo.toLocaleDateString('es-ES', { month: 'long' });
                    const isFirstMonth = i === 0;

                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${startPct}%`,
                          width: `${monthWidth}%`,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderLeft: isFirstMonth ? 'none' : `2px solid ${PALETTE.faint}`,
                          borderRight: i === months.length - 1 ? `2px solid ${PALETTE.faint}` : 'none'
                        }}
                      >
                        <div style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: PALETTE.ink,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          fontWeight: 700
                        }}>
                          {monthName.toUpperCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fila de días/semanas/meses principales */}
            <div style={{
              display: 'flex',
              padding: '12px 0 10px 0',
              background: PALETTE.warm
            }}>
              <div style={{
                width: NAME_W,
                flexShrink: 0,
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                color: PALETTE.muted,
                letterSpacing: 1,
                padding: '4px 20px',
                textTransform: 'uppercase'
              }}>
                Área de Negocio
              </div>
              <div style={{ flex: 1, position: 'relative', height: zoomLevel > 0.75 ? 42 : zoomLevel > 0.5 ? 36 : 24 }}>
                {/* Mostrar días individuales si zoom > 0.75 (Días) */}
                {zoomLevel > 0.75 ? (
                  allDays.map((day, i) => {
                    const pct = ((day.date - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                    const dayWidth = (1 / RANGE_DAYS) * 100;

                    // Determinar si es el primer día del mes para mostrar separación
                    const isFirstOfMonth = day.date.getDate() === 1;

                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${pct}%`,
                          width: `${dayWidth}%`,
                          height: '100%',
                          borderLeft: isFirstOfMonth ? `2px solid ${PALETTE.faint}` : `0.5px solid ${PALETTE.faint}30`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isFirstOfMonth ? PALETTE.cream + '80' : 'transparent'
                        }}
                      >
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          color: day.isWeekend ? PALETTE.muted : PALETTE.ink,
                          fontWeight: day.isWeekend ? 400 : 600,
                          background: day.isWeekend ? PALETTE.muted + '10' : 'transparent',
                          padding: '2px 4px',
                          borderRadius: 3
                        }}>
                          {day.dayNumber}
                        </div>
                        <div style={{
                          fontSize: 7,
                          color: PALETTE.muted,
                          marginTop: 2
                        }}>
                          {day.date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    );
                  })
                ) : zoomLevel > 0.5 ? (
                  // Mostrar semanas si zoom entre 0.5 y 0.75 (Semanas)
                  allWeeks.map((week, i) => {
                    const weekStartPct = ((week.start - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                    const weekEndPct = ((week.end - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                    const weekWidth = weekEndPct - weekStartPct;

                    // Determinar si la semana cruza un mes
                    const startMonth = week.start.getMonth();
                    const endMonth = week.end.getMonth();
                    const crossesMonth = startMonth !== endMonth;

                    return (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${weekStartPct}%`,
                          width: `${weekWidth}%`,
                          height: '100%',
                          borderLeft: crossesMonth ? `2px solid ${PALETTE.faint}` : `1px solid ${PALETTE.faint}60`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: crossesMonth ? PALETTE.cream + '40' : 'transparent'
                        }}
                      >
                        <div style={{
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          color: PALETTE.ink,
                          fontWeight: 600
                        }}>
                          {week.label}
                        </div>
                        <div style={{
                          fontSize: 7,
                          color: PALETTE.muted,
                          marginTop: 2
                        }}>
                          {week.start.getDate()}/{week.start.getMonth() + 1}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Mostrar meses si zoom <= 0.5
                  months.map((mo, i) => {
                    const pct = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                    const monthName = mo.toLocaleDateString('es-ES', { month: 'long' });
                    const isFirstMonth = i === 0;

                    return (
                      <div key={i} style={{ position: 'absolute', left: `${pct}%` }}>
                        <div style={{
                          fontSize: 11,
                          fontFamily: 'var(--font-mono)',
                          color: PALETTE.ink,
                          letterSpacing: '.5px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          top: 0,
                          paddingLeft: isFirstMonth ? 0 : 8,
                          borderLeft: isFirstMonth ? 'none' : `2px solid ${PALETTE.faint}80`
                        }}>
                          {monthName.substring(0, 3)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Grid de fines de semana (franjas grises verticales) */}
          <div style={{ position: 'absolute', top: 80, bottom: 0, left: NAME_W, right: 0, pointerEvents: 'none', zIndex: 1 }}>
            {allDays.filter(day => day.isWeekend).map((day, idx) => {
              const dayPct = ((day.date - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
              const dayWidth = (1 / RANGE_DAYS) * 100; // Ancho de un día

              return (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${dayPct}%`,
                    width: `${dayWidth}%`,
                    top: 0,
                    bottom: 0,
                    background: PALETTE.muted + '08',
                    borderRight: `0.5px solid ${PALETTE.faint}15`
                  }}
                />
              );
            })}
          </div>

          {/* Categorías agrupadas (Workstreams, Proyectos o Sub-proyectos) */}
          {Object.entries(groupedCategories).map(([catKey, catData]) => {
            const allCatTasks = Object.values(catData.subcategories).flatMap(sub => sub.tasks);
            if (allCatTasks.length === 0) return null;

            // En modo compacto: colapsado por defecto (click para expandir). En detallado: expandido por defecto.
            const isExpanded = compactMode
              ? expandedCategories[catKey] === true
              : expandedCategories[catKey] !== false;
            const stats = getGroupStats(allCatTasks);
            const pos = getPos(stats.startDate, stats.endDate);

            // Detectar si solo hay una subcategoría con nombre duplicado
            const subcategoryEntries = Object.entries(catData.subcategories);
            const hasSingleSubcategory = subcategoryEntries.length === 1;
            const shouldFlattenHierarchy = hasSingleSubcategory && (
              subcategoryEntries[0][0] === catData.name ||
              subcategoryEntries[0][0].toLowerCase().includes(catData.name.toLowerCase()) ||
              catData.name.toLowerCase().includes(subcategoryEntries[0][0].toLowerCase())
            );

            // Si solo hay una subcategoría con el mismo nombre, aplanar la jerarquía
            if (shouldFlattenHierarchy) {
              const [, subData] = subcategoryEntries[0];

              return (
              <div key={catKey} style={{ marginBottom: 2, position: 'relative', zIndex: 2 }}>
                {/* Fila de categoría principal (sin subcategoría intermedia) */}
                <div
                  onClick={() => setExpandedCategories(prev => ({ ...prev, [catKey]: !isExpanded }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 0',
                    background: PALETTE.warm,
                    borderBottom: `1px solid ${PALETTE.faint}`,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.cream}
                  onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.warm}
                >
                  <div style={{
                    width: NAME_W,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    paddingLeft: 20
                  }}>
                    {isExpanded ? <ChevronDown size={12} color={PALETTE.muted} /> : <ChevronRight size={12} color={PALETTE.muted} />}
                    <span style={{ fontSize: 14 }}>{catData.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        fontWeight: 600,
                        color: PALETTE.ink
                      }}>
                        {catData.name}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: PALETTE.muted,
                      background: PALETTE.warm,
                      padding: '2px 6px',
                      borderRadius: 3,
                      marginLeft: 8
                    }}>
                      {stats.done}/{stats.total}
                    </span>
                    {stats.overdue > 0 && (
                      <span style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono)',
                        color: PALETTE.danger,
                        background: PALETTE.danger + '10',
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontWeight: 600
                      }}>
                        {stats.overdue}⚠
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, position: 'relative', height: 24 }}>
                    {/* Grid vertical de meses */}
                    {months.map((mo, i) => {
                      const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                      return (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${mp}%`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: PALETTE.faint + '80'
                          }}
                        />
                      );
                    })}

                    {/* Barra de progreso */}
                    {stats.startDate && stats.endDate && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${pos.left}%`,
                          width: `${pos.width}%`,
                          top: 10,
                          height: 16,
                          borderRadius: 8,
                          background: catData.color + '20',
                          border: `2px solid ${catData.color}`,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${stats.progress}%`,
                            background: catData.color,
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tareas individuales directamente (sin nivel de subcategoría duplicada) */}
                {isExpanded && subData.tasks.map(task => {
                  const taskPos = getPos(toDate(task.startDate), toDate(task.endDate));
                  const isDone = task.status === 'Hecho';
                  const isOverdue = task.status !== 'Hecho' && task.endDate && toDate(task.endDate) < TODAY;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleEditTask(task)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '3px 0',
                        background: PALETTE.bone,
                        borderBottom: `0.5px solid ${PALETTE.faint}20`,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
                      onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.bone}
                      title="Clic para editar"
                    >
                      <div style={{
                        width: NAME_W,
                        flexShrink: 0,
                        paddingLeft: 68,
                        fontSize: 10,
                        color: isDone ? PALETTE.menthe : isOverdue ? PALETTE.danger : PALETTE.soft,
                        textDecoration: isDone ? 'line-through' : 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {task.isMilestone && '◆ '}
                        {task.name}
                        <span style={{ fontSize: 8, color: PALETTE.muted, fontStyle: 'italic' }}>✎</span>
                      </div>

                      <div style={{ flex: 1, position: 'relative', height: 14 }}>
                        {/* Grid vertical */}
                        {months.map((mo, i) => {
                          const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                          return (
                            <div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: `${mp}%`,
                                top: 0,
                                bottom: 0,
                                width: '0.5px',
                                background: PALETTE.faint + '20'
                              }}
                            />
                          );
                        })}

                        {task.startDate && task.endDate && (
                          <div
                            style={{
                              position: 'absolute',
                              left: `${taskPos.left}%`,
                              width: `${taskPos.width}%`,
                              top: 4,
                              height: 6,
                              borderRadius: 3,
                              background: isDone ? PALETTE.menthe : isOverdue ? PALETTE.danger : catData.color + '40'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
              );
            }

            // Caso normal: mostrar jerarquía completa con subcategorías
            return (
              <div key={catKey} style={{ marginBottom: 2, position: 'relative', zIndex: 2 }}>
                {/* Fila de categoría principal */}
                <div
                  onClick={() => setExpandedCategories(prev => ({ ...prev, [catKey]: !isExpanded }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 0',
                    background: PALETTE.warm,
                    borderBottom: `1px solid ${PALETTE.faint}`,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.cream}
                  onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.warm}
                >
                  <div style={{
                    width: NAME_W,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    paddingLeft: 20
                  }}>
                    {isExpanded ? <ChevronDown size={12} color={PALETTE.muted} /> : <ChevronRight size={12} color={PALETTE.muted} />}
                    <span style={{ fontSize: 14 }}>{catData.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        fontWeight: 600,
                        color: PALETTE.ink
                      }}>
                        {catData.name}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9,
                      fontFamily: 'var(--font-mono)',
                      color: PALETTE.muted,
                      background: PALETTE.warm,
                      padding: '2px 6px',
                      borderRadius: 3,
                      marginLeft: 8
                    }}>
                      {stats.done}/{stats.total}
                    </span>
                    {stats.overdue > 0 && (
                      <span style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono)',
                        color: PALETTE.danger,
                        background: PALETTE.danger + '10',
                        padding: '2px 6px',
                        borderRadius: 3,
                        fontWeight: 600
                      }}>
                        {stats.overdue}⚠
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, position: 'relative', height: 24 }}>
                    {/* Grid vertical de meses */}
                    {months.map((mo, i) => {
                      const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                      return (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `${mp}%`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: PALETTE.faint + '80'
                          }}
                        />
                      );
                    })}

                    {/* Barra de progreso */}
                    {stats.startDate && stats.endDate && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${pos.left}%`,
                          width: `${pos.width}%`,
                          top: 10,
                          height: 16,
                          borderRadius: 8,
                          background: catData.color + '20',
                          border: `2px solid ${catData.color}`,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${stats.progress}%`,
                            background: catData.color,
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcategorías (solo cuando no es duplicado) */}
                {isExpanded && Object.entries(catData.subcategories).map(([subKey, subData]) => {
                  if (subData.tasks.length === 0) return null;

                  const subStats = getGroupStats(subData.tasks);
                  const subPos = getPos(subStats.startDate, subStats.endDate);
                  const isSubExpanded = expandedSubcategories[`${catKey}-${subKey}`];

                  return (
                    <div key={subKey}>
                      <div
                        onClick={() => setExpandedSubcategories(prev => ({
                          ...prev,
                          [`${catKey}-${subKey}`]: !isSubExpanded
                        }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '6px 0',
                          background: PALETTE.bone,
                          borderBottom: `0.5px solid ${PALETTE.faint}50`,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
                        onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.bone}
                      >
                        <div style={{
                          width: NAME_W,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          paddingLeft: 68
                        }}>
                          {isSubExpanded ? <ChevronDown size={10} color={PALETTE.muted} /> : <ChevronRight size={10} color={PALETTE.muted} />}
                          <span style={{ fontSize: 11, color: PALETTE.ink, fontWeight: 500 }}>
                            {subData.name}
                          </span>
                          <span style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            color: PALETTE.muted,
                            background: PALETTE.warm,
                            padding: '1px 5px',
                            borderRadius: 2
                          }}>
                            {subStats.done}/{subStats.total}
                          </span>
                        </div>

                        <div style={{ flex: 1, position: 'relative', height: 18 }}>
                          {/* Grid vertical */}
                          {months.map((mo, i) => {
                            const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                            return (
                              <div
                                key={i}
                                style={{
                                  position: 'absolute',
                                  left: `${mp}%`,
                                  top: 0,
                                  bottom: 0,
                                  width: '0.5px',
                                  background: PALETTE.faint + '40'
                                }}
                              />
                            );
                          })}

                          {subStats.startDate && subStats.endDate && (
                            <div
                              style={{
                                position: 'absolute',
                                left: `${subPos.left}%`,
                                width: `${subPos.width}%`,
                                top: 6,
                                height: 6,
                                borderRadius: 3,
                                background: catData.color + '50'
                              }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Tareas individuales */}
                      {isSubExpanded && subData.tasks.map(task => {
                        const taskPos = getPos(toDate(task.startDate), toDate(task.endDate));
                        const isDone = task.status === 'Hecho';
                        const isOverdue = task.status !== 'Hecho' && task.endDate && toDate(task.endDate) < TODAY;

                        return (
                          <div
                            key={task.id}
                            onClick={() => handleEditTask(task)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '3px 0',
                              background: PALETTE.bone,
                              borderBottom: `0.5px solid ${PALETTE.faint}20`,
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
                            onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.bone}
                            title="Clic para editar"
                          >
                            <div style={{
                              width: NAME_W,
                              flexShrink: 0,
                              paddingLeft: 108,
                              fontSize: 10,
                              color: isDone ? PALETTE.menthe : isOverdue ? PALETTE.danger : PALETTE.soft,
                              textDecoration: isDone ? 'line-through' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              {task.isMilestone && '◆ '}
                              {task.name}
                              <span style={{ fontSize: 8, color: PALETTE.muted, fontStyle: 'italic' }}>✎</span>
                            </div>

                            <div style={{ flex: 1, position: 'relative', height: 14 }}>
                              {/* Grid vertical */}
                              {months.map((mo, i) => {
                                const mp = ((mo - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      position: 'absolute',
                                      left: `${mp}%`,
                                      top: 0,
                                      bottom: 0,
                                      width: '0.5px',
                                      background: PALETTE.faint + '20'
                                    }}
                                  />
                                );
                              })}

                              {task.startDate && task.endDate && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: `${taskPos.left}%`,
                                    width: `${taskPos.width}%`,
                                    top: 4,
                                    height: 6,
                                    borderRadius: 3,
                                    background: isDone ? PALETTE.menthe : isOverdue ? PALETTE.danger : catData.color + '40'
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Lineas verticales de HITOS — respeta visibilidad */}
          {CRITICAL_MILESTONES.map((milestone, idx) => {
            if ((milestoneVisibility || {})[idx] === false) return null;
            const milestonePct = ((milestone.date - RANGE_START) / 864e5 / RANGE_DAYS) * 100;
            if (milestonePct < 0 || milestonePct > 100) return null;
            return (
              <div key={'ml'+idx} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `calc(${NAME_W}px + (100% - ${NAME_W}px) * ${milestonePct / 100})`,
                width: 1.5, background: milestone.color, zIndex: 15, pointerEvents: 'none', opacity: 0.5
              }} />
            );
          })}

          {/* Linea de HOY */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `calc(${NAME_W}px + (100% - ${NAME_W}px) * ${todayPct / 100})`,
            width: 2, background: PALETTE.nectarine, zIndex: 16, pointerEvents: 'none', opacity: 0.9
          }}>
            <div style={{
              position: 'absolute', top: 4, left: 4,
              fontSize: 9, fontWeight: 700, color: '#fff',
              fontFamily: 'var(--font-mono)',
              background: PALETTE.nectarine, padding: '2px 8px', borderRadius: 3,
              whiteSpace: 'nowrap', pointerEvents: 'auto', zIndex: 17
            }}>
              HOY · {formatDate(TODAY)}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Tarea */}
      {editingTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={() => setEditingTask(null)}
        >
          <div
            style={{
              background: PALETTE.bone,
              borderRadius: 12,
              padding: '24px',
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h3 style={{
                fontFamily: SERIF,
                fontSize: 20,
                fontWeight: 600,
                color: PALETTE.ink,
                margin: 0
              }}>
                {readOnly ? 'Detalle de tarea' : 'Editar Tarea'}
              </h3>
              <button onClick={() => setEditingTask(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: PALETTE.muted }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {readOnly ? (
                /* Viewer: solo texto plano */
                <>
                  <div style={{ fontSize: 16, fontFamily: SERIF, color: PALETTE.ink }}>{editForm.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><div style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 600, marginBottom: 4 }}>Estado</div><span style={{ fontSize: 13, color: PALETTE.ink }}>{editForm.status}</span></div>
                    <div><div style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 600, marginBottom: 4 }}>Prioridad</div><span style={{ fontSize: 13, color: PALETTE.ink }}>{editForm.priority}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><div style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 600, marginBottom: 4 }}>Inicio</div><span style={{ fontSize: 13, color: PALETTE.ink }}>{editForm.startDate || '-'}</span></div>
                    <div><div style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 600, marginBottom: 4 }}>Fin</div><span style={{ fontSize: 13, color: PALETTE.ink }}>{editForm.endDate || '-'}</span></div>
                  </div>
                  <div><div style={{ fontSize: 11, color: PALETTE.soft, fontWeight: 600, marginBottom: 4 }}>Responsable</div><span style={{ fontSize: 13, color: PALETTE.ink }}>{editForm.owner || 'Sin asignar'}</span></div>
                  <button onClick={() => setEditingTask(null)} style={{ padding: '10px', background: PALETTE.warm, color: PALETTE.soft, border: '1px solid ' + PALETTE.faint, borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Cerrar</button>
                </>
              ) : (
                /* Editor: formulario completo */
                <>
                  <div>
                    <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Inicio</label>
                      <input type="date" value={editForm.startDate ? new Date(editForm.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fin</label>
                      <input type="date" value={editForm.endDate ? new Date(editForm.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
                      <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, boxSizing: 'border-box' }}>
                        <option value="Pendiente">Pendiente</option><option value="En curso">En curso</option><option value="Hecho">Hecho</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Prioridad</label>
                      <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, boxSizing: 'border-box' }}>
                        <option value="P3">Baja</option><option value="P2">Media</option><option value="P1">Alta</option><option value="P0">Critica</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: PALETTE.soft, fontWeight: 600, display: 'block', marginBottom: 6 }}>Responsable</label>
                    <input type="text" value={editForm.owner} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: `1px solid ${PALETTE.faint}`, borderRadius: 6, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={handleSaveTask} style={{ flex: 1, padding: '12px', background: PALETTE.menthe, color: PALETTE.ink, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Guardar cambios</button>
                    <button onClick={() => handleDeleteTask(editingTask.id)} style={{ padding: '12px 20px', background: PALETTE.danger, color: PALETTE.bone, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SummaryTimelineView(props) {
  return (
    <TimelineErrorBoundary>
      <SummaryTimelineInner {...props} />
    </TimelineErrorBoundary>
  );
}
