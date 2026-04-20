import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const { data, error } = await supabase
  .from('tasks')
  .select('id, name, project')
  .order('id');

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

// Contar por proyecto
const projectCounts = {};
let sinProyecto = 0;
const tareasSinProyecto = [];

data.forEach(task => {
  if (!task.project || task.project === '' || task.project === null || task.project === 'Sin proyecto asignado') {
    sinProyecto++;
    tareasSinProyecto.push(`${task.id} - ${task.name}`);
  } else {
    projectCounts[task.project] = (projectCounts[task.project] || 0) + 1;
  }
});

console.log('\n========================================');
console.log('TAREAS SIN PROYECTO:', sinProyecto);
console.log('========================================');
tareasSinProyecto.forEach(t => console.log(t));

console.log('\n========================================');
console.log('TAREAS POR PROYECTO:');
console.log('========================================');
Object.entries(projectCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([project, count]) => {
    console.log(count + ' - ' + project);
  });
console.log('\n========================================');
console.log('TOTAL TAREAS:', data.length);
console.log('========================================');
