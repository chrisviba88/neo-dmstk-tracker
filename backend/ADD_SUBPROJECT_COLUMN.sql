-- ======================================================
-- AGREGAR COLUMNA 'subproject' A LA TABLA 'tasks'
-- ======================================================
-- Este script agrega la columna subproject para soportar
-- la jerarquía Proyecto Principal > Subproyecto
--
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ======================================================

-- Agregar columna subproject (si no existe)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS subproject TEXT;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_tasks_subproject ON tasks(subproject);

-- Comentario
COMMENT ON COLUMN tasks.subproject IS 'Subproyecto dentro del proyecto principal (ej: "Método" dentro de "Global")';

-- ======================================================
-- VERIFICACIÓN
-- ======================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'tasks' AND column_name = 'subproject';
-- ======================================================
