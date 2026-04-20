import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🚀 EJECUTANDO SQL PARA AGREGAR COLUMNA milestone_id...\n');

async function executeSql() {
  try {
    // Ejecutar SQL mediante una función RPC o directamente
    // Como no podemos ejecutar DDL directamente con el SDK,
    // vamos a verificar si la columna ya existe consultando

    console.log('📝 Paso 1: Verificando estructura actual de la tabla...');

    const { data: columns, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'tasks' AND column_name = 'milestone_id';
        `
      });

    if (schemaError) {
      console.log('⚠️  No se puede ejecutar SQL directamente con RPC.');
      console.log('   El método RPC "exec_sql" no está habilitado.\n');
      console.log('💡 SOLUCIÓN: Ejecuta manualmente en Supabase SQL Editor:\n');
      console.log('   1. Ve a: https://sfpdqurpmysbnwcofvcf.supabase.co/project/default/sql/new');
      console.log('   2. Copia y pega el siguiente SQL:\n');
      console.log('   ' + '='.repeat(70));
      console.log(`
   -- Agregar columna milestone_id
   ALTER TABLE tasks
   ADD COLUMN IF NOT EXISTS milestone_id UUID;

   -- Crear índice
   CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);

   -- Agregar foreign key constraint
   ALTER TABLE tasks
   DROP CONSTRAINT IF EXISTS fk_milestone;

   ALTER TABLE tasks
   ADD CONSTRAINT fk_milestone
     FOREIGN KEY (milestone_id)
     REFERENCES tasks(id)
     ON DELETE SET NULL;

   -- Verificar que se creó correctamente
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'tasks' AND column_name = 'milestone_id';
      `);
      console.log('   ' + '='.repeat(70));
      console.log('\n   3. Haz clic en RUN\n');

      // Intentar verificar si la columna existe de otra manera
      console.log('🔍 Intentando verificar si la columna ya existe...');
      const { data: testData, error: testError } = await supabase
        .from('tasks')
        .select('id, milestone_id')
        .limit(1);

      if (testError) {
        if (testError.message.includes('milestone_id')) {
          console.log('❌ La columna milestone_id NO existe todavía.');
          console.log('   Por favor ejecuta el SQL manualmente como se indica arriba.\n');
        } else {
          console.log('❌ Error al verificar:', testError.message);
        }
      } else {
        console.log('✅ ¡La columna milestone_id YA EXISTE!');
        console.log('✅ No es necesario ejecutar el SQL.\n');
        console.log('🎉 ¡TODO LISTO! Recarga http://localhost:5174/ para ver la columna "Hito".\n');
      }

      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ La columna milestone_id ya existe\n');
    } else {
      console.log('⚠️  La columna milestone_id no existe, ejecutando SQL...\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

executeSql();
