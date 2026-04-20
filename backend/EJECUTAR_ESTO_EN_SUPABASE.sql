-- ============================================================================
-- INSTRUCCIONES: EJECUTAR ESTO EN SUPABASE SQL EDITOR
-- ============================================================================
-- 1. Ve a: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a: SQL Editor → New query
-- 4. Copia y pega TODO este archivo
-- 5. Haz clic en RUN
-- ============================================================================

-- Paso 1: Agregar columna subproject
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS subproject TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_subproject ON tasks(subproject);

-- Paso 2: Poblar automáticamente proyecto principal y subproyecto
-- Esto analiza los proyectos existentes y los separa

-- Para proyectos con formato "E1 Madrid > Legal & Licencias"
UPDATE tasks
SET
  project = SPLIT_PART(project, '>', 1),
  subproject = TRIM(SPLIT_PART(project, '>', 2))
WHERE project LIKE '%>%'
  AND project NOT LIKE 'Global:%';

-- Para proyectos con formato "Global: Branding & Comunicación"
UPDATE tasks
SET
  project = 'Global',
  subproject = TRIM(SUBSTRING(project FROM 8))
WHERE project LIKE 'Global:%';

-- Paso 3: Normalizar proyectos principales
UPDATE tasks
SET project = TRIM(project)
WHERE project IS NOT NULL;

-- Paso 4: Limpiar subproyectos vacíos
UPDATE tasks
SET subproject = NULL
WHERE subproject = '';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Ver las primeras 20 tareas con su estructura actualizada
SELECT
  id,
  name,
  project AS proyecto_principal,
  subproject AS subproyecto
FROM tasks
WHERE project IS NOT NULL
ORDER BY project, subproject
LIMIT 20;

-- Contar tareas por proyecto principal
SELECT
  project AS proyecto_principal,
  COUNT(*) AS total_tareas
FROM tasks
WHERE project IS NOT NULL
GROUP BY project
ORDER BY total_tareas DESC;

-- ============================================================================
-- ¡LISTO! Ahora recarga tu app en http://localhost:5174/
-- Las columnas "Proyecto Principal" y "Subproyecto" estarán pobladas
-- ============================================================================
