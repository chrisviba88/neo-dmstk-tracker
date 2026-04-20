/**
 * SEMANTIC COLOR SYSTEM
 * Sistema de comunicación visual profesional
 *
 * Cada color comunica el estado de la tarea instantáneamente
 * siguiendo principios de diseño de información.
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
  faint: "#D8D2CA",
  bone: "#FFFDF9",
  danger: "#C0564A",
};

/**
 * Colores semánticos por estado de tarea
 */
export const SEMANTIC_COLORS = {
  taskStatus: {
    'Hecho': {
      bg: '#E5F8F0',
      text: '#2C8A66',
      border: PALETTE.menthe,
      icon: '✅',
      meaning: 'Completada exitosamente'
    },
    'En curso': {
      bg: '#E5F3FF',
      text: '#2E7DB8',
      border: PALETTE.lagune,
      icon: '🔄',
      meaning: 'En progreso activo'
    },
    'Pendiente': {
      bg: PALETTE.warm,
      text: PALETTE.soft,
      border: PALETTE.faint,
      icon: '⏸️',
      meaning: 'Esperando inicio'
    },
    'Urgente': {
      bg: '#FFE5E5',
      text: PALETTE.danger,
      border: PALETTE.danger,
      icon: '🔥',
      meaning: 'Requiere atención inmediata',
      pulse: true
    },
    'Bloqueada': {
      bg: '#FFF4E5',
      text: '#D68910',
      border: PALETTE.mostaza,
      icon: '🚧',
      meaning: 'Dependencias sin completar'
    },
    'Cancelada': {
      bg: '#F5F5F5',
      text: '#999',
      border: '#CCC',
      icon: '❌',
      meaning: 'No se realizará',
      strikethrough: true
    }
  },

  /**
   * Indicadores temporales (overrides de estado)
   */
  temporal: {
    overdue: {
      bg: '#FFE5E5',
      text: PALETTE.danger,
      border: PALETTE.danger,
      icon: '🚨',
      pulse: true,
      glow: 'rgba(192, 86, 74, 0.3)',
      meaning: 'Vencida - acción inmediata requerida'
    },
    dueSoon: {
      bg: '#FFF4E5',
      text: '#D68910',
      border: PALETTE.mostaza,
      icon: '⏰',
      meaning: 'Vence en 0-2 días'
    },
    dueThisWeek: {
      bg: '#E5F3FF',
      text: '#2E7DB8',
      border: PALETTE.lagune,
      icon: '📅',
      meaning: 'Vence esta semana'
    },
    future: {
      bg: PALETTE.cream,
      text: PALETTE.soft,
      border: PALETTE.faint,
      icon: '📆',
      meaning: 'Más de 7 días'
    }
  },

  /**
   * Niveles de prioridad
   */
  priority: {
    'Crítica': {
      bg: '#FFE5E5',
      text: PALETTE.danger,
      border: PALETTE.danger,
      icon: '🔴',
      weight: 900
    },
    'Alta': {
      bg: '#FFF4E5',
      text: PALETTE.mostaza,
      border: PALETTE.mostaza,
      icon: '🟠',
      weight: 700
    },
    'Media': {
      bg: '#E5F3FF',
      text: PALETTE.lagune,
      border: PALETTE.lagune,
      icon: '🔵',
      weight: 500
    },
    'Baja': {
      bg: PALETTE.warm,
      text: PALETTE.muted,
      border: PALETTE.faint,
      icon: '⚪',
      weight: 300
    }
  },

  /**
   * Indicadores de riesgo
   */
  risk: {
    high: {
      bg: '#FFE5E5',
      text: PALETTE.danger,
      border: PALETTE.danger,
      icon: '⚠️',
      meaning: 'Alto riesgo de impacto'
    },
    medium: {
      bg: '#FFF4E5',
      text: PALETTE.mostaza,
      border: PALETTE.mostaza,
      icon: '⚡',
      meaning: 'Riesgo moderado'
    },
    low: {
      bg: '#E5F8F0',
      text: PALETTE.menthe,
      border: PALETTE.menthe,
      icon: '✓',
      meaning: 'Bajo riesgo'
    },
    none: {
      bg: PALETTE.cream,
      text: PALETTE.soft,
      border: PALETTE.faint,
      icon: '—',
      meaning: 'Sin riesgos identificados'
    }
  },

  /**
   * Tipos de workstream
   */
  workstream: {
    'Dirección': { color: PALETTE.ink, icon: '🎯' },
    'Legal': { color: '#8B5A3C', icon: '⚖️' },
    'Producto': { color: PALETTE.lagune, icon: '📦' },
    'Comunicación': { color: PALETTE.mostaza, icon: '📢' },
    'Sponsor': { color: PALETTE.nectarine, icon: '🤝' },
    'Branding': { color: '#9B59B6', icon: '🎨' },
    'Pilot-Ventas': { color: PALETTE.menthe, icon: '🚀' },
    'Ops-Prod': { color: '#3498DB', icon: '⚙️' },
    'Profesor-Contenido': { color: '#E74C3C', icon: '📚' },
    'Obras': { color: '#95A5A6', icon: '🏗️' }
  },

  /**
   * Health Score (salud del proyecto)
   */
  health: {
    excellent: {
      bg: '#E5F8F0',
      text: '#2C8A66',
      icon: '💚',
      range: [90, 100],
      meaning: '90-100%: Todo en orden'
    },
    good: {
      bg: '#E5F3FF',
      text: '#2E7DB8',
      icon: '💙',
      range: [70, 89],
      meaning: '70-89%: Buen progreso'
    },
    warning: {
      bg: '#FFF4E5',
      text: '#D68910',
      icon: '💛',
      range: [50, 69],
      meaning: '50-69%: Requiere atención'
    },
    critical: {
      bg: '#FFE5E5',
      text: PALETTE.danger,
      icon: '❤️',
      range: [0, 49],
      meaning: '0-49%: Acción inmediata'
    }
  }
};

