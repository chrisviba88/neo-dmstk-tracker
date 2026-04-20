-- =============================================
-- FASE 5+6: Briefings diarios del PM + Backups automaticos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de briefings diarios del PM
CREATE TABLE IF NOT EXISTS pm_briefings (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary TEXT NOT NULL,
  alerts JSONB DEFAULT '[]',
  priorities JSONB DEFAULT '[]',
  generated_by TEXT DEFAULT 'gemini',
  task_count INTEGER,
  overdue_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

ALTER TABLE pm_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefings_select_auth" ON pm_briefings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "briefings_insert_auth" ON pm_briefings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pm'))
  );

-- 2. Asegurar que task_snapshots tiene RLS correcta
-- (puede que ya exista de migraciones anteriores)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_snapshots') THEN
    CREATE TABLE task_snapshots (
      id SERIAL PRIMARY KEY,
      reason TEXT,
      task_count INTEGER,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 3. Funcion para auto-backup diario
CREATE OR REPLACE FUNCTION auto_daily_backup()
RETURNS void AS $$
BEGIN
  -- Solo crear backup si no hay uno hoy
  IF NOT EXISTS (
    SELECT 1 FROM task_snapshots
    WHERE created_at::date = CURRENT_DATE
    AND reason = 'auto-daily'
  ) THEN
    INSERT INTO task_snapshots (reason, task_count, data)
    SELECT 'auto-daily', COUNT(*), jsonb_agg(to_jsonb(t))
    FROM tasks t
    WHERE deleted = false OR deleted IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Habilitar realtime para tasks (si no esta)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
END $$;

-- 5. Verificacion
SELECT 'Briefings + Backups + Realtime configurados' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'pm_briefings') as briefings_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'task_snapshots') as snapshots_table;
