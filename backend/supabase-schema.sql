-- Schema para Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- Tabla de tareas
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ws TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  owner TEXT NOT NULL,
  "isMilestone" BOOLEAN DEFAULT false,
  risk TEXT,
  notes TEXT,
  deps JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Tabla de owners/miembros del equipo
CREATE TABLE owners (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes diarios
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  overdue INTEGER,
  "dueSoon" INTEGER,
  total INTEGER,
  completed INTEGER,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividad/historial
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  action TEXT NOT NULL,
  user_name TEXT,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes del chat con el agente
CREATE TABLE agent_conversations (
  id SERIAL PRIMARY KEY,
  user_name TEXT,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_endDate ON tasks("endDate");
CREATE INDEX idx_tasks_owner ON tasks(owner);
CREATE INDEX idx_activity_task ON activity_log(task_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios en activity_log
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO activity_log (task_id, action, changes)
    VALUES (NEW.id, 'UPDATE', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO activity_log (task_id, action, changes)
    VALUES (NEW.id, 'CREATE', to_jsonb(NEW));
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO activity_log (task_id, action, changes)
    VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_task_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_changes();

-- Habilitar Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (por ahora permitir todo - personalizar según necesidad)
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON tasks FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON owners FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON owners FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON daily_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON agent_conversations FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON agent_conversations FOR INSERT WITH CHECK (true);

-- Insertar owners iniciales
INSERT INTO owners (name) VALUES
  ('David'),
  ('Christian'),
  ('Cristina'),
  ('Miguel Márquez'),
  ('Profesora'),
  ('Mavi'),
  ('Estudio Branding'),
  ('Facilitador'),
  ('Empresa Reformas'),
  ('Equipo Tech'),
  ('Por asignar')
ON CONFLICT (name) DO NOTHING;
