import { useState, useMemo } from 'react';
import { Edit2, Trash2, Plus, Check, X, Search, AlertTriangle } from 'lucide-react';

/**
 * ProjectManager - Componente para gestión completa de proyectos
 *
 * Permite:
 * - Ver todos los proyectos con conteo de tareas
 * - Renombrar proyectos (inline editing)
 * - Añadir nuevos proyectos
 * - Borrar proyectos con confirmación
 * - Reasignar tareas huérfanas
 * - Búsqueda/filtrado de proyectos
 *
 * @param {Array} tasks - Array de todas las tareas
 * @param {Function} onRenameProject - Callback (oldName, newName)
 * @param {Function} onDeleteProject - Callback (projectName)
 * @param {Function} onAddProject - Callback (projectName)
 * @param {Function} onReassignTasks - Callback (fromProject, toProject)
 */
export default function ProjectManager({
  tasks = [],
  onRenameProject,
  onDeleteProject,
  onAddProject,
  onReassignTasks,
  onClose
}) {
  const [editingProject, setEditingProject] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProject, setDeletingProject] = useState(null);
  const [reassignTarget, setReassignTarget] = useState('');

  // Paleta de colores
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
    danger: "#C0564A",
  };

  // Calcular estadísticas de proyectos
  const projectStats = useMemo(() => {
    const stats = {};

    tasks.forEach(task => {
      const project = task.project || 'Sin proyecto asignado';
      if (!stats[project]) {
        stats[project] = {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          blocked: 0
        };
      }

      stats[project].total++;

      if (task.status === 'Hecho') stats[project].completed++;
      else if (task.status === 'En curso') stats[project].inProgress++;
      else if (task.status === 'Pendiente') stats[project].pending++;
      else if (task.status === 'Bloqueado') stats[project].blocked++;
    });

    return stats;
  }, [tasks]);

  // Filtrar proyectos por búsqueda
  const filteredProjects = useMemo(() => {
    const projects = Object.keys(projectStats);
    if (!searchTerm) return projects;
    return projects.filter(p =>
      p.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projectStats, searchTerm]);

  // Colores de proyectos
  const PROJECT_COLORS = {
    'Fundación & Método': '#7B6FA0',
    'Espacio E1': PALETTE.menthe,
    'Espacio E1 — Madrid': PALETTE.menthe,
    'Piloto & Validación': PALETTE.lagune,
    'Branding & Comunicación': '#D4727E',
    'Kit de Experiencia & Producto': PALETTE.mostaza,
    'Daruma — prototipo 3D': PALETTE.nectarine,
    'Stack Tecnológico': PALETTE.soft,
    'Formación Facilitadores': PALETTE.mostaza,
    'Escala — E2 + CDMX': PALETTE.menthe,
    'Sin proyecto asignado': PALETTE.muted
  };

  const handleStartEdit = (projectName) => {
    setEditingProject(projectName);
    setEditValue(projectName);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingProject) {
      onRenameProject?.(editingProject, editValue.trim());
    }
    setEditingProject(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditValue('');
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) {
      alert('Por favor ingresa un nombre de proyecto');
      return;
    }

    try {
      await onAddProject?.(newProjectName.trim());
      setNewProjectName('');
      alert(`Proyecto "${newProjectName.trim()}" añadido con éxito`);
    } catch (error) {
      console.error('Error añadiendo proyecto:', error);
      alert('Error al añadir proyecto');
    }
  };

  const handleDeleteProject = (projectName) => {
    setDeletingProject(projectName);
    setReassignTarget('');
  };

  const confirmDelete = () => {
    if (deletingProject) {
      // Si hay tareas, primero reasignarlas
      if (projectStats[deletingProject]?.total > 0 && reassignTarget) {
        onReassignTasks?.(deletingProject, reassignTarget);
      }

      onDeleteProject?.(deletingProject);
      setDeletingProject(null);
      setReassignTarget('');
    }
  };

  const getProjectColor = (projectName) => {
    return PROJECT_COLORS[projectName] || PALETTE.lagune;
  };

  const getCompletionPercentage = (stats) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: PALETTE.cream,
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${PALETTE.muted}20`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: PALETTE.ink,
            margin: 0
          }}>
            Gestión de Proyectos
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = PALETTE.warm}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={24} color={PALETTE.soft} />
          </button>
        </div>

        {/* Búsqueda y Add */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${PALETTE.muted}20`,
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color={PALETTE.muted}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: `1px solid ${PALETTE.muted}40`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: PALETTE.warm
              }}
            />
          </div>
        </div>

        {/* Add new project */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${PALETTE.muted}20`,
          backgroundColor: PALETTE.warm
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nombre del nuevo proyecto..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `1px solid ${PALETTE.muted}40`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleAddProject}
              disabled={!newProjectName.trim()}
              style={{
                padding: '10px 16px',
                backgroundColor: newProjectName.trim() ? PALETTE.lagune : PALETTE.muted,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: newProjectName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={16} />
              Añadir
            </button>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px'
        }}>
          {filteredProjects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: PALETTE.muted
            }}>
              No se encontraron proyectos
            </div>
          ) : (
            filteredProjects.map(projectName => {
              const stats = projectStats[projectName];
              const completion = getCompletionPercentage(stats);
              const color = getProjectColor(projectName);
              const isEditing = editingProject === projectName;

              return (
                <div
                  key={projectName}
                  style={{
                    marginBottom: '12px',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    border: `1px solid ${PALETTE.muted}20`,
                    borderLeft: `4px solid ${color}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    {isEditing ? (
                      <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: `2px solid ${color}`,
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={handleSaveEdit}
                          style={{
                            padding: '8px',
                            backgroundColor: PALETTE.menthe,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                        >
                          <Check size={16} color="white" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '8px',
                            backgroundColor: PALETTE.muted,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                        >
                          <X size={16} color="white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: PALETTE.ink,
                          margin: 0,
                          flex: 1
                        }}>
                          {projectName}
                        </h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleStartEdit(projectName)}
                            style={{
                              padding: '6px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = PALETTE.warm}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Edit2 size={16} color={PALETTE.soft} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(projectName)}
                            style={{
                              padding: '6px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = `${PALETTE.danger}20`}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={16} color={PALETTE.danger} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '13px',
                    color: PALETTE.soft,
                    marginBottom: '12px'
                  }}>
                    <span><strong>{stats.total}</strong> total</span>
                    <span style={{ color: PALETTE.menthe }}><strong>{stats.completed}</strong> completadas</span>
                    <span style={{ color: PALETTE.mostaza }}><strong>{stats.inProgress}</strong> en curso</span>
                    <span style={{ color: PALETTE.lagune }}><strong>{stats.pending}</strong> pendientes</span>
                    {stats.blocked > 0 && (
                      <span style={{ color: PALETTE.danger }}><strong>{stats.blocked}</strong> bloqueadas</span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: `${color}20`,
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${completion}%`,
                        height: '100%',
                        backgroundColor: color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: PALETTE.soft,
                      minWidth: '40px'
                    }}>
                      {completion}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de confirmación de borrado */}
      {deletingProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            margin: '20px'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <AlertTriangle size={24} color={PALETTE.danger} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: PALETTE.ink,
                margin: 0
              }}>
                Eliminar proyecto
              </h3>
            </div>
            <p style={{
              fontSize: '14px',
              color: PALETTE.soft,
              marginBottom: '16px'
            }}>
              ¿Estás seguro de que quieres eliminar "{deletingProject}"?
            </p>
            {projectStats[deletingProject]?.total > 0 && (
              <>
                <p style={{
                  fontSize: '14px',
                  color: PALETTE.danger,
                  marginBottom: '12px',
                  fontWeight: '500'
                }}>
                  Este proyecto tiene {projectStats[deletingProject].total} tareas.
                  Selecciona a dónde reasignarlas:
                </p>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${PALETTE.muted}40`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="">Seleccionar proyecto...</option>
                  {filteredProjects
                    .filter(p => p !== deletingProject)
                    .map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))
                  }
                </select>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeletingProject(null)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: PALETTE.warm,
                  border: `1px solid ${PALETTE.muted}40`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: PALETTE.soft
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={projectStats[deletingProject]?.total > 0 && !reassignTarget}
                style={{
                  padding: '10px 16px',
                  backgroundColor: (projectStats[deletingProject]?.total > 0 && !reassignTarget) ? PALETTE.muted : PALETTE.danger,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (projectStats[deletingProject]?.total > 0 && !reassignTarget) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
