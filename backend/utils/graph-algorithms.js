/**
 * GRAPH ALGORITHMS - Algoritmos de grafos para gestión de dependencias
 *
 * Basado en teoría de grafos dirigidos acíclicos (DAG)
 * Inspirado en sistemas naturales de dependencias (redes neuronales, ecosistemas)
 *
 * @module graph-algorithms
 */

/**
 * Construye un grafo de dependencias desde las tareas
 * @param {Array} tasks - Array de tareas
 * @returns {Object} Grafo con adjacency list y reverse adjacency list
 */
export function buildDependencyGraph(tasks) {
  const graph = new Map(); // taskId -> [dependents] (tareas que dependen de esta)
  const reverseGraph = new Map(); // taskId -> [dependencies] (de qué tareas depende)
  const taskMap = new Map();

  // Inicializar
  tasks.forEach(task => {
    taskMap.set(task.id, task);
    graph.set(task.id, []);
    reverseGraph.set(task.id, task.deps || []);
  });

  // Construir grafo
  tasks.forEach(task => {
    (task.deps || []).forEach(depId => {
      if (graph.has(depId)) {
        graph.get(depId).push(task.id);
      }
    });
  });

  return { graph, reverseGraph, taskMap };
}

/**
 * Detecta ciclos en el grafo (dependencias circulares)
 * Usa DFS con colores: blanco (no visitado), gris (en proceso), negro (terminado)
 * @param {Map} reverseGraph - Grafo inverso
 * @returns {Object} { hasCycle: boolean, cycle: Array }
 */
export function detectCycles(reverseGraph) {
  const color = new Map();
  const parent = new Map();
  let cycleStart = null;
  let cycleEnd = null;

  // Inicializar todos como blancos
  for (const node of reverseGraph.keys()) {
    color.set(node, 'WHITE');
    parent.set(node, null);
  }

  function dfs(node) {
    color.set(node, 'GRAY'); // Visitando

    const deps = reverseGraph.get(node) || [];
    for (const dep of deps) {
      if (color.get(dep) === 'GRAY') {
        // Ciclo detectado
        cycleStart = dep;
        cycleEnd = node;
        return true;
      }
      if (color.get(dep) === 'WHITE') {
        parent.set(dep, node);
        if (dfs(dep)) return true;
      }
    }

    color.set(node, 'BLACK'); // Terminado
    return false;
  }

  // Verificar desde todos los nodos
  for (const node of reverseGraph.keys()) {
    if (color.get(node) === 'WHITE') {
      if (dfs(node)) {
        // Reconstruir ciclo
        const cycle = [cycleStart];
        let current = cycleEnd;
        while (current !== cycleStart) {
          cycle.push(current);
          current = parent.get(current);
        }
        cycle.push(cycleStart);
        return { hasCycle: true, cycle: cycle.reverse() };
      }
    }
  }

  return { hasCycle: false, cycle: [] };
}

/**
 * Ordenamiento topológico (Kahn's algorithm)
 * Devuelve las tareas en orden de ejecución válido
 * @param {Array} tasks - Tareas
 * @returns {Array} Tareas ordenadas topológicamente
 */
export function topologicalSort(tasks) {
  const { graph, reverseGraph, taskMap } = buildDependencyGraph(tasks);
  const inDegree = new Map();
  const queue = [];
  const sorted = [];

  // Calcular in-degree (número de dependencias)
  for (const [taskId, deps] of reverseGraph) {
    inDegree.set(taskId, deps.length);
    if (deps.length === 0) {
      queue.push(taskId);
    }
  }

  // Procesar
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(taskMap.get(current));

    // Reducir in-degree de dependientes
    const dependents = graph.get(current) || [];
    for (const dependent of dependents) {
      const newDegree = inDegree.get(dependent) - 1;
      inDegree.set(dependent, newDegree);
      if (newDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  // Si sorted.length < tasks.length, hay ciclos
  if (sorted.length < tasks.length) {
    throw new Error('Dependencias circulares detectadas');
  }

  return sorted;
}

/**
 * Encuentra todos los descendientes de una tarea (todas las que dependen directa o indirectamente)
 * @param {String} taskId - ID de la tarea
 * @param {Map} graph - Grafo de dependencias
 * @returns {Set} Set de IDs de tareas afectadas
 */
export function findAllDescendants(taskId, graph) {
  const visited = new Set();

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const dependents = graph.get(node) || [];
    for (const dependent of dependents) {
      dfs(dependent);
    }
  }

  dfs(taskId);
  visited.delete(taskId); // No incluir la tarea misma

  return visited;
}

/**
 * Encuentra todos los ancestros de una tarea (todas de las que depende directa o indirectamente)
 * @param {String} taskId - ID de la tarea
 * @param {Map} reverseGraph - Grafo inverso
 * @returns {Set} Set de IDs de tareas de las que depende
 */
export function findAllAncestors(taskId, reverseGraph) {
  const visited = new Set();

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const dependencies = reverseGraph.get(node) || [];
    for (const dep of dependencies) {
      dfs(dep);
    }
  }

  dfs(taskId);
  visited.delete(taskId); // No incluir la tarea misma

  return visited;
}

