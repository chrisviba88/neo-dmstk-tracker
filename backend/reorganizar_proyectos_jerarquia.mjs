import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🏗️  REORGANIZACIÓN JERÁRQUICA DE PROYECTOS NEO DMSTK\n');
console.log('========================================');
console.log('Sistema de 3 Niveles:');
console.log('  NIVEL 1: SCOPE GLOBAL (Cross-espacios)');
console.log('  NIVEL 2: ESPACIOS ESPECÍFICOS (E1, E2)');
console.log('  NIVEL 3: EXPANSIÓN FUTURA (E3+)');
console.log('========================================\n');

// DEFINICIÓN DE PROYECTOS JERÁRQUICOS
const PROYECTOS_JERARQUICOS = {
  // NIVEL 1: GLOBAL
  global: [
    'Global: Branding & Comunicación',
    'Global: Daruma (Producto)',
    'Global: Kit de Experiencia',
    'Global: Stack Tecnológico',
    'Global: Método & Piloto',
    'Global: Formación Facilitadores'
  ],

  // NIVEL 2: ESPACIOS
  e1Madrid: [
    'E1 Madrid > Legal & Licencias',
    'E1 Madrid > Búsqueda & Negociación',
    'E1 Madrid > Reforma & Construcción',
    'E1 Madrid > Equipamiento & Setup',
    'E1 Madrid > Operaciones & Apertura',
    'E1 Madrid > Finanzas',
    'E1 Madrid > General'
  ],

  e2Barcelona: [
    'E2 Barcelona > Legal & Licencias',
    'E2 Barcelona > Búsqueda & Negociación',
    'E2 Barcelona > Reforma & Construcción',
    'E2 Barcelona > Equipamiento & Setup',
    'E2 Barcelona > Operaciones & Apertura',
    'E2 Barcelona > Finanzas',
    'E2 Barcelona > General'
  ],

  // NIVEL 3: EXPANSIÓN
  e3Mexico: [
    'E3 México > Investigación',
    'E3 México > General'
  ]
};

/**
 * Determina el nuevo proyecto basado en el análisis inteligente de la tarea
 */
