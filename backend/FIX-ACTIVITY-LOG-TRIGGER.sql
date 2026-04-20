-- =====================================================
-- SOLUCIÓN DEFINITIVA: Deshabilitar trigger automático
-- =====================================================
--
-- PROBLEMA IDENTIFICADO:
-- El archivo supabase-schema.sql define un TRIGGER automático (log_task_changes_trigger)
-- que se ejecuta AUTOMÁTICAMENTE cada vez que se hace INSERT/UPDATE/DELETE en la tabla tasks.
-- Este trigger intenta insertar en activity_log usando la columna 'changes' (JSONB),
-- pero la tabla actual NO tiene esa columna.
--
-- CAUSA RAÍZ:
-- Hay un desajuste entre dos versiones del schema:
-- 1. supabase-schema.sql: Define activity_log con columna 'changes' (JSONB)
-- 2. migration-activity-log.sql: Define activity_log con columnas separadas
--    (field, old_value, new_value) - el formato esperado por history.service.js
--
-- El trigger automático está usando el formato antiguo (changes),
-- pero la tabla tiene el formato nuevo (field, old_value, new_value).
--
-- SOLUCIÓN INMEDIATA:
-- Deshabilitar el trigger automático para que el guardado funcione YA.
-- Esto permite que las operaciones de tareas funcionen sin errores.
-- =====================================================

-- 1. DESHABILITAR el trigger automático que causa el error
DROP TRIGGER IF EXISTS log_task_changes_trigger ON tasks;

-- 2. ELIMINAR la función del trigger (ya no se necesita)
DROP FUNCTION IF EXISTS log_task_changes();

-- 3. VERIFICAR que la tabla activity_log existe con el schema correcto
-- Si no existe o tiene el schema incorrecto, ejecutar migration-activity-log.sql primero

-- =====================================================
-- VERIFICACIÓN (ejecutar después de aplicar este fix)
-- =====================================================
-- SELECT * FROM pg_trigger WHERE tgrelid = 'tasks'::regclass;
-- Debería retornar solo el trigger update_tasks_updated_at
-- NO debería aparecer log_task_changes_trigger
-- =====================================================

-- NOTA IMPORTANTE:
-- Una vez aplicado este fix, el logging de historial se hará SOLO desde el código Node.js
-- (server.js y history.service.js) cuando esté descomentado.
-- El trigger automático ya NO interferirá con las operaciones de guardado.
