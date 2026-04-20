/**
 * DEPENDENCY PROPAGATION SERVICE
 *
 * Sistema inteligente de propagación de cambios en dependencias
 * Basado en algoritmos de grafos y reglas de negocio
 *
 * @module propagation-service
 */

import {
  buildDependencyGraph,
  calculateImpact,
  detectCycles,
  findAllDescendants,
  generateDependencyTree,
} from '../../utils/graph-algorithms.js';
import { BUFFER_RULES } from '../../data/tasks-complete.js';

/**
 * Analiza el impacto de un cambio de fecha en una tarea
 * @param {String} taskId - ID de la tarea modificada
 * @param {Object} changes - Cambios propuestos { startDate?, endDate? }
 * @param {Array} allTasks - Todas las tareas del proyecto
 * @returns {Object} Análisis de impacto
 */
export function analyzeImpact(taskId, changes, allTasks) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) {
    return { error: 'Tarea no encontrada' };
  }

  const affectedTasks = [];
  const warnings = [];
  const critical = [];

  // Si cambió la fecha de fin, calcular propagación
  if (changes.endDate && changes.endDate !== task.endDate) {
    const impacted = calculateImpact(taskId, changes.endDate, allTasks, BUFFER_RULES);

    for (const affected of impacted) {
      affectedTasks.push(affected);

      // Detectar warnings
      if (affected.isMilestone) {
        critical.push({
          type: 'milestone_moved',
          taskId: affected.taskId,
          taskName: affected.taskName,
          message: `⚠️ HITO "${affected.taskName}" se moverá de ${affected.oldEndDate} a ${affected.newEndDate}`,
        });
      }

      if (affected.priority === 'Crítica') {
        warnings.push({
          type: 'critical_task_moved',
          taskId: affected.taskId,
          message: `Tarea crítica "${affected.taskName}" afectada`,
        });
      }

      // Detectar si se mueve más allá de deadline importante
      const newEndDate = new Date(affected.newEndDate);
      const GO_NO_GO = new Date('2026-06-20');
      const SOFT_OPENING = new Date('2026-09-01');

      if (task.endDate < GO_NO_GO && newEndDate > GO_NO_GO) {
        critical.push({
          type: 'crosses_deadline',
          message: `🚨 "${affected.taskName}" cruza la fecha GO/NO-GO (2026-06-20)`,
        });
      }

      if (task.endDate < SOFT_OPENING && newEndDate > SOFT_OPENING) {
        critical.push({
          type: 'crosses_soft_opening',
          message: `🚨 "${affected.taskName}" cruza la fecha de Soft Opening (2026-09-01)`,
        });
      }
    }
  }

  // Verificar si el cambio crea ciclos
  const tempTasks = allTasks.map(t => {
    if (t.id === taskId) {
      return { ...t, ...changes };
    }
    return t;
  });

  const { graph, reverseGraph } = buildDependencyGraph(tempTasks);
  const cycleCheck = detectCycles(reverseGraph);

  if (cycleCheck.hasCycle) {
    return {
      error: 'Cambio crearía dependencia circular',
      cycle: cycleCheck.cycle,
      canProceed: false,
    };
  }

  // Generar resumen
  const summary = {
    taskChanged: {
      id: taskId,
      name: task.name,
      oldStartDate: task.startDate,
      oldEndDate: task.endDate,
      newStartDate: changes.startDate || task.startDate,
      newEndDate: changes.endDate || task.endDate,
    },
    affectedCount: affectedTasks.length,
    milestonesAffected: affectedTasks.filter(t => t.isMilestone).length,
    criticalTasksAffected: affectedTasks.filter(t => t.priority === 'Crítica').length,
    affectedTasks,
    warnings,
    critical,
    canProceed: true,
  };

  return summary;
}

/**
 * Aplica cambios en cascada (propagar a tareas dependientes)
 * @param {String} taskId - Tarea raíz
 * @param {Object} changes - Cambios a aplicar
 * @param {Array} allTasks - Todas las tareas
 * @param {Boolean} autoPropagate - Si true, aplica automáticamente; si false, solo sugiere
 * @returns {Object} Resultado de la propagación
 */
