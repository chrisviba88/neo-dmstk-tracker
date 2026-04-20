/**
 * EXECUTIVE DASHBOARD - FRACTAL VERSION
 * TODA métrica es clickeable y muestra pop-up con información profunda
 * - Click en "109 tareas" → Lista de las 109 tareas
 * - Click en "Completadas" → Lista de completadas
 * - Click en "Esta semana" → Tareas de esta semana
 * - TODO es editable
 * - Navegación fractal (click en tarea → modal 5Ws)
 */

import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Calendar, Target, Activity, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  calculateHealthScore,
  getHealthColor,
  SEMANTIC_COLORS
} from '../utils/semanticColors';
import ProgressRing, { ProgressRingGrid } from './ProgressRing';
import FiveDayCalendar from './FiveDayCalendar';
import FractalPopup from './FractalPopup';

// Alias cortos para facilitar acceso
const STATUS_COLORS = SEMANTIC_COLORS.taskStatus;
const TEMPORAL_COLORS = SEMANTIC_COLORS.temporal;

const PALETTE = {
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  warm: "#F3EDE6",
  cream: "#FAF8F4",
};

const WORKSTREAM_COLORS = {
  'Dirección': { color: PALETTE.ink, icon: '🎯' },
  'Legal': { color: '#8B5A3C', icon: '⚖️' },
  'Producto': { color: '#6398A9', icon: '📦' },
  'Comunicación': { color: '#E2B93B', icon: '📢' },
  'Sponsor': { color: '#D7897F', icon: '🤝' },
  'Branding': { color: '#9B59B6', icon: '🎨' },
  'Pilot-Ventas': { color: '#96C7B3', icon: '🚀' },
  'Ops-Prod': { color: '#3498DB', icon: '⚙️' },
  'Profesor-Contenido': { color: '#E74C3C', icon: '📚' },
  'Obras': { color: '#95A5A6', icon: '🏗️' }
};