function determineNewProject(task) {
  const name = (task.name || '').toLowerCase();
  const currentProject = (task.project || '').toLowerCase();
  const notes = (task.notes || '').toLowerCase();
  const ws = (task.ws || '').toLowerCase();
  const combinedText = `${name} ${currentProject} ${notes} ${ws}`;

  // =====================================================
  // NIVEL 1: PROYECTOS GLOBALES (Cross-espacios)
  // =====================================================

  // BRANDING & COMUNICACIÓN
  if (
    combinedText.includes('brand') ||
    combinedText.includes('identidad') ||
    combinedText.includes('comunicación') ||
    combinedText.includes('comunicacion') ||
    combinedText.includes('canal') ||
    combinedText.includes('naming') ||
    combinedText.includes('web') ||
    combinedText.includes('redes') ||
    combinedText.includes('logo') ||
    combinedText.includes('visual')
  ) {
    return 'Global: Branding & Comunicación';
  }

  // DARUMA (PRODUCTO CORE)
  if (
    combinedText.includes('daruma') ||
    combinedText.includes('3d') ||
    combinedText.includes('prototipo producto')
  ) {
    return 'Global: Daruma (Producto)';
  }

  // KIT DE EXPERIENCIA
  if (
    combinedText.includes('kit') ||
    combinedText.includes('merch') ||
    combinedText.includes('producto') ||
    combinedText.includes('experiencia') ||
    combinedText.includes('packaging')
  ) {
    return 'Global: Kit de Experiencia';
  }

  // STACK TECNOLÓGICO
  if (
    combinedText.includes('stack') ||
    combinedText.includes('tech') ||
    combinedText.includes('plataforma') ||
    combinedText.includes('crm') ||
    combinedText.includes('software') ||
    combinedText.includes('sistema') ||
    combinedText.includes('app') ||
    combinedText.includes('digital')
  ) {
    return 'Global: Stack Tecnológico';
  }

  // MÉTODO & PILOTO
  if (
    combinedText.includes('método') ||
    combinedText.includes('metodo') ||
    combinedText.includes('piloto') ||
    combinedText.includes('go/no-go') ||
    combinedText.includes('profesor') ||
    combinedText.includes('contenido') ||
    combinedText.includes('curriculum') ||
    combinedText.includes('sesión') ||
    combinedText.includes('sesion')
  ) {
    return 'Global: Método & Piloto';
  }

  // FORMACIÓN FACILITADORES
  if (
    combinedText.includes('facilitador') ||
    combinedText.includes('certificación') ||
    combinedText.includes('certificacion') ||
    combinedText.includes('formación') ||
    combinedText.includes('formacion')
  ) {
    return 'Global: Formación Facilitadores';
  }

  // =====================================================
  // NIVEL 2: ESPACIOS ESPECÍFICOS
  // =====================================================

  // ESPACIO E1 MADRID
  if (
    currentProject.includes('e1') ||
    currentProject.includes('madrid') ||
    currentProject.includes('espacio e1') ||
    name.includes('e1') ||
    name.includes('madrid')
  ) {
    // Subcategorías E1
    if (combinedText.includes('legal') || combinedText.includes('licencia') || combinedText.includes('contrato')) {
      return 'E1 Madrid > Legal & Licencias';
    }
    if (combinedText.includes('búsqueda') || combinedText.includes('busqueda') || combinedText.includes('local') || combinedText.includes('negociación') || combinedText.includes('negociacion')) {
      return 'E1 Madrid > Búsqueda & Negociación';
    }
    if (combinedText.includes('reforma') || combinedText.includes('obra') || combinedText.includes('construcción') || combinedText.includes('construccion')) {
      return 'E1 Madrid > Reforma & Construcción';
    }
    if (combinedText.includes('equipamiento') || combinedText.includes('mobiliario') || combinedText.includes('setup')) {
      return 'E1 Madrid > Equipamiento & Setup';
    }
    if (combinedText.includes('soft opening') || combinedText.includes('grand opening') || combinedText.includes('apertura')) {
      return 'E1 Madrid > Operaciones & Apertura';
    }
    if (combinedText.includes('presupuesto') || combinedText.includes('finanzas') || combinedText.includes('fundraising')) {
      return 'E1 Madrid > Finanzas';
    }
    return 'E1 Madrid > General';
  }

  // ESPACIO E2 BARCELONA
  if (
    currentProject.includes('e2') ||
    currentProject.includes('barcelona') ||
    name.includes('e2') ||
    name.includes('barcelona')
  ) {
    // Subcategorías E2
    if (combinedText.includes('legal') || combinedText.includes('licencia') || combinedText.includes('contrato')) {
      return 'E2 Barcelona > Legal & Licencias';
    }
    if (combinedText.includes('búsqueda') || combinedText.includes('busqueda') || combinedText.includes('local') || combinedText.includes('negociación') || combinedText.includes('negociacion')) {
      return 'E2 Barcelona > Búsqueda & Negociación';
    }
    if (combinedText.includes('reforma') || combinedText.includes('obra') || combinedText.includes('construcción') || combinedText.includes('construccion')) {
      return 'E2 Barcelona > Reforma & Construcción';
    }
    if (combinedText.includes('equipamiento') || combinedText.includes('mobiliario') || combinedText.includes('setup')) {
      return 'E2 Barcelona > Equipamiento & Setup';
    }
    if (combinedText.includes('soft opening') || combinedText.includes('grand opening') || combinedText.includes('apertura')) {
      return 'E2 Barcelona > Operaciones & Apertura';
    }
    if (combinedText.includes('presupuesto') || combinedText.includes('finanzas') || combinedText.includes('fundraising')) {
      return 'E2 Barcelona > Finanzas';
    }
    return 'E2 Barcelona > General';
  }

  // ESPACIO E3 MÉXICO
  if (
    currentProject.includes('e3') ||
    currentProject.includes('méxico') ||
    currentProject.includes('mexico') ||
    currentProject.includes('cdmx') ||
    name.includes('e3') ||
    name.includes('méxico') ||
    name.includes('mexico')
  ) {
    if (combinedText.includes('investigación') || combinedText.includes('investigacion') || combinedText.includes('research')) {
      return 'E3 México > Investigación';
    }
    return 'E3 México > General';
  }

  // =====================================================
  // FALLBACK: Mantener proyecto actual si no encaja
  // =====================================================
  return task.project || 'Sin proyecto asignado';
}

/**
 * Ejecuta la reorganización completa
 */
