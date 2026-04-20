/**
 * DEPENDENCIES ROUTES
 * API endpoints para gestión de dependencias y propagación de cambios
 */

import express from 'express';
import {
  analyzeImpact,
  propagateChanges,
  validateDependencies,
} from '../modules/dependencies/propagation.service.js';
import {
  buildDependencyGraph,
  detectCycles,
  calculateCriticalPath,
  topologicalSort,
} from '../utils/graph-algorithms.js';

const router = express.Router();

// Supabase client will be injected via middleware
let supabase;

/**
 * POST /api/dependencies/analyze-impact
 * Analiza el impacto de cambiar una tarea sin aplicar cambios
 */
router.post('/analyze-impact', async (req, res) => {
  try {
    const { taskId, changes } = req.body;

    if (!taskId || !changes) {
      return res.status(400).json({
        error: 'taskId y changes son requeridos'
      });
    }

    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    // Analizar impacto
    const impact = analyzeImpact(taskId, changes, tasks);

    res.json({
      success: true,
      impact,
      recommendation: getRecommendation(impact),
    });
  } catch (error) {
    console.error('Error analyzing impact:', error);
    res.status(500).json({
      error: 'Error analizando impacto',
      details: error.message
    });
  }
});

/**
 * POST /api/dependencies/propagate
 * Propaga cambios a tareas dependientes
 */
router.post('/propagate', async (req, res) => {
  try {
    const { taskId, changes, autoPropagate = false } = req.body;

    if (!taskId || !changes) {
      return res.status(400).json({
        error: 'taskId y changes son requeridos'
      });
    }

    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    // Propagar cambios
    const result = propagateChanges(taskId, changes, tasks, autoPropagate);

    if (result.mode === 'suggestion') {
      // Modo preview
      return res.json({
        success: true,
        mode: 'preview',
        summary: result.summary,
        affectedTasks: result.summary.affectedTasks,
      });
    }

    // Modo aplicación - actualizar tareas en BD
    const updates = result.updates;
    const updatePromises = updates.map(update =>
      supabase
        .from('tasks')
        .update({ endDate: update.newEndDate })
        .eq('id', update.taskId)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      mode: 'applied',
      updatedCount: updates.length,
      updates,
    });
  } catch (error) {
    console.error('Error propagating changes:', error);
    res.status(500).json({
      error: 'Error propagando cambios',
      details: error.message
    });
  }
});

/**
 * POST /api/dependencies/validate
 * Valida dependencias de una tarea
 */
router.post('/validate', async (req, res) => {
  try {
    const { taskId, deps } = req.body;

    if (!taskId) {
      return res.status(400).json({
        error: 'taskId es requerido'
      });
    }

    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    // Crear tarea temporal con las nuevas dependencias
    const tempTask = tasks.find(t => t.id === taskId);
    if (!tempTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    tempTask.deps = deps || [];

    // Validar
    const validation = validateDependencies(tempTask, tasks);

    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error('Error validating dependencies:', error);
    res.status(500).json({
      error: 'Error validando dependencias',
      details: error.message
    });
  }
});

/**
 * GET /api/dependencies/task/:taskId
 * Obtiene información completa de dependencias de una tarea
 */
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Construir grafo
    const { graph, reverseGraph } = buildDependencyGraph(tasks);

    // Dependencias (tareas de las que depende)
    const dependencies = (task.deps || []).map(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask ? {
        id: depTask.id,
        name: depTask.name,
        status: depTask.status,
        endDate: depTask.endDate,
      } : null;
    }).filter(Boolean);

    // Dependientes (tareas que dependen de esta)
    const dependents = (graph.get(taskId) || []).map(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask ? {
        id: depTask.id,
        name: depTask.name,
        status: depTask.status,
        startDate: depTask.startDate,
      } : null;
    }).filter(Boolean);

    res.json({
      success: true,
      task: {
        id: task.id,
        name: task.name,
      },
      dependencies: {
        upstream: dependencies,
        downstream: dependents,
        upstreamCount: dependencies.length,
        downstreamCount: dependents.length,
      },
    });
  } catch (error) {
    console.error('Error getting task dependencies:', error);
    res.status(500).json({
      error: 'Error obteniendo dependencias',
      details: error.message
    });
  }
});

