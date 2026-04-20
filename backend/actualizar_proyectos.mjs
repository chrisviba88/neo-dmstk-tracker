import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔄 ACTUALIZANDO PROYECTOS EN SUPABASE...\n');

// Leer archivo JSON con todas las tareas
const jsonPath = '../TODAS_LAS_TAREAS_E1_COMPLETO.json';
const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
const tareas = jsonData.tareas;

console.log(`📋 Total de tareas en JSON: ${tareas.length}\n`);

// Obtener todas las tareas actuales de Supabase
const { data: tareasSupabase, error: errorFetch } = await supabase
  .from('tasks')
  .select('id');

if (errorFetch) {
  console.error('❌ Error obteniendo tareas de Supabase:', errorFetch);
  process.exit(1);
}

console.log(`📊 Total de tareas en Supabase: ${tareasSupabase.length}\n`);

// Crear mapa de tareas del JSON por ID
const tareasMap = {};
tareas.forEach(tarea => {
  tareasMap[tarea.id] = tarea;
});

// Actualizar cada tarea en Supabase
let actualizadas = 0;
let errores = 0;
let noEncontradas = 0;

for (const tareaSupabase of tareasSupabase) {
  const id = tareaSupabase.id;
  const tareaJSON = tareasMap[id];

  if (!tareaJSON) {
    console.log(`⚠️  Tarea ${id} existe en Supabase pero NO en JSON`);
    noEncontradas++;
    continue;
  }

  // Actualizar proyecto
  const { error: errorUpdate } = await supabase
    .from('tasks')
    .update({ project: tareaJSON.project || 'Sin proyecto asignado' })
    .eq('id', id);

  if (errorUpdate) {
    console.error(`❌ Error actualizando ${id}:`, errorUpdate.message);
    errores++;
  } else {
    actualizadas++;
    if (actualizadas % 20 === 0) {
      console.log(`✅ ${actualizadas} tareas actualizadas...`);
    }
  }
}

console.log('\n========================================');
console.log('📊 RESUMEN DE ACTUALIZACIÓN');
console.log('========================================');
console.log(`✅ Tareas actualizadas: ${actualizadas}`);
console.log(`❌ Errores: ${errores}`);
console.log(`⚠️  No encontradas en JSON: ${noEncontradas}`);
console.log('========================================\n');

if (errores === 0) {
  console.log('🎉 ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!\n');

  // Verificar distribución final
  const { data: verificacion } = await supabase
    .from('tasks')
    .select('project');

  const projectCounts = {};
  let sinProyecto = 0;

  verificacion.forEach(task => {
    if (!task.project || task.project === 'Sin proyecto asignado') {
      sinProyecto++;
    } else {
      projectCounts[task.project] = (projectCounts[task.project] || 0) + 1;
    }
  });

  console.log('📊 DISTRIBUCIÓN FINAL POR PROYECTO:');
  console.log('========================================');
  console.log(`Sin proyecto: ${sinProyecto}`);
  Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      console.log(`${count} - ${project}`);
    });
  console.log('========================================\n');
} else {
  console.log('⚠️  Se completó con algunos errores. Revisa arriba.\n');
}
