-- ======================================================
-- AÑADIR COLUMNA 'project' A LA TABLA tasks
-- ======================================================
-- EJECUTAR ESTE ARCHIVO EN SUPABASE SQL EDITOR
--
-- 1. Ve a: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto Neo DMSTK
-- 3. Ve a: SQL Editor → New query
-- 4. Copia y pega TODO este archivo
-- 5. Haz clic en RUN
-- ======================================================

-- Añadir columna project (texto, nullable)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS project TEXT;

-- Crear índice para mejorar performance en agrupaciones
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project);

-- Comentario en la columna
COMMENT ON COLUMN tasks.project IS 'Proyecto jerárquico al que pertenece la tarea. Formato: "Proyecto Padre > Subproyecto"';

-- ======================================================
-- VERIFICACIÓN
-- ======================================================
-- Ejecuta esto después para verificar:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'tasks' AND column_name = 'project';
--
-- Debe mostrar: project | text | YES
-- ======================================================
