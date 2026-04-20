#!/usr/bin/env node

/**
 * Script para añadir las 119 tareas faltantes a Supabase
 *
 * Lee el JSON maestro con 227 tareas, compara con las 108 actuales en Supabase,
 * e inserta únicamente las tareas que faltan.
 *
 * Autor: Sistema autónomo Neo DMSTK
 * Fecha: 2026-04-13
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configuración
const JSON_MAESTRO_PATH = '/Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/TODAS_LAS_TAREAS_E1_COMPLETO.json';

/**
 * Mapea una tarea del JSON maestro al schema de Supabase
 * Solo incluye los campos que existen en la tabla tasks
 */
function mapearTareaASupabase(tarea) {
  return {
    id: tarea.id,
    name: tarea.name,
    ws: tarea.ws || 'Sin asignar',
    status: tarea.status || 'Pendiente',
    priority: tarea.priority || 'P3 (Normal)',
    startDate: tarea.startDate || '2026-04-13',
    endDate: tarea.endDate || '2026-04-20',
    owner: tarea.owner || 'Por asignar',
    isMilestone: tarea.isMilestone || false,
    risk: tarea.risk || null,
    notes: tarea.notes || '',
    deps: tarea.deps || [],
    project: tarea.project || null
  };
}

/**
 * Progress bar simple
 */
function mostrarProgreso(actual, total, mensaje = '') {
  const porcentaje = Math.floor((actual / total) * 100);
  const barraLongitud = 40;
  const barraProgreso = Math.floor((actual / total) * barraLongitud);
  const barra = '█'.repeat(barraProgreso) + '░'.repeat(barraLongitud - barraProgreso);

  process.stdout.write(`\r${barra} ${porcentaje}% (${actual}/${total}) ${mensaje}`);

  if (actual === total) {
    process.stdout.write('\n');
  }
}

/**
 * Función principal
 */
async function añadirTareasFaltantes() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MIGRACIÓN DE TAREAS FALTANTES A SUPABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // PASO 1: Leer JSON maestro
    console.log('📖 PASO 1: Leyendo JSON maestro...');
    const jsonData = JSON.parse(fs.readFileSync(JSON_MAESTRO_PATH, 'utf8'));
    const todasLasTareas = jsonData.tareas;
    console.log(`   ✓ ${todasLasTareas.length} tareas encontradas en JSON maestro\n`);

    // PASO 2: Obtener tareas existentes en Supabase
    console.log('🔍 PASO 2: Consultando tareas existentes en Supabase...');
    const { data: tareasExistentes, error: errorConsulta } = await supabase
      .from('tasks')
      .select('id');

    if (errorConsulta) {
      throw new Error(`Error al consultar Supabase: ${errorConsulta.message}`);
    }

    const idsExistentes = new Set(tareasExistentes.map(t => t.id));
    console.log(`   ✓ ${idsExistentes.size} tareas ya existen en Supabase\n`);

    // PASO 3: Identificar tareas faltantes
    console.log('🔎 PASO 3: Identificando tareas faltantes...');
    const tareasFaltantes = todasLasTareas.filter(t => !idsExistentes.has(t.id));
    console.log(`   ✓ ${tareasFaltantes.length} tareas faltantes identificadas\n`);

    if (tareasFaltantes.length === 0) {
      console.log('✨ ¡No hay tareas faltantes! Todas las tareas ya están en Supabase.\n');
      return;
    }

    // PASO 4: Insertar tareas faltantes
    console.log('💾 PASO 4: Insertando tareas faltantes en Supabase...\n');

    let insertadas = 0;
    let errores = 0;
    const erroresDetalle = [];

    for (let i = 0; i < tareasFaltantes.length; i++) {
      const tarea = tareasFaltantes[i];
      const tareaSupabase = mapearTareaASupabase(tarea);

      const { error } = await supabase
        .from('tasks')
        .insert([tareaSupabase]);

      if (error) {
        errores++;
        erroresDetalle.push({
          id: tarea.id,
          nombre: tarea.name,
          error: error.message
        });
      } else {
        insertadas++;
      }

      mostrarProgreso(i + 1, tareasFaltantes.length, `Insertando ${tarea.id}`);
    }

    console.log('\n');

    // PASO 5: Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  RESUMEN DE MIGRACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Tareas insertadas correctamente: ${insertadas}`);
    console.log(`❌ Tareas con errores: ${errores}`);
    console.log(`📊 Total en JSON maestro: ${todasLasTareas.length}`);
    console.log(`📊 Total previo en Supabase: ${idsExistentes.size}`);
    console.log(`📊 Total esperado en Supabase: ${idsExistentes.size + insertadas}\n`);

    if (erroresDetalle.length > 0) {
      console.log('⚠️  ERRORES ENCONTRADOS:\n');
      erroresDetalle.forEach(e => {
        console.log(`   • ${e.id} (${e.nombre}): ${e.error}`);
      });
      console.log('');
    }

    // PASO 6: Verificación final
    console.log('🔍 PASO 6: Verificando resultado final...');
    const { count: totalFinal, error: errorVerificacion } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (errorVerificacion) {
      console.log(`   ⚠️  No se pudo verificar: ${errorVerificacion.message}\n`);
    } else {
      console.log(`   ✓ Total de tareas en Supabase ahora: ${totalFinal}\n`);

      if (totalFinal === todasLasTareas.length) {
        console.log('🎉 ¡ÉXITO! Todas las 227 tareas están ahora en Supabase.\n');
      } else {
        console.log(`⚠️  Discrepancia: Se esperaban ${todasLasTareas.length} pero hay ${totalFinal}\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  MIGRACIÓN COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Guardar log de errores si los hay
    if (erroresDetalle.length > 0) {
      const logPath = path.join(__dirname, 'migracion_errores.log');
      fs.writeFileSync(
        logPath,
        JSON.stringify(erroresDetalle, null, 2),
        'utf8'
      );
      console.log(`📝 Log de errores guardado en: ${logPath}\n`);
    }

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
añadirTareasFaltantes();
