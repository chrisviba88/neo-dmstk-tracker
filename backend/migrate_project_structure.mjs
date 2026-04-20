import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔄 MIGRANDO ESTRUCTURA DE PROYECTOS...\n');

async function migrateProjectStructure() {
  try {
    // 1. Primero agregar la columna subproject si no existe
    console.log('📝 Paso 1: Agregando columna subproject a tasks...');

    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS subproject TEXT;

        CREATE INDEX IF NOT EXISTS idx_tasks_subproject ON tasks(subproject);
      `
    });

    if (alterError) {
      console.log('⚠️  No se pudo ejecutar con RPC, continuando...');
    } else {
      console.log('✅ Columna subproject agregada\n');
    }

    // 2. Obtener todas las tareas
    console.log('📊 Paso 2: Obteniendo todas las tareas...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, project');

    if (tasksError) throw tasksError;
    console.log(`✅ ${tasks.length} tareas encontradas\n`);

    // 3. Separar proyectos en principal y subproyecto
    console.log('🔧 Paso 3: Separando proyectos en principal y subproyecto...');

    let updated = 0;
    let skipped = 0;

    for (const task of tasks) {
      if (!task.project || task.project === 'Sin proyecto asignado') {
        skipped++;
        continue;
      }

      let projectPrincipal = '';
      let subproject = '';

      // Analizar el formato del proyecto
      if (task.project.includes('>')) {
        // Formato: "E1 Madrid > Legal & Licencias"
        const parts = task.project.split('>').map(p => p.trim());
        projectPrincipal = parts[0];  // "E1 Madrid"
        subproject = parts[1];         // "Legal & Licencias"
      } else if (task.project.startsWith('Global:')) {
        // Formato: "Global: Branding & Comunicación"
        projectPrincipal = 'Global';
        subproject = task.project.replace('Global:', '').trim();
      } else if (task.project.includes('E1') || task.project.includes('Madrid')) {
        projectPrincipal = 'E1 Madrid';
        subproject = task.project;
      } else if (task.project.includes('E2') || task.project.includes('Barcelona')) {
        projectPrincipal = 'E2 Barcelona';
        subproject = task.project;
      } else if (task.project.includes('E3') || task.project.includes('México')) {
        projectPrincipal = 'E3 México';
        subproject = task.project;
      } else {
        // Proyecto sin clasificar - dejar como está
        projectPrincipal = task.project;
        subproject = '';
      }

      // Actualizar la tarea
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          project: projectPrincipal,
          subproject: subproject || null
        })
        .eq('id', task.id);

      if (updateError) {
        console.error(`❌ Error actualizando tarea ${task.id}:`, updateError.message);
      } else {
        updated++;
        if (updated % 50 === 0) {
          console.log(`   📝 Actualizadas ${updated} tareas...`);
        }
      }
    }

    console.log(`\n✅ Paso 3 completado:`);
    console.log(`   - Actualizadas: ${updated} tareas`);
    console.log(`   - Omitidas: ${skipped} tareas sin proyecto\n`);

    // 4. Verificar resultado
    console.log('🔍 Paso 4: Verificando migración...');
    const { data: verifyTasks, error: verifyError } = await supabase
      .from('tasks')
      .select('project, subproject')
      .not('project', 'is', null)
      .limit(10);

    if (!verifyError && verifyTasks) {
      console.log('\n📋 Primeras 10 tareas migradas:');
      console.log('='.repeat(80));
      verifyTasks.forEach((t, idx) => {
        console.log(`${idx + 1}. Proyecto: ${t.project || 'N/A'}`);
        console.log(`   Subproyecto: ${t.subproject || '(vacío)'}`);
        console.log('');
      });
      console.log('='.repeat(80));
    }

    console.log('\n✅ MIGRACIÓN COMPLETADA CON ÉXITO!');
    console.log('\n💡 Ahora puedes:');
    console.log('   1. Ir a la pestaña "Tareas"');
    console.log('   2. Ver las columnas "Proyecto Principal" y "Subproyecto" pobladas');
    console.log('   3. Usar el filtro rápido para ver solo Global, E1, E2 o E3');
    console.log('   4. Asignar/cambiar subproyectos fácilmente con los dropdowns\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  }
}

migrateProjectStructure();
