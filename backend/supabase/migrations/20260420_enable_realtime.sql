-- Habilitar Realtime para la tabla tasks
-- Esto permite que Supabase emita eventos cuando se insertan/actualizan/eliminan tareas

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Verificacion
SELECT 'Realtime habilitado para tasks' as status;
