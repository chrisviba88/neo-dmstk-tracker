/**
 * EXECUTIVE DASHBOARD
 * Dashboard profesional con métricas clave, gráficos y calendario
 *
 * Componentes:
 * - Health Score del proyecto
 * - Próximos 5 hitos
 * - Calendario de 5 días laborables
 * - Progress rings por workstream (click para ver 5Ws)
 * - Burn-down chart
 */

import { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Calendar, Target, Activity } from 'lucide-react';
import {
  calculateHealthScore,
  getHealthColor,
  SEMANTIC_COLORS
} from '../utils/semanticColors';
import ProgressRing, { ProgressRingGrid } from './ProgressRing';
import FiveDayCalendar from './FiveDayCalendar';

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

export default function ExecutiveDashboard({ tasks, onTaskClick, onWorkstreamClick }) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Calcular métricas
  const metrics = useMemo(() => {
    const healthScore = calculateHealthScore(tasks);
    const healthConfig = getHealthColor(healthScore);

    const milestones = tasks
      .filter(t => t.isMilestone)
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5);

    const workstreams = Object.keys(WORKSTREAM_COLORS).map(wsName => {
      const wsTasks = tasks.filter(t => t.ws === wsName);
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
      };
    }).filter(ws => ws.total > 0);

    const completedTasks = tasks.filter(t => t.status === 'Hecho').length;
    const totalTasks = tasks.length;

    return {
      healthScore,
      healthConfig,
      milestones,
      workstreams,
      completedTasks,
      totalTasks,
      completionRate: Math.round((completedTasks / totalTasks) * 100),
    };
  }, [tasks]);

  return (
    <div style={{
      padding: '24px',
      background: PALETTE.cream,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
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
          Vista general del proyecto NEO DMSTK
        </p>
      </div>

      {/* Top Row: Health Score + Upcoming Milestones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Health Score Card */}
        <HealthScoreCard
          score={metrics.healthScore}
          config={metrics.healthConfig}
          completionRate={metrics.completionRate}
          completedTasks={metrics.completedTasks}
          totalTasks={metrics.totalTasks}
        />

        {/* Upcoming Milestones Card */}
        <UpcomingMilestonesCard
          milestones={metrics.milestones}
          onMilestoneClick={onTaskClick}
        />
      </div>

      {/* 5-Day Calendar */}
      <div style={{ marginBottom: 24 }}>
        <FiveDayCalendar tasks={tasks} onTaskClick={onTaskClick} />
      </div>

      {/* Progress Rings por Workstream */}
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
          <Target size={20} color={PALETTE.soft} />
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: PALETTE.ink,
          }}>
            Progreso por Workstream
          </h3>
        </div>

        <ProgressRingGrid
          workstreams={metrics.workstreams}
          onWorkstreamClick={onWorkstreamClick}
        />
      </div>

      {/* Burn-down Chart (Placeholder - will add Recharts) */}
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
        }}>
          <Activity size={20} color={PALETTE.soft} />
          <h3 style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: PALETTE.ink,
          }}>
            Gráfico de Avance
          </h3>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: PALETTE.muted,
        }}>
          <Activity size={48} color={PALETTE.faint} style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14 }}>
            Gráfico de burn-down próximamente
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Health Score Card
 */
function HealthScoreCard({ score, config, completionRate, completedTasks, totalTasks }) {
  return (
    <div style={{
      background: PALETTE.bone,
      border: `2px solid ${config.border || config.text}`,
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <TrendingUp size={20} color={config.text} />
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: PALETTE.ink,
        }}>
          Salud del Proyecto
        </h3>
      </div>

      {/* Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 700,
          color: config.text,
          lineHeight: 1,
        }}>
          {score}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{ fontSize: 32, lineHeight: 1 }}>{config.icon}</div>
          <div style={{
            fontSize: 12,
            color: config.text,
            fontWeight: 600,
          }}>
            {config.meaning}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: 13,
          color: PALETTE.soft,
        }}>
          <span>Progreso del proyecto</span>
          <span>{completionRate}%</span>
        </div>
        <div style={{
          height: 8,
          background: PALETTE.faint,
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: config.text,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{
          fontSize: 11,
          color: PALETTE.muted,
          marginTop: 6,
        }}>
          {completedTasks} de {totalTasks} tareas completadas
        </div>
      </div>
    </div>
  );
}

/**
 * Upcoming Milestones Card
 */
function UpcomingMilestonesCard({ milestones, onMilestoneClick }) {
  return (
    <div style={{
      background: PALETTE.bone,
      border: `1px solid ${PALETTE.faint}`,
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottom: `1px solid ${PALETTE.faint}`,
      }}>
        <Calendar size={20} color={PALETTE.soft} />
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: PALETTE.ink,
        }}>
          Próximos 5 Hitos
        </h3>
      </div>

      {/* Milestone list */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {milestones.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: PALETTE.muted,
          }}>
            <Target size={48} color={PALETTE.faint} style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              No hay hitos programados
            </p>
          </div>
        ) : (
          milestones.map(milestone => {
            const daysUntil = Math.ceil(
              (new Date(milestone.endDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

            const statusColor = isOverdue
              ? SEMANTIC_COLORS.temporal.overdue
              : isDueSoon
              ? SEMANTIC_COLORS.temporal.dueSoon
              : SEMANTIC_COLORS.temporal.future;

            return (
              <div
                key={milestone.id}
                onClick={() => onMilestoneClick && onMilestoneClick(milestone)}
                style={{
                  padding: '12px 16px',
                  background: statusColor.bg,
                  border: `1px solid ${statusColor.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: statusColor.text,
                  }}>
                    {statusColor.icon} {milestone.name}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: statusColor.text,
                }}>
                  <span>{new Date(milestone.endDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                  <span style={{ fontWeight: 600 }}>
                    {isOverdue
                      ? `Vencido hace ${Math.abs(daysUntil)} días`
                      : `En ${daysUntil} días`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
