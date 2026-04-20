const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, name, project')
    .order('id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Contar por proyecto
  const projectCounts = {};
  let sinProyecto = 0;
  
  data.forEach(task => {
    if (!task.project || task.project === '' || task.project === null || task.project === 'Sin proyecto asignado') {
      sinProyecto++;
    } else {
      projectCounts[task.project] = (projectCounts[task.project] || 0) + 1;
    }
  });
  
  console.log('TAREAS SIN PROYECTO:', sinProyecto);
  console.log('\nTAREAS POR PROYECTO:');
  Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      console.log(count + ' - ' + project);
    });
  console.log('\nTOTAL TAREAS:', data.length);
})();
