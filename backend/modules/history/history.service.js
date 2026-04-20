/**
 * HISTORY SERVICE - Sistema de versionado estilo Google Docs
 *
 * Responde a las 5Ws:
 * - WHO: Quién hizo el cambio
 * - WHAT: Qué cambió exactamente
 * - WHEN: Cuándo se hizo el cambio
 * - WHERE: En qué tarea/campo
 * - WHY: Razón del cambio (opcional)
 *
 * Funcionalidad:
 * - Registra cada cambio en activity_log
 * - Permite ver historial completo
 * - Permite restaurar versiones anteriores
 * - Genera diffs visuales
 *
 * @module history-service
 */

// Supabase client will be injected
let supabase = null;

export function setSupabaseClient(client) {
  supabase = client;
}

/**
 * Registra un cambio en el activity log
 * @param {Object} change - Información del cambio
 * @returns {Promise<Object>} Entrada del log creada
 */
export async function logChange(change) {
  const {
    taskId,
    userId,
    userName,
    action, // 'created', 'updated', 'deleted', 'restored'
    field, // Campo modificado (ej: 'endDate', 'status')
    oldValue,
    newValue,
    reason, // Opcional: razón del cambio
    metadata, // Datos adicionales
  } = change;

  const entry = {
    task_id: taskId,
    user_id: userId,
    user_name: userName,
    action,
    field,
    old_value: oldValue !== undefined ? JSON.stringify(oldValue) : null,
    new_value: newValue !== undefined ? JSON.stringify(newValue) : null,
    reason: reason || null,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('activity_log')
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error('Error logging change:', error);
    throw error;
  }

  return data;
}

/**
 * Obtiene el historial completo de una tarea
 * @param {String} taskId - ID de la tarea
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Array>} Historial de cambios
 */
export async function getTaskHistory(taskId, options = {}) {
  const {
    limit = 100,
    offset = 0,
    userId = null,
    action = null,
    field = null,
    startDate = null,
    endDate = null,
  } = options;

  let query = supabase
    .from('activity_log')
    .select('*')
    .eq('task_id', taskId)
    .order('timestamp', { ascending: false });

  if (userId) query = query.eq('user_id', userId);
  if (action) query = query.eq('action', action);
  if (field) query = query.eq('field', field);
  if (startDate) query = query.gte('timestamp', startDate);
  if (endDate) query = query.lte('timestamp', endDate);

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching history:', error);
    throw error;
  }

  // Enriquecer con información adicional
  return data.map(enrichHistoryEntry);
}

/**
 * Obtiene el historial global del proyecto
 * @param {Object} options - Opciones
 * @returns {Promise<Array>} Historial global
 */
export async function getProjectHistory(options = {}) {
  const {
    limit = 50,
    offset = 0,
    userId = null,
    action = null,
    startDate = null,
    endDate = null,
  } = options;

  let query = supabase
    .from('activity_log')
    .select('*, tasks(name, ws)')
    .order('timestamp', { ascending: false });

  if (userId) query = query.eq('user_id', userId);
  if (action) query = query.eq('action', action);
  if (startDate) query = query.gte('timestamp', startDate);
  if (endDate) query = query.lte('timestamp', endDate);

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching project history:', error);
    throw error;
  }

  return data.map(enrichHistoryEntry);
}

/**
 * Restaura una tarea a un estado anterior
 * @param {String} taskId - ID de la tarea
 * @param {String} snapshotId - ID del snapshot a restaurar
 * @param {Object} user - Usuario que restaura
 * @returns {Promise<Object>} Tarea restaurada
 */
