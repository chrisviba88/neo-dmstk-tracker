import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verificarEstado() {
  console.log('🔍 Verificando estado actual de Supabase...\n');

  // Contar tareas totales
  const { count: totalTasks, error: errorCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true });

  if (errorCount) {
    console.error('❌ Error al contar tareas:', errorCount);
    return;
  }

  console.log(`📊 Total de tareas en Supabase: ${totalTasks}`);

  // Obtener IDs de todas las tareas
  const { data: tasks, error: errorTasks } = await supabase
    .from('tasks')
    .select('id, name, project')
    .order('id');

  if (errorTasks) {
    console.error('❌ Error al obtener tareas:', errorTasks);
    return;
  }

  // Contar proyectos únicos
  const proyectos = new Set(tasks.filter(t => t.project).map(t => t.project));
  console.log(`📁 Proyectos únicos: ${proyectos.size}`);
  console.log('\nProyectos encontrados:');
  proyectos.forEach(p => console.log(`  - ${p}`));

  console.log('\n📝 Primeras 5 tareas:');
  tasks.slice(0, 5).forEach(t => {
    console.log(`  ${t.id}: ${t.name} [${t.project || 'Sin proyecto'}]`);
  });

  console.log('\n✅ Verificación completada');
}

verificarEstado();