async function reorganizarProyectos() {
  try {
    // 1. Obtener todas las tareas
    console.log('📊 Obteniendo tareas de Supabase...\n');
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*');

    if (fetchError) {
      console.error('❌ Error obteniendo tareas:', fetchError);
      process.exit(1);
    }

    console.log(`✅ ${tasks.length} tareas obtenidas\n`);

    // 2. Analizar y reasignar
    const changes = [];
    const projectDistribution = {};

    console.log('🔍 Analizando cada tarea...\n');

    for (const task of tasks) {
      const oldProject = task.project || 'Sin proyecto asignado';
      const newProject = determineNewProject(task);

      // Contar distribución
      projectDistribution[newProject] = (projectDistribution[newProject] || 0) + 1;

      if (oldProject !== newProject) {
        changes.push({
          id: task.id,
          name: task.name,
          oldProject,
          newProject
        });
      }
    }

    console.log('========================================');
    console.log('📋 ANÁLISIS COMPLETADO');
    console.log('========================================');
    console.log(`Total de tareas: ${tasks.length}`);
    console.log(`Tareas a reasignar: ${changes.length}`);
    console.log(`Tareas sin cambios: ${tasks.length - changes.length}\n`);

    // 3. Mostrar distribución prevista
    console.log('📊 DISTRIBUCIÓN PREVISTA POR PROYECTO:');
    console.log('========================================\n');

    console.log('🌍 NIVEL 1: PROYECTOS GLOBALES');
    console.log('----------------------------');
    Object.entries(projectDistribution)
      .filter(([proj]) => proj.startsWith('Global:'))
      .sort((a, b) => b[1] - a[1])
      .forEach(([project, count]) => {
        console.log(`  ${count.toString().padStart(3)} tareas → ${project}`);
      });

    console.log('\n🏢 NIVEL 2: ESPACIOS ESPECÍFICOS');
    console.log('----------------------------');
    console.log('E1 Madrid:');
    Object.entries(projectDistribution)
      .filter(([proj]) => proj.startsWith('E1 Madrid'))
      .sort((a, b) => b[1] - a[1])
      .forEach(([project, count]) => {
        console.log(`  ${count.toString().padStart(3)} tareas → ${project}`);
      });

    console.log('\nE2 Barcelona:');
    Object.entries(projectDistribution)
      .filter(([proj]) => proj.startsWith('E2 Barcelona'))
      .sort((a, b) => b[1] - a[1])
      .forEach(([project, count]) => {
        console.log(`  ${count.toString().padStart(3)} tareas → ${project}`);
      });

    console.log('\n🌎 NIVEL 3: EXPANSIÓN FUTURA');
    console.log('----------------------------');
    Object.entries(projectDistribution)
      .filter(([proj]) => proj.startsWith('E3'))
      .sort((a, b) => b[1] - a[1])
      .forEach(([project, count]) => {
        console.log(`  ${count.toString().padStart(3)} tareas → ${project}`);
      });

    console.log('\n⚠️  OTROS');
    console.log('----------------------------');
    Object.entries(projectDistribution)
      .filter(([proj]) => !proj.startsWith('Global:') && !proj.startsWith('E1') && !proj.startsWith('E2') && !proj.startsWith('E3'))
      .sort((a, b) => b[1] - a[1])
      .forEach(([project, count]) => {
        console.log(`  ${count.toString().padStart(3)} tareas → ${project}`);
      });

    // 4. Confirmar antes de ejecutar
    console.log('\n========================================');
    console.log('⚠️  CONFIRMACIÓN REQUERIDA');
    console.log('========================================');
    console.log(`Se van a actualizar ${changes.length} tareas en Supabase.`);
    console.log('\nEjecutando actualización en 3 segundos...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Ejecutar actualización
    console.log('🚀 Actualizando tareas en Supabase...\n');

    let updated = 0;
    let errors = 0;

    for (const change of changes) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ project: change.newProject })
        .eq('id', change.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${change.id}:`, updateError.message);
        errors++;
      } else {
        updated++;
        if (updated % 20 === 0) {
          console.log(`  ✅ ${updated}/${changes.length} tareas actualizadas...`);
        }
      }
    }

    console.log('\n========================================');
    console.log('✅ REORGANIZACIÓN COMPLETADA');
    console.log('========================================');
    console.log(`Tareas actualizadas: ${updated}`);
    console.log(`Errores: ${errors}`);
    console.log('========================================\n');

    // 6. Generar reporte
    const reporte = generateReport(tasks.length, changes, projectDistribution, updated, errors);
    await fs.writeFile('REPORTE_REORGANIZACION.md', reporte, 'utf-8');

    console.log('📄 Reporte generado: REPORTE_REORGANIZACION.md\n');

    if (errors === 0) {
      console.log('🎉 ¡REORGANIZACIÓN EXITOSA!\n');
      console.log('Próximos pasos:');
      console.log('  1. Revisar el componente ProjectsHierarchyView.jsx');
      console.log('  2. Integrar en App.jsx');
      console.log('  3. Probar la nueva vista jerárquica\n');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

/**
 * Genera el reporte markdown de la reorganización
 */
function generateReport(totalTasks, changes, distribution, updated, errors) {
  const timestamp = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'long'
  });

  let report = `# 📊 Reporte de Reorganización Jerárquica
## NEO DMSTK - Sistema de Proyectos

**Fecha:** ${timestamp}

---

## 🎯 Objetivo

Reorganizar los ${totalTasks} proyectos existentes en una estructura jerárquica de 3 niveles:

- **NIVEL 1:** Proyectos GLOBALES (aplican a todos los espacios)
- **NIVEL 2:** Proyectos por ESPACIO específico (E1 Madrid, E2 Barcelona)
- **NIVEL 3:** Proyectos de EXPANSIÓN futura (E3 México+)

---

## 📈 Resultados de la Reorganización

### Estadísticas Generales
- **Total de tareas analizadas:** ${totalTasks}
- **Tareas reasignadas:** ${changes.length}
- **Tareas sin cambios:** ${totalTasks - changes.length}
- **Tareas actualizadas exitosamente:** ${updated}
- **Errores durante actualización:** ${errors}

---

## 🌍 Distribución Final por Nivel

### NIVEL 1: Proyectos Globales

`;

  Object.entries(distribution)
    .filter(([proj]) => proj.startsWith('Global:'))
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      const percentage = ((count / totalTasks) * 100).toFixed(1);
      report += `- **${project}**: ${count} tareas (${percentage}%)\n`;
    });

  report += `\n### NIVEL 2: Espacios Específicos

#### E1 Madrid

`;

  Object.entries(distribution)
    .filter(([proj]) => proj.startsWith('E1 Madrid'))
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      const percentage = ((count / totalTasks) * 100).toFixed(1);
      report += `- **${project}**: ${count} tareas (${percentage}%)\n`;
    });

  report += `\n#### E2 Barcelona

`;

  Object.entries(distribution)
    .filter(([proj]) => proj.startsWith('E2 Barcelona'))
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      const percentage = ((count / totalTasks) * 100).toFixed(1);
      report += `- **${project}**: ${count} tareas (${percentage}%)\n`;
    });

  report += `\n### NIVEL 3: Expansión Futura

`;

  Object.entries(distribution)
    .filter(([proj]) => proj.startsWith('E3'))
    .sort((a, b) => b[1] - a[1])
    .forEach(([project, count]) => {
      const percentage = ((count / totalTasks) * 100).toFixed(1);
      report += `- **${project}**: ${count} tareas (${percentage}%)\n`;
    });

  report += `\n---

## 🔄 Detalle de Cambios (Primeros 50)

| ID | Tarea | Proyecto Anterior | Proyecto Nuevo |
|---|---|---|---|
`;

  changes.slice(0, 50).forEach(change => {
    const taskName = change.name.substring(0, 40);
    report += `| ${change.id.substring(0, 8)} | ${taskName} | ${change.oldProject} | ${change.newProject} |\n`;
  });

  if (changes.length > 50) {
    report += `\n*...y ${changes.length - 50} cambios más*\n`;
  }

  report += `\n---

## ✅ Estado Final

${errors === 0 ? '🎉 **Reorganización completada exitosamente sin errores.**' : `⚠️ **Completada con ${errors} errores. Revisar logs.**`}

### Próximos Pasos

1. ✅ Script de reorganización ejecutado
2. ⏳ Crear componente \`ProjectsHierarchyView.jsx\`
3. ⏳ Integrar componente en \`App.jsx\`
4. ⏳ Probar nueva vista jerárquica en frontend

---

## 📝 Notas Técnicas

### Lógica de Clasificación

**Proyectos Globales:**
- Branding & Comunicación: tareas con "brand", "identidad", "comunicación", "web"
- Daruma: tareas con "daruma", "3d", "prototipo"
- Kit de Experiencia: tareas con "kit", "merch", "producto"
- Stack Tecnológico: tareas con "stack", "tech", "crm", "software"
- Método & Piloto: tareas con "método", "piloto", "profesor", "contenido"
- Formación Facilitadores: tareas con "facilitador", "certificación"

**Espacios (E1, E2):**
- Legal & Licencias: tareas con "legal", "licencia", "contrato"
- Búsqueda & Negociación: tareas con "búsqueda", "local", "negociación"
- Reforma & Construcción: tareas con "reforma", "obra", "construcción"
- Equipamiento & Setup: tareas con "equipamiento", "mobiliario", "setup"
- Operaciones & Apertura: tareas con "opening", "apertura"
- Finanzas: tareas con "presupuesto", "finanzas", "fundraising"

---

*Generado automáticamente por \`reorganizar_proyectos_jerarquia.mjs\`*
`;

  return report;
}

// Ejecutar reorganización
reorganizarProyectos();
