import { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, Edit2, Check, AlertTriangle,
  Clock, Users, CheckCircle, Circle, Clock3, XCircle,
  Target, Calendar, ArrowRight, Flame, Plus, Trash2, X
} from 'lucide-react';

/**
 * ProjectsHierarchyView - Vista jerárquica de proyectos de 3 niveles
 *
 * NIVEL 1: SCOPE GLOBAL (Aplica a todos los espacios)
 * NIVEL 2: ESPACIOS ESPECÍFICOS (E1 Madrid, E2 Barcelona)
 * NIVEL 3: EXPANSIÓN FUTURA (E3 México+)
 *
 * Características:
 * - Desplegables con persistencia en localStorage
 * - Notas de PM inteligentes y contextuales
 * - Edición inline de tareas
 * - Alertas a nivel proyecto
 * - UI limpia y no abrumadora
 */
export default function ProjectsHierarchyView({
  tasks = [],
  projects = [], // ✅ Lista de proyectos independientes
  onEditTask,
  onUpdateTask,
  onAddProject, // ✅ NUEVO: Función para añadir proyectos
  onRenameProject, // ✅ NUEVO: Función para renombrar proyectos
  onDeleteProject // ✅ NUEVO: Función para eliminar proyectos
}) {
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

  // Estado de expansión de proyectos (persistido en localStorage)
  const [expandedProjects, setExpandedProjects] = useState(() => {
    const saved = localStorage.getItem('neo-dmstk-expanded-projects');
    return saved ? JSON.parse(saved) : {};
  });

  // Estados para gestión de proyectos
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');

  // Persistir estado en localStorage
  useEffect(() => {
    localStorage.setItem('neo-dmstk-expanded-projects', JSON.stringify(expandedProjects));
  }, [expandedProjects]);

  /**
   * Estructura jerárquica de proyectos
   */
  const PROJECT_HIERARCHY = {
    global: {
      title: '🌍 PROYECTOS GLOBALES',
      subtitle: 'Aplican a todos los espacios',
      projects: [
        {
          name: 'Global: Branding & Comunicación',
          color: '#D4727E',
          icon: '🎨'
        },
        {
          name: 'Global: Daruma (Producto)',
          color: PALETTE.nectarine,
          icon: '🎯'
        },
        {
          name: 'Global: Kit de Experiencia',
          color: PALETTE.mostaza,
          icon: '📦'
        },
        {
          name: 'Global: Stack Tecnológico',
          color: PALETTE.lagune,
          icon: '⚙️'
        },
        {
          name: 'Global: Método & Piloto',
          color: '#7B6FA0',
          icon: '🧠'
        },
        {
          name: 'Global: Formación Facilitadores',
          color: PALETTE.menthe,
          icon: '👥'
        }
      ]
    },
    espacios: {
      title: '🏢 ESPACIOS FÍSICOS',
      subtitle: 'Proyectos específicos por ubicación',
      spaces: [
        {
          name: 'E1 Madrid',
          deadline: 'Soft Opening Sep 2026',
          color: PALETTE.menthe,
          icon: '🇪🇸',
          projects: [
            'E1 Madrid > Legal & Licencias',
            'E1 Madrid > Búsqueda & Negociación',
            'E1 Madrid > Reforma & Construcción',
            'E1 Madrid > Equipamiento & Setup',
            'E1 Madrid > Operaciones & Apertura',
            'E1 Madrid > Finanzas',
            'E1 Madrid > General'
          ]
        },
        {
          name: 'E2 Barcelona',
          deadline: 'Apertura Oct-Nov 2026',
          color: PALETTE.lagune,
          icon: '🇪🇸',
          projects: [
            'E2 Barcelona > Legal & Licencias',
            'E2 Barcelona > Búsqueda & Negociación',
            'E2 Barcelona > Reforma & Construcción',
            'E2 Barcelona > Equipamiento & Setup',
            'E2 Barcelona > Operaciones & Apertura',
            'E2 Barcelona > Finanzas',
            'E2 Barcelona > General'
          ]
        }
      ]
    },
    expansion: {
      title: '🌎 EXPANSIÓN FUTURA',
      subtitle: 'Investigación y preparación',
      spaces: [
        {
          name: 'E3 México',
          deadline: 'Investigación',
          color: PALETTE.nectarine,
          icon: '🇲🇽',
          projects: [
            'E3 México > Investigación',
            'E3 México > General'
          ]
        }
      ]
    }
  };

  /**
   * Obtiene lista completa de proyectos (del estado + de tareas)
   */
  const allProjectNames = useMemo(() => {
    // Proyectos del estado (pueden estar vacíos)
    const projectsFromState = projects.map(p => p.name);

    // Proyectos de tareas
    const projectsFromTasks = tasks.map(t => t.project).filter(Boolean);

    // Combinar y eliminar duplicados
    return [...new Set([...projectsFromState, ...projectsFromTasks])];
  }, [projects, tasks]);

  /**
   * Agrupa tareas por proyecto
   */
  const tasksByProject = useMemo(() => {
    const grouped = {};

    // Inicializar con todos los proyectos (incluso los vacíos)
    allProjectNames.forEach(projectName => {
      grouped[projectName] = [];
    });

    // Asignar tareas a proyectos
    tasks.forEach(task => {
      const project = task.project || 'Sin proyecto asignado';
      if (!grouped[project]) {
        grouped[project] = [];
      }
      grouped[project].push(task);
    });

    return grouped;
  }, [tasks, allProjectNames]);

  /**
   * Organiza proyectos dinámicamente en jerarquía
   */
  const dynamicProjectHierarchy = useMemo(() => {
    const hierarchy = {
      global: [],
      e1: [],
      e2: [],
      expansion: [],
      otros: [] // ✅ Categoría para proyectos sin clasificar
    };

    allProjectNames.forEach(projectName => {
      const projectObj = {
        name: projectName,
        color: '#6398A9', // Color por defecto
        icon: '📁'
      };

      if (projectName.startsWith('Global:')) {
        projectObj.icon = '🌍';
        projectObj.color = '#7B6FA0';
        hierarchy.global.push(projectObj);
      } else if (projectName.includes('E1') || projectName.includes('Madrid')) {
        projectObj.icon = '🏢';
        projectObj.color = '#6398A9';
        hierarchy.e1.push(projectObj);
      } else if (projectName.includes('E2') || projectName.includes('Barcelona')) {
        projectObj.icon = '🏙️';
        projectObj.color = '#9B7AB8';
        hierarchy.e2.push(projectObj);
      } else if (projectName.includes('E3') || projectName.includes('México') || projectName.includes('CDMX')) {
        projectObj.icon = '🚀';
        projectObj.color = '#E67E22';
        hierarchy.expansion.push(projectObj);
      } else {
        // ✅ Proyectos que no coinciden con ningún patrón
        projectObj.icon = '📋';
        projectObj.color = '#96C7B3';
        hierarchy.otros.push(projectObj);
      }
    });

    return hierarchy;
  }, [allProjectNames]);

  /**
   * Calcula estadísticas de un proyecto
   */
  const getProjectStats = (projectName) => {
    const projectTasks = tasksByProject[projectName] || [];
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'Hecho').length;
    const inProgress = projectTasks.filter(t => t.status === 'En curso').length;
    const pending = projectTasks.filter(t => t.status === 'Pendiente').length;
    const blocked = projectTasks.filter(t => t.status === 'Bloqueado').length;
    const urgent = projectTasks.filter(t => t.status === 'Urgente').length;
    const overdue = projectTasks.filter(t =>
      t.status !== 'Hecho' && new Date(t.endDate) < new Date()
    ).length;
    const unassigned = projectTasks.filter(t =>
      !t.owner || t.owner === 'Por asignar'
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      urgent,
      overdue,
      unassigned,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  /**
   * Genera notas inteligentes de PM para cada tarea
   */
  const generatePMNotes = (task, allProjectTasks) => {
    const notes = [];
    const today = new Date();
    const endDate = new Date(task.endDate);
    const daysUntilDue = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // URGENCIA TEMPORAL
    if (daysUntilDue < 0 && task.status !== 'Hecho') {
      notes.push({
        type: 'critical',
        icon: '🔥',
        text: `VENCIDA hace ${Math.abs(daysUntilDue)} días. Requiere atención INMEDIATA.`,
        color: PALETTE.danger
      });
    } else if (daysUntilDue >= 0 && daysUntilDue < 3 && task.status !== 'Hecho') {
      notes.push({
        type: 'critical',
        icon: '🔥',
        text: `URGENTE - Vence en ${daysUntilDue} día${daysUntilDue === 1 ? '' : 's'}. Requiere atención INMEDIATA.`,
        color: PALETTE.danger
      });
    } else if (daysUntilDue >= 3 && daysUntilDue < 7 && task.status !== 'Hecho') {
      notes.push({
        type: 'warning',
        icon: '⚠️',
        text: `CRÍTICO - Deadline próximo (${daysUntilDue} días). Priorizar esta semana.`,
        color: PALETTE.mostaza
      });
    }

    // DEPENDENCIAS
    if (task.deps && task.deps.length > 0) {
      const blockedByTasks = task.deps.map(depId =>
        tasks.find(t => t.id === depId)
      ).filter(Boolean).filter(t => t.status !== 'Hecho');

      if (blockedByTasks.length > 0) {
        notes.push({
          type: 'blocked',
          icon: '🚧',
          text: `Bloqueada por ${blockedByTasks.length} tarea(s): ${blockedByTasks.map(t => t.name).join(', ')}`,
          color: PALETTE.soft
        });
      }
    }

    // HITOS
    if (task.isMilestone) {
      notes.push({
        type: 'milestone',
        icon: '⭐',
        text: `HITO ESTRATÉGICO - Impacta timeline completo. Review con board requerido.`,
        color: PALETTE.mostaza
      });
    }

    // PRIORIDAD CRÍTICA
    if (task.priority === 'Crítica') {
      notes.push({
        type: 'priority',
        icon: '🎯',
        text: `Prioridad MÁXIMA - No puede retrasarse. Asignar recursos necesarios.`,
        color: PALETTE.danger
      });
    }

    // ESTADO BLOQUEADO
    if (task.status === 'Bloqueado') {
      notes.push({
        type: 'action',
        icon: '💡',
        text: `Acción requerida: Identificar bloqueante y resolver hoy. Escalar si necesario.`,
        color: PALETTE.lagune
      });
    }

    // CONSTRAINT AGOSTO (para España)
    if (task.name.toLowerCase().includes('licencia') && endDate > new Date('2026-07-01')) {
      notes.push({
        type: 'constraint',
        icon: '🇪🇸',
        text: `CONSTRAINT AGOSTO - España paraliza licencias. DEBE completarse antes 1 julio.`,
        color: PALETTE.danger
      });
    }

    // LEAD TIME (Daruma)
    if (task.name.toLowerCase().includes('daruma') && task.name.toLowerCase().includes('pedido')) {
      notes.push({
        type: 'leadtime',
        icon: '⏱️',
        text: `Lead time 8-10 semanas. Pedido URGENTE o no llega para piloto.`,
        color: PALETTE.danger
      });
    }

    // RECOMENDACIONES PROACTIVAS
    if (task.status === 'Hecho' && task.name.toLowerCase().includes('brief')) {
      notes.push({
        type: 'next',
        icon: '➡️',
        text: `Siguiente paso: Validar brief con stakeholders antes de ejecutar.`,
        color: PALETTE.menthe
      });
    }

    // SIN OWNER
    if (!task.owner || task.owner === 'Por asignar') {
      notes.push({
        type: 'action',
        icon: '👤',
        text: `ACCIÓN: Asignar owner ESTA SEMANA. Tarea sin dueño = tarea que no avanza.`,
        color: PALETTE.mostaza
      });
    }

    return notes;
  };

  /**
   * Genera alertas a nivel proyecto
   */
  const generateProjectAlerts = (projectTasks) => {
    const alerts = [];
    const today = new Date();

    // Tareas vencidas
    const overdue = projectTasks.filter(t =>
      t.status !== 'Hecho' && new Date(t.endDate) < today
    );
    if (overdue.length > 0) {
      alerts.push({
        type: 'critical',
        icon: '⚠️',
        text: `${overdue.length} tarea${overdue.length === 1 ? '' : 's'} vencida${overdue.length === 1 ? '' : 's'}. Review urgente requerido.`,
        color: PALETTE.danger
      });
    }

    // Tareas bloqueadas
    const blocked = projectTasks.filter(t => t.status === 'Bloqueado');
    if (blocked.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '🚧',
        text: `${blocked.length} tarea${blocked.length === 1 ? '' : 's'} bloqueada${blocked.length === 1 ? '' : 's'}. Desbloquear esta semana.`,
        color: PALETTE.mostaza
      });
    }

    // Tareas sin owner
    const unassigned = projectTasks.filter(t => !t.owner || t.owner === 'Por asignar');
    if (unassigned.length > 0) {
      alerts.push({
        type: 'info',
        icon: '👤',
        text: `${unassigned.length} tarea${unassigned.length === 1 ? '' : 's'} sin owner. Asignar ASAP.`,
        color: PALETTE.lagune
      });
    }

    return alerts;
  };

  /**
   * Toggle de expansión de proyecto
   */
  const toggleProject = (projectName) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectName]: !prev[projectName]
    }));
  };

  /**
   * Obtiene ícono de estado
   */
  const getStatusIcon = (status) => {
    const iconProps = { size: 14 };
    switch (status) {
      case 'Hecho':
        return <CheckCircle {...iconProps} color={PALETTE.menthe} />;
      case 'En curso':
        return <Clock3 {...iconProps} color={PALETTE.mostaza} />;
      case 'Urgente':
        return <Flame {...iconProps} color={PALETTE.danger} />;
      case 'Bloqueado':
        return <XCircle {...iconProps} color={PALETTE.soft} />;
      default:
        return <Circle {...iconProps} color={PALETTE.lagune} />;
    }
  };

  /**
   * Renderiza una tarea individual
   */
  const TaskRow = ({ task, projectTasks }) => {
    const pmNotes = generatePMNotes(task, projectTasks);
    const today = new Date();
    const endDate = new Date(task.endDate);
    const daysUntilDue = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0 && task.status !== 'Hecho';

    return (
      <div
        style={{
          padding: '12px 16px',
          marginBottom: '8px',
          background: PALETTE.bone,
          borderRadius: '8px',
          border: `1px solid ${PALETTE.faint}`,
          borderLeft: `4px solid ${isOverdue ? PALETTE.danger : task.isMilestone ? PALETTE.mostaza : PALETTE.faint}`,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={() => onEditTask?.(task)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        {/* Encabezado de tarea */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: pmNotes.length > 0 ? '8px' : '0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {getStatusIcon(task.status)}
            <span style={{
              fontSize: '14px',
              fontWeight: task.isMilestone ? '600' : '400',
              color: isOverdue ? PALETTE.danger : PALETTE.ink,
              textDecoration: task.status === 'Hecho' ? 'line-through' : 'none',
              fontFamily: task.isMilestone ? SERIF : 'inherit'
            }}>
              {task.isMilestone && '◆ '}
              {task.name}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: PALETTE.muted }}>
            {/* Owner */}
            {task.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={11} />
                <span>{task.owner.split(' ')[0]}</span>
              </div>
            )}

            {/* Fecha */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isOverdue ? PALETTE.danger : PALETTE.muted
            }}>
              <Calendar size={11} />
              <span>
                {isOverdue
                  ? `Vencida ${Math.abs(daysUntilDue)}d`
                  : daysUntilDue <= 7
                    ? `${daysUntilDue}d`
                    : new Date(task.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                }
              </span>
            </div>

            {/* Quick status change */}
            <div onClick={(e) => e.stopPropagation()}>
              <select
                value={task.status}
                onChange={(e) => {
                  onUpdateTask?.(task.id, { status: e.target.value });
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  background: task.status === 'Hecho' ? PALETTE.menthe + '20' :
                              task.status === 'Urgente' ? PALETTE.danger + '20' :
                              task.status === 'En curso' ? PALETTE.mostaza + '20' :
                              PALETTE.lagune + '20',
                  color: task.status === 'Hecho' ? PALETTE.menthe :
                         task.status === 'Urgente' ? PALETTE.danger :
                         task.status === 'En curso' ? PALETTE.mostaza :
                         PALETTE.lagune,
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Urgente">Urgente</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Hecho">Hecho</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notas de PM */}
        {pmNotes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {pmNotes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  fontSize: '11px',
                  color: note.color,
                  background: note.color + '08',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  borderLeft: `2px solid ${note.color}`
                }}
              >
                <span style={{ fontSize: '12px', flexShrink: 0 }}>{note.icon}</span>
                <span style={{ lineHeight: '1.4' }}>
                  <strong>PM:</strong> {note.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza un proyecto
   */
  const ProjectSection = ({ projectName, color, icon }) => {
    const projectTasks = tasksByProject[projectName] || [];
    const stats = getProjectStats(projectName);
    const alerts = generateProjectAlerts(projectTasks);
    const isExpanded = expandedProjects[projectName];
    const [showActions, setShowActions] = useState(false);

    // ✅ MODIFICADO: Permitir mostrar proyectos vacíos
    // if (projectTasks.length === 0) return null;

    const handleRenameCategory = (e, newPrefix) => {
      e.stopPropagation();

      // Determinar nuevo nombre basado en el prefijo seleccionado
      let newName = projectName;

      if (newPrefix === 'Global:') {
        // Si ya tiene prefijo, reemplazarlo
        if (projectName.includes('>') || projectName.startsWith('E1') || projectName.startsWith('E2') || projectName.startsWith('E3')) {
          const baseName = projectName.split('>').pop().trim() || projectName.replace(/^E[1-3]\s+/, '');
          newName = `Global: ${baseName}`;
        } else if (!projectName.startsWith('Global:')) {
          newName = `Global: ${projectName}`;
        }
      } else if (newPrefix === 'E1') {
        const baseName = projectName.replace(/^Global:\s*/, '').split('>')[0].trim();
        newName = `E1 Madrid > ${baseName}`;
      } else if (newPrefix === 'E2') {
        const baseName = projectName.replace(/^Global:\s*/, '').split('>')[0].trim();
        newName = `E2 Barcelona > ${baseName}`;
      } else if (newPrefix === 'E3') {
        const baseName = projectName.replace(/^Global:\s*/, '').split('>')[0].trim();
        newName = `E3 México > ${baseName}`;
      } else if (newPrefix === 'Otros') {
        // Remover cualquier prefijo
        newName = projectName.replace(/^Global:\s*/, '').replace(/^E[1-3]\s+\w+\s*>\s*/, '').trim();
      }

      if (onRenameProject && newName !== projectName) {
        onRenameProject(projectName, newName);
      }
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      if (onDeleteProject) {
        onDeleteProject(projectName);
      }
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        {/* Header del proyecto */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: PALETTE.warm,
            borderRadius: '10px',
            border: `1px solid ${PALETTE.faint}`,
            borderLeft: `4px solid ${color}`,
            transition: 'all 0.2s',
            marginBottom: isExpanded ? '12px' : '0',
            position: 'relative'
          }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div
            onClick={() => toggleProject(projectName)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
          >
            {isExpanded ? <ChevronDown size={16} color={PALETTE.soft} /> : <ChevronRight size={16} color={PALETTE.soft} />}
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: PALETTE.ink,
                fontFamily: SERIF,
                marginBottom: '2px'
              }}>
                {projectName}
              </div>
              <div style={{ fontSize: '11px', color: PALETTE.muted }}>
                {stats.total} tarea{stats.total !== 1 ? 's' : ''} · {stats.completed} completada{stats.completed !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Botones de acción (aparecen al hacer hover) */}
          {showActions && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <select
                onChange={(e) => handleRenameCategory(e, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                defaultValue=""
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: `1px solid ${PALETTE.faint}`,
                  borderRadius: '6px',
                  background: PALETTE.bone,
                  color: PALETTE.soft,
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <option value="" disabled>Mover a...</option>
                <option value="Global:">🌍 Global</option>
                <option value="E1">🏢 E1 Madrid</option>
                <option value="E2">🏙️ E2 Barcelona</option>
                <option value="E3">🚀 E3 México</option>
                <option value="Otros">📋 Otros</option>
              </select>

              <button
                onClick={handleDelete}
                style={{
                  padding: '6px 8px',
                  background: PALETTE.danger + '15',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = PALETTE.danger + '30';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = PALETTE.danger + '15';
                }}
              >
                <Trash2 size={14} color={PALETTE.danger} />
              </button>
            </div>
          )}

          {/* Barra de progreso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: PALETTE.faint,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.percentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${color}dd, ${color})`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: color,
              minWidth: '40px',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)'
            }}>
              {stats.percentage}%
            </span>
          </div>
        </div>

        {/* Alertas del proyecto */}
        {isExpanded && alerts.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: alert.color + '08',
                  border: `1px solid ${alert.color}30`,
                  borderRadius: '8px',
                  marginBottom: '6px',
                  fontSize: '12px',
                  color: alert.color,
                  fontWeight: '500'
                }}
              >
                <span style={{ fontSize: '14px' }}>{alert.icon}</span>
                <span><strong>PM:</strong> {alert.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Lista de tareas */}
        {isExpanded && (
          <div style={{ paddingLeft: '20px' }}>
            {projectTasks.length === 0 ? (
              <div style={{
                padding: '20px',
                background: PALETTE.warm,
                border: `1px dashed ${PALETTE.faint}`,
                borderRadius: '8px',
                textAlign: 'center',
                color: PALETTE.muted
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: PALETTE.soft }}>
                  Proyecto creado sin tareas asignadas
                </div>
                <div style={{ fontSize: '12px' }}>
                  <strong>PM:</strong> Asigna tareas existentes editándolas o crea nuevas tareas con este proyecto.
                </div>
              </div>
            ) : (
              projectTasks
                .sort((a, b) => {
                  // Ordenar: vencidas > urgentes > en curso > pendientes > bloqueadas > hechas
                  const statusOrder = { 'Urgente': 0, 'En curso': 1, 'Pendiente': 2, 'Bloqueado': 3, 'Hecho': 4 };
                  const aOverdue = new Date(a.endDate) < new Date() && a.status !== 'Hecho';
                  const bOverdue = new Date(b.endDate) < new Date() && b.status !== 'Hecho';

                  if (aOverdue && !bOverdue) return -1;
                  if (!aOverdue && bOverdue) return 1;

                  return (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
                })
                .map(task => (
                  <TaskRow key={task.id} task={task} projectTasks={projectTasks} />
                ))
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza un espacio con sus proyectos
   */
  const SpaceSection = ({ space }) => {
    const allSpaceTasks = space.projects.reduce((acc, proj) => {
      return [...acc, ...(tasksByProject[proj] || [])];
    }, []);

    const totalTasks = allSpaceTasks.length;
    const completedTasks = allSpaceTasks.filter(t => t.status === 'Hecho').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const spaceAlerts = generateProjectAlerts(allSpaceTasks);
    const isExpanded = expandedProjects[space.name];

    // ✅ MODIFICADO: Permitir mostrar espacios vacíos
    // if (totalTasks === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        {/* Header del espacio */}
        <div
          onClick={() => toggleProject(space.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${space.color}15, ${space.color}05)`,
            borderRadius: '12px',
            border: `2px solid ${space.color}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: isExpanded ? '16px' : '0'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${space.color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            {isExpanded ? <ChevronDown size={18} color={space.color} /> : <ChevronRight size={18} color={space.color} />}
            <span style={{ fontSize: '20px' }}>{space.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: PALETTE.ink,
                fontFamily: SERIF,
                marginBottom: '4px'
              }}>
                {space.name} — {space.deadline}
              </div>
              <div style={{ fontSize: '12px', color: PALETTE.soft }}>
                {totalTasks} tarea{totalTasks !== 1 ? 's' : ''} · {completedTasks} completada{completedTasks !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Barra de progreso del espacio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
            <div style={{
              flex: 1,
              height: '10px',
              background: PALETTE.faint,
              borderRadius: '5px',
              overflow: 'hidden',
              border: `1px solid ${space.color}20`
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${space.color}, ${space.color}dd)`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: space.color,
              minWidth: '50px',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)'
            }}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Alertas del espacio */}
        {isExpanded && spaceAlerts.length > 0 && (
          <div style={{ marginBottom: '16px', paddingLeft: '20px' }}>
            {spaceAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 18px',
                  background: alert.color + '10',
                  border: `2px solid ${alert.color}40`,
                  borderRadius: '10px',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: alert.color,
                  fontWeight: '600'
                }}
              >
                <span style={{ fontSize: '16px' }}>{alert.icon}</span>
                <span><strong>PM:</strong> {alert.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Proyectos del espacio */}
        {isExpanded && (
          <div style={{ paddingLeft: '24px' }}>
            {space.projects.map(projectName => (
              <ProjectSection
                key={projectName}
                projectName={projectName}
                color={space.color}
                icon="📂"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Handlers para gestión de proyectos
  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      alert('Por favor ingresa un nombre de proyecto');
      return;
    }

    if (onAddProject) {
      await onAddProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddProjectModal(false);
    }
  };

  const handleRenameProject = async () => {
    if (!editProjectName.trim()) {
      alert('Por favor ingresa un nombre válido');
      return;
    }

    if (onRenameProject && editingProject) {
      await onRenameProject(editingProject, editProjectName.trim());
      setEditingProject(null);
      setEditProjectName('');
    }
  };

  const handleDeleteProject = async (projectName) => {
    if (confirm(`¿Eliminar proyecto "${projectName}"?\n\nLas tareas no se eliminarán, solo perderán la asignación al proyecto.`)) {
      if (onDeleteProject) {
        await onDeleteProject(projectName);
      }
    }
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header con botón de añadir proyecto */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '16px 20px',
        background: PALETTE.warm,
        borderRadius: '12px',
        border: `1px solid ${PALETTE.faint}`
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: PALETTE.ink,
            fontFamily: SERIF
          }}>
            Gestión de Proyectos
          </h2>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: PALETTE.soft
          }}>
            {projects.length} proyectos · {tasks.length} tareas totales
          </p>
        </div>
        <button
          onClick={() => setShowAddProjectModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: PALETTE.lagune,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PALETTE.nectarine;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PALETTE.lagune;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={16} />
          Añadir Proyecto
        </button>
      </div>

      {/* Modal: Añadir Proyecto */}
      {showAddProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowAddProjectModal(false)}
        >
          <div
            style={{
              background: PALETTE.bone,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              border: `1px solid ${PALETTE.faint}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: PALETTE.ink,
                fontFamily: SERIF
              }}>
                Añadir Nuevo Proyecto
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} color={PALETTE.soft} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: PALETTE.soft,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Ej: Global: Nuevo Proyecto"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProject();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: `1px solid ${PALETTE.faint}`,
                  borderRadius: '8px',
                  background: PALETTE.bone,
                  color: PALETTE.ink,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                fontSize: '11px',
                color: PALETTE.muted,
                marginTop: '6px'
              }}>
                💡 <strong>Tip:</strong> Usa &quot;Global: Nombre&quot; para nivel 1, &quot;E1 Madrid &gt; Subproyecto&quot; para nivel 2
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowAddProjectModal(false);
                  setNewProjectName('');
                }}
                style={{
                  padding: '10px 20px',
                  background: PALETTE.warm,
                  border: `1px solid ${PALETTE.faint}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: PALETTE.soft,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newProjectName.trim()}
                style={{
                  padding: '10px 20px',
                  background: newProjectName.trim() ? PALETTE.lagune : PALETTE.faint,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  cursor: newProjectName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newProjectName.trim() ? 1 : 0.5
                }}
              >
                Añadir Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NIVEL 1: PROYECTOS GLOBALES */}
      {dynamicProjectHierarchy.global.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: PALETTE.muted,
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            🌍 PROYECTOS GLOBALES
          </div>
          <div style={{
            fontSize: '12px',
            color: PALETTE.soft,
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            Aplican a todos los espacios
          </div>

          {dynamicProjectHierarchy.global.map(project => (
            <ProjectSection
              key={project.name}
              projectName={project.name}
              color={project.color}
              icon={project.icon}
            />
          ))}
        </div>
      )}

      {/* NIVEL 2: E1 MADRID */}
      {dynamicProjectHierarchy.e1.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: PALETTE.muted,
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            🏢 E1 MADRID
          </div>
          <div style={{
            fontSize: '12px',
            color: PALETTE.soft,
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            Proyectos específicos de Madrid
          </div>

          {dynamicProjectHierarchy.e1.map(project => (
            <ProjectSection
              key={project.name}
              projectName={project.name}
              color={project.color}
              icon={project.icon}
            />
          ))}
        </div>
      )}

      {/* NIVEL 3: E2 BARCELONA */}
      {dynamicProjectHierarchy.e2.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: PALETTE.muted,
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            🏙️ E2 BARCELONA
          </div>
          <div style={{
            fontSize: '12px',
            color: PALETTE.soft,
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            Proyectos específicos de Barcelona
          </div>

          {dynamicProjectHierarchy.e2.map(project => (
            <ProjectSection
              key={project.name}
              projectName={project.name}
              color={project.color}
              icon={project.icon}
            />
          ))}
        </div>
      )}

      {/* NIVEL 4: EXPANSIÓN FUTURA */}
      {dynamicProjectHierarchy.expansion.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: PALETTE.muted,
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            🚀 EXPANSIÓN FUTURA
          </div>
          <div style={{
            fontSize: '12px',
            color: PALETTE.soft,
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            E3 México y futuros espacios
          </div>

          {dynamicProjectHierarchy.expansion.map(project => (
            <ProjectSection
              key={project.name}
              projectName={project.name}
              color={project.color}
              icon={project.icon}
            />
          ))}
        </div>
      )}

      {/* OTROS PROYECTOS (sin clasificar) */}
      {dynamicProjectHierarchy.otros.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: PALETTE.muted,
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)'
          }}>
            📋 OTROS PROYECTOS
          </div>
          <div style={{
            fontSize: '12px',
            color: PALETTE.soft,
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            Proyectos sin clasificación específica
          </div>

          {dynamicProjectHierarchy.otros.map(project => (
            <ProjectSection
              key={project.name}
              projectName={project.name}
              color={project.color}
              icon={project.icon}
            />
          ))}
        </div>
      )}
    </div>
  );
}
