import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import dependenciesRoutes, { setSupabaseClient as setDepsSupabase } from './routes/dependencies.routes.js';
import historyRoutes from './routes/history.routes.js';
import { setSupabaseClient as setHistorySupabase, logChange } from './modules/history/history.service.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Inicializar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Inject Supabase client into routes and services
setDepsSupabase(supabase);
setHistorySupabase(supabase);

app.use(cors());
app.use(express.json());

// Registrar rutas modulares
app.use('/api/dependencies', dependenciesRoutes);
app.use('/api/history', historyRoutes);

// Estado de usuarios conectados
const connectedUsers = new Map();

// Socket.io para tiempo real
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on('user:join', (userData) => {
    connectedUsers.set(socket.id, userData);
    io.emit('users:update', Array.from(connectedUsers.values()));
  });

  socket.on('task:update', async (task) => {
    try {
      // Obtener tarea actual para comparar cambios
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task.id)
        .single();

      const isNewTask = !existingTask;

      // Upsert la tarea
      const { data, error } = await supabase
        .from('tasks')
        .upsert(task)
        .select();

      if (error) throw error;

      const updatedTask = data[0];

      // Registrar cambio en historial
      // TEMPORALMENTE DESHABILITADO - Schema mismatch entre activity_log actual y el esperado
      // TODO: Ejecutar migration-activity-log.sql en Supabase para habilitar logging
      /*
      const userData = connectedUsers.get(socket.id) || { name: 'Usuario Desconocido' };

      if (isNewTask) {
        // Tarea nueva - log creation
        await logChange({
          taskId: updatedTask.id,
          userId: socket.id,
          userName: userData.name,
          action: 'created',
          field: null,
          oldValue: null,
          newValue: updatedTask,
          reason: 'Tarea creada',
        });
      } else {
        // Tarea existente - log updates por cada campo cambiado
        const fieldsToTrack = ['name', 'status', 'priority', 'startDate', 'endDate', 'owner', 'ws', 'deps', 'isMilestone', 'risk', 'notes'];

        for (const field of fieldsToTrack) {
          const oldValue = existingTask[field];
          const newValue = updatedTask[field];

          // Comparar valores (usar JSON.stringify para arrays/objects)
          const oldStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue;
          const newStr = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;

          if (oldStr !== newStr) {
            await logChange({
              taskId: updatedTask.id,
              userId: socket.id,
              userName: userData.name,
              action: 'updated',
              field: field,
              oldValue: oldValue,
              newValue: newValue,
            });
          }
        }
      }
      */

      // Broadcast a todos los clientes
      io.emit('task:updated', updatedTask);
    } catch (error) {
      console.error('Error in task:update:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('task:delete', async (taskId) => {
    try {
      // Obtener la tarea antes de eliminarla
      const { data: taskToDelete } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      // Eliminar la tarea
      await supabase.from('tasks').delete().eq('id', taskId);

      // Registrar eliminación en historial
      // TEMPORALMENTE DESHABILITADO - Schema mismatch
      /*
      const userData = connectedUsers.get(socket.id) || { name: 'Usuario Desconocido' };

      if (taskToDelete) {
        await logChange({
          taskId: taskId,
          userId: socket.id,
          userName: userData.name,
          action: 'deleted',
          field: null,
          oldValue: taskToDelete,
          newValue: null,
          reason: 'Tarea eliminada',
        });
      }
      */

      io.emit('task:deleted', taskId);
    } catch (error) {
      console.error('Error in task:delete:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    io.emit('users:update', Array.from(connectedUsers.values()));
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

// API REST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('endDate', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(req.body)
      .select();

    if (error) throw error;

    const newTask = data[0];

    // Registrar creación en historial
    // TEMPORALMENTE DESHABILITADO - Schema mismatch
    /*
    await logChange({
      taskId: newTask.id,
      userId: 'api',
      userName: 'API',
      action: 'created',
      field: null,
      oldValue: null,
      newValue: newTask,
      reason: 'Tarea creada via API',
    });
    */

    // Notificar via Socket.IO
    io.emit('task:created', newTask);
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/owners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para el agente de chat
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { question } = req.body;

    // Obtener todas las tareas para contexto
    const { data: tasks } = await supabase.from('tasks').select('*');

    // Aquí integraremos OpenAI
    const response = await askAgent(question, tasks);

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Función del agente IA (placeholder)
async function askAgent(question, tasks) {
  // Por ahora un placeholder - implementaremos OpenAI después
  const overdueTasks = tasks.filter(t =>
    t.status !== 'Hecho' && new Date(t.endDate) < new Date()
  );

  if (question.toLowerCase().includes('vencidas') || question.toLowerCase().includes('atrasadas')) {
    return `Actualmente hay ${overdueTasks.length} tareas vencidas: ${overdueTasks.map(t => t.name).join(', ')}`;
  }

  return `Hay ${tasks.length} tareas en total. ${tasks.filter(t => t.status === 'Hecho').length} completadas.`;
}

// Monitoreo diario automático - corre todos los días a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Ejecutando monitoreo diario...');

  try {
    const { data: tasks } = await supabase.from('tasks').select('*');

    const today = new Date();
    const overdue = tasks.filter(t =>
      t.status !== 'Hecho' && new Date(t.endDate) < today
    );
    const dueSoon = tasks.filter(t => {
      const daysLeft = Math.ceil((new Date(t.endDate) - today) / (1000 * 60 * 60 * 24));
      return t.status !== 'Hecho' && daysLeft >= 0 && daysLeft <= 7;
    });

    const report = {
      timestamp: today.toISOString(),
      overdue: overdue.length,
      dueSoon: dueSoon.length,
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Hecho').length
    };

    // Guardar reporte
    await supabase.from('daily_reports').insert(report);

    // Notificar a todos los clientes conectados
    io.emit('daily:report', report);

    console.log('Reporte diario generado:', report);
  } catch (error) {
    console.error('Error en monitoreo diario:', error);
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🤖 Agente de monitoreo activo`);
});
