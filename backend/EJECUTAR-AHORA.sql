-- ======================================================
-- EJECUTAR ESTE ARCHIVO EN SUPABASE SQL EDITOR
-- ======================================================
-- 1. Ve a: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto Neo DMSTK
-- 3. Ve a: SQL Editor → New query
-- 4. Copia y pega TODO este archivo
-- 5. Haz clic en RUN
-- 6. Deberías ver: "Success. No rows returned"
-- ======================================================

-- Eliminar trigger problemático
DROP TRIGGER IF EXISTS log_task_changes_trigger ON tasks;

-- Eliminar función asociada
DROP FUNCTION IF EXISTS log_task_changes();

-- ======================================================
-- VERIFICACIÓN (ejecutar después):
-- ======================================================
-- SELECT * FROM pg_trigger WHERE tgrelid = 'tasks'::regclass;
--
-- RESULTADO ESPERADO:
-- Solo debe aparecer: update_tasks_updated_at
-- NO debe aparecer: log_task_changes_trigger
-- ======================================================
