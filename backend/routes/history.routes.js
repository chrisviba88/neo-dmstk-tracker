/**
 * HISTORY ROUTES
 * API endpoints para sistema de historial y versionado (estilo Google Docs)
 */

import express from 'express';
import {
  logChange,
  getTaskHistory,
  getProjectHistory,
  restoreTaskToSnapshot,
  generateDiff,
} from '../modules/history/history.service.js';

const router = express.Router();

/**
 * GET /api/history/task/:taskId
 * Obtiene el historial completo de una tarea
 */
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit, offset, userId, action, field, startDate, endDate } = req.query;

    const history = await getTaskHistory(taskId, {
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
      userId,
      action,
      field,
      startDate,
      endDate,
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      error: 'Error obteniendo historial de tarea',
      details: error.message
    });
  }
});

/**
 * GET /api/history/project
 * Obtiene el historial global del proyecto
 */
router.get('/project', async (req, res) => {
  try {
    const { limit, offset, userId, action, startDate, endDate } = req.query;

    const history = await getProjectHistory({
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      userId,
      action,
      startDate,
      endDate,
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching project history:', error);
    res.status(500).json({
      error: 'Error obteniendo historial del proyecto',
      details: error.message
    });
  }
});

/**
 * POST /api/history/restore
 * Restaura una tarea a un snapshot anterior
 */
router.post('/restore', async (req, res) => {
  try {
    const { taskId, snapshotId, user } = req.body;

    if (!taskId || !snapshotId) {
      return res.status(400).json({
        error: 'taskId y snapshotId son requeridos'
      });
    }

    if (!user || !user.id || !user.name) {
      return res.status(400).json({
        error: 'Información de usuario es requerida (id, name)'
      });
    }

    const restoredTask = await restoreTaskToSnapshot(taskId, snapshotId, user);

    res.json(restoredTask);
  } catch (error) {
    console.error('Error restoring task:', error);
    res.status(500).json({
      error: 'Error restaurando tarea',
      details: error.message
    });
  }
});

/**
 * POST /api/history/log
 * Registra un cambio manualmente (normalmente se hace automáticamente)
 */
router.post('/log', async (req, res) => {
  try {
    const change = req.body;

    if (!change.taskId || !change.userId || !change.action) {
      return res.status(400).json({
        error: 'taskId, userId y action son requeridos'
      });
    }

    const entry = await logChange(change);

    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error('Error logging change:', error);
    res.status(500).json({
      error: 'Error registrando cambio',
      details: error.message
    });
  }
});

/**
 * POST /api/history/diff
 * Genera un diff entre dos versiones de una tarea
 */
router.post('/diff', async (req, res) => {
  try {
    const { oldVersion, newVersion } = req.body;

    if (!oldVersion || !newVersion) {
      return res.status(400).json({
        error: 'oldVersion y newVersion son requeridos'
      });
    }

    const diff = generateDiff(oldVersion, newVersion);

    res.json({
      success: true,
      diff,
    });
  } catch (error) {
    console.error('Error generating diff:', error);
    res.status(500).json({
      error: 'Error generando diff',
      details: error.message
    });
  }
});

export default router;