/**
 * Calcula el camino crítico del proyecto (Critical Path Method - CPM)
 * @param {Array} tasks - Tareas
 * @returns {Object} { criticalPath: Array, totalDuration: Number, slacks: Map }
 */
export function calculateCriticalPath(tasks) {
  const { graph, reverseGraph, taskMap } = buildDependencyGraph(tasks);
  const earliestStart = new Map();
  const earliestFinish = new Map();
  const latestStart = new Map();
  const latestFinish = new Map();
  const slack = new Map();

  // Ordenar topológicamente
  const sorted = topologicalSort(tasks);

  // Forward pass - calcular earliest times
  for (const task of sorted) {
    const deps = reverseGraph.get(task.id) || [];
    const duration = calculateDuration(task.startDate, task.endDate);

    if (deps.length === 0) {
      earliestStart.set(task.id, 0);
    } else {
      const maxFinish = Math.max(...deps.map(depId => earliestFinish.get(depId) || 0));
      earliestStart.set(task.id, maxFinish);
    }

    earliestFinish.set(task.id, earliestStart.get(task.id) + duration);
  }

  // Proyecto total duration
  const projectDuration = Math.max(...Array.from(earliestFinish.values()));

  // Backward pass - calcular latest times
  for (let i = sorted.length - 1; i >= 0; i--) {
    const task = sorted[i];
    const dependents = graph.get(task.id) || [];
    const duration = calculateDuration(task.startDate, task.endDate);

    if (dependents.length === 0) {
      latestFinish.set(task.id, projectDuration);
    } else {
      const minStart = Math.min(...dependents.map(depId => latestStart.get(depId)));
      latestFinish.set(task.id, minStart);
    }

    latestStart.set(task.id, latestFinish.get(task.id) - duration);
  }

  // Calcular slack (holgura) y encontrar camino crítico
  const criticalTasks = [];
  for (const task of tasks) {
    const taskSlack = latestStart.get(task.id) - earliestStart.get(task.id);
    slack.set(task.id, taskSlack);

    if (taskSlack === 0) {
      criticalTasks.push(task.id);
    }
  }

  return {
    criticalPath: criticalTasks,
    totalDuration: projectDuration,
    slacks: slack,
    earliestStart,
    earliestFinish,
    latestStart,
    latestFinish,
  };
}

/**
 * Calcula duración en días entre dos fechas
 * @param {String} startDate - Fecha inicio YYYY-MM-DD
 * @param {String} endDate - Fecha fin YYYY-MM-DD
 * @returns {Number} Días de duración
 */
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir día final
}

/**
 * Calcula el impacto de cambiar la fecha de fin de una tarea
 * @param {String} taskId - ID de la tarea
 * @param {String} newEndDate - Nueva fecha de fin
 * @param {Array} tasks - Todas las tareas
 * @param {Object} bufferRules - Reglas de buffer
 * @returns {Array} Tareas afectadas con nuevas fechas propuestas
 */