/**
 * Obtiene el color semántico de una tarea basado en múltiples factores
 * Prioridad: temporal > status > priority
 */
export function getTaskColor(task) {
  const now = new Date();
  const endDate = new Date(task.endDate);
  const daysUntilDue = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  // 1. TEMPORAL (máxima prioridad)
  if (task.status !== 'Hecho' && task.status !== 'Cancelada') {
    if (daysUntilDue < 0) {
      return SEMANTIC_COLORS.temporal.overdue;
    }
    if (daysUntilDue <= 2) {
      return SEMANTIC_COLORS.temporal.dueSoon;
    }
    if (daysUntilDue <= 7) {
      return SEMANTIC_COLORS.temporal.dueThisWeek;
    }
  }

  // 2. STATUS
  if (SEMANTIC_COLORS.taskStatus[task.status]) {
    return SEMANTIC_COLORS.taskStatus[task.status];
  }

  // 3. PRIORITY (fallback)
  if (SEMANTIC_COLORS.priority[task.priority]) {
    return SEMANTIC_COLORS.priority[task.priority];
  }

  // 4. DEFAULT
  return {
    bg: PALETTE.cream,
    text: PALETTE.soft,
    border: PALETTE.faint,
    icon: '📋'
  };
}

/**
 * Obtiene el health score color
 */
export function getHealthColor(score) {
  for (const [key, config] of Object.entries(SEMANTIC_COLORS.health)) {
    const [min, max] = config.range;
    if (score >= min && score <= max) {
      return config;
    }
  }
  return SEMANTIC_COLORS.health.critical;
}

/**
 * Calcula el health score del proyecto
 */
export function calculateHealthScore(tasks) {
  if (!tasks || tasks.length === 0) return 0;

  let score = 100;
  const now = new Date();

  // Penalizaciones
  tasks.forEach(task => {
    if (task.status === 'Cancelada') return; // Skip cancelled

    const endDate = new Date(task.endDate);
    const daysUntilDue = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    // Tareas vencidas: -5 puntos cada una
    if (task.status !== 'Hecho' && daysUntilDue < 0) {
      score -= 5;
    }

    // Tareas urgentes sin completar: -3 puntos
    if (task.status === 'Urgente' || (daysUntilDue <= 2 && task.status !== 'Hecho')) {
      score -= 3;
    }

    // Tareas bloqueadas: -2 puntos
    if (task.status === 'Bloqueada') {
      score -= 2;
    }
  });

  // Bonificaciones
  const completedTasks = tasks.filter(t => t.status === 'Hecho').length;
  const completionRate = (completedTasks / tasks.length) * 100;

  // Bonus por alto completion rate
  if (completionRate >= 80) score += 10;
  else if (completionRate >= 60) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Genera estilos CSS para una tarea
 */
export function getTaskStyles(task, variant = 'card') {
  const colors = getTaskColor(task);

  const baseStyles = {
    backgroundColor: colors.bg,
    color: colors.text,
    borderColor: colors.border,
  };

  if (variant === 'card') {
    return {
      ...baseStyles,
      border: `2px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '12px 16px',
      transition: 'all 0.2s ease',
      ...(colors.pulse && {
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: `0 0 0 0 ${colors.glow || colors.border}`
      }),
      ...(colors.strikethrough && {
        textDecoration: 'line-through',
        opacity: 0.6
      })
    };
  }

  if (variant === 'timeline-bar') {
    return {
      ...baseStyles,
      height: '32px',
      borderRadius: '4px',
      border: `1px solid ${colors.border}`,
      ...(colors.pulse && {
        animation: 'pulse 2s ease-in-out infinite'
      })
    };
  }

  if (variant === 'badge') {
    return {
      ...baseStyles,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
  }

  return baseStyles;
}

/**
 * Estilos globales de animación
 */
export const GLOBAL_ANIMATIONS = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${SEMANTIC_COLORS.temporal.overdue.border}66;
    }
    50% {
      box-shadow: 0 0 0 8px ${SEMANTIC_COLORS.temporal.overdue.border}00;
    }
    100% {
      box-shadow: 0 0 0 0 ${SEMANTIC_COLORS.temporal.overdue.border}00;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .semantic-task-card {
    animation: slideIn 0.3s ease;
  }

  .semantic-task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

export default SEMANTIC_COLORS;
