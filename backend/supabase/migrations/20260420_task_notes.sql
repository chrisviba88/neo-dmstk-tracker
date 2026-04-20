-- =============================================
-- Sistema de notas/comentarios en tareas
-- Comunicacion transversal del equipo
-- =============================================

-- 1. Tabla de notas
CREATE TABLE IF NOT EXISTS task_notes (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notes_created ON task_notes(created_at DESC);

-- 2. RLS: todos autenticados pueden leer y escribir notas (incluso viewers)
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_auth" ON task_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "notes_insert_auth" ON task_notes
  FOR INSERT TO authenticated WITH CHECK (true);

-- Solo el autor puede borrar su propia nota
CREATE POLICY "notes_delete_own" ON task_notes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. Habilitar realtime para notas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'task_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE task_notes;
  END IF;
END $$;

-- 4. Verificacion
SELECT 'task_notes creada' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'task_notes') as exists;