export async function restoreTaskToSnapshot(taskId, snapshotId, user) {
  // 1. Obtener el snapshot
  const { data: snapshot, error: snapshotError } = await supabase
    .from('activity_log')
    .select('*')
    .eq('id', snapshotId)
    .single();

  if (snapshotError || !snapshot) {
    throw new Error('Snapshot no encontrado');
  }

  // 2. Obtener estado actual de la tarea
  const { data: currentTask, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (taskError || !currentTask) {
    throw new Error('Tarea no encontrada');
  }

  // 3. Reconstruir estado de la tarea en ese momento
  const restoredState = await reconstructTaskAtTimestamp(taskId, snapshot.timestamp);

  // 4. Actualizar tarea con estado restaurado
  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update(restoredState)
    .eq('id', taskId)
    .select()
    .single();

  if (updateError) {
    throw new Error('Error restaurando tarea');
  }

  // 5. Registrar la restauración
  await logChange({
    taskId,
    userId: user.id,
    userName: user.name,
    action: 'restored',
    field: 'all',
    oldValue: currentTask,
    newValue: updatedTask,
    reason: `Restaurado a snapshot ${snapshotId} (${new Date(snapshot.timestamp).toLocaleString()})`,
    metadata: { snapshotId, snapshotTimestamp: snapshot.timestamp },
  });

  return updatedTask;
}

/**
 * Genera un diff visual entre dos versiones
 * @param {Object} oldVersion - Versión antigua
 * @param {Object} newVersion - Versión nueva
 * @returns {Object} Diff estructurado
 */
export function generateDiff(oldVersion, newVersion) {
  const diff = {
    changes: [],
    summary: {
      fieldsChanged: 0,
      fieldsAdded: 0,
      fieldsRemoved: 0,
    },
  };

  const allKeys = new Set([
    ...Object.keys(oldVersion || {}),
    ...Object.keys(newVersion || {}),
  ]);

  for (const key of allKeys) {
    const oldValue = oldVersion?.[key];
    const newValue = newVersion?.[key];

    if (oldValue === undefined && newValue !== undefined) {
      // Campo añadido
      diff.changes.push({
        field: key,
        type: 'added',
        oldValue: null,
        newValue,
        label: getFieldLabel(key),
      });
      diff.summary.fieldsAdded++;
    } else if (oldValue !== undefined && newValue === undefined) {
      // Campo eliminado
      diff.changes.push({
        field: key,
        type: 'removed',
        oldValue,
        newValue: null,
        label: getFieldLabel(key),
      });
      diff.summary.fieldsRemoved++;
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      // Campo modificado
      diff.changes.push({
        field: key,
        type: 'modified',
        oldValue,
        newValue,
        label: getFieldLabel(key),
        visualDiff: getVisualDiff(key, oldValue, newValue),
      });
      diff.summary.fieldsChanged++;
    }
  }

  return diff;
}

/**
 * Reconstruye el estado de una tarea en un timestamp específico
 * @param {String} taskId - ID de la tarea
 * @param {String} timestamp - Timestamp objetivo
 * @returns {Promise<Object>} Estado de la tarea en ese momento
 */
async function reconstructTaskAtTimestamp(taskId, timestamp) {
  // Obtener todos los cambios hasta ese timestamp, ordenados cronológicamente
  const { data: history, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('task_id', taskId)
    .lte('timestamp', timestamp)
    .order('timestamp', { ascending: true });

  if (error) throw error;

  // Reconstruir estado aplicando cambios secuencialmente
  let state = {};

  for (const entry of history) {
    if (entry.action === 'created') {
      // Tarea creada - inicializar estado
      state = JSON.parse(entry.new_value || '{}');
    } else if (entry.action === 'updated') {
      // Actualización - aplicar cambio
      if (entry.field && entry.new_value) {
        try {
          state[entry.field] = JSON.parse(entry.new_value);
        } catch {
          state[entry.field] = entry.new_value;
        }
      }
    } else if (entry.action === 'deleted') {
      // Tarea eliminada - marcar como eliminada
      state._deleted = true;
      state._deletedAt = entry.timestamp;
    } else if (entry.action === 'restored') {
      // Restauración - aplicar estado completo
      state = JSON.parse(entry.new_value || '{}');
      delete state._deleted;
      delete state._deletedAt;
    }
  }

  return state;
}

/**
 * Enriquece una entrada del historial con información adicional
 */
function enrichHistoryEntry(entry) {
  return {
    ...entry,
    // Parse JSON values
    oldValue: entry.old_value ? tryParseJSON(entry.old_value) : null,
    newValue: entry.new_value ? tryParseJSON(entry.new_value) : null,

    // Formatear timestamp
    formattedTimestamp: new Date(entry.timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),

    // Tiempo relativo (ej: "hace 2 horas")
    relativeTime: getRelativeTime(entry.timestamp),

    // Descripción human-readable
    description: generateDescription(entry),

    // Icono según acción
    icon: getActionIcon(entry.action),
    color: getActionColor(entry.action),
  };
}

/**
 * Genera descripción human-readable de un cambio
 */
function generateDescription(entry) {
  const user = entry.user_name || 'Usuario';
  const field = getFieldLabel(entry.field);

  switch (entry.action) {
    case 'created':
      return `${user} creó la tarea`;
    case 'updated':
      if (entry.field === 'status') {
        return `${user} cambió el estado de "${entry.oldValue}" a "${entry.newValue}"`;
      }
      if (entry.field === 'endDate') {
        return `${user} movió la fecha de fin de ${formatDate(entry.oldValue)} a ${formatDate(entry.newValue)}`;
      }
      if (entry.field === 'owner') {
        return `${user} reasignó de ${entry.oldValue} a ${entry.newValue}`;
      }
      return `${user} modificó ${field}`;
    case 'deleted':
      return `${user} eliminó la tarea`;
    case 'restored':
      return `${user} restauró la tarea a una versión anterior`;
    default:
      return `${user} realizó una acción: ${entry.action}`;
  }
}

/**
 * Obtiene label amigable de un campo
 */
function getFieldLabel(field) {
  const labels = {
    name: 'Nombre',
    status: 'Estado',
    priority: 'Prioridad',
    startDate: 'Fecha inicio',
    endDate: 'Fecha fin',
    owner: 'Responsable',
    ws: 'Workstream',
    deps: 'Dependencias',
    isMilestone: 'Es hito',
    risk: 'Riesgo',
    notes: 'Notas',
  };
  return labels[field] || field;
}

/**
 * Obtiene diff visual para un campo específico
 */
function getVisualDiff(field, oldValue, newValue) {
  if (field === 'endDate' || field === 'startDate') {
    const oldDate = new Date(oldValue);
    const newDate = new Date(newValue);
    const diff = Math.floor((newDate - oldDate) / (1000 * 60 * 60 * 24));

    return {
      type: 'date',
      oldFormatted: formatDate(oldValue),
      newFormatted: formatDate(newValue),
      daysDiff: diff,
      direction: diff > 0 ? 'forward' : 'backward',
      message: diff > 0 ? `+${diff} días` : `${diff} días`,
    };
  }

  if (field === 'deps') {
    const oldDeps = Array.isArray(oldValue) ? oldValue : [];
    const newDeps = Array.isArray(newValue) ? newValue : [];
    const added = newDeps.filter(d => !oldDeps.includes(d));
    const removed = oldDeps.filter(d => !newDeps.includes(d));

    return {
      type: 'array',
      added,
      removed,
      message: `${added.length > 0 ? `+${added.length}` : ''}${removed.length > 0 ? ` -${removed.length}` : ''}`,
    };
  }

  return {
    type: 'text',
    old: String(oldValue),
    new: String(newValue),
  };
}

/**
 * Helpers
 */
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`;
  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace unos segundos';
}

function getActionIcon(action) {
  const icons = {
    created: '✨',
    updated: '✏️',
    deleted: '🗑️',
    restored: '↩️',
  };
  return icons[action] || '📝';
}

function getActionColor(action) {
  const colors = {
    created: '#96C7B3', // Verde
    updated: '#6398A9', // Azul
    deleted: '#C0564A', // Rojo
    restored: '#E2B93B', // Amarillo
  };
  return colors[action] || '#5C5650';
}

export default {
  logChange,
  getTaskHistory,
  getProjectHistory,
  restoreTaskToSnapshot,
  generateDiff,
};