export function propagateChanges(taskId, changes, allTasks, autoPropagate = false) {
  const impact = analyzeImpact(taskId, changes, allTasks);

  if (!impact.canProceed) {
    return { success: false, error: impact.error };
  }

  if (!autoPropagate) {
    // Modo sugerencia - devolver plan sin aplicar
    return {
      success: true,
      mode: 'suggestion',
      summary: impact,
      message: `Se actualizarían ${impact.affectedCount} tareas. Confirma para aplicar.`,
    };
  }

  // Modo auto - aplicar cambios
  const updatedTasks = allTasks.map(task => {
    // Aplicar cambio a tarea raíz
    if (task.id === taskId) {
      return { ...task, ...changes };
    }

    // Aplicar cambios propagados
    const affected = impact.affectedTasks.find(a => a.taskId === task.id);
    if (affected) {
      return {
        ...task,
        startDate: affected.newStartDate,
        endDate: affected.newEndDate,
      };
    }

    return task;
  });

  return {
    success: true,
    mode: 'applied',
    updatedTasks,
    summary: impact,
    message: `✅ Cambios aplicados. ${impact.affectedCount} tareas actualizadas.`,
  };
}

/**
 * Genera recomendaciones inteligentes para ajustar fechas
 * @param {String} taskId - Tarea a analizar
 * @param {Array} allTasks - Todas las tareas
 * @returns {Object} Recomendaciones
 */
export function generateRecommendations(taskId, allTasks) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return { error: 'Tarea no encontrada' };

  const { reverseGraph, graph, taskMap } = buildDependencyGraph(allTasks);
  const recommendations = [];

  // Verificar si la tarea puede empezar antes
  const deps = reverseGraph.get(taskId) || [];
  if (deps.length > 0) {
    const depTasks = deps.map(id => taskMap.get(id));
    const allDepsComplete = depTasks.every(t => t.status === 'Hecho');

    if (allDepsComplete) {
      const latestDepEnd = Math.max(...depTasks.map(t => new Date(t.endDate)));
      const canStartDate = new Date(latestDepEnd);
      canStartDate.setDate(canStartDate.getDate() + 1); // +1 día buffer

      const currentStart = new Date(task.startDate);

      if (canStartDate < currentStart) {
        recommendations.push({
          type: 'can_start_earlier',
          message: `Puedes empezar esta tarea antes. Todas las dependencias están completas.`,
          suggestedStartDate: canStartDate.toISOString().split('T')[0],
          daysEarlier: Math.floor((currentStart - canStartDate) / (1000 * 60 * 60 * 24)),
        });
      }
    } else {
      const incompleteDeps = depTasks.filter(t => t.status !== 'Hecho');
      recommendations.push({
        type: 'blocked',
        message: `Bloqueada por ${incompleteDeps.length} tarea(s) sin completar:`,
        blockingTasks: incompleteDeps.map(t => ({
          id: t.id,
          name: t.name,
          endDate: t.endDate,
          status: t.status,
        })),
      });
    }
  }

  // Verificar si está en camino crítico
  const descendants = findAllDescendants(taskId, graph);
  if (descendants.size > 10) {
    recommendations.push({
      type: 'high_impact',
      message: `⚠️ Esta tarea afecta a ${descendants.size} tareas. Cualquier retraso tendrá alto impacto.`,
      affectedCount: descendants.size,
    });
  }

  // Verificar si está vencida
  const today = new Date();
  const endDate = new Date(task.endDate);

  if (endDate < today && task.status !== 'Hecho') {
    const daysOverdue = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
    recommendations.push({
      type: 'overdue',
      message: `🔴 Tarea vencida hace ${daysOverdue} día(s)`,
      daysOverdue,
      suggestedAction: 'Actualizar fecha de fin o marcar como completada',
    });
  }

  // Verificar buffer con siguiente tarea
  const dependents = graph.get(taskId) || [];
  if (dependents.length > 0) {
    const nextTasks = dependents.map(id => taskMap.get(id));
    for (const nextTask of nextTasks) {
      const taskEnd = new Date(task.endDate);
      const nextStart = new Date(nextTask.startDate);
      const buffer = Math.floor((nextStart - taskEnd) / (1000 * 60 * 60 * 24));

      if (buffer < 1) {
        recommendations.push({
          type: 'insufficient_buffer',
          message: `⚠️ Buffer insuficiente con "${nextTask.name}" (${buffer} días)`,
          nextTask: nextTask.name,
          suggestedBuffer: 3,
        });
      }
    }
  }

  return {
    taskId,
    taskName: task.name,
    recommendations,
    recommendationCount: recommendations.length,
  };
}

/**
 * Genera un reporte de salud del proyecto basado en dependencias
 * @param {Array} allTasks - Todas las tareas
 * @returns {Object} Reporte de salud
 */
/**
 * Valida las dependencias de una tarea
 * @param {Object} task - Tarea a validar
 * @param {Array} allTasks - Todas las tareas
 * @returns {Object} Resultado de validación
 */
