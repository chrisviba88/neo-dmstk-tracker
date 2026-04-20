import { useState, useMemo } from 'react';
import { ArrowUpDown, Eye, EyeOff, Trash2, Maximize2, Minimize2 } from 'lucide-react';

// Sistema de opciones editables para dropdowns
// Cada columna tiene opciones que se pueden agregar, renombrar, eliminar
// Se guardan en localStorage y se propagan a todas las tareas
function getOptions(storageKey, defaults) {
  try { const s = localStorage.getItem(storageKey); if (s) return JSON.parse(s); } catch(e) {}
  return defaults;
}
function saveOptions(storageKey, options) {
  try { localStorage.setItem(storageKey, JSON.stringify(options)); } catch(e) {}
}

// Dropdown LIMPIO: solo selecciona valores. Lee opciones de localStorage.
function EditableDropdown({ value, options, storageKey, field, labelField, task, tasks, onUpdate, palette, style }) {
  const opts = getOptions(storageKey, options);
  const disabled = !onUpdate;

  function handleChange(e) {
    if (!onUpdate) return;
    const val = e.target.value;
    const selected = opts.find(o => o.value === val);
    const changes = { [field]: val };
    if (labelField && selected) changes[labelField] = selected.label;
    onUpdate(task.id, changes);
  }

  return (
    <select value={value || ''} onChange={handleChange} onClick={(e) => e.stopPropagation()} disabled={disabled} style={{ ...style, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'default' : 'pointer' }}>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Panel de gestion de opciones de una columna
function OptionsManager({ storageKey, defaults, field, labelField, tasks, onUpdate, palette, onClose }) {
  const [opts, setOpts] = useState(getOptions(storageKey, defaults));
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState('');

  function save(newOpts) {
    setOpts(newOpts);
    saveOptions(storageKey, newOpts);
  }

  function rename(idx) {
    if (!editValue.trim()) return;
    const oldLabel = opts[idx].label;
    const newLabel = editValue.trim();
    const updated = opts.map((o, i) => i === idx ? { ...o, label: newLabel } : o);
    save(updated);
    // Propagar el cambio a todas las tareas
    if (labelField) {
      tasks.filter(t => t[field] === opts[idx].value).forEach(t => onUpdate(t.id, { [labelField]: newLabel }));
    }
    setEditingIdx(null);
    setEditValue('');
  }

  function addNew() {
    const code = prompt('Codigo (sin espacios, ej: NEW1):');
    if (!code) return;
    const label = prompt('Nombre visible:');
    if (!label) return;
    save([...opts, { value: code.trim(), label: label.trim() }]);
  }

  function remove(idx) {
    const opt = opts[idx];
    const inUse = tasks.filter(t => t[field] === opt.value).length;
    if (inUse > 0) {
      alert('"' + opt.label + '" esta en uso por ' + inUse + ' tarea' + (inUse > 1 ? 's' : '') + '. Reasignalas primero.');
      return;
    }
    save(opts.filter((_, i) => i !== idx));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(44,41,38,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFDF9', borderRadius: 12, width: 360, maxHeight: '70vh', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.2)', border: '1px solid #D8D2CA' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #D8D2CA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F3EDE6' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Gestionar opciones</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#9A948C' }}>x</button>
        </div>
        <div style={{ padding: '12px 18px', overflowY: 'auto', maxHeight: '50vh' }}>
          {opts.map((opt, idx) => {
            const count = tasks.filter(t => t[field] === opt.value).length;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #D8D2CA20' }}>
                {editingIdx === idx ? (
                  <>
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') rename(idx); if (e.key === 'Escape') setEditingIdx(null); }} autoFocus
                      style={{ flex: 1, fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #6398A9', outline: 'none' }} />
                    <button onClick={() => rename(idx)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: 'none', background: '#6398A9', color: '#fff', cursor: 'pointer' }}>OK</button>
                    <button onClick={() => setEditingIdx(null)} style={{ fontSize: 10, padding: '3px 6px', borderRadius: 4, border: '1px solid #D8D2CA', background: 'transparent', cursor: 'pointer', color: '#9A948C' }}>x</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: 12, color: '#2C2926' }}>{opt.label}</span>
                    <span style={{ fontSize: 9, color: '#9A948C', fontFamily: 'var(--font-mono)' }}>{count}</span>
                    <button onClick={() => { setEditingIdx(idx); setEditValue(opt.label); }} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid #D8D2CA', background: 'transparent', cursor: 'pointer', color: '#5C5650' }}>editar</button>
                    <button onClick={() => remove(idx)} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid #C0564A30', background: 'transparent', cursor: 'pointer', color: count > 0 ? '#D8D2CA' : '#C0564A' }} disabled={count > 0} title={count > 0 ? 'En uso' : 'Eliminar'}>x</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid #D8D2CA', background: '#F3EDE6' }}>
          <button onClick={addNew} style={{ width: '100%', fontSize: 11, padding: '6px', borderRadius: 6, border: '1px dashed #D8D2CA', background: 'transparent', cursor: 'pointer', color: '#6398A9', fontWeight: 600 }}>+ Agregar opcion</button>
        </div>
      </div>
    </div>
  );
}

/**
 * ExcelTasksView - Vista de tareas estilo Excel con edicion inline
 *
 * Caracteristicas:
 * - Todas las columnas visibles y editables
 * - Dropdowns inline con agregar/renombrar/eliminar
 * - Toggle para mostrar/ocultar columnas
 * - Diseno limpio y profesional
 * - Edicion rapida tipo Airtable/Notion
 */
export default function ExcelTasksView({
  tasks = [],
  projects = [],
  owners = [],
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
  sortKey = 'name',
  sortDir = 1,
  onSort,
  readOnly = false
}) {
  // Si readOnly, bloquear todas las funciones de edicion
  const safeUpdate = readOnly ? null : onUpdateTask;
  const safeDelete = readOnly ? null : onDeleteTask;
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

  const STATUSES = ["Pendiente", "En curso", "Hecho"];
  const STATUS_COLORS = {
    Pendiente: PALETTE.lagune,
    "En curso": PALETTE.mostaza,
    Hecho: PALETTE.menthe,
  };

  const PRIORITIES = ["P0", "P1", "P2", "P3"];
  const PRIORITY_COLORS = {
    P0: PALETTE.danger,
    P1: PALETTE.mostaza,
    P2: PALETTE.muted,
    P3: "#D8D2CA"
  };

  const WORKSTREAMS = [
    "Direccion", "Legal", "Metodo", "Profesor-Contenido", "Producto",
    "Branding", "Espacio-E1", "Equipo", "Piloto", "Tecnologia",
  ];

  // Estado de columnas visibles/ocultas
  const defaultColumns = { id: true, name: true, level: true, familyLabel: true, status: true, priority: true, stage: true, owner: true, startDate: true, endDate: true, risk: true, scope: true, milestone: true, notes: false, actions: true };
  const [visibleColumns, setVisibleColumns] = useState(function() {
    try { const saved = localStorage.getItem('neo-dmstk-columns'); return saved ? { ...defaultColumns, ...JSON.parse(saved) } : defaultColumns; } catch(e) { return defaultColumns; }
  });

  // Persistir columnas visibles
  function updateVisibleColumns(newVal) {
    const updated = typeof newVal === 'function' ? newVal(visibleColumns) : newVal;
    setVisibleColumns(updated);
    try { localStorage.setItem('neo-dmstk-columns', JSON.stringify(updated)); } catch(e) {}
  }

  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [managingColumn, setManagingColumn] = useState(null); // which column's options are being managed

  // Config for which columns have manageable options
  const COLUMN_OPTIONS_CONFIG = {
    familyLabel: { storageKey: 'neo-dmstk-opt-family', field: 'family', labelField: 'familyLabel', defaults: [{value:'DIR',label:'Direccion & Decision'},{value:'LEG',label:'Legal & Licencias'},{value:'MET',label:'Metodo PERMA'},{value:'CON',label:'Contenido Video'},{value:'DAR',label:'Daruma Ritual'},{value:'KIT',label:'Kits Experiencia'},{value:'RET',label:'Retail & Merch'},{value:'BRA',label:'Marca & Branding'},{value:'RED',label:'Redes & Marketing'},{value:'EQU',label:'Equipo & Formacion'},{value:'TEC',label:'Tecnologia & Web'},{value:'PIL',label:'Piloto & Validacion'},{value:'ESP1',label:'Espacio E1 Madrid'},{value:'OPS1',label:'Operaciones E1'},{value:'ESP2',label:'E2 Barcelona'}] },
    status: { storageKey: 'neo-dmstk-opt-status', field: 'status', defaults: [{value:'Pendiente',label:'Pendiente'},{value:'En curso',label:'En curso'},{value:'Hecho',label:'Hecho'}] },
    priority: { storageKey: 'neo-dmstk-opt-priority', field: 'priority', defaults: [{value:'P0',label:'Critica'},{value:'P1',label:'Alta'},{value:'P2',label:'Media'},{value:'P3',label:'Baja'}] },
    stage: { storageKey: 'neo-dmstk-opt-stage', field: 'stage', defaults: [{value:'pre',label:'Pre-produccion'},{value:'prod',label:'Produccion'},{value:'pilot',label:'Piloto'},{value:'launch',label:'Lanzamiento'},{value:'post',label:'Post / Ops'}] },
    risk: { storageKey: 'neo-dmstk-opt-risk', field: 'risk', defaults: [{value:'CRITICO',label:'Critico'},{value:'ALTO',label:'Alto'},{value:'MEDIO',label:'Medio'},{value:'BAJO',label:'Bajo'}] },
    milestone: { storageKey: 'neo-dmstk-opt-milestone', field: 'milestone', defaults: [{value:'',label:'Sin hito'},{value:'piloto',label:'Piloto arranca'},{value:'goNoGo',label:'GO/NO-GO Board'},{value:'reformaE1',label:'Reforma E1'},{value:'softOpeningE1',label:'Soft Opening E1'},{value:'grandOpeningE1',label:'Grand Opening E1'},{value:'softOpeningE2',label:'Apertura E2 BCN'}] },
    scope: { storageKey: 'neo-dmstk-opt-scope', field: 'scope', defaults: [{value:'global',label:'Global'},{value:'space',label:'Espacio'}] },
  };
  const [columnWidths, setColumnWidths] = useState(function() {
    try { const s = localStorage.getItem('neo-dmstk-col-widths'); return s ? JSON.parse(s) : {}; } catch(e) { return {}; }
  });
  const [resizing, setResizing] = useState(null);

  // Handle column resize — robust approach
  const handleResizeStart = (colKey, startX, startWidth) => {
    setResizing(colKey);
    let lastWidth = startWidth;

    const handleMouseMove = (moveE) => {
      moveE.preventDefault();
      const diff = moveE.clientX - startX;
      lastWidth = Math.max(40, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [colKey]: lastWidth }));
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setResizing(null);
      // Persist with final width
      setColumnWidths(prev => {
        const final = { ...prev, [colKey]: lastWidth };
        try { localStorage.setItem('neo-dmstk-col-widths', JSON.stringify(final)); } catch(e) {}
        return final;
      });
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Lista de proyectos disponibles
  const availableProjects = useMemo(() => {
    const projectsFromState = projects.map(p => p.name);
    const projectsFromTasks = [...new Set(tasks.map(t => t.project).filter(Boolean))];
    const allProjects = [...new Set([...projectsFromState, ...projectsFromTasks])];
    return ['Sin proyecto asignado', ...allProjects.sort()];
  }, [projects, tasks]);

  // Lista de subproyectos disponibles (todos los subproyectos únicos de las tareas)
  const getAllSubprojects = useMemo(() => {
    const subprojects = tasks
      .map(t => t.subproject)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i) // únicos
      .sort();

    return subprojects;
  }, [tasks]);

  // Lista de milestones disponibles (extraídos de las tareas que son hitos)
  const availableMilestones = useMemo(() => {
    const milestones = tasks
      .filter(t => t.isMilestone)
      .map(t => ({ id: t.id, name: t.name }));
    return milestones;
  }, [tasks]);

  // Filtrar subproyectos por proyecto padre
  const getSubprojectsForProject = (parentProject) => {
    if (!parentProject || parentProject === 'Sin proyecto asignado') return [];

    // Obtener subproyectos únicos de tareas del mismo proyecto padre
    const subprojects = tasks
      .filter(t => t.project === parentProject && t.subproject)
      .map(t => t.subproject)
      .filter((v, i, a) => a.indexOf(v) === i) // únicos
      .sort();

    return subprojects;
  };

  // Definicion de columnas — modelo v2 completo
  const columns = [
    { key: 'id', label: 'ID', width: '75px', sortable: true },
    { key: 'name', label: 'Tarea', width: '280px', sortable: true },
    { key: 'level', label: 'Nivel', width: '100px', sortable: true },
    { key: 'familyLabel', label: 'Area', width: '180px', sortable: true },
    { key: 'status', label: 'Estado', width: '130px', sortable: true },
    { key: 'priority', label: 'Prioridad', width: '80px', sortable: true },
    { key: 'stage', label: 'Etapa', width: '120px', sortable: true },
    { key: 'owner', label: 'Responsable', width: '150px', sortable: true },
    { key: 'startDate', label: 'Inicio', width: '120px', sortable: true },
    { key: 'endDate', label: 'Fin', width: '120px', sortable: true },
    { key: 'risk', label: 'Riesgo', width: '90px', sortable: true },
    { key: 'scope', label: 'Alcance', width: '100px', sortable: true },
    { key: 'milestone', label: 'Hito ancla', width: '140px', sortable: true },
    { key: 'notes', label: 'Notas', width: '220px', sortable: false },
    { key: 'actions', label: '', width: '50px', sortable: false },
  ];

  // Filtrar y ordenar tareas con jerarquia: Area → Iniciativa → Tareas derivadas
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    if (projectFilter !== 'all') {
      filtered = tasks.filter(task => {
        const projectName = task.project?.toLowerCase() || '';
        switch (projectFilter) {
          case 'global': return task.scope === 'global' || projectName.includes('global');
          case 'e1': return (task.spaces || []).includes('E1') || projectName.includes('e1');
          case 'e2': return (task.spaces || []).includes('E2') || projectName.includes('e2');
          default: return true;
        }
      });
    }

    // Agrupar por area con jerarquia: Iniciativa primero, derivadas despues
    const familyOrder = ['DIR','LEG','MET','CON','DAR','KIT','RET','BRA','RED','EQU','TEC','PIL','ESP1','OPS1','ESP2'];
    const grouped = [];

    familyOrder.forEach(famCode => {
      const famTasks = filtered.filter(t => t.family === famCode);
      if (famTasks.length === 0) return;

      // Iniciativa primero
      const epic = famTasks.find(t => t.level === 'epic');
      const derived = famTasks.filter(t => t.level !== 'epic').sort((a, b) => {
        const aVal = a[sortKey] || '';
        const bVal = b[sortKey] || '';
        return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
      });

      if (epic) grouped.push(epic);
      grouped.push(...derived);
    });

    // Tareas sin familia al final
    const noFamily = filtered.filter(t => !t.family);
    grouped.push(...noFamily);

    return grouped;
  }, [tasks, sortKey, sortDir, projectFilter]);

  // Toggle sort
  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  // Toggle column visibility
  const toggleColumn = (key) => {
    updateVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Renderizar celda editable
  const EditableCell = ({ task, column }) => {
    const cellStyle = {
      padding: '8px 10px',
      borderBottom: `1px solid ${PALETTE.faint}`,
      fontSize: '13px',
      color: PALETTE.ink,
      verticalAlign: 'middle',
      background: PALETTE.bone,
    };

    switch (column.key) {
      case 'name': {
        const isEpic = task.level === 'epic';
        const isDerived = task.level === 'task' && task.parent;
        const parentTask = isDerived ? tasks.find(t => t.id === task.parent) : null;
        return (
          <td
            style={{
              ...cellStyle,
              cursor: 'pointer',
              fontWeight: isEpic ? '600' : '400',
              paddingLeft: isDerived ? '28px' : '10px',
              background: isEpic ? (PALETTE.warm) : PALETTE.bone,
            }}
            onClick={() => onTaskClick?.(task)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isEpic && <span style={{ color: PALETTE.mostaza, fontSize: 12 }}>★</span>}
              {isDerived && <span style={{ color: PALETTE.muted, fontSize: 10 }}>↳</span>}
              {task.isMilestone && !isEpic && <span style={{ color: PALETTE.mostaza, fontSize: 10 }}>◆</span>}
              <span style={{ fontFamily: isEpic ? SERIF : 'inherit' }}>{task.name}</span>
            </div>
            {isDerived && parentTask && (
              <div style={{ fontSize: 9, color: PALETTE.muted, paddingLeft: 20, marginTop: 1 }}>Iniciativa: {parentTask.name}</div>
            )}
          </td>
        );
      }

      case 'status': {
        const stLabel = {Pendiente:'Pendiente','En curso':'En curso',Hecho:'Hecho'}[task.status] || task.status;
        const stColor = STATUS_COLORS[task.status] || PALETTE.muted;
        if (readOnly) return <td style={cellStyle}><span style={{ padding:'4px 8px', fontSize:12, borderRadius:6, background:stColor+'18', color:stColor, fontWeight:600 }}>{stLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.status} field="status" storageKey="neo-dmstk-opt-status" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[{value:'Pendiente',label:'Pendiente'},{value:'En curso',label:'En curso'},{value:'Hecho',label:'Hecho'}]}
              style={{ width:'100%', padding:'6px 8px', fontSize:12, border:'none', borderRadius:6, background:stColor+'18', color:stColor, fontWeight:600, cursor:'pointer', outline:'none' }}
            />
          </td>
        );
      }

      case 'priority': {
        const prLabel = {P0:'Critica',P1:'Alta',P2:'Media',P3:'Baja'}[task.priority] || task.priority;
        const prColor = PRIORITY_COLORS[task.priority] || PALETTE.muted;
        if (readOnly) return <td style={cellStyle}><span style={{ padding:'3px 6px', fontSize:11, borderRadius:4, background:prColor+'18', color:prColor, fontWeight:600 }}>{prLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.priority} field="priority" storageKey="neo-dmstk-opt-priority" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[{value:'P0',label:'Critica'},{value:'P1',label:'Alta'},{value:'P2',label:'Media'},{value:'P3',label:'Baja'}]}
              style={{ width:'100%', padding:'6px 8px', fontSize:12, border:'none', borderRadius:6, background:prColor+'18', color:prColor, fontWeight:600, cursor:'pointer', outline:'none' }}
            />
          </td>
        );
      }

      case 'owner':
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:12, color: task.owner && task.owner !== 'Por asignar' ? PALETTE.ink : PALETTE.muted, fontWeight: task.owner && task.owner !== 'Por asignar' ? 500 : 400 }}>{task.owner || 'Sin asignar'}</span></td>;
        return (
          <td style={cellStyle}>
            <select
              value={task.owner || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '__new__') {
                  const newOwner = prompt('Nuevo owner:');
                  if (newOwner && newOwner.trim()) {
                    safeUpdate?.(task.id, { owner: newOwner.trim() });
                  }
                } else {
                  safeUpdate?.(task.id, { owner: value || 'Por asignar' });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', padding: '6px 8px', fontSize: '12px',
                border: `1px solid ${PALETTE.faint}`, borderRadius: '6px',
                background: task.owner && task.owner !== 'Por asignar' ? PALETTE.lagune + '10' : PALETTE.bone,
                color: PALETTE.ink, cursor: 'pointer', outline: 'none',
                fontWeight: task.owner && task.owner !== 'Por asignar' ? '500' : 'normal',
              }}
            >
              <option value="">- Por asignar -</option>
              {owners.map(o => (<option key={o} value={o}>{o}</option>))}
              <option value="__new__">+ Crear nuevo...</option>
            </select>
          </td>
        );

      case 'startDate':
      case 'endDate': {
        const today = new Date();
        const endDateVal = new Date(task.endDate);
        const isOverdue = column.key === 'endDate' && task.status !== 'Hecho' && endDateVal < today;
        const dateStr = task[column.key] ? new Date(task[column.key] + 'T00:00:00').toLocaleDateString('es-ES', { day:'numeric', month:'short' }) : '-';

        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:12, color: isOverdue ? PALETTE.danger : PALETTE.ink, fontWeight: isOverdue ? 600 : 400 }}>{dateStr}</span></td>;
        return (
          <td style={cellStyle}>
            <input type="date" value={task[column.key] || ''}
              onChange={(e) => safeUpdate?.(task.id, { [column.key]: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', padding: '6px 8px', fontSize: '12px',
                border: `1px solid ${isOverdue ? PALETTE.danger : PALETTE.faint}`,
                borderRadius: '6px', background: isOverdue ? PALETTE.danger + '10' : PALETTE.bone,
                color: isOverdue ? PALETTE.danger : PALETTE.ink, cursor: 'pointer', outline: 'none',
              }}
            />
          </td>
        );
      }

      case 'actions':
        if (readOnly) return <td style={{ ...cellStyle, textAlign: 'center' }} />;
        return (
          <td style={{ ...cellStyle, textAlign: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (safeDelete) {
                  safeDelete(task.id);
                }
              }}
              style={{
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: PALETTE.faint,
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = PALETTE.danger}
              onMouseLeave={(e) => e.currentTarget.style.color = PALETTE.faint}
              title="Eliminar tarea"
            >
              <Trash2 size={14} />
            </button>
          </td>
        );

      case 'id':
        return (
          <td style={{ ...cellStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: PALETTE.muted }}>
            {task.id}
          </td>
        );

      case 'level': {
        const lvColor = task.level === 'epic' ? PALETTE.mostaza : PALETTE.lagune;
        const lvLabel = task.level === 'epic' ? 'Iniciativa' : 'Tarea';
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:11, padding:'2px 6px', borderRadius:4, background:lvColor+'18', color:lvColor, fontWeight:600 }}>{lvLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <select value={task.level || 'task'} onChange={(e) => safeUpdate?.(task.id, { level: e.target.value })} onClick={(e) => e.stopPropagation()} style={{ fontSize: 11, padding: '3px 6px', borderRadius: 4, border: 'none', background: lvColor + '18', color: lvColor, fontWeight: 600, cursor: 'pointer' }}>
              <option value="epic">Iniciativa</option>
              <option value="task">Tarea</option>
            </select>
          </td>
        );
      }

      case 'familyLabel':
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:11, color:PALETTE.ink }}>{task.familyLabel || task.family || '-'}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.family} field="family" labelField="familyLabel" storageKey="neo-dmstk-opt-family" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[
                {value:'DIR',label:'Direccion & Decision'},{value:'LEG',label:'Legal & Licencias'},
                {value:'MET',label:'Metodo PERMA'},{value:'CON',label:'Contenido Video'},
                {value:'DAR',label:'Daruma Ritual'},{value:'KIT',label:'Kits Experiencia'},
                {value:'RET',label:'Retail & Merch'},{value:'BRA',label:'Marca & Branding'},
                {value:'RED',label:'Redes & Marketing'},{value:'EQU',label:'Equipo & Formacion'},
                {value:'TEC',label:'Tecnologia & Web'},{value:'PIL',label:'Piloto & Validacion'},
                {value:'ESP1',label:'Espacio E1 Madrid'},{value:'OPS1',label:'Operaciones E1'},
                {value:'ESP2',label:'E2 Barcelona'},
              ]}
              style={{ width:'100%', fontSize:11, padding:'4px 6px', borderRadius:4, border:`1px solid ${PALETTE.faint}`, background:PALETTE.bone, color:PALETTE.ink, cursor:'pointer' }}
            />
          </td>
        );

      case 'stage': {
        const stgOpts = getOptions('neo-dmstk-opt-stage', [{value:'pre',label:'Pre-produccion'},{value:'prod',label:'Produccion'},{value:'pilot',label:'Piloto'},{value:'launch',label:'Lanzamiento'},{value:'post',label:'Post / Ops'}]);
        const stgColors = {pre:'#64748b',prod:'#f59e0b',pilot:'#8b5cf6',launch:'#10b981',post:'#3b82f6'};
        const sc = stgColors[task.stage] || PALETTE.muted;
        const stgLabel = stgOpts.find(o => o.value === task.stage)?.label || task.stage || '-';
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:sc+'18', color:sc, fontWeight:600 }}>{stgLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.stage} field="stage" storageKey="neo-dmstk-opt-stage" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={stgOpts}
              style={{ width:'100%', fontSize:10, padding:'3px 6px', borderRadius:4, border:'none', background:sc+'18', color:sc, fontWeight:600, cursor:'pointer' }}
            />
          </td>
        );
      }

      case 'risk': {
        const riskColors = {CRITICO:PALETTE.danger, ALTO:'#f59e0b', MEDIO:PALETTE.lagune, BAJO:PALETTE.menthe};
        const rc = riskColors[task.risk] || PALETTE.muted;
        const riskLabel = {CRITICO:'Critico',ALTO:'Alto',MEDIO:'Medio',BAJO:'Bajo'}[task.risk] || task.risk || '-';
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:10, padding:'2px 6px', borderRadius:4, background:rc+'18', color:rc, fontWeight:600 }}>{riskLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.risk} field="risk" storageKey="neo-dmstk-opt-risk" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[{value:'CRITICO',label:'Critico'},{value:'ALTO',label:'Alto'},{value:'MEDIO',label:'Medio'},{value:'BAJO',label:'Bajo'}]}
              style={{ fontSize:10, padding:'3px 6px', borderRadius:4, border:'none', background:rc+'18', color:rc, fontWeight:600, cursor:'pointer' }}
            />
          </td>
        );
      }

      case 'scope': {
        const scColor = task.scope==='global' ? '#a78bfa' : '#fb923c';
        const scLabel = task.scope==='global' ? 'Global' : 'Espacio';
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:11, padding:'2px 6px', borderRadius:4, background:scColor+'18', color:scColor, fontWeight:500 }}>{scLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.scope} field="scope" storageKey="neo-dmstk-opt-scope" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[{value:'global',label:'Global'},{value:'space',label:'Espacio'}]}
              style={{ fontSize:11, padding:'3px 6px', borderRadius:4, border:'none', background:scColor+'18', color:scColor, fontWeight:500, cursor:'pointer' }}
            />
          </td>
        );
      }

      case 'milestone': {
        const msOpts = [{value:'',label:'-'},{value:'piloto',label:'Piloto'},{value:'goNoGo',label:'GO/NO-GO'},{value:'reformaE1',label:'Reforma E1'},{value:'softOpeningE1',label:'Soft Opening E1'},{value:'grandOpeningE1',label:'Grand Opening E1'},{value:'softOpeningE2',label:'E2 BCN'}];
        const msLabel = msOpts.find(o => o.value === (task.milestone || ''))?.label || task.milestone || '-';
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:10, color:PALETTE.soft }}>{msLabel}</span></td>;
        return (
          <td style={cellStyle}>
            <EditableDropdown value={task.milestone || ''} field="milestone" storageKey="neo-dmstk-opt-milestone" task={task} tasks={tasks} onUpdate={(id, changes) => safeUpdate?.(id, changes)} palette={PALETTE}
              options={[{value:'',label:'Sin hito'},{value:'piloto',label:'Piloto arranca'},{value:'goNoGo',label:'GO/NO-GO Board'},{value:'reformaE1',label:'Reforma E1'},{value:'softOpeningE1',label:'Soft Opening E1'},{value:'grandOpeningE1',label:'Grand Opening E1'},{value:'softOpeningE2',label:'Apertura E2 BCN'}]}
              style={{ width:'100%', fontSize:10, padding:'3px 6px', borderRadius:4, border:`1px solid ${PALETTE.faint}`, background:PALETTE.bone, color:PALETTE.soft, cursor:'pointer' }}
            />
          </td>
        );
      }

      case 'notes':
        if (readOnly) return <td style={cellStyle}><span style={{ fontSize:11, color:PALETTE.muted }}>{task.notes || '-'}</span></td>;
        return (
          <td style={cellStyle} onClick={(e) => e.stopPropagation()}>
            <input type="text" value={task.notes || ''} onChange={(e) => safeUpdate?.(task.id, { notes: e.target.value })} placeholder="..." style={{ width: '100%', fontSize: 11, padding: '4px 6px', borderRadius: 4, border: `1px solid ${PALETTE.faint}`, background: PALETTE.bone, color: PALETTE.muted, outline: 'none' }} />
          </td>
        );

      default:
        return (
          <td style={cellStyle}>
            {task[column.key] != null ? String(task[column.key]) : '-'}
          </td>
        );
    }
  };

  return (
    <div style={{
      background: PALETTE.bone,
      borderRadius: isFullscreen ? 0 : '12px',
      overflow: 'hidden',
      border: isFullscreen ? 'none' : `1px solid ${PALETTE.faint}`,
      ...(isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column' } : {})
    }}>
      {/* Options Manager modal */}
      {managingColumn && COLUMN_OPTIONS_CONFIG[managingColumn] && (
        <OptionsManager
          storageKey={COLUMN_OPTIONS_CONFIG[managingColumn].storageKey}
          defaults={COLUMN_OPTIONS_CONFIG[managingColumn].defaults}
          field={COLUMN_OPTIONS_CONFIG[managingColumn].field}
          labelField={COLUMN_OPTIONS_CONFIG[managingColumn].labelField}
          tasks={tasks}
          onUpdate={(id, changes) => safeUpdate?.(id, changes)}
          palette={PALETTE}
          onClose={() => setManagingColumn(null)}
        />
      )}

      {/* Header con controles */}
      <div style={{
        padding: '16px 20px',
        background: PALETTE.warm,
        borderBottom: `1px solid ${PALETTE.faint}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: PALETTE.ink,
            fontFamily: SERIF,
            marginBottom: '4px'
          }}>
            Vista de Tareas
          </div>
          <div style={{ fontSize: '12px', color: PALETTE.muted }}>
            {filteredAndSortedTasks.length} de {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Filtro rápido de proyectos */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              border: `1px solid ${PALETTE.faint}`,
              borderRadius: '8px',
              background: PALETTE.bone,
              color: PALETTE.ink,
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="all">📋 Todos los proyectos</option>
            <option value="global">🌍 Solo Global</option>
            <option value="e1">🏢 Solo E1 Madrid</option>
            <option value="e2">🏙️ Solo E2 Barcelona</option>
            <option value="e3">🚀 Solo E3 México</option>
          </select>

          {/* Toggle de columnas */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: PALETTE.bone,
                border: `1px solid ${PALETTE.faint}`,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                color: PALETTE.soft,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {showColumnToggle ? <EyeOff size={14} /> : <Eye size={14} />}
              Columnas
            </button>

          {/* Fullscreen */}
          <button onClick={() => setIsFullscreen(!isFullscreen)} style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${PALETTE.faint}`, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', color: PALETTE.soft, fontSize: 11 }} title={isFullscreen ? 'Salir' : 'Pantalla completa'}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Dropdown de columnas */}
          {showColumnToggle && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: PALETTE.bone,
              border: `1px solid ${PALETTE.faint}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '8px',
              minWidth: '200px',
              zIndex: 100
            }}>
              {columns.map(col => (
                <label
                  key={col.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: PALETTE.ink,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={() => toggleColumn(col.key)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: isFullscreen ? 'calc(100vh - 80px)' : 'calc(100vh - 300px)',
        flex: isFullscreen ? 1 : 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          fontSize: '13px',
        }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              {columns
                .filter(col => visibleColumns[col.key])
                .map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && !resizing && handleSort(col.key)}
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      color: PALETTE.muted,
                      padding: '12px 10px',
                      textAlign: 'left',
                      cursor: col.sortable ? 'pointer' : 'default',
                      whiteSpace: 'nowrap',
                      width: columnWidths[col.key] || col.width,
                      minWidth: 50,
                      fontFamily: 'var(--font-mono)',
                      borderBottom: `2px solid ${PALETTE.faint}`,
                      background: PALETTE.warm,
                      position: 'sticky',
                      top: 0,
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <ArrowUpDown size={10} color={PALETTE.lagune} />
                      )}
                      {/* Resize handle */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const th = e.target.closest('th');
                          handleResizeStart(col.key, e.clientX, th ? th.getBoundingClientRect().width : 150);
                        }}
                        style={{
                          position: 'absolute',
                          right: -6,
                          top: 0,
                          bottom: 0,
                          width: 12,
                          cursor: 'col-resize',
                          zIndex: 20,
                          background: resizing === col.key ? PALETTE.lagune + '30' : 'transparent',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = PALETTE.lagune + '20'; }}
                        onMouseLeave={(e) => { if (resizing !== col.key) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ position: 'absolute', right: 5, top: '25%', height: '50%', width: 2, background: PALETTE.faint, borderRadius: 1 }} />
                      </div>
                    </div>
                  </th>
                ))}
            </tr>
            {/* Fila de gestion de opciones */}
            <tr>
              {columns
                .filter(col => visibleColumns[col.key])
                .map(col => (
                  <th key={'mgr-'+col.key} style={{ padding: '2px 4px', background: PALETTE.cream, borderBottom: `1px solid ${PALETTE.faint}30`, height: 20 }}>
                    {COLUMN_OPTIONS_CONFIG[col.key] ? (
                      <button onClick={() => setManagingColumn(col.key)} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, border: `1px solid ${PALETTE.faint}50`, background: 'transparent', cursor: 'pointer', color: PALETTE.muted, fontWeight: 500 }}>
                        opciones
                      </button>
                    ) : null}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map(task => (
              <tr
                key={task.id}
                style={{
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  const cells = e.currentTarget.querySelectorAll('td');
                  cells.forEach(cell => cell.style.background = PALETTE.warm);
                }}
                onMouseLeave={(e) => {
                  const cells = e.currentTarget.querySelectorAll('td');
                  cells.forEach(cell => cell.style.background = PALETTE.bone);
                }}
              >
                {columns
                  .filter(col => visibleColumns[col.key])
                  .map(col => (
                    <EditableCell key={col.key} task={task} column={col} />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedTasks.length === 0 && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: PALETTE.muted,
            fontFamily: SERIF,
            fontSize: '15px'
          }}>
            No hay tareas para mostrar
          </div>
        )}
      </div>
    </div>
  );
}

