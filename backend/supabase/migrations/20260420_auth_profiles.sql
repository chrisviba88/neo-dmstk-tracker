-- =============================================
-- AUTH: Tabla de perfiles + roles + RLS
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'pm', 'viewer')),
  avatar_url TEXT,
  invited_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Indices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 4. RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios autenticados pueden ver todos los perfiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Solo el propio usuario puede editar su perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Solo admins pueden insertar nuevos perfiles (invitar)
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM profiles) -- primer usuario = admin
  );

-- 5. Actualizar RLS de tasks: solo usuarios autenticados
-- Primero eliminar politicas antiguas (abiertas a todos)
DROP POLICY IF EXISTS "Enable read access for all users" ON tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON tasks;

-- Nuevas politicas: autenticados pueden leer todo
CREATE POLICY "tasks_select_auth" ON tasks
  FOR SELECT TO authenticated
  USING (true);

-- Solo admin y pm pueden insertar/editar/eliminar
CREATE POLICY "tasks_insert_admin_pm" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pm'))
  );

CREATE POLICY "tasks_update_admin_pm" ON tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pm'))
  );

CREATE POLICY "tasks_delete_admin_pm" ON tasks
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pm'))
  );

-- 6. RLS para task_history, task_snapshots, activity_log
DROP POLICY IF EXISTS "Enable read access for all users" ON activity_log;
CREATE POLICY "activity_log_select_auth" ON activity_log
  FOR SELECT TO authenticated
  USING (true);

-- task_history: lectura para todos autenticados
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_history_select_auth" ON task_history
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_history_insert_auth" ON task_history
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- task_snapshots: lectura para todos, escritura admin/pm
ALTER TABLE task_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "task_snapshots_select_auth" ON task_snapshots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "task_snapshots_insert_admin" ON task_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'pm'))
  );

-- 7. Funcion helper para obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 8. Actualizar updated_at en profiles
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profile_updated_at();

-- 9. Verificacion
SELECT 'Auth migration completada' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'profiles') as profiles_table_exists;
