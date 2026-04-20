import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🚀 CONFIGURANDO Y RELLENANDO SUBPROYECTOS...\n');

async function setupAndFillSubprojects() {
  try {
    // Paso 1: Verificar si la columna existe consultando una tarea
    console.log('📝 Verificando si la columna subproject existe...');
    const { data: testTask, error: testError } = await supabase
      .from('tasks')
      .select('id, project, subproject')
      .limit(1);

    if (testError && testError.message.includes('subproject')) {
      console.log('❌ La columna subproject NO existe.');
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   1. Ve a Supabase SQL Editor');
      console.log('   2. Ejecuta este comando:\n');
      console.log('      ALTER TABLE tasks ADD COLUMN subproject TEXT;');
      console.log('      CREATE INDEX idx_tasks_subproject ON tasks(subproject);\n');
      console.log('   3. Vuelve a ejecutar este script\n');
      return;
    }

    console.log('✅ La columna subproject existe\n');

    // Paso 2: Obtener todas las tareas
    console.log('📊 Obteniendo todas las tareas...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, project');

    if (tasksError) throw tasksError;
    console.log(`✅ ${tasks.length} tareas encontradas\n`);

    // Paso 3: Procesar cada tarea
    console.log('🔧 Procesando y actualizando tareas...\n');
    let updated = 0;
    let skipped = 0;

    for (const task of tasks) {
      if (!task.project || task.project === 'Sin proyecto asignado') {
        skipped++;
        continue;
      }

      let newProject = task.project;
      let newSubproject = null;

      // Analizar el proyecto
      if (task.project.includes('>')) {
        // Formato: "E1 Madrid > Legal & Licencias"
        const parts = task.project.split('>').map(s => s.trim());
        newProject = parts[0];
        newSubproject = parts[1];
      } else if (task.project.startsWith('Global:')) {
        // Formato: "Global: Branding & Comunicación"
        newProject = 'Global';
        newSubproject = task.project.replace('Global:', '').trim();
      }

      // Solo actualizar si hay cambios
      if (newProject !== task.project || newSubproject) {
        const { error } = await supabase
          .from('tasks')
          .update({
            project: newProject,
            subproject: newSubproject
          })
          .eq('id', task.id);

        if (error) {
          console.error(`❌ Error en ${task.id}:`, error.message);
        } else {
          updated++;
          if (updated % 50 === 0) {
            console.log(`   ✅ Actualizadas ${updated} tareas...`);
          }
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Actualizadas: ${updated} tareas`);
    console.log(`   - Omitidas: ${skipped} tareas\n`);

    // Paso 4: Mostrar muestra
    console.log('🔍 Verificando resultado...\n');
    const { data: sample } = await supabase
      .from('tasks')
      .select('name, project, subproject')
      .not('project', 'is', null)
      .order('project')
      .limit(12);

    if (sample) {
      console.log('📋 Primeras 12 tareas:');
      console.log('='.repeat(90));
      sample.forEach((t, idx) => {
        const name = t.name.length > 40 ? t.name.substring(0, 40) + '...' : t.name;
        const proj = t.project || 'N/A';
        const sub = t.subproject || '-';
        console.log(`${String(idx + 1).padStart(2)}. ${name.padEnd(43)} | ${proj.padEnd(15)} | ${sub}`);
      });
      console.log('='.repeat(90));
    }

    // Estadísticas
    const { data: stats } = await supabase
      .from('tasks')
      .select('project, subproject')
      .not('project', 'is', null);

    if (stats) {
      const withSub = stats.filter(t => t.subproject).length;
      const withoutSub = stats.filter(t => !t.subproject).length;
      console.log(`\n📊 Estadísticas:`);
      console.log(`   - Tareas con subproyecto: ${withSub}`);
      console.log(`   - Tareas sin subproyecto: ${withoutSub}`);
    }

    console.log('\n✅ ¡TODO LISTO!');
    console.log('💡 Recarga http://localhost:5174/ y ve a la pestaña "Tareas"\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupAndFillSubprojects();
