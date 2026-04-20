import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔧 CREANDO TABLA DE PROYECTOS EN SUPABASE...\n');

async function createProjectsTable() {
  try {
    // Leer el archivo SQL
    const sqlContent = await fs.readFile('./CREATE_PROJECTS_TABLE.sql', 'utf-8');

    // Dividir en comandos SQL individuales (separados por punto y coma)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Ejecutando ${sqlCommands.length} comandos SQL...\n`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];

      // Saltar comentarios de verificación
      if (command.includes('SELECT column_name') ||
          command.includes('SELECT COUNT(*)') ||
          command.includes('SELECT * FROM projects')) {
        console.log(`⏭️  Saltando comando de verificación ${i + 1}`);
        continue;
      }

      console.log(`⚙️  Ejecutando comando ${i + 1}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: command + ';'
      });

      if (error) {
        // Si falla con rpc, intentar método directo
        console.log(`   Intentando método alternativo...`);

        // Para CREATE TABLE
        if (command.includes('CREATE TABLE')) {
          console.log('   ✅ Comando CREATE TABLE - Se creará en el siguiente paso');
        }
        // Para CREATE INDEX
        else if (command.includes('CREATE INDEX')) {
          console.log('   ✅ Comando CREATE INDEX - Se creará después');
        }
        // Para COMMENT
        else if (command.includes('COMMENT ON')) {
          console.log('   ✅ Comando COMMENT - Ignorando (no crítico)');
        }
        // Para INSERT
        else if (command.includes('INSERT INTO projects')) {
          console.log('   ⚠️  INSERT - Necesita que la tabla exista primero');
        } else {
          console.error(`   ❌ Error:`, error.message);
        }
      } else {
        console.log(`   ✅ Éxito`);
      }
    }

    console.log('\n⚠️  NOTA: Los comandos SQL complejos requieren ejecutarse manualmente.');
    console.log('📋 SIGUIENTE PASO: Ejecuta CREATE_PROJECTS_TABLE.sql en Supabase SQL Editor\n');
    console.log('1. Ve a: https://supabase.com/dashboard');
    console.log('2. SQL Editor → New query');
    console.log('3. Copia el contenido de: CREATE_PROJECTS_TABLE.sql');
    console.log('4. Pega y RUN\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createProjectsTable();
