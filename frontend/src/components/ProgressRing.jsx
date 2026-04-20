/**
 * PROGRESS RING - Anillo de progreso visual
 * Muestra el progreso de un workstream o milestone de manera visual
 * Al hacer click, muestra las 5Ws (Who, What, When, Where, Why)
 */

import { useState } from 'react';
import { SEMANTIC_COLORS } from '../utils/semanticColors';

const PALETTE = {
  ink: "#2C2926",
  soft: "#5C5650",
  muted: "#9A948C",
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  warm: "#F3EDE6",
};

export default function ProgressRing({
  label,
  icon,
  total,
  completed,
  inProgress,
  pending,
  overdue,
  color = '#6398A9',
  size = 120,
  strokeWidth = 12,
  onClick,
  showDetails = true
}) {
  const [isHovered, setIsHovered] = useState(false);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determinar color del anillo según health
  const getRingColor = () => {
    if (overdue > 0) return SEMANTIC_COLORS.temporal.overdue.border;
    if (percentage >= 90) return SEMANTIC_COLORS.health.excellent.text;
    if (percentage >= 70) return SEMANTIC_COLORS.health.good.text;
    if (percentage >= 50) return SEMANTIC_COLORS.health.warning.text;
    return SEMANTIC_COLORS.health.critical.text;
  };

  const ringColor = getRingColor();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        transform: isHovered && onClick ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* SVG Ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={PALETTE.faint}
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}>
          {icon && <div style={{ fontSize: 24 }}>{icon}</div>}
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: PALETTE.ink,
          }}>
            {percentage}%
          </div>
          {showDetails && (
            <div style={{
              fontSize: 10,
              color: PALETTE.muted,
              textAlign: 'center',
            }}>
              {completed}/{total}
            </div>
          )}
        </div>

        {/* Warning indicator for overdue tasks */}
        {overdue > 0 && (
          <div style={{
            position: 'absolute',
            top: -8,
            right: -8,
            background: SEMANTIC_COLORS.temporal.overdue.bg,
            color: SEMANTIC_COLORS.temporal.overdue.text,
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            border: `2px solid ${PALETTE.bone}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            {overdue}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        textAlign: 'center',
        maxWidth: size + 40,
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: PALETTE.ink,
          marginBottom: 4,
        }}>
          {label}
        </div>

        {/* Breakdown */}
        {showDetails && (
          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            fontSize: 11,
            color: PALETTE.muted,
          }}>
            {inProgress > 0 && (
              <span style={{ color: SEMANTIC_COLORS.taskStatus['En curso'].text }}>
                🔄 {inProgress}
              </span>
            )}
            {pending > 0 && (
              <span style={{ color: PALETTE.soft }}>
                ⏸️ {pending}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover tooltip */}
      {isHovered && onClick && (
        <div style={{
          position: 'absolute',
          bottom: -40,
          background: PALETTE.ink,
          color: PALETTE.bone,
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 11,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          animation: 'slideIn 0.2s ease',
        }}>
          Click para ver detalles →
        </div>
      )}
    </div>
  );
}

/**
 * Grid de progress rings para múltiples workstreams
 */
export function ProgressRingGrid({ workstreams, onWorkstreamClick }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 24,
      padding: 20,
    }}>
      {workstreams.map(ws => (
        <ProgressRing
          key={ws.name}
          label={ws.name}
          icon={ws.icon}
          total={ws.total}
          completed={ws.completed}
          inProgress={ws.inProgress}
          pending={ws.pending}
          overdue={ws.overdue}
          color={ws.color}
          onClick={() => onWorkstreamClick && onWorkstreamClick(ws)}
        />
      ))}
    </div>
  );
}
