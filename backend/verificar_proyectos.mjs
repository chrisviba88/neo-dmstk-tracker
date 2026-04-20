import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 VERIFICANDO PROYECTOS EN SUPABASE...\n');

async function verificarProyectos() {
  try {
    // Consultar todos los proyectos
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error consultando proyectos:', error.message);
      return;
    }

    console.log(`📊 Total de proyectos en Supabase: ${projects.length}\n`);

    if (projects.length === 0) {
      console.log('⚠️  No hay proyectos en la base de datos.');
      console.log('💡 Ejecuta CREATE_PROJECTS_TABLE.sql para poblar con proyectos existentes.\n');
      return;
    }

    console.log('LISTA DE PROYECTOS:');
    console.log('='.repeat(80));

    projects.forEach((proj, idx) => {
      console.log(`${idx + 1}. ${proj.name}`);
      console.log(`   ID: ${proj.id}`);
      console.log(`   Nivel: ${proj.level}`);
      console.log(`   Creado: ${new Date(proj.created_at).toLocaleString('es-ES')}`);
      console.log('');
    });

    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarProyectos();
