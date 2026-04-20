-- =============================================
-- MIGRACION V2: Nuevas columnas para modelo enriquecido
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Agregar columnas v2 a la tabla tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS family TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "familyLabel" TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'task';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pillar TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'pre';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'global';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS spaces JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- 2. Indices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_tasks_family ON tasks(family);
CREATE INDEX IF NOT EXISTS idx_tasks_level ON tasks(level);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON tasks(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_scope ON tasks(scope);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent);

-- 3. Tabla de historial de cambios (si no existe)
CREATE TABLE IF NOT EXISTS task_history (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT DEFAULT 'usuario',
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_changed_at ON task_history(changed_at DESC);

-- 4. Tabla de snapshots (backups completos)
CREATE TABLE IF NOT EXISTS task_snapshots (
  id SERIAL PRIMARY KEY,
  reason TEXT,
  task_count INTEGER,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Trigger para guardar historial automaticamente
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Comparar cada campo y registrar cambios
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'name', OLD.name, NEW.name);
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'status', OLD.status, NEW.status);
  END IF;
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'priority', OLD.priority, NEW.priority);
  END IF;
  IF OLD.owner IS DISTINCT FROM NEW.owner THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'owner', OLD.owner, NEW.owner);
  END IF;
  IF OLD."startDate" IS DISTINCT FROM NEW."startDate" THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'startDate', OLD."startDate"::TEXT, NEW."startDate"::TEXT);
  END IF;
  IF OLD."endDate" IS DISTINCT FROM NEW."endDate" THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'endDate', OLD."endDate"::TEXT, NEW."endDate"::TEXT);
  END IF;
  IF OLD.family IS DISTINCT FROM NEW.family THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'family', OLD.family, NEW.family);
  END IF;
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO task_history (task_id, field, old_value, new_value) VALUES (NEW.id, 'stage', OLD.stage, NEW.stage);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger (drop primero si existe)
DROP TRIGGER IF EXISTS task_change_trigger ON tasks;
CREATE TRIGGER task_change_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_changes();

-- 6. Funcion para crear snapshot
CREATE OR REPLACE FUNCTION create_task_snapshot(reason_text TEXT DEFAULT 'manual')
RETURNS INTEGER AS $$
DECLARE
  snap_id INTEGER;
BEGIN
  INSERT INTO task_snapshots (reason, task_count, data)
  SELECT reason_text, COUNT(*), jsonb_agg(to_jsonb(t))
  FROM tasks t
  WHERE deleted = false OR deleted IS NULL
  RETURNING id INTO snap_id;

  RETURN snap_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificacion
SELECT 'Migracion V2 completada' as status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tasks') as total_columns;
