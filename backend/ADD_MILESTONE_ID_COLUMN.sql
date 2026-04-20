-- ============================================================================
-- AGREGAR COLUMNA milestone_id A LA TABLA tasks
-- ============================================================================
-- Ejecuta esto en Supabase SQL Editor
-- ============================================================================

-- Paso 1: Agregar columna milestone_id (UUID que referencia a otra tarea que es hito)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS milestone_id UUID;

-- Paso 2: Crear índice para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

-- Paso 3: Agregar constraint de foreign key para asegurar integridad referencial
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS fk_milestone;

ALTER TABLE tasks
ADD CONSTRAINT fk_milestone
  FOREIGN KEY (milestone_id)
  REFERENCES tasks(id)
  ON DELETE SET NULL;

-- Paso 4: Verificar que se creó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'milestone_id';

-- ============================================================================
-- ¡LISTO! Ahora puedes relacionar cada tarea con un hito
-- La columna "Hito" en ExcelTasksView mostrará solo las tareas marcadas como hitos
-- ============================================================================