export function calculateImpact(taskId, newEndDate, tasks, bufferRules = {}) {
  const { graph, taskMap } = buildDependencyGraph(tasks);
  const affected = [];
  const originalTask = taskMap.get(taskId);

  if (!originalTask) return affected;

  // Calcular cuántos días cambió
  const originalEnd = new Date(originalTask.endDate);
  const newEnd = new Date(newEndDate);
  const daysDiff = Math.ceil((newEnd - originalEnd) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return affected; // Sin cambio

  // BFS para propagar cambios
  const queue = [{ taskId, newEndDate }];
  const processed = new Set();
  const updates = new Map();

  updates.set(taskId, { oldEndDate: originalTask.endDate, newEndDate });

  while (queue.length > 0) {
    const { taskId: currentId, newEndDate: currentNewEnd } = queue.shift();

    if (processed.has(currentId)) continue;
    processed.add(currentId);

    const dependents = graph.get(currentId) || [];

    for (const dependentId of dependents) {
      const dependentTask = taskMap.get(dependentId);
      if (!dependentTask) continue;

      // Determinar buffer apropiado
      const buffer = getBufferForTask(dependentTask, bufferRules);

      // Nueva fecha de inicio = fecha fin de dependencia + buffer
      const newStartDate = addDays(currentNewEnd, buffer);
      const taskDuration = calculateDuration(dependentTask.startDate, dependentTask.endDate);
      const newDependentEndDate = addDays(newStartDate, taskDuration - 1);

      // Solo actualizar si la nueva fecha es después de la actual
      const currentDepStart = new Date(dependentTask.startDate);
      const proposedStart = new Date(newStartDate);

      if (proposedStart > currentDepStart) {
        updates.set(dependentId, {
          oldStartDate: dependentTask.startDate,
          oldEndDate: dependentTask.endDate,
          newStartDate,
          newEndDate: newDependentEndDate,
          reason: `Depende de ${currentId} que cambió a ${currentNewEnd}`,
        });

        queue.push({ taskId: dependentId, newEndDate: newDependentEndDate });
      }
    }
  }

  // Convertir a array con información completa
  for (const [id, changes] of updates) {
    if (id === taskId) continue; // No incluir la tarea original

    const task = taskMap.get(id);
    affected.push({
      taskId: id,
      taskName: task.name,
      isMilestone: task.isMilestone,
      priority: task.priority,
      ...changes,
    });
  }

  return affected;
}

/**
 * Añade días a una fecha
 * @param {String} dateStr - Fecha en formato YYYY-MM-DD
 * @param {Number} days - Días a añadir
 * @returns {String} Nueva fecha en formato YYYY-MM-DD
 */
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Determina el buffer apropiado para una tarea
 * @param {Object} task - Tarea
 * @param {Object} bufferRules - Reglas de buffer
 * @returns {Number} Días de buffer
 */
function getBufferForTask(task, bufferRules) {
  if (task.isMilestone) return bufferRules.milestone || 0;

  // Heurística basada en el nombre y características
  if (task.ws === 'Legal') return bufferRules.contractual || 1;
  if (task.ws === 'Espacio-E1') return bufferRules.construction || 14;
  if (task.name.toLowerCase().includes('grabación') ||
      task.name.toLowerCase().includes('edición')) {
    return bufferRules.production || 7;
  }
  if (task.name.toLowerCase().includes('diseño') ||
      task.name.toLowerCase().includes('crear')) {
    return bufferRules.creative || 3;
  }

  return bufferRules.contractual || 1; // Default
}

/**
 * Encuentra tareas bloqueadas (que tienen dependencias no completadas)
 * @param {Array} tasks - Tareas
 * @returns {Array} Tareas bloqueadas con información de qué las bloquea
 */
export function findBlockedTasks(tasks) {
  const { reverseGraph, taskMap } = buildDependencyGraph(tasks);
  const blocked = [];

  for (const task of tasks) {
    if (task.status === 'Hecho') continue;

    const deps = reverseGraph.get(task.id) || [];
    const incompleteDeps = deps.filter(depId => {
      const depTask = taskMap.get(depId);
      return depTask && depTask.status !== 'Hecho';
    });

    if (incompleteDeps.length > 0) {
      blocked.push({
        taskId: task.id,
        taskName: task.name,
        blockedBy: incompleteDeps.map(id => ({
          id,
          name: taskMap.get(id).name,
          status: taskMap.get(id).status,
        })),
      });
    }
  }

  return blocked;
}

/**
 * Genera un árbol de dependencias para visualización
 * @param {String} taskId - ID de la tarea raíz
 * @param {Array} tasks - Todas las tareas
 * @param {String} direction - 'upstream' (de qué depende) o 'downstream' (qué depende de esta)
 * @returns {Object} Árbol de dependencias
 */
export function generateDependencyTree(taskId, tasks, direction = 'upstream') {
  const { graph, reverseGraph, taskMap } = buildDependencyGraph(tasks);
  const targetGraph = direction === 'upstream' ? reverseGraph : graph;

  function buildTree(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) {
      return { id: nodeId, name: '[CIRCULAR]', children: [] };
    }

    visited.add(nodeId);
    const task = taskMap.get(nodeId);
    if (!task) return null;

    const deps = targetGraph.get(nodeId) || [];
    const children = deps
      .map(depId => buildTree(depId, new Set(visited)))
      .filter(Boolean);

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      isMilestone: task.isMilestone,
      priority: task.priority,
      endDate: task.endDate,
      children,
    };
  }

  return buildTree(taskId);
}
