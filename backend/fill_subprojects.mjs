import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔄 RELLENANDO SUBPROYECTOS AUTOMÁTICAMENTE...\n');

async function fillSubprojects() {
  try {
    // Obtener todas las tareas
    console.log('📊 Obteniendo todas las tareas...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, project');

    if (tasksError) throw tasksError;
    console.log(`✅ ${tasks.length} tareas encontradas\n`);

    // Mapeo de proyectos conocidos a su estructura
    const projectMapping = {
      // Proyectos Global - todos son subproyectos de "Global"
      'Global: Branding & Comunicación': { main: 'Global', sub: 'Branding & Comunicación' },
      'Global: Daruma (Producto)': { main: 'Global', sub: 'Daruma (Producto)' },
      'Global: Formación Facilitadores': { main: 'Global', sub: 'Formación Facilitadores' },
      'Global: Kit de Experiencia': { main: 'Global', sub: 'Kit de Experiencia' },
      'Global: Método & Piloto': { main: 'Global', sub: 'Método & Piloto' },
      'Global: Stack Tecnológico': { main: 'Global', sub: 'Stack Tecnológico' },

      // E1 Madrid - separar por >
      'E1 Madrid > Equipamiento & Setup': { main: 'E1 Madrid', sub: 'Equipamiento & Setup' },
      'E1 Madrid > Finanzas': { main: 'E1 Madrid', sub: 'Finanzas' },
      'E1 Madrid > General': { main: 'E1 Madrid', sub: 'General' },
      'E1 Madrid > Legal & Licencias': { main: 'E1 Madrid', sub: 'Legal & Licencias' },
      'E1 Madrid > Operaciones & Apertura': { main: 'E1 Madrid', sub: 'Operaciones & Apertura' },
      'E1 Madrid > Reforma & Construcción': { main: 'E1 Madrid', sub: 'Reforma & Construcción' },
      'E1 Madrid > Búsqueda & Negociación': { main: 'E1 Madrid', sub: 'Búsqueda & Negociación' },

      // E2 Barcelona - separar por >
      'E2 Barcelona > Búsqueda & Negociación': { main: 'E2 Barcelona', sub: 'Búsqueda & Negociación' },
      'E2 Barcelona > Equipamiento & Setup': { main: 'E2 Barcelona', sub: 'Equipamiento & Setup' },
      'E2 Barcelona > Finanzas': { main: 'E2 Barcelona', sub: 'Finanzas' },
      'E2 Barcelona > General': { main: 'E2 Barcelona', sub: 'General' },
      'E2 Barcelona > Legal & Licencias': { main: 'E2 Barcelona', sub: 'Legal & Licencias' },
      'E2 Barcelona > Operaciones & Apertura': { main: 'E2 Barcelona', sub: 'Operaciones & Apertura' },
      'E2 Barcelona > Reforma & Construcción': { main: 'E2 Barcelona', sub: 'Reforma & Construcción' },

      // E3 México - separar por >
      'E3 México > Investigación': { main: 'E3 México', sub: 'Investigación' },
      'E3 México > General': { main: 'E3 México', sub: 'General' },
    };

    console.log('🔧 Procesando tareas...\n');
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const task of tasks) {
      if (!task.project || task.project === 'Sin proyecto asignado') {
        skipped++;
        continue;
      }

      // Buscar en el mapeo
      const mapping = projectMapping[task.project];

      if (mapping) {
        // Actualizar con el mapeo conocido
        const { error } = await supabase
          .from('tasks')
          .update({
            project: mapping.main,
            subproject: mapping.sub
          })
          .eq('id', task.id);

        if (error) {
          console.error(`❌ Error actualizando ${task.id}:`, error.message);
          errors++;
        } else {
          updated++;
          if (updated % 50 === 0) {
            console.log(`   ✅ Actualizadas ${updated} tareas...`);
          }
        }
      } else {
        // Proyecto no mapeado - intentar parse genérico
        if (task.project.includes('>')) {
          const [main, sub] = task.project.split('>').map(s => s.trim());

          const { error } = await supabase
            .from('tasks')
            .update({
              project: main,
              subproject: sub
            })
            .eq('id', task.id);

          if (error) {
            errors++;
          } else {
            updated++;
          }
        } else if (task.project.startsWith('Global:')) {
          const sub = task.project.replace('Global:', '').trim();

          const { error } = await supabase
            .from('tasks')
            .update({
              project: 'Global',
              subproject: sub
            })
            .eq('id', task.id);

          if (error) {
            errors++;
          } else {
            updated++;
          }
        } else {
          // Dejar como está
          skipped++;
        }
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Actualizadas: ${updated} tareas`);
    console.log(`   - Omitidas: ${skipped} tareas`);
    console.log(`   - Errores: ${errors} tareas\n`);

    // Verificar resultado
    console.log('🔍 Verificando resultado...\n');
    const { data: sample, error: sampleError } = await supabase
      .from('tasks')
      .select('id, name, project, subproject')
      .not('project', 'is', null)
      .order('project')
      .limit(15);

    if (!sampleError && sample) {
      console.log('📋 Primeras 15 tareas:');
      console.log('='.repeat(100));
      sample.forEach((t, idx) => {
        const proj = t.project || 'N/A';
        const sub = t.subproject || '(sin subproyecto)';
        console.log(`${idx + 1}. ${t.name.substring(0, 50)}`);
        console.log(`   Proyecto: ${proj} → Subproyecto: ${sub}`);
        console.log('');
      });
      console.log('='.repeat(100));
    }

    console.log('\n✅ ¡LISTO! Recarga la app y verás los subproyectos poblados.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fillSubprojects();