export function validateDependencies(task, allTasks) {
  const errors = [];
  const warnings = [];

  // Validar que las dependencias existan
  const deps = task.deps || [];
  for (const depId of deps) {
    const depTask = allTasks.find(t => t.id === depId);
    if (!depTask) {
      errors.push({
        type: 'invalid_dependency',
        message: `Dependencia "${depId}" no encontrada`,
        depId,
      });
    }
  }

  // Crear tarea temporal para detectar ciclos
  const tempTasks = allTasks.map(t =>
    t.id === task.id ? { ...t, deps: task.deps } : t
  );

  const { reverseGraph } = buildDependencyGraph(tempTasks);
  const cycleCheck = detectCycles(reverseGraph);

  if (cycleCheck.hasCycle) {
    errors.push({
      type: 'circular_dependency',
      message: 'Las dependencias crean un ciclo',
      cycle: cycleCheck.cycle,
    });
  }

  // Validar fechas lógicas
  for (const depId of deps) {
    const depTask = allTasks.find(t => t.id === depId);
    if (depTask && depTask.endDate && task.startDate) {
      const depEndDate = new Date(depTask.endDate);
      const taskStartDate = new Date(task.startDate);

      if (taskStartDate < depEndDate) {
        warnings.push({
          type: 'date_conflict',
          message: `La tarea "${task.name}" inicia antes de que termine su dependencia "${depTask.name}"`,
          depId,
          depName: depTask.name,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateHealthReport(allTasks) {
  const { reverseGraph, taskMap } = buildDependencyGraph(allTasks);

  // Detectar ciclos
  const cycleCheck = detectCycles(reverseGraph);

  // Tareas vencidas
  const today = new Date();
  const overdueTasks = allTasks.filter(t => {
    const endDate = new Date(t.endDate);
    return endDate < today && t.status !== 'Hecho';
  });

  // Tareas bloqueadas
  const blockedTasks = allTasks.filter(t => {
    if (t.status === 'Hecho') return false;
    const deps = reverseGraph.get(t.id) || [];
    const incompleteDeps = deps.filter(depId => {
      const dep = taskMap.get(depId);
      return dep && dep.status !== 'Hecho';
    });
    return incompleteDeps.length > 0;
  });

  // Cuellos de botella (tareas con muchas dependientes)
  const bottlenecks = [];
  const { graph } = buildDependencyGraph(allTasks);
  for (const [taskId, dependents] of graph) {
    if (dependents.length >= 3) {
      const task = taskMap.get(taskId);
      bottlenecks.push({
        id: taskId,
        name: task.name,
        dependentCount: dependents.length,
        status: task.status,
      });
    }
  }

  // Hitos en riesgo
  const milestones = allTasks.filter(t => t.isMilestone);
  const milestonesAtRisk = milestones.filter(m => {
    const endDate = new Date(m.endDate);
    const daysUntil = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil < 30 && daysUntil > 0 && m.status !== 'Hecho';
  });

  // Score de salud (0-100)
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'Hecho').length;
  const completionRate = (completedTasks / totalTasks) * 100;

  const overdueRate = (overdueTasks.length / totalTasks) * 100;
  const blockedRate = (blockedTasks.length / totalTasks) * 100;

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      completionRate - (overdueRate * 2) - (blockedRate * 1.5) - (cycleCheck.hasCycle ? 50 : 0)
    )
  );

  return {
    healthScore: Math.round(healthScore),
    summary: {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate),
      overdueTasks: overdueTasks.length,
      blockedTasks: blockedTasks.length,
      milestonesAtRisk: milestonesAtRisk.length,
      bottlenecks: bottlenecks.length,
    },
    details: {
      overdueTasks: overdueTasks.map(t => ({
        id: t.id,
        name: t.name,
        endDate: t.endDate,
        daysOverdue: Math.floor((today - new Date(t.endDate)) / (1000 * 60 * 60 * 24)),
      })),
      blockedTasks: blockedTasks.slice(0, 10), // Top 10
      bottlenecks,
      milestonesAtRisk: milestonesAtRisk.map(m => ({
        id: m.id,
        name: m.name,
        endDate: m.endDate,
        daysUntil: Math.floor((new Date(m.endDate) - today) / (1000 * 60 * 60 * 24)),
      })),
      hasCycles: cycleCheck.hasCycle,
      cycles: cycleCheck.cycle,
    },
    alerts: [
      ...overdueTasks.length > 0 ? [{ level: 'error', message: `${overdueTasks.length} tareas vencidas` }] : [],
      ...blockedTasks.length > 5 ? [{ level: 'warning', message: `${blockedTasks.length} tareas bloqueadas` }] : [],
      ...milestonesAtRisk.length > 0 ? [{ level: 'warning', message: `${milestonesAtRisk.length} hitos en riesgo` }] : [],
      ...cycleCheck.hasCycle ? [{ level: 'error', message: 'Dependencias circulares detectadas' }] : [],
    ],
  };
}
