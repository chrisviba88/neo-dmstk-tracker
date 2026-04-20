import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Filter } from 'lucide-react';

/**
 * ProjectHierarchyManager - Gestor visual de jerarquía de proyectos
 *
 * Sistema de 2 niveles:
 * - NIVEL 1 (Padre): Global, E1, E2, E3
 * - NIVEL 2 (Hijo): Subproyectos específicos
 *
 * Ejemplo:
 * Global
 *   ├─ Branding
 *   ├─ Método
 *   └─ Stack Tecnológico
 * E1 Madrid
 *   ├─ Legal & Licencias
 *   ├─ Búsqueda & Negociación
 *   └─ Reforma & Construcción
 */
export default function ProjectHierarchyManager({
  projects = [],
  tasks = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onUpdateTask
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

  // Estados
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'global', 'e1', 'e2', 'e3'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    parent: null,
    level: 1
  });

  // Categorías principales
  const CATEGORIES = [
    { id: 'global', name: 'Global', icon: '🌍', color: '#7B6FA0' },
    { id: 'e1', name: 'E1 Madrid', icon: '🏢', color: '#6398A9' },
    { id: 'e2', name: 'E2 Barcelona', icon: '🏙️', color: '#9B7AB8' },
    { id: 'e3', name: 'E3 México', icon: '🚀', color: '#E67E22' },
  ];

  // Organizar proyectos en jerarquía
  const hierarchy = useMemo(() => {
    const result = {
      global: { main: null, children: [] },
      e1: { main: null, children: [] },
      e2: { main: null, children: [] },
      e3: { main: null, children: [] },
    };

    projects.forEach(project => {
      const name = project.name.toLowerCase();

      if (name.startsWith('global')) {
        if (!name.includes('>')) {
          result.global.main = project;
        } else {
          result.global.children.push(project);
        }
      } else if (name.includes('e1') || name.includes('madrid')) {
        if (!name.includes('>')) {
          result.e1.main = project;
        } else {
          result.e1.children.push(project);
        }
      } else if (name.includes('e2') || name.includes('barcelona')) {
        if (!name.includes('>')) {
          result.e2.main = project;
        } else {
          result.e2.children.push(project);
        }
      } else if (name.includes('e3') || name.includes('méxico') || name.includes('mexico')) {
        if (!name.includes('>')) {
          result.e3.main = project;
        } else {
          result.e3.children.push(project);
        }
      }
    });

    return result;
  }, [projects]);

  // Contar tareas por proyecto
  const getProjectStats = (projectName) => {
    const projectTasks = tasks.filter(t => t.project === projectName);
    const completed = projectTasks.filter(t => t.status === 'Hecho').length;
    return {
      total: projectTasks.length,
      completed,
      percentage: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
    };
  };

  // Toggle expansión
  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Añadir subproyecto
  const handleAddSubproject = async (categoryId) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const name = prompt(`Nombre del subproyecto de ${category.name}:`);
    if (!name || !name.trim()) return;

    const fullName = `${category.name} > ${name.trim()}`;

    if (onAddProject) {
      await onAddProject(fullName);
    }
  };

  // Eliminar proyecto
  const handleDelete = async (projectName) => {
    const stats = getProjectStats(projectName);
    const message = stats.total > 0
      ? `¿Eliminar "${projectName}"?\n\n${stats.total} tarea(s) perderán la asignación.`
      : `¿Eliminar "${projectName}"?`;

    if (confirm(message) && onDeleteProject) {
      await onDeleteProject(projectName);
    }
  };

  // Renderizar subproyecto
  const SubprojectItem = ({ project, categoryColor }) => {
    const stats = getProjectStats(project.name);
    const subName = project.name.split('>')[1]?.trim() || project.name;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px 10px 40px',
        marginBottom: '4px',
        background: PALETTE.bone,
        borderRadius: '8px',
        border: `1px solid ${PALETTE.faint}`,
        borderLeft: `3px solid ${categoryColor}`,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.warm}
      onMouseLeave={(e) => e.currentTarget.style.background = PALETTE.bone}
      >
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: PALETTE.ink,
            marginBottom: '4px'
          }}>
            {subName}
          </div>
          <div style={{ fontSize: '11px', color: PALETTE.muted }}>
            {stats.total} tarea{stats.total !== 1 ? 's' : ''} · {stats.completed} completada{stats.completed !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Barra de progreso mini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '80px',
            height: '6px',
            background: PALETTE.faint,
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${stats.percentage}%`,
              height: '100%',
              background: categoryColor,
              transition: 'width 0.3s'
            }} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: categoryColor,
            minWidth: '35px',
            fontFamily: 'var(--font-mono)'
          }}>
            {stats.percentage}%
          </span>

          {/* Botón eliminar */}
          <button
            onClick={() => handleDelete(project.name)}
            style={{
              padding: '4px',
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = PALETTE.danger + '20'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 size={12} color={PALETTE.danger} />
          </button>
        </div>
      </div>
    );
  };

  // Renderizar categoría principal
  const CategorySection = ({ category }) => {
    const categoryData = hierarchy[category.id];
    const isExpanded = expanded[category.id];
    const allTasks = tasks.filter(t => {
      const projectName = t.project?.toLowerCase() || '';
      return projectName.includes(category.id) ||
             projectName.includes(category.name.toLowerCase().split(' ')[0]);
    });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'Hecho').length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Aplicar filtro
    if (filter !== 'all' && filter !== category.id) return null;

    return (
      <div style={{ marginBottom: '16px' }}>
        {/* Header de categoría */}
        <div
          onClick={() => toggle(category.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
            borderRadius: '12px',
            border: `2px solid ${category.color}30`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: isExpanded ? '12px' : '0'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${category.color}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            {isExpanded ? <ChevronDown size={18} color={category.color} /> : <ChevronRight size={18} color={category.color} />}
            <span style={{ fontSize: '20px' }}>{category.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '17px',
                fontWeight: '700',
                color: PALETTE.ink,
                fontFamily: SERIF,
                marginBottom: '2px'
              }}>
                {category.name}
              </div>
              <div style={{ fontSize: '12px', color: PALETTE.soft }}>
                {categoryData.children.length} subproyecto{categoryData.children.length !== 1 ? 's' : ''} · {totalTasks} tarea{totalTasks !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '200px' }}>
            <div style={{
              flex: 1,
              height: '10px',
              background: PALETTE.faint,
              borderRadius: '5px',
              overflow: 'hidden',
              border: `1px solid ${category.color}20`
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${category.color}, ${category.color}dd)`,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: category.color,
              minWidth: '45px',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)'
            }}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Subproyectos */}
        {isExpanded && (
          <div style={{ paddingLeft: '12px' }}>
            {categoryData.children.map(project => (
              <SubprojectItem
                key={project.id}
                project={project}
                categoryColor={category.color}
              />
            ))}

            {/* Botón añadir subproyecto */}
            <button
              onClick={() => handleAddSubproject(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px 10px 40px',
                marginTop: '8px',
                background: 'transparent',
                border: `1px dashed ${PALETTE.faint}`,
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                color: PALETTE.soft,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = category.color + '08';
                e.currentTarget.style.borderColor = category.color + '40';
                e.currentTarget.style.color = category.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = PALETTE.faint;
                e.currentTarget.style.color = PALETTE.soft;
              }}
            >
              <Plus size={14} />
              Añadir subproyecto a {category.name}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '20px',
        background: PALETTE.warm,
        borderRadius: '12px',
        border: `1px solid ${PALETTE.faint}`
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '600',
            color: PALETTE.ink,
            fontFamily: SERIF,
            marginBottom: '6px'
          }}>
            Estructura de Proyectos
          </h2>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: PALETTE.soft
          }}>
            Organiza tus proyectos por categoría y subproyectos
          </p>
        </div>

        {/* Filtros rápidos */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} color={PALETTE.soft} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              border: `1px solid ${PALETTE.faint}`,
              borderRadius: '8px',
              background: PALETTE.bone,
              color: PALETTE.ink,
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="all">Todos</option>
            <option value="global">🌍 Solo Global</option>
            <option value="e1">🏢 Solo E1 Madrid</option>
            <option value="e2">🏙️ Solo E2 Barcelona</option>
            <option value="e3">🚀 Solo E3 México</option>
          </select>
        </div>
      </div>

      {/* Categorías */}
      {CATEGORIES.map(category => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}
