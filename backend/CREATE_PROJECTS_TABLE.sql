-- ======================================================
-- CREAR TABLA 'projects' PARA GESTIÓN INDEPENDIENTE
-- ======================================================
-- EJECUTAR ESTE ARCHIVO EN SUPABASE SQL EDITOR
--
-- 1. Ve a: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto Neo DMSTK
-- 3. Ve a: SQL Editor → New query
-- 4. Copia y pega TODO este archivo
-- 5. Haz clic en RUN
-- ======================================================

-- Crear tabla projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent TEXT,
  level INTEGER DEFAULT 1,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_projects_parent ON projects(parent);
CREATE INDEX IF NOT EXISTS idx_projects_level ON projects(level);

-- Comentarios
COMMENT ON TABLE projects IS 'Tabla de proyectos independientes. Los proyectos pueden existir sin tareas asignadas.';
COMMENT ON COLUMN projects.parent IS 'ID del proyecto padre para jerarquía (NULL si es proyecto raíz)';
COMMENT ON COLUMN projects.level IS 'Nivel jerárquico: 1=Global, 2=Espacio (E1/E2/E3), 3=Subproyecto';

-- ======================================================
-- POBLAR CON PROYECTOS EXISTENTES
-- ======================================================

-- Insertar proyectos únicos desde tareas existentes
INSERT INTO projects (id, name, level)
SELECT
  LOWER(REPLACE(REPLACE(project, ' ', '_'), '>', '_')) as id,
  project as name,
  CASE
    WHEN project LIKE '%>%>%' THEN 3
    WHEN project LIKE '%>%' THEN 2
    ELSE 1
  END as level
FROM (
  SELECT DISTINCT project
  FROM tasks
  WHERE project IS NOT NULL
    AND project != ''
    AND project != 'Sin proyecto asignado'
) as unique_projects
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- VERIFICACIÓN
-- ======================================================
-- SELECT COUNT(*) as total_projects FROM projects;
-- SELECT * FROM projects ORDER BY level, name;
-- ======================================================
