import { useState, useEffect, useMemo } from 'react';
import { Eye, Plus, Trash2, Star, StarOff, Save, X, Edit2, Check } from 'lucide-react';

/**
 * ViewManager - Sistema de vistas guardables
 *
 * Permite:
 * - Guardar configuración actual (filtros + agrupación + orden)
 * - Nombrar vistas personalizadas
 * - Cambiar entre vistas guardadas
 * - Borrar vistas custom
 * - 7 vistas predefinidas + ilimitadas custom
 *
 * Estructura de vista:
 * {
 *   id: "vista-1",
 *   name: "Roadmap Maestro",
 *   groupBy: "project",
 *   filters: { priority: ["P0", "P1"] },
 *   sortBy: "startDate",
 *   showCompleted: false,
 *   isPredefined: true
 * }
 */

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

// Vistas predefinidas
const PREDEFINED_VIEWS = [
  {
    id: 'roadmap-maestro',
    name: 'Roadmap Maestro',
    description: 'Vista completa por proyectos con fechas',
    icon: '🗺️',
    groupBy: 'project',
    sortBy: 'startDate',
    filters: {},
    showCompleted: true,
    isPredefined: true
  },
  {
    id: 'urgente-critico',
    name: 'Urgente y Crítico',
    description: 'Solo tareas P0 y P1 sin completar',
    icon: '🚨',
    groupBy: 'priority',
    sortBy: 'endDate',
    filters: {
      priority: ['P0 (Crítica)', 'P1 (Alta)'],
      status: ['Urgente', 'En curso', 'Pendiente']
    },
    showCompleted: false,
    isPredefined: true
  },
  {
    id: 'esta-semana',
    name: 'Esta Semana',
    description: 'Tareas que vencen en los próximos 7 días',
    icon: '📅',
    groupBy: 'none',
    sortBy: 'endDate',
    filters: {
      dueWithin: 7
    },
    showCompleted: false,
    isPredefined: true
  },
  {
    id: 'por-workstream',
    name: 'Por Workstream',
    description: 'Agrupado por área de trabajo',
    icon: '👥',
    groupBy: 'ws',
    sortBy: 'priority',
    filters: {},
    showCompleted: false,
    isPredefined: true
  },
  {
    id: 'bloqueadas',
    name: 'Bloqueadas',
    description: 'Solo tareas bloqueadas que necesitan atención',
    icon: '⚠️',
    groupBy: 'owner',
    sortBy: 'startDate',
    filters: {
      status: ['Bloqueado']
    },
    showCompleted: false,
    isPredefined: true
  },
  {
    id: 'hitos',
    name: 'Hitos',
    description: 'Solo milestones y gates críticos',
    icon: '⭐',
    groupBy: 'project',
    sortBy: 'endDate',
    filters: {
      milestone: true
    },
    showCompleted: true,
    isPredefined: true
  },
  {
    id: 'mi-trabajo',
    name: 'Mi Trabajo',
    description: 'Tareas asignadas a mí',
    icon: '👤',
    groupBy: 'status',
    sortBy: 'priority',
    filters: {
      ownerMe: true
    },
    showCompleted: false,
    isPredefined: true
  }
];

const STORAGE_KEY = 'neo-dmstk-custom-views';

