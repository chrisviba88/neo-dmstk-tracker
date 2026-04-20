# Arquitectura del Sistema de Historial

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                         App.jsx                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │  │
│  │  │  Dashboard  │  │    Tasks    │  │  🕐 History Button   │  │  │
│  │  │    View     │  │    View     │  │  (Reemplaza Reset)   │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────────┘  │  │
│  │                                                                 │  │
│  │  User Actions:                                                  │  │
│  │  • Create Task  ──────┐                                        │  │
│  │  • Update Task  ──────┼───► Socket.IO emit                     │  │
│  │  • Delete Task  ──────┘     (task:update / task:delete)        │  │
│  │  • View History ───────────► Abre HistoryViewer                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              HistoryViewer.jsx (Panel Lateral)                 │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Filtros: [Todos] [Actualizaciones] [Cambios mayores]   │  │  │
│  │  ├─────────────────────────────────────────────────────────┤  │  │
│  │  │  Timeline:                                               │  │  │
│  │  │  ● ✨ Usuario creó la tarea                             │  │  │
│  │  │  │   hace 2 horas                                        │  │  │
│  │  │  │   [Expandir para ver diff]                           │  │  │
│  │  │  ●                                                        │  │  │
│  │  │  │ ✏️ Usuario cambió estado                             │  │  │
│  │  │  │   hace 1 hora                                         │  │  │
│  │  │  │   [Antes: Pendiente → Después: En curso]             │  │  │
│  │  │  │   [Restaurar a esta versión]                         │  │  │
│  │  │  ●                                                        │  │  │
│  │  │  │ 🗑️ Usuario eliminó la tarea                          │  │  │
│  │  │  │   hace 30 min                                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                                 │  │
│  │  API Calls:                                                     │  │
│  │  • GET /api/history/project  ──► Cargar historial global      │  │
│  │  • GET /api/history/task/:id ──► Historial de tarea           │  │
│  │  • POST /api/history/restore ──► Restaurar versión            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Socket.IO / HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        server.js                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │              Socket.IO Event Handlers                    │  │  │
│  │  │                                                           │  │  │
│  │  │  socket.on('task:update', async (task) => {              │  │  │
│  │  │    1. Obtener tarea actual de Supabase                   │  │  │
│  │  │    2. Determinar si es nueva o actualización             │  │  │
│  │  │    3. Upsert tarea                                        │  │  │
│  │  │                                                           │  │  │
│  │  │    if (nueva) {                                           │  │  │
│  │  │      ──► logChange({ action: 'created' })                │  │  │
│  │  │    } else {                                               │  │  │
│  │  │      Para cada campo modificado:                         │  │  │
│  │  │      ──► logChange({                                     │  │  │
│  │  │            action: 'updated',                            │  │  │
│  │  │            field, oldValue, newValue                     │  │  │
│  │  │          })                                               │  │  │
│  │  │    }                                                      │  │  │
│  │  │                                                           │  │  │
│  │  │    4. Broadcast task:updated a todos                     │  │  │
│  │  │  })                                                       │  │  │
│  │  │                                                           │  │  │
│  │  │  socket.on('task:delete', async (taskId) => {            │  │  │
│  │  │    1. Obtener tarea antes de eliminar                    │  │  │
│  │  │    2. Delete de Supabase                                 │  │  │
│  │  │    3. ──► logChange({ action: 'deleted' })               │  │  │
│  │  │    4. Broadcast task:deleted                             │  │  │
│  │  │  })                                                       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  routes/history.routes.js                      │  │
│  │                                                                 │  │
│  │  GET  /api/history/task/:taskId                                │  │
│  │       ──► getTaskHistory(taskId, options)                      │  │
│  │                                                                 │  │
│  │  GET  /api/history/project                                     │  │
│  │       ──► getProjectHistory(options)                           │  │
│  │                                                                 │  │
│  │  POST /api/history/restore                                     │  │
│  │       ──► restoreTaskToSnapshot(taskId, snapshotId, user)     │  │
│  │                                                                 │  │
│  │  POST /api/history/log                                         │  │
│  │       ──► logChange(change)  [Manual logging]                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │            modules/history/history.service.js                  │  │
│  │                                                                 │  │
│  │  logChange(change)                                             │  │
│  │    • Estructura el objeto de cambio                            │  │
│  │    • JSON.stringify de old/new values                         │  │
│  │    • INSERT en activity_log                                    │  │
│  │    • Return entry creada                                       │  │
│  │                                                                 │  │
│  │  getTaskHistory(taskId, options)                               │  │
│  │    • Query activity_log WHERE task_id                          │  │
│  │    • Ordenar por timestamp DESC                                │  │
│  │    • Aplicar filtros (user, action, field, dates)             │  │
│  │    • enrichHistoryEntry() en cada resultado                    │  │
│  │                                                                 │  │
│  │  getProjectHistory(options)                                    │  │
│  │    • Query activity_log global                                 │  │
│  │    • JOIN con tasks para obtener nombre                        │  │
│  │    • Aplicar filtros y paginación                             │  │
│  │                                                                 │  │
│  │  restoreTaskToSnapshot(taskId, snapshotId, user)              │  │
│  │    • Obtener snapshot del historial                            │  │
│  │    • reconstructTaskAtTimestamp()                              │  │
│  │    • UPDATE task con estado restaurado                         │  │
│  │    • logChange({ action: 'restored' })                        │  │
│  │                                                                 │  │
│  │  reconstructTaskAtTimestamp(taskId, timestamp)                 │  │
│  │    • Query todos los cambios hasta timestamp                   │  │
│  │    • Aplicar cambios secuencialmente                          │  │
│  │    • Return estado reconstruido                                │  │
│  │                                                                 │  │
│  │  generateDiff(oldVersion, newVersion)                          │  │
│  │    • Comparar objetos campo por campo                          │  │
│  │    • Clasificar: added, removed, modified                      │  │
│  │    • getVisualDiff() para tipos especiales (dates, arrays)    │  │
│  │                                                                 │  │
│  │  enrichHistoryEntry(entry)                                     │  │
│  │    • Parse JSON values                                         │  │
│  │    • Format timestamps                                         │  │
│  │    • Generate descriptions (human-readable)                    │  │
│  │    • Add icons and colors                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (PostgreSQL)                         │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                       tasks table                              │  │
│  │  ┌──────────┬──────────┬────────┬──────────┬───────┬────────┐ │  │
│  │  │ id (PK)  │   name   │  ws    │  status  │ owner │  ...   │ │  │
│  │  ├──────────┼──────────┼────────┼──────────┼───────┼────────┤ │  │
│  │  │ abc123   │ Task 1   │ Tech   │ En curso │ David │  ...   │ │  │
│  │  │ def456   │ Task 2   │ Legal  │ Hecho    │ Chris │  ...   │ │  │
│  │  └──────────┴──────────┴────────┴──────────┴───────┴────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    activity_log table                          │  │
│  │  ┌────┬─────────┬─────────┬──────────┬────────┬───────┬─────┐ │  │
│  │  │ id │ task_id │user_name│  action  │ field  │old_val│new..│ │  │
│  │  ├────┼─────────┼─────────┼──────────┼────────┼───────┼─────┤ │  │
│  │  │ 1  │ abc123  │ Usuario │ created  │ null   │ null  │{...}│ │  │
│  │  │ 2  │ abc123  │ Usuario │ updated  │ status │"Pend" │"En..│ │  │
│  │  │ 3  │ abc123  │ Usuario │ updated  │priority│"Alta" │"Med"│ │  │
│  │  │ 4  │ abc123  │ Usuario │restored  │ all    │{...}  │{...}│ │  │
│  │  │ 5  │ def456  │ Usuario │ deleted  │ null   │{...}  │null │ │  │
│  │  └────┴─────────┴─────────┴──────────┴────────┴───────┴─────┘ │  │
│  │                                                                 │  │
│  │  Indices:                                                       │  │
│  │  • idx_activity_task_id (task_id)                              │  │
│  │  • idx_activity_timestamp (timestamp DESC)                     │  │
│  │  • idx_activity_action (action)                                │  │
│  │  • idx_activity_user_id (user_id)                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                          FLUJO DE DATOS
═══════════════════════════════════════════════════════════════════════