/**
 * GET /api/dependencies/critical-path
 * Calcula el camino crítico del proyecto
 */
router.get('/critical-path', async (req, res) => {
  try {
    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const criticalPath = calculateCriticalPath(tasks);

    res.json({
      success: true,
      criticalPath: {
        tasks: criticalPath.path.map(taskId => {
          const task = tasks.find(t => t.id === taskId);
          return {
            id: taskId,
            name: task?.name,
            slack: criticalPath.slacks[taskId],
            isCritical: criticalPath.slacks[taskId] === 0,
          };
        }),
        totalDuration: criticalPath.totalDuration,
        taskCount: criticalPath.path.length,
      },
    });
  } catch (error) {
    console.error('Error calculating critical path:', error);
    res.status(500).json({
      error: 'Error calculando camino crítico',
      details: error.message
    });
  }
});

/**
 * POST /api/dependencies/detect-cycles
 * Detecta ciclos en las dependencias
 */
router.post('/detect-cycles', async (req, res) => {
  try {
    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const { reverseGraph } = buildDependencyGraph(tasks);
    const cycleInfo = detectCycles(reverseGraph);

    if (cycleInfo.hasCycle) {
      const cycleTaskNames = cycleInfo.cycle.map(taskId => {
        const task = tasks.find(t => t.id === taskId);
        return task?.name || taskId;
      });

      res.json({
        success: true,
        hasCycle: true,
        cycle: cycleInfo.cycle,
        cycleTaskNames,
        message: `Se detectó un ciclo: ${cycleTaskNames.join(' → ')}`,
      });
    } else {
      res.json({
        success: true,
        hasCycle: false,
        message: 'No se detectaron ciclos',
      });
    }
  } catch (error) {
    console.error('Error detecting cycles:', error);
    res.status(500).json({
      error: 'Error detectando ciclos',
      details: error.message
    });
  }
});

/**
 * GET /api/dependencies/topological-sort
 * Obtiene el orden topológico de las tareas
 */
router.get('/topological-sort', async (req, res) => {
  try {
    // Obtener todas las tareas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) throw tasksError;

    const { reverseGraph } = buildDependencyGraph(tasks);
    const sorted = topologicalSort(reverseGraph);

    if (!sorted) {
      return res.status(400).json({
        error: 'No se puede ordenar: existe un ciclo en las dependencias'
      });
    }

    const sortedTasks = sorted.map(taskId => {
      const task = tasks.find(t => t.id === taskId);
      return {
        id: taskId,
        name: task?.name,
        ws: task?.ws,
      };
    });

    res.json({
      success: true,
      sorted: sortedTasks,
      totalTasks: sorted.length,
    });
  } catch (error) {
    console.error('Error calculating topological sort:', error);
    res.status(500).json({
      error: 'Error calculando orden topológico',
      details: error.message
    });
  }
});

/**
 * Helper: Genera recomendación basada en análisis de impacto
 */
function getRecommendation(impact) {
  if (!impact.canProceed) {
    return {
      action: 'block',
      message: 'No se recomienda aplicar estos cambios',
      reasons: impact.critical,
    };
  }

  if (impact.milestonesAffected.length > 0) {
    return {
      action: 'warning',
      message: `Se afectarán ${impact.milestonesAffected.length} hito(s)`,
      reasons: impact.warnings,
    };
  }

  if (impact.affectedCount > 10) {
    return {
      action: 'caution',
      message: `Se afectarán ${impact.affectedCount} tareas`,
      reasons: ['Considere revisar el impacto en cada tarea antes de proceder'],
    };
  }

  return {
    action: 'proceed',
    message: 'Los cambios pueden aplicarse de forma segura',
    reasons: [],
  };
}

/**
 * Helper: Inyecta el cliente de Supabase
 */
export function setSupabaseClient(client) {
  supabase = client;
}

export default router;