export default function ViewManager({
  currentView,
  currentFilters,
  currentGroupBy,
  currentSortBy,
  showCompleted,
  onApplyView,
  onClose
}) {
  const [customViews, setCustomViews] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [editingView, setEditingView] = useState(null);
  const [editName, setEditName] = useState('');

  // Cargar vistas custom del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomViews(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading custom views:', error);
    }
  }, []);

  // Guardar vistas custom en localStorage
  const saveCustomViews = (views) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
      setCustomViews(views);
    } catch (error) {
      console.error('Error saving custom views:', error);
    }
  };

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) return;

    const newView = {
      id: `custom-${Date.now()}`,
      name: newViewName.trim(),
      description: newViewDescription.trim() || 'Vista personalizada',
      icon: '💾',
      groupBy: currentGroupBy,
      sortBy: currentSortBy,
      filters: currentFilters,
      showCompleted,
      isPredefined: false,
      createdAt: new Date().toISOString()
    };

    saveCustomViews([...customViews, newView]);
    setShowSaveDialog(false);
    setNewViewName('');
    setNewViewDescription('');
  };

  const handleDeleteView = (viewId) => {
    if (confirm('¿Seguro que quieres eliminar esta vista?')) {
      saveCustomViews(customViews.filter(v => v.id !== viewId));
    }
  };

  const handleRenameView = (viewId) => {
    if (!editName.trim()) return;

    saveCustomViews(
      customViews.map(v =>
        v.id === viewId ? { ...v, name: editName.trim() } : v
      )
    );
    setEditingView(null);
    setEditName('');
  };

  const allViews = [...PREDEFINED_VIEWS, ...customViews];

  const isCurrentView = (view) => {
    return currentView?.id === view.id;
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
        maxWidth: '900px',
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
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: PALETTE.ink,
              margin: 0,
              marginBottom: '4px'
            }}>
              Vistas Guardadas
            </h2>
            <p style={{
              fontSize: '14px',
              color: PALETTE.soft,
              margin: 0
            }}>
              Gestiona y cambia entre diferentes vistas de tus tareas
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} color={PALETTE.soft} />
          </button>
        </div>

        {/* Save Current View Button */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${PALETTE.muted}20`,
          backgroundColor: PALETTE.warm
        }}>
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: PALETTE.lagune,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            <Save size={18} />
            Guardar vista actual
          </button>
        </div>

        {/* Views List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {/* Predefined Views */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: PALETTE.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              Vistas Predefinidas
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {PREDEFINED_VIEWS.map(view => (
                <button
                  key={view.id}
                  onClick={() => {
                    onApplyView(view);
                    onClose();
                  }}
                  style={{
                    padding: '16px',
                    backgroundColor: isCurrentView(view) ? `${PALETTE.lagune}15` : 'white',
                    border: isCurrentView(view) ? `2px solid ${PALETTE.lagune}` : `1px solid ${PALETTE.muted}20`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentView(view)) {
                      e.currentTarget.style.borderColor = PALETTE.lagune;
                      e.currentTarget.style.backgroundColor = PALETTE.warm;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentView(view)) {
                      e.currentTarget.style.borderColor = `${PALETTE.muted}20`;
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {isCurrentView(view) && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px'
                    }}>
                      <Star size={16} fill={PALETTE.lagune} color={PALETTE.lagune} />
                    </div>
                  )}
                  <div style={{
                    fontSize: '24px',
                    marginBottom: '8px'
                  }}>
                    {view.icon}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: PALETTE.ink,
                    marginBottom: '4px'
                  }}>
                    {view.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: PALETTE.soft,
                    lineHeight: '1.4'
                  }}>
                    {view.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Views */}
          {customViews.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: PALETTE.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '16px'
              }}>
                Vistas Personalizadas ({customViews.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px'
              }}>
                {customViews.map(view => (
                  <div
                    key={view.id}
                    style={{
                      padding: '16px',
                      backgroundColor: isCurrentView(view) ? `${PALETTE.menthe}15` : 'white',
                      border: isCurrentView(view) ? `2px solid ${PALETTE.menthe}` : `1px solid ${PALETTE.muted}20`,
                      borderRadius: '10px',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '4px'
                    }}>
                      <button
                        onClick={() => {
                          setEditingView(view.id);
                          setEditName(view.name);
                        }}
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex'
                        }}
                      >
                        <Edit2 size={14} color={PALETTE.soft} />
                      </button>
                      <button
                        onClick={() => handleDeleteView(view.id)}
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex'
                        }}
                      >
                        <Trash2 size={14} color={PALETTE.danger} />
                      </button>
                    </div>

                    <div style={{
                      fontSize: '24px',
                      marginBottom: '8px'
                    }}>
                      {view.icon}
                    </div>

                    {editingView === view.id ? (
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameView(view.id);
                            if (e.key === 'Escape') setEditingView(null);
                          }}
                          autoFocus
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            border: `1px solid ${PALETTE.menthe}`,
                            borderRadius: '4px',
                            fontSize: '15px',
                            fontWeight: '600'
                          }}
                        />
                        <button
                          onClick={() => handleRenameView(view.id)}
                          style={{
                            padding: '4px',
                            backgroundColor: PALETTE.menthe,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                        >
                          <Check size={14} color="white" />
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: PALETTE.ink,
                        marginBottom: '4px',
                        paddingRight: '60px'
                      }}>
                        {view.name}
                      </div>
                    )}

                    <div style={{
                      fontSize: '12px',
                      color: PALETTE.soft,
                      marginBottom: '12px',
                      lineHeight: '1.4'
                    }}>
                      {view.description}
                    </div>

                    <button
                      onClick={() => {
                        onApplyView(view);
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: isCurrentView(view) ? PALETTE.menthe : PALETTE.lagune,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={14} />
                      {isCurrentView(view) ? 'Vista Actual' : 'Aplicar Vista'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
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
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: PALETTE.ink,
              marginBottom: '16px'
            }}>
              Guardar Vista Actual
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: PALETTE.soft,
                marginBottom: '6px'
              }}>
                Nombre de la vista
              </label>
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Ej: Tareas Q2 2026"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${PALETTE.muted}40`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: PALETTE.soft,
                marginBottom: '6px'
              }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                placeholder="Ej: Tareas del segundo trimestre"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${PALETTE.muted}40`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewViewName('');
                  setNewViewDescription('');
                }}
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
                onClick={handleSaveCurrentView}
                disabled={!newViewName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: newViewName.trim() ? PALETTE.menthe : PALETTE.muted,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newViewName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
