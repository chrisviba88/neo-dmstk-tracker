import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔧 AGREGANDO COLUMNA milestoneId A LA TABLA TASKS...\n');

async function addMilestoneIdColumn() {
  try {
    // Paso 1: Verificar si la columna existe
    console.log('📝 Verificando si la columna milestoneId existe...');
    const { data: testTask, error: testError } = await supabase
      .from('tasks')
      .select('id, milestoneId')
      .limit(1);

    if (testError && testError.message.includes('milestoneId')) {
      console.log('❌ La columna milestoneId NO existe.');
      console.log('\n⚠️  ACCIÓN REQUERIDA:');
      console.log('   1. Ve a Supabase SQL Editor');
      console.log('   2. Ejecuta este comando:\n');
      console.log('      ALTER TABLE tasks ADD COLUMN milestone_id UUID;');
      console.log('      CREATE INDEX idx_tasks_milestone_id ON tasks(milestone_id);');
      console.log('      ALTER TABLE tasks ADD CONSTRAINT fk_milestone');
      console.log('        FOREIGN KEY (milestone_id) REFERENCES tasks(id)');
      console.log('        ON DELETE SET NULL;\n');
      console.log('   3. Vuelve a ejecutar este script\n');
      return;
    }

    console.log('✅ La columna milestoneId existe\n');
    console.log('✅ ¡TODO LISTO! Ahora puedes relacionar tareas con hitos en la app.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMilestoneIdColumn();
