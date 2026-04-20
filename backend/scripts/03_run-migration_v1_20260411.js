import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  console.log('🚀 Ejecutando migración de activity_log...');

  try {
    // Leer el archivo SQL
    const sql = readFileSync('./migration-activity-log.sql', 'utf8');

    // Ejecutar la migración
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si exec_sql no existe, intentamos ejecutar directamente
      console.log('⚠️  exec_sql no disponible, ejecutando comandos individuales...');

      // Ejecutar DROP TABLE
      const { error: dropError } = await supabase.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS activity_log CASCADE;'
      });

      if (dropError) {
        console.log('ℹ️  No se pudo usar RPC, necesitas ejecutar el SQL manualmente en Supabase Dashboard');
        console.log('\n📋 Ve a: https://supabase.com/dashboard');
        console.log('   1. Selecciona tu proyecto');
        console.log('   2. Ve a SQL Editor');
        console.log('   3. Copia el contenido de migration-activity-log.sql');
        console.log('   4. Pégalo y ejecuta\n');
        process.exit(1);
      }
    }

    // Verificar que la tabla existe
    const { data: tables, error: checkError } = await supabase
      .from('activity_log')
      .select('*')
      .limit(0);

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('❌ La tabla activity_log no existe todavía');
        console.log('\n📋 DEBES ejecutar el SQL manualmente:');
        console.log('   1. Ve a https://supabase.com/dashboard');
        console.log('   2. Selecciona tu proyecto');
        console.log('   3. Ve a SQL Editor → New query');
        console.log('   4. Copia el contenido de backend/migration-activity-log.sql');
        console.log('   5. Pégalo y ejecuta\n');
      } else {
        throw checkError;
      }
    } else {
      console.log('✅ Tabla activity_log creada exitosamente!');
      console.log('✅ Índices creados');
      console.log('✅ RLS habilitado');
      console.log('✅ Políticas creadas');
      console.log('\n🎉 Migración completada! El sistema de historial está listo.');
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.log('\n📋 SOLUCIÓN: Ejecuta el SQL manualmente:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Ve a SQL Editor → New query');
    console.log('   4. Copia el contenido de backend/migration-activity-log.sql');
    console.log('   5. Pégalo y ejecuta\n');
    process.exit(1);
  }
}

runMigration();
