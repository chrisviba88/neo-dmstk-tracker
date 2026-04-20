-- Migration: Update activity_log table to match history.service.js expectations
-- Run this in Supabase SQL Editor

-- Drop existing table if needed (backup data first if you have important history!)
DROP TABLE IF EXISTS activity_log CASCADE;

-- Create new activity_log table with correct schema
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,  -- Not a foreign key to allow logging deleted tasks
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,  -- 'created', 'updated', 'deleted', 'restored'
  field TEXT,  -- Campo modificado (ej: 'endDate', 'status')
  old_value TEXT,  -- JSON string of old value
  new_value TEXT,  -- JSON string of new value
  reason TEXT,  -- Opcional: razón del cambio
  metadata JSONB DEFAULT '{}',  -- Datos adicionales
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_activity_task_id ON activity_log(task_id);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp DESC);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_user_id ON activity_log(user_id);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Enable read access for all users" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON activity_log FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON activity_log TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO postgres, anon, authenticated, service_role;