1. CREAR TAREA
   Usuario → Frontend → Socket.emit('task:update', newTask)
   ↓
   Backend detecta isNewTask = true
   ↓
   Supabase: INSERT INTO tasks
   ↓
   logChange({ action: 'created', newValue: fullTask })
   ↓
   Supabase: INSERT INTO activity_log
   ↓
   Socket broadcast: task:updated
   ↓
   Frontend: Actualiza lista de tareas

2. ACTUALIZAR TAREA
   Usuario cambia campo → Frontend → Socket.emit('task:update', task)
   ↓
   Backend obtiene tarea actual de Supabase
   ↓
   Compara campo por campo (status, priority, dates, etc.)
   ↓
   Para cada cambio:
     logChange({ action: 'updated', field, oldValue, newValue })
   ↓
   Supabase: UPDATE tasks + múltiples INSERT activity_log
   ↓
   Socket broadcast
   ↓
   Frontend actualiza

3. VER HISTORIAL
   Usuario click History → Frontend abre HistoryViewer
   ↓
   fetch('/api/history/project')
   ↓
   Backend: getProjectHistory()
   ↓
   Supabase: SELECT * FROM activity_log ORDER BY timestamp DESC
   ↓
   enrichHistoryEntry() para cada entrada
     • Parse JSON
     • Format dates
     • Generate descriptions
     • Add icons/colors
   ↓
   Return enriched history
   ↓
   Frontend: Render timeline con diff visual

4. RESTAURAR
   Usuario click "Restaurar" → Frontend POST /api/history/restore
   ↓
   Backend: restoreTaskToSnapshot()
   ↓
   reconstructTaskAtTimestamp():
     • Query cambios hasta timestamp
     • Aplicar secuencialmente
     • Reconstruir estado exacto
   ↓
   Supabase: UPDATE tasks con estado restaurado
   ↓
   logChange({ action: 'restored', metadata: { snapshotId } })
   ↓
   Return tarea restaurada
   ↓
   Frontend: Actualiza UI + recarga historial

═══════════════════════════════════════════════════════════════════════
                        SEGURIDAD Y PERMISOS
═══════════════════════════════════════════════════════════════════════

RLS (Row Level Security) en Supabase:
• tasks: Lectura/escritura para todos (PUBLIC)
• activity_log: Solo lectura para todos, escritura vía service_role
• Políticas configuradas en migration-activity-log.sql

Autenticación:
• Actualmente: socket.id como user_id temporal
• Próximo: Integrar Supabase Auth para usuarios reales

Validación:
• Backend valida que tarea existe antes de restaurar
• Frontend requiere confirmación para restauraciones
• Todo cambio queda auditado permanentemente
```
