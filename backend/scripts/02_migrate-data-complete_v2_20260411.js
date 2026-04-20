import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { COMPLETE_TASKS } from './data/tasks-complete.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrate() {
  console.log('🔄 Iniciando migración de 109 tareas completas...');
  console.log(`📝 Procesando ${COMPLETE_TASKS.length} tareas con UPSERT...`);

  try {
    // Usar UPSERT para actualizar tareas existentes o insertar nuevas
    const { data, error } = await supabase
      .from('tasks')
      .upsert(COMPLETE_TASKS, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 ${COMPLETE_TASKS.length} tareas procesadas (insertadas/actualizadas)`);

    // Verificar
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    console.log(`✓ Total de tareas en la base de datos: ${count}`);

    if (count !== COMPLETE_TASKS.length) {
      console.warn(`⚠️  ADVERTENCIA: Se esperaban ${COMPLETE_TASKS.length} tareas pero hay ${count} en la BD`);
    }

    // Verificar cuántas tareas de cada workstream
    const { data: tasks } = await supabase
      .from('tasks')
      .select('ws, status, priority, isMilestone');

    if (tasks) {
      const wsCount = tasks.reduce((acc, t) => {
        acc[t.ws] = (acc[t.ws] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Desglose por workstream:');
      Object.entries(wsCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([ws, count]) => {
          console.log(`   ${ws.padEnd(20)} : ${count} tareas`);
        });

      // Estadísticas
      const milestonesCount = tasks.filter(t => t.isMilestone).length;
      const criticalCount = tasks.filter(t => t.priority === 'Crítica').length;
      const urgentCount = tasks.filter(t => t.status === 'Urgente').length;

      console.log('\n📈 Estadísticas:');
      console.log(`   Hitos                : ${milestonesCount}`);
      console.log(`   Tareas críticas      : ${criticalCount}`);
      console.log(`   Tareas urgentes      : ${urgentCount}`);
    }

    console.log('\n✨ ¡Migración de 109 tareas completada con éxito!');

  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

migrate();