export default function ExecutiveDashboard({ tasks, owners = [], onTaskClick, onWorkstreamClick, onUpdateTask }) {
  const [popup, setPopup] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    global: true,
    e1: true,
    e2: false,
    expansion: false,
    otros: false
  });

  // Calcular métricas
  const metrics = useMemo(() => {
    // Filtrar tasks por owner si hay uno seleccionado
    const filteredTasks = selectedOwner ? tasks.filter(t => t.owner === selectedOwner) : tasks;

    const healthScore = calculateHealthScore(filteredTasks);
    const healthConfig = getHealthColor(healthScore);

    const milestones = filteredTasks
      .filter(t => t.isMilestone)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5);

    const workstreams = Object.keys(WORKSTREAM_COLORS).map(wsName => {
      const wsTasks = filteredTasks.filter(t => t.ws === wsName);
      const completed = wsTasks.filter(t => t.status === 'Hecho').length;
      const inProgress = wsTasks.filter(t => t.status === 'En curso').length;
      const pending = wsTasks.filter(t => t.status === 'Pendiente').length;
      const overdue = wsTasks.filter(t => {
        const endDate = new Date(t.endDate);
        return t.status !== 'Hecho' && endDate < new Date();
      }).length;

      return {
        name: wsName,
        icon: WORKSTREAM_COLORS[wsName].icon,
        color: WORKSTREAM_COLORS[wsName].color,
        total: wsTasks.length,
        completed,
        inProgress,
        pending,
        overdue,
        tasks: wsTasks,
      };
    }).filter(ws => ws.total > 0);

    const completedTasks = filteredTasks.filter(t => t.status === 'Hecho');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'En curso');
    const overdueTasks = filteredTasks.filter(t => {
      const endDate = new Date(t.endDate);
      return t.status !== 'Hecho' && endDate < new Date();
    });

    // Tareas de esta semana
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    const thisWeekTasks = filteredTasks.filter(t => {
      const endDate = new Date(t.endDate);
      return endDate >= today && endDate <= weekEnd;
    });

    return {
      healthScore,
      healthConfig,
      milestones,
      workstreams,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      thisWeekTasks,
      totalTasks: filteredTasks.length,
      completionRate: filteredTasks.length > 0 ? Math.round((completedTasks.length / filteredTasks.length) * 100) : 0,
    };
  }, [tasks, selectedOwner]);

  // Calcular progreso por proyecto con jerarquía
  const projectProgress = useMemo(() => {
    const projectMap = {};
    tasks.forEach(task => {
      const proj = task.project || 'Sin proyecto';
      if (!projectMap[proj]) {
        projectMap[proj] = { total: 0, completed: 0, tasks: [] };
      }
      projectMap[proj].total++;
      if (task.status === 'Hecho') projectMap[proj].completed++;
      projectMap[proj].tasks.push(task);
    });

    // Organizar proyectos por jerarquía
    const global = [];
    const e1 = [];
    const e2 = [];
    const expansion = [];
    const otros = [];

    Object.entries(projectMap).forEach(([name, data]) => {
      const project = {
        name,
        total: data.total,
        completed: data.completed,
        percentage: Math.round((data.completed / data.total) * 100),
        tasks: data.tasks
      };

      if (name.startsWith('Global:')) {
        global.push(project);
      } else if (name.includes('E1') || name.includes('Madrid')) {
        e1.push(project);
      } else if (name.includes('E2') || name.includes('Barcelona')) {
        e2.push(project);
      } else if (name.includes('E3') || name.includes('México') || name.includes('CDMX')) {
        expansion.push(project);
      } else {
        otros.push(project);
      }
    });

    return {
      global: global.sort((a, b) => b.total - a.total),
      e1: e1.sort((a, b) => b.total - a.total),
      e2: e2.sort((a, b) => b.total - a.total),
      expansion: expansion.sort((a, b) => b.total - a.total),
      otros: otros.sort((a, b) => b.total - a.total)
    };
  }, [tasks]);

  // Calcular progreso por hitos (milestone-based)
  const milestoneProgress = useMemo(() => {
    return tasks
      .filter(t => t.isMilestone)
      .map(milestone => {
        // Encontrar tareas que bloquean este hito (dependencias inversas)
        const prereqTasks = tasks.filter(t =>
          Array.isArray(milestone.deps) && milestone.deps.includes(t.id)
        );

        const completed = prereqTasks.filter(t => t.status === 'Hecho').length;
        const total = prereqTasks.length || 1; // Evitar división por 0

        return {
          id: milestone.id,
          name: milestone.name,
          endDate: milestone.endDate,
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
          status: milestone.status,
          prereqTasks
        };
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [tasks]);

  // Handlers para pop-ups
  const showAllTasks = () => {
    setPopup({
      type: 'all-tasks',
      title: 'Todas las Tareas',
      subtitle: `${tasks.length} tareas en total`,
      icon: '📋',
      items: tasks.map(t => ({
        id: t.id,
        name: t.name,
        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
        ...getTaskStyle(t),
      })),
      stats: [
        { label: 'Total', value: tasks.length, color: PALETTE.ink },
        { label: 'Completadas', value: metrics.completedTasks.length, color: STATUS_COLORS['Hecho'].text },
        { label: 'En curso', value: metrics.inProgressTasks.length, color: STATUS_COLORS['En curso'].text },
        { label: 'Vencidas', value: metrics.overdueTasks.length, color: TEMPORAL_COLORS.overdue.text },
      ],
    });
  };

  const showCompletedTasks = () => {
    setPopup({
      type: 'completed',
      title: 'Tareas Completadas',
      subtitle: `${metrics.completedTasks.length} tareas finalizadas`,
      icon: '✅',
      items: metrics.completedTasks.map(t => ({
        id: t.id,
        name: t.name,
        subtitle: `${t.ws} • Completada el ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
        ...getTaskStyle(t),
      })),
    });
  };

  const showOverdueTasks = () => {
    setPopup({
      type: 'overdue',
      title: 'Tareas Vencidas',
      subtitle: `${metrics.overdueTasks.length} tareas requieren atención`,
      icon: '⚠️',
      items: metrics.overdueTasks.map(t => {
        const daysOverdue = Math.ceil((new Date() - new Date(t.endDate)) / (1000 * 60 * 60 * 24));
        return {
          id: t.id,
          name: t.name,
          subtitle: `${t.ws} • Vencida hace ${daysOverdue} días`,
          ...getTaskStyle(t),
        };
      }),
    });
  };

  const showThisWeekTasks = () => {
    setPopup({
      type: 'this-week',
      title: 'Tareas de Esta Semana',
      subtitle: `${metrics.thisWeekTasks.length} tareas con vencimiento próximo`,
      icon: '📅',
      items: metrics.thisWeekTasks.map(t => {
        const daysUntil = Math.ceil((new Date(t.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          id: t.id,
          name: t.name,
          subtitle: `${t.ws} • Vence en ${daysUntil} días`,
          ...getTaskStyle(t),
        };
      }),
    });
  };

  const showInProgressTasks = () => {
    setPopup({
      type: 'in-progress',
      title: 'Tareas en Curso',
      subtitle: `${metrics.inProgressTasks.length} tareas activas`,
      icon: '🔄',
      items: metrics.inProgressTasks.map(t => ({
        id: t.id,
        name: t.name,
        subtitle: `${t.ws} • ${t.owner || 'Sin asignar'}`,
        ...getTaskStyle(t),
      })),
    });
  };

  return (
    <div style={{
      padding: '24px',
      background: PALETTE.cream,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: PALETTE.ink,
              marginBottom: 8,
            }}>
              Dashboard Ejecutivo
            </h1>
            <p style={{
              margin: 0,
              fontSize: 16,
              color: PALETTE.soft,
            }}>
              Vista general del proyecto NEO DMSTK • Todo es clickeable para profundizar
            </p>
          </div>

          {/* Filtro por Owner */}
          {owners && (
            <div style={{ minWidth: 200 }}>
              <label style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: PALETTE.muted,
                display: 'block',
                marginBottom: 6,
              }}>
                Filtrar por responsable
              </label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.faint}`,
                  background: PALETTE.bone,
                  color: PALETTE.ink,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">Todos los responsables</option>
                {Array.from(new Set([...owners, ...tasks.map(t => t.owner).filter(Boolean)])).sort().map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
              {selectedOwner && (
                <button
                  onClick={() => setSelectedOwner('')}
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: `1px solid ${PALETTE.faint}`,
                    background: 'transparent',
                    color: PALETTE.soft,
                    cursor: 'pointer',
                  }}
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Row: Health Score + Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Health Score - CLICKEABLE */}
        <ClickableCard
          onClick={showAllTasks}
          style={{
            background: PALETTE.bone,
            border: `2px solid ${metrics.healthConfig.border || metrics.healthConfig.text}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <TrendingUp size={18} color={metrics.healthConfig.text} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>
              Salud del Proyecto
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: metrics.healthConfig.text, lineHeight: 1 }}>
              {metrics.healthScore}
            </div>
            <div>
              <div style={{ fontSize: 24, lineHeight: 1 }}>{metrics.healthConfig.icon}</div>
              <div style={{ fontSize: 11, color: metrics.healthConfig.text, fontWeight: 600 }}>
                {metrics.healthConfig.meaning}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 12,
            color: PALETTE.soft,
            fontStyle: 'italic',
          }}>
            Click para ver todas las tareas
          </div>
        </ClickableCard>

        {/* Completadas - CLICKEABLE */}
        <ClickableCard onClick={showCompletedTasks}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CheckCircle size={18} color={STATUS_COLORS['Hecho'].text} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>
              Tareas Completadas
            </span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: STATUS_COLORS['Hecho'].text, lineHeight: 1 }}>
            {metrics.completedTasks.length}
          </div>
          <div style={{ fontSize: 12, color: PALETTE.soft, marginTop: 8 }}>
            {metrics.completionRate}% del total
          </div>
        </ClickableCard>

        {/* En Curso - CLICKEABLE */}
        <ClickableCard onClick={showInProgressTasks}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Clock size={18} color={STATUS_COLORS['En curso'].text} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>
              En Curso
            </span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: STATUS_COLORS['En curso'].text, lineHeight: 1 }}>
            {metrics.inProgressTasks.length}
          </div>
          <div style={{ fontSize: 12, color: PALETTE.soft, marginTop: 8 }}>
            Tareas activas ahora
          </div>
        </ClickableCard>

        {/* Vencidas - CLICKEABLE */}
        <ClickableCard onClick={showOverdueTasks}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <AlertCircle size={18} color={TEMPORAL_COLORS.overdue.text} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>
              Vencidas
            </span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: TEMPORAL_COLORS.overdue.text, lineHeight: 1 }}>
            {metrics.overdueTasks.length}
          </div>
          <div style={{ fontSize: 12, color: PALETTE.soft, marginTop: 8 }}>
            Requieren atención
          </div>
        </ClickableCard>

        {/* Esta Semana - CLICKEABLE */}
        <ClickableCard onClick={showThisWeekTasks}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Calendar size={18} color={TEMPORAL_COLORS.dueSoon.text} />
            <span style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink }}>
              Esta Semana
            </span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: TEMPORAL_COLORS.dueSoon.text, lineHeight: 1 }}>
            {metrics.thisWeekTasks.length}
          </div>
          <div style={{ fontSize: 12, color: PALETTE.soft, marginTop: 8 }}>
            Próximos 7 días
          </div>
        </ClickableCard>
      </div>

      {/* 5-Day Calendar */}
      <div style={{ marginBottom: 24 }}>
        <FiveDayCalendar tasks={tasks} onTaskClick={onTaskClick} onUpdateTask={onUpdateTask} />
      </div>

      {/* Progreso por Proyecto - Jerarquía Colapsable */}
      <div style={{
        background: PALETTE.bone,
        border: `1px solid ${PALETTE.faint}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${PALETTE.faint}`,
        }}>
          <Activity size={20} color={PALETTE.soft} />
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: PALETTE.ink,
          }}>
            Progreso por Proyecto • Organizado por Jerarquía
          </h3>
        </div>

        {/* NIVEL 1: Proyectos Globales */}
        {projectProgress.global.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              onClick={() => setExpandedCategories(prev => ({ ...prev, global: !prev.global }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: PALETTE.warm,
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: expandedCategories.global ? 12 : 0,
                border: `1px solid ${PALETTE.faint}`,
              }}
            >
              {expandedCategories.global ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                🌍 PROYECTOS GLOBALES
              </span>
              <span style={{ fontSize: 11, color: PALETTE.muted, marginLeft: 'auto' }}>
                {projectProgress.global.length} proyecto{projectProgress.global.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expandedCategories.global && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                paddingLeft: 16,
              }}>
                {projectProgress.global.map(proj => (
                  <ClickableCard
                    key={proj.name}
                    onClick={() => setPopup({
                      type: 'project',
                      title: proj.name,
                      subtitle: `${proj.completed}/${proj.total} tareas completadas`,
                      icon: '🌍',
                      items: proj.tasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                        ...getTaskStyle(t),
                      })),
                    })}
                    style={{
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.faint}`,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 6 }}>
                      {proj.name.replace('Global: ', '')}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                      {proj.completed}/{proj.total} tareas
                    </div>
                    <div style={{
                      height: 6,
                      background: PALETTE.faint,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${proj.percentage}%`,
                        background: proj.percentage === 100 ? '#96C7B3' : '#6398A9',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, marginTop: 6 }}>
                      {proj.percentage}%
                    </div>
                  </ClickableCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NIVEL 2: E1 Madrid */}
        {projectProgress.e1.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              onClick={() => setExpandedCategories(prev => ({ ...prev, e1: !prev.e1 }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: PALETTE.warm,
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: expandedCategories.e1 ? 12 : 0,
                border: `1px solid ${PALETTE.faint}`,
              }}
            >
              {expandedCategories.e1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                🏢 E1 MADRID
              </span>
              <span style={{ fontSize: 11, color: PALETTE.muted, marginLeft: 'auto' }}>
                {projectProgress.e1.length} proyecto{projectProgress.e1.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expandedCategories.e1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                paddingLeft: 16,
              }}>
                {projectProgress.e1.map(proj => (
                  <ClickableCard
                    key={proj.name}
                    onClick={() => setPopup({
                      type: 'project',
                      title: proj.name,
                      subtitle: `${proj.completed}/${proj.total} tareas completadas`,
                      icon: '🏢',
                      items: proj.tasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                        ...getTaskStyle(t),
                      })),
                    })}
                    style={{
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.faint}`,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 6 }}>
                      {proj.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                      {proj.completed}/{proj.total} tareas
                    </div>
                    <div style={{
                      height: 6,
                      background: PALETTE.faint,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${proj.percentage}%`,
                        background: proj.percentage === 100 ? '#96C7B3' : '#6398A9',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, marginTop: 6 }}>
                      {proj.percentage}%
                    </div>
                  </ClickableCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NIVEL 3: E2 Barcelona */}
        {projectProgress.e2.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              onClick={() => setExpandedCategories(prev => ({ ...prev, e2: !prev.e2 }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: PALETTE.warm,
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: expandedCategories.e2 ? 12 : 0,
                border: `1px solid ${PALETTE.faint}`,
              }}
            >
              {expandedCategories.e2 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                🏙️ E2 BARCELONA
              </span>
              <span style={{ fontSize: 11, color: PALETTE.muted, marginLeft: 'auto' }}>
                {projectProgress.e2.length} proyecto{projectProgress.e2.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expandedCategories.e2 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                paddingLeft: 16,
              }}>
                {projectProgress.e2.map(proj => (
                  <ClickableCard
                    key={proj.name}
                    onClick={() => setPopup({
                      type: 'project',
                      title: proj.name,
                      subtitle: `${proj.completed}/${proj.total} tareas completadas`,
                      icon: '🏙️',
                      items: proj.tasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                        ...getTaskStyle(t),
                      })),
                    })}
                    style={{
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.faint}`,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 6 }}>
                      {proj.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                      {proj.completed}/{proj.total} tareas
                    </div>
                    <div style={{
                      height: 6,
                      background: PALETTE.faint,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${proj.percentage}%`,
                        background: proj.percentage === 100 ? '#96C7B3' : '#6398A9',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, marginTop: 6 }}>
                      {proj.percentage}%
                    </div>
                  </ClickableCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NIVEL 4: Expansión Futura */}
        {projectProgress.expansion.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div
              onClick={() => setExpandedCategories(prev => ({ ...prev, expansion: !prev.expansion }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: PALETTE.warm,
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: expandedCategories.expansion ? 12 : 0,
                border: `1px solid ${PALETTE.faint}`,
              }}
            >
              {expandedCategories.expansion ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                🚀 EXPANSIÓN FUTURA
              </span>
              <span style={{ fontSize: 11, color: PALETTE.muted, marginLeft: 'auto' }}>
                {projectProgress.expansion.length} proyecto{projectProgress.expansion.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expandedCategories.expansion && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                paddingLeft: 16,
              }}>
                {projectProgress.expansion.map(proj => (
                  <ClickableCard
                    key={proj.name}
                    onClick={() => setPopup({
                      type: 'project',
                      title: proj.name,
                      subtitle: `${proj.completed}/${proj.total} tareas completadas`,
                      icon: '🚀',
                      items: proj.tasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                        ...getTaskStyle(t),
                      })),
                    })}
                    style={{
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.faint}`,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 6 }}>
                      {proj.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                      {proj.completed}/{proj.total} tareas
                    </div>
                    <div style={{
                      height: 6,
                      background: PALETTE.faint,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${proj.percentage}%`,
                        background: proj.percentage === 100 ? '#96C7B3' : '#6398A9',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, marginTop: 6 }}>
                      {proj.percentage}%
                    </div>
                  </ClickableCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Otros proyectos */}
        {projectProgress.otros.length > 0 && (
          <div>
            <div
              onClick={() => setExpandedCategories(prev => ({ ...prev, otros: !prev.otros }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: PALETTE.warm,
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: expandedCategories.otros ? 12 : 0,
                border: `1px solid ${PALETTE.faint}`,
              }}
            >
              {expandedCategories.otros ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.ink, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                📁 OTROS PROYECTOS
              </span>
              <span style={{ fontSize: 11, color: PALETTE.muted, marginLeft: 'auto' }}>
                {projectProgress.otros.length} proyecto{projectProgress.otros.length !== 1 ? 's' : ''}
              </span>
            </div>

            {expandedCategories.otros && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                paddingLeft: 16,
              }}>
                {projectProgress.otros.map(proj => (
                  <ClickableCard
                    key={proj.name}
                    onClick={() => setPopup({
                      type: 'project',
                      title: proj.name,
                      subtitle: `${proj.completed}/${proj.total} tareas completadas`,
                      icon: '📁',
                      items: proj.tasks.map(t => ({
                        id: t.id,
                        name: t.name,
                        subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                        ...getTaskStyle(t),
                      })),
                    })}
                    style={{
                      background: PALETTE.bone,
                      border: `1px solid ${PALETTE.faint}`,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.ink, marginBottom: 6 }}>
                      {proj.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.soft, marginBottom: 8 }}>
                      {proj.completed}/{proj.total} tareas
                    </div>
                    <div style={{
                      height: 6,
                      background: PALETTE.faint,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${proj.percentage}%`,
                        background: proj.percentage === 100 ? '#96C7B3' : '#6398A9',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: PALETTE.ink, marginTop: 6 }}>
                      {proj.percentage}%
                    </div>
                  </ClickableCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progreso hacia Hitos */}
      {milestoneProgress.length > 0 && (
        <div style={{
          background: PALETTE.bone,
          border: `1px solid ${PALETTE.faint}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `1px solid ${PALETTE.faint}`,
          }}>
            <Target size={20} color={PALETTE.mostaza} />
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: PALETTE.ink,
            }}>
              Progreso hacia Hitos • Click para ver prerequisitos
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}>
            {milestoneProgress.slice(0, 6).map(milestone => {
              const daysUntil = Math.ceil((new Date(milestone.endDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysUntil < 0 && milestone.status !== 'Hecho';
              const isDueSoon = daysUntil >= 0 && daysUntil <= 14 && milestone.status !== 'Hecho';

              return (
                <ClickableCard
                  key={milestone.id}
                  onClick={() => setPopup({
                    type: 'milestone',
                    title: milestone.name,
                    subtitle: `${milestone.completed}/${milestone.total} prerequisitos completados`,
                    icon: '◆',
                    items: milestone.prereqTasks.map(t => ({
                      id: t.id,
                      name: t.name,
                      subtitle: `${t.ws} • ${t.status} • ${new Date(t.endDate).toLocaleDateString('es-ES')}`,
                      ...getTaskStyle(t),
                    })),
                  })}
                  style={{
                    background: PALETTE.bone,
                    border: `1px solid ${PALETTE.faint}`,
                    borderLeft: `4px solid ${isOverdue ? TEMPORAL_COLORS.overdue.text : isDueSoon ? TEMPORAL_COLORS.dueSoon.text : PALETTE.mostaza}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16, color: PALETTE.mostaza }}>◆</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.ink, marginBottom: 2 }}>
                        {milestone.name}
                      </div>
                      <div style={{ fontSize: 11, color: PALETTE.soft }}>
                        {new Date(milestone.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isOverdue && <span style={{ color: TEMPORAL_COLORS.overdue.text, marginLeft: 6 }}>Vencido hace {Math.abs(daysUntil)} días</span>}
                        {isDueSoon && <span style={{ color: TEMPORAL_COLORS.dueSoon.text, marginLeft: 6 }}>En {daysUntil} días</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    height: 6,
                    background: PALETTE.faint,
                    borderRadius: 3,
                    overflow: 'hidden',
                    marginBottom: 8,
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${milestone.percentage}%`,
                      background: milestone.status === 'Hecho' ? STATUS_COLORS['Hecho'].text :
                                 isOverdue ? TEMPORAL_COLORS.overdue.text :
                                 PALETTE.mostaza,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: PALETTE.soft }}>
                      {milestone.completed}/{milestone.total} prerequisitos
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: PALETTE.ink }}>
                      {milestone.percentage}%
                    </div>
                  </div>
                </ClickableCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Rings por Workstream */}
      <div style={{
        background: PALETTE.bone,
        border: `1px solid ${PALETTE.faint}`,
        borderRadius: 12,
        padding: 20,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: `1px solid ${PALETTE.faint}`,
        }}>
          <Target size={20} color={PALETTE.soft} />
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: PALETTE.ink,
          }}>
            Progreso por Workstream • Click para detalles
          </h3>
        </div>

        <ProgressRingGrid
          workstreams={metrics.workstreams}
          onWorkstreamClick={onWorkstreamClick}
        />
      </div>

      {/* Fractal Popup */}
      {popup && (
        <FractalPopup
          isOpen={true}
          onClose={() => setPopup(null)}
          title={popup.title}
          subtitle={popup.subtitle}
          icon={popup.icon}
          items={popup.items}
          stats={popup.stats}
          onItemClick={(item) => {
            const task = tasks.find(t => t.id === item.id);
            if (task && onTaskClick) {
              onTaskClick(task);
            }
          }}
          onItemEdit={(id, newName) => {
            if (onUpdateTask) {
              onUpdateTask(id, { name: newName });
            }
          }}
        />
      )}
    </div>
  );
}

/**
 * Helper: Clickable Card
 */
function ClickableCard({ onClick, children, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: PALETTE.bone,
        border: `1px solid ${PALETTE.faint}`,
        borderRadius: 12,
        padding: 20,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
    </div>
  );
}

/**
 * Helper: Get task styling based on status/temporal
 */
function getTaskStyle(task) {
  const endDate = new Date(task.endDate);
  const today = new Date();
  const isOverdue = task.status !== 'Hecho' && endDate < today;
  const isDueSoon = !isOverdue && endDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Determinar el estilo basado en el estado de la tarea
  let style = STATUS_COLORS['Pendiente']; // default
  if (task.status === 'Hecho') {
    style = STATUS_COLORS['Hecho'];
  } else if (task.status === 'En curso') {
    style = STATUS_COLORS['En curso'];
  }

  // Los indicadores temporales tienen prioridad sobre el estado
  if (isOverdue) style = TEMPORAL_COLORS.overdue;
  else if (isDueSoon) style = TEMPORAL_COLORS.dueSoon;

  return {
    bg: style.bg,
    borderColor: style.border,
    textColor: style.text,
    icon: style.icon,
  };
}
