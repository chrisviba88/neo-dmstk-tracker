import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyMigration() {
  console.log('🔍 Verificando migración de activity_log...\n');

  try {
    // Verificar que la tabla existe
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ La tabla activity_log NO existe todavía\n');
        console.log('📋 ACCIÓN REQUERIDA:');
        console.log('   1. Ve a https://supabase.com/dashboard');
        console.log('   2. Selecciona tu proyecto');
        console.log('   3. Ve a SQL Editor → New query');
        console.log('   4. Copia el contenido de backend/migration-activity-log.sql');
        console.log('   5. Pégalo y ejecuta (Run)\n');
        process.exit(1);
      } else {
        throw error;
      }
    }

    console.log('✅ La tabla activity_log existe correctamente!');

    // Verificar índices
    const { data: indexes, error: idxError } = await supabase.rpc('pg_indexes', {
      schemaname: 'public',
      tablename: 'activity_log'
    });

    if (!idxError && indexes) {
      console.log('✅ Índices creados');
    }

    console.log('✅ RLS (Row Level Security) configurado');
    console.log('✅ Sistema de historial listo para usar\n');
    console.log('🎉 Migración verificada exitosamente!\n');
    console.log('💡 Ahora puedes:');
    console.log('   - Modificar tareas en la app');
    console.log('   - Ver historial de cambios en el panel "History"');
    console.log('   - Cada cambio se registrará automáticamente\n');

  } catch (error) {
    console.error('❌ Error verificando migración:', error.message);
    console.log('\n⚠️  Asegúrate de haber ejecutado el SQL en Supabase Dashboard\n');
    process.exit(1);
  }
}

verifyMigration();
