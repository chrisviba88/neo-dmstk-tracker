ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_milestone;

ALTER TABLE tasks ADD CONSTRAINT fk_milestone FOREIGN KEY (milestone_id) REFERENCES tasks(id) ON DELETE SET NULL;

SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'milestone_id';
