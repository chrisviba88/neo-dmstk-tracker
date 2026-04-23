/**
 * 05_import-gantts_v1_20260423.js
 *
 * Importa datos de los Gantts de Retail y Piloto a Supabase.
 * Usa upsert (on conflict: id) — seguro de ejecutar varias veces.
 *
 * Uso: node scripts/05_import-gantts_v1_20260423.js [retail|piloto|all]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en backend/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ═══════════════════════════════════════════════════════════
// UTILIDADES DE FECHA
// ═══════════════════════════════════════════════════════════

// Retail: base = 21 abril 2026, semanas 1-indexed
function retailWeek(wn, isEnd = false) {
  const base = new Date(2026, 3, 21); // mes 3 = abril
  base.setDate(base.getDate() + (wn - 1) * 7 + (isEnd ? 6 : 0));
  return base.toISOString().slice(0, 10);
}

// Piloto: base = 4 mayo 2026, semanas 0-indexed
function pilotoWeek(week, isEnd = false) {
  const base = new Date(2026, 4, 4); // mes 4 = mayo
  base.setDate(base.getDate() + week * 7 + (isEnd ? 6 : 0));
  return base.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════
// DATOS RETAIL (del Gantt 03_GANTT-RETAIL.html)
// ═══════════════════════════════════════════════════════════

const RETAIL_PHASES = {
  F0: { name: 'F0 — Decisiones críticas', ws: 1, we: 2 },
  F1: { name: 'F1 — Sourcing + Diseño',   ws: 3, we: 7 },
  F2: { name: 'F2 — Producción + Pedidos',ws: 8, we: 14 },
  F3: { name: 'F3 — Ensamblaje + Stock',  ws: 13, we: 17 },
  F4: { name: 'F4 — Montaje tienda',       ws: 17, we: 20 },
};

const RETAIL_GROUPS = {
  sourcing:   { name: 'Sourcing',     phase: 'F1' },
  design:     { name: 'Diseño',       phase: 'F1' },
  production: { name: 'Pedidos',      phase: 'F2' },
  reception:  { name: 'Recepciones',  phase: 'F2' },
};

const RETAIL_TASKS_RAW = [
  // F0
  { id:'d1',  name:'Enviar catálogo a Dupo',               phase:'F0', group:null, ws:1,  we:1,  type:'decision',    owner:'Christian', critical:true },
  { id:'d2',  name:'Reunión scope opening (SKUs)',         phase:'F0', group:null, ws:1,  we:2,  type:'decision',    owner:'Christian+Dupo', critical:true, deps:['d1'] },
  { id:'d3',  name:'Aprobar presupuesto stock inicial',    phase:'F0', group:null, ws:2,  we:2,  type:'decision',    owner:'Dupo', critical:true, deps:['d2'] },
  { id:'d4',  name:'Decidir art toys custom (sept/Q4)',    phase:'F0', group:null, ws:1,  we:2,  type:'decision',    owner:'Christian+Dupo' },
  { id:'d5',  name:'Decidir licensing (diferir/sustituir)',phase:'F0', group:null, ws:1,  we:2,  type:'decision',    owner:'Christian+Dupo' },
  { id:'d6',  name:'Decidir libro (sept o navidad)',       phase:'F0', group:null, ws:2,  we:2,  type:'decision',    owner:'Christian+Dupo' },
  { id:'d7',  name:'Definir almacén temporal',             phase:'F0', group:null, ws:2,  we:2,  type:'decision',    owner:'Christian' },
  { id:'dm1', name:'HITO: Catálogo aprobado + presupuesto',phase:'F0', group:null, ws:2,  we:2,  type:'milestone',   owner:'', critical:true },
  // F1 sourcing
  { id:'s1',  name:'Contactar proveedor kits DIY (24)',    phase:'F1', group:'sourcing', ws:3, we:3, type:'task', owner:'Christian', critical:true, deps:['dm1'] },
  { id:'s2',  name:'Contactar DMC España — cuenta B2B',   phase:'F1', group:'sourcing', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'s3',  name:'Contactar Royal Talens (Sakura)',      phase:'F1', group:'sourcing', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'s4',  name:'Contactar Paleta Art (Kuretake)',      phase:'F1', group:'sourcing', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'s5',  name:'Contactar Katia lanas (Barcelona)',    phase:'F1', group:'sourcing', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'s6',  name:'Contactar proveedores PBN',            phase:'F1', group:'sourcing', ws:4, we:4, type:'task', owner:'Christian' },
  { id:'s7',  name:'Buscar ceramista Madrid (darumas)',    phase:'F1', group:'sourcing', ws:4, we:5, type:'task', owner:'Christian' },
  { id:'s8',  name:'Contactar La Real Lana (telares)',     phase:'F1', group:'sourcing', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'s9',  name:'Negociar precios + MOQ',               phase:'F1', group:'sourcing', ws:5, we:6, type:'task', owner:'Christian', deps:['s1','s2','s3','s4','s5','s6','s7','s8'] },
  { id:'s10', name:'Confirmar pedidos iniciales',          phase:'F1', group:'sourcing', ws:7, we:7, type:'task', owner:'Christian+Dupo', critical:true, deps:['s9'] },
  { id:'sm1', name:'HITO: Proveedores cerrados',           phase:'F1', group:'sourcing', ws:7, we:7, type:'milestone', owner:'', critical:true },
  // F1 design
  { id:'ds1', name:'Diseñar packaging DMSTK (3 tamaños)', phase:'F1', group:'design', ws:3, we:5, type:'task', owner:'Christian', critical:true, deps:['dm1'] },
  { id:'ds2', name:'Diseñar instrucciones 7 kits',         phase:'F1', group:'design', ws:4, we:7, type:'task', owner:'Christian', critical:true },
  { id:'ds3', name:'Diseñar tarjeta regalo',               phase:'F1', group:'design', ws:3, we:4, type:'task', owner:'Christian' },
  { id:'ds4', name:'Diseñar merch: tote + delantal',       phase:'F1', group:'design', ws:4, we:6, type:'task', owner:'Christian' },
  { id:'ds5', name:'Diseñar 3-5 pins esmaltados',          phase:'F1', group:'design', ws:4, we:6, type:'task', owner:'Christian' },
  { id:'ds6', name:'Diseñar mapas acuarela (kit P3)',      phase:'F1', group:'design', ws:5, we:6, type:'task', owner:'Christian' },
  { id:'ds7', name:'Diseñar plantillas/patrones',          phase:'F1', group:'design', ws:5, we:6, type:'task', owner:'Christian' },
  { id:'ds8', name:'Pedir presupuesto packaging',          phase:'F1', group:'design', ws:5, we:6, type:'task', owner:'Christian', deps:['ds1'] },
  // F2 production
  { id:'p1',  name:'Cursar pedido kits DIY',               phase:'F2', group:'production', ws:8,  we:8,  type:'task', owner:'Christian', critical:true, deps:['s10'] },
  { id:'p2',  name:'Cursar pedido materiales marca',       phase:'F2', group:'production', ws:8,  we:8,  type:'task', owner:'Christian', deps:['s10'] },
  { id:'p3',  name:'Cursar pedido PBN',                    phase:'F2', group:'production', ws:8,  we:8,  type:'task', owner:'Christian' },
  { id:'p4',  name:'Enviar packaging a producción',        phase:'F2', group:'production', ws:8,  we:10, type:'task', owner:'Christian', critical:true, deps:['ds1','ds8'] },
  { id:'p5',  name:'Enviar merch a producción',            phase:'F2', group:'production', ws:9,  we:11, type:'task', owner:'Christian', deps:['ds4'] },
  { id:'p6',  name:'Enviar pins a producción',             phase:'F2', group:'production', ws:9,  we:12, type:'task', owner:'Christian', deps:['ds5'] },
  { id:'p7',  name:'Enviar a imprenta',                    phase:'F2', group:'production', ws:9,  we:11, type:'task', owner:'Christian', deps:['ds2','ds3','ds6','ds7'] },
  { id:'p8',  name:'Comprar componentes sueltos BOM',      phase:'F2', group:'production', ws:9,  we:10, type:'task', owner:'Christian', critical:true },
  { id:'p9',  name:'Producir darumas cerámica',            phase:'F2', group:'production', ws:8,  we:12, type:'task', owner:'Christian', deps:['s7'] },
  // F2 reception
  { id:'r1',  name:'Recibir packaging DMSTK',              phase:'F2', group:'reception', ws:11, we:11, type:'task', owner:'Christian', critical:true, deps:['p4'] },
  { id:'r2',  name:'Recibir kits DIY proveedor',           phase:'F2', group:'reception', ws:12, we:13, type:'task', owner:'Christian', critical:true, deps:['p1'] },
  { id:'r3',  name:'Recibir materiales marca',             phase:'F2', group:'reception', ws:11, we:12, type:'task', owner:'Christian', deps:['p2','p3'] },
  { id:'r4',  name:'Recibir imprenta',                     phase:'F2', group:'reception', ws:12, we:12, type:'task', owner:'Christian', deps:['p7'] },
  { id:'r5',  name:'Recibir merch',                        phase:'F2', group:'reception', ws:12, we:13, type:'task', owner:'Christian', deps:['p5'] },
  { id:'r6',  name:'Recibir darumas',                      phase:'F2', group:'reception', ws:13, we:14, type:'task', owner:'Christian', deps:['p9'] },
  { id:'rm1', name:'HITO: Todo material recibido',         phase:'F2', group:'reception', ws:14, we:14, type:'milestone', owner:'', critical:true },
  // F3
  { id:'a1',  name:'Ensamblar 200 kits taller (P1-P7)',    phase:'F3', group:null, ws:13, we:16, type:'task', owner:'Christian', critical:true, deps:['r1','r4','p8'] },
  { id:'a2',  name:'Montar 290 complementos satélite',     phase:'F3', group:null, ws:13, we:16, type:'task', owner:'Christian' },
  { id:'a3',  name:'Montar cajas regalo "Primera Vez"',    phase:'F3', group:null, ws:15, we:16, type:'task', owner:'Christian' },
  { id:'a4',  name:'Etiquetar + preciar producto curado',  phase:'F3', group:null, ws:15, we:16, type:'task', owner:'Christian' },
  { id:'a5',  name:'Fotografía producto real',             phase:'F3', group:null, ws:16, we:17, type:'task', owner:'Christian' },
  { id:'a6',  name:'Inventario completo pre-opening',      phase:'F3', group:null, ws:17, we:17, type:'task', owner:'Christian', critical:true },
  { id:'am1', name:'HITO: Stock completo listo',           phase:'F3', group:null, ws:17, we:17, type:'milestone', owner:'', critical:true },
  // F4
  { id:'t0',  name:'Recepción espacio reformado',          phase:'F4', group:null, ws:17, we:17, type:'task', owner:'CULDESAC', critical:true },
  { id:'t1',  name:'Instalar mobiliario tienda',           phase:'F4', group:null, ws:17, we:18, type:'task', owner:'Christian+Equipo', critical:true, deps:['t0'] },
  { id:'t2',  name:'Visual merchandising',                 phase:'F4', group:null, ws:18, we:18, type:'task', owner:'Christian', critical:true, deps:['t1','am1'] },
  { id:'t3',  name:'Señalética + precios',                 phase:'F4', group:null, ws:18, we:19, type:'task', owner:'Christian' },
  { id:'t4',  name:'Instalar TPV',                         phase:'F4', group:null, ws:19, we:19, type:'task', owner:'Christian' },
  { id:'t5',  name:'Dry run + revisión final',             phase:'F4', group:null, ws:19, we:19, type:'task', owner:'Christian+Dupo' },
  { id:'tm1', name:'SOFT OPENING',                         phase:'F4', group:null, ws:20, we:20, type:'milestone', owner:'', critical:true },
];

function buildRetailTasks() {
  const stageMap = { F0:'pre', F1:'prod', F2:'prod', F3:'prod', F4:'launch' };
  const rows = [];

  // Phase epics
  for (const [id, p] of Object.entries(RETAIL_PHASES)) {
    rows.push({
      id: 'retail_' + id.toLowerCase(),
      name: p.name,
      status: 'Pendiente',
      priority: 'P1',
      startDate: retailWeek(p.ws),
      endDate: retailWeek(p.we, true),
      owner: 'Christian',
      family: 'RET',
      familyLabel: 'Retail: Productos',
      level: 'epic',
      parent: null,
      pillar: 'retail',
      stage: stageMap[id] || 'prod',
      scope: 'space',
      spaces: ['E1'],
      milestone: 'softOpeningE1',
      deps: [],
      isMilestone: false,
      risk: 'MEDIO',
      deleted: false,
      ws: 'RET',
    });
  }

  // Group epics
  for (const [id, g] of Object.entries(RETAIL_GROUPS)) {
    const groupTasks = RETAIL_TASKS_RAW.filter(t => t.group === id);
    if (!groupTasks.length) continue;
    const minWs = Math.min(...groupTasks.map(t => t.ws));
    const maxWe = Math.max(...groupTasks.map(t => t.we));
    rows.push({
      id: 'retail_' + g.phase.toLowerCase() + '_' + id,
      name: g.name,
      status: 'Pendiente',
      priority: 'P1',
      startDate: retailWeek(minWs),
      endDate: retailWeek(maxWe, true),
      owner: 'Christian',
      family: 'RET',
      familyLabel: 'Retail: Productos',
      level: 'epic',
      parent: 'retail_' + g.phase.toLowerCase(),
      pillar: 'retail',
      stage: stageMap[g.phase] || 'prod',
      scope: 'space',
      spaces: ['E1'],
      milestone: 'softOpeningE1',
      deps: [],
      isMilestone: false,
      risk: 'BAJO',
      deleted: false,
      ws: 'RET',
    });
  }

  // Tasks
  for (const t of RETAIL_TASKS_RAW) {
    const parentId = t.group
      ? 'retail_' + t.phase.toLowerCase() + '_' + t.group
      : 'retail_' + t.phase.toLowerCase();
    rows.push({
      id: 'retail_' + t.id,
      name: t.name,
      status: 'Pendiente',
      priority: t.critical ? 'P0' : 'P2',
      startDate: retailWeek(t.ws),
      endDate: retailWeek(t.we, true),
      owner: t.owner || 'Christian',
      family: 'RET',
      familyLabel: 'Retail: Productos',
      level: 'task',
      parent: parentId,
      pillar: 'retail',
      stage: stageMap[t.phase] || 'prod',
      scope: 'space',
      spaces: ['E1'],
      milestone: 'softOpeningE1',
      deps: (t.deps || []).map(d => 'retail_' + d),
      isMilestone: t.type === 'milestone',
      risk: t.critical ? 'ALTO' : 'MEDIO',
      deleted: false,
      ws: 'RET',
    });
  }

  return rows;
}

// ═══════════════════════════════════════════════════════════
// DATOS PILOTO (del Gantt 03_DMSTK-Piloto-Gantt.html)
// ═══════════════════════════════════════════════════════════

const PILOTO_PHASES = [
  { id:'f0', name:'Fase 0: Decisiones Fundamentales', tasks:[
    { id:'t01', name:'Validar documento del método con Dupo + Miguel', type:'task', start:0, dur:1, owner:'Christian', critical:true },
    { id:'t02', name:'Decidir: Daruma en Kit (¿sí/no?)',              type:'decision', start:0, dur:1, owner:'Dupo+Christian' },
    { id:'t03', name:'Decidir: Política de móviles',                  type:'decision', start:0, dur:1, owner:'Dupo+Christian' },
    { id:'t04', name:'Decidir: Presentación materiales en mesa',      type:'decision', start:0, dur:2, owner:'Dupo+Miguel' },
    { id:'t05', name:'Decidir: Mandil (branding, entrega, se llevan)',type:'decision', start:0, dur:2, owner:'Dupo+Miguel' },
    { id:'t06', name:'Decidir: Segundo ojo sesión corta',             type:'decision', start:0, dur:1, owner:'Christian+Dupo' },
    { id:'t07', name:'Decidir: Copa/bebida en qué formatos',          type:'decision', start:0, dur:1, owner:'Dupo' },
    { id:'t08', name:'Aprobar presupuesto piloto',                    type:'task', start:1, dur:1, owner:'Dupo+Mavi', critical:true },
    { id:'h01', name:'HITO: MÉTODO CERRADO',                          type:'milestone', start:2, dur:0, owner:'' },
  ]},
  { id:'f1', name:'Fase 1: Preproducción', tasks:[
    { id:'t10', name:'Identificar 3-5 profesores candidatos',         type:'task', start:2, dur:2, owner:'Miguel+Christian' },
    { id:'t11', name:'Seleccionar profesora + contrato',              type:'task', start:3, dur:1, owner:'Cristina', critical:true },
    { id:'t12', name:'Briefing con profesora (90 min)',               type:'task', start:4, dur:1, owner:'Miguel+Christian' },
    { id:'t13', name:'Preparar espacio MM19 para piloto',             type:'task', start:2, dur:3, owner:'Christian' },
    { id:'t14', name:'Decidir plataforma de reservas',                type:'decision', start:2, dur:2, owner:'Christian' },
    { id:'t15', name:'Crear matriz de contenido (6 bloques)',         type:'task', start:3, dur:2, owner:'Miguel' },
    { id:'t16', name:'Calendario fechas especiales',                  type:'task', start:3, dur:1, owner:'Miguel' },
    { id:'t17', name:'Pedido darumas (lead time 8-10 sem)',           type:'task', start:2, dur:1, owner:'Christian', critical:true },
    { id:'h02', name:'HITO: PREPRODUCCIÓN COMPLETA',                  type:'milestone', start:5, dur:0, owner:'' },
  ]},
  { id:'f2', name:'Fase 2: Desarrollo con Profesor', tasks:[
    { id:'t20', name:'Profesora propone 2-3 proyectos',               type:'task', start:5, dur:1, owner:'Profesora' },
    { id:'t21', name:'Selección proyecto + prototipos MVP',           type:'task', start:6, dur:1, owner:'Miguel+Profesora', critical:true },
    { id:'t22', name:'MVP cronometrado por novato',                   type:'task', start:6, dur:1, owner:'Profesora' },
    { id:'t23', name:'Avanzado hecho por profesora (fotos promo)',    type:'task', start:6, dur:1, owner:'Profesora' },
    { id:'t24', name:'Lista materiales exactos + proveedores',        type:'task', start:6, dur:1, owner:'Profesora+Christian' },
    { id:'t25', name:'Definir 3-4 paletas de color',                  type:'task', start:6, dur:1, owner:'Profesora+Miguel' },
    { id:'t26', name:'Guiones de video con productor',                type:'task', start:7, dur:1, owner:'Miguel+Profesora' },
    { id:'t27', name:'Variaciones estacionales (Navidad, SV, etc)',   type:'task', start:7, dur:1, owner:'Profesora' },
    { id:'h03', name:'HITO: CONTENIDO VALIDADO',                      type:'milestone', start:8, dur:0, owner:'' },
  ]},
  { id:'f3', name:'Fase 3: Test Validación', tasks:[
    { id:'t30', name:'Reclutar 5-8 personas para test',               type:'task', start:7, dur:1, owner:'Christian' },
    { id:'t31', name:'Test formato solo (2-3 con kit + QR)',          type:'task', start:8, dur:1, owner:'Miguel', critical:true },
    { id:'t32', name:'Test formato grupo (4-5 con facilitador)',      type:'task', start:8, dur:1, owner:'Miguel', critical:true },
    { id:'t33', name:'Test avanzado (1 experta)',                     type:'task', start:8, dur:1, owner:'Profesora' },
    { id:'t34', name:'Medir métricas por persona',                    type:'task', start:8, dur:1, owner:'Miguel+Christian' },
    { id:'t35', name:'Decisión GO / NO-GO / ITERAR',                  type:'decision', start:9, dur:1, owner:'Dupo+Christian', critical:true },
    { id:'h04', name:'HITO: TEST GO',                                 type:'milestone', start:9, dur:0, owner:'' },
  ]},
  { id:'f4', name:'Fase 4: Producción Contenido', tasks:[
    { id:'t40', name:'Ajustes post-test + ensayos',                   type:'task', start:9,  dur:1, owner:'Profesora+Miguel' },
    { id:'t41', name:'GRABACIÓN Día 1: Instruccional + Emocional',    type:'task', start:10, dur:1, owner:'Set', critical:true },
    { id:'t42', name:'GRABACIÓN Día 2: Estacional + Grupos',         type:'task', start:10, dur:1, owner:'Set' },
    { id:'t43', name:'GRABACIÓN Día 3: Casual (móvil)',              type:'task', start:10, dur:1, owner:'Set' },
    { id:'t44', name:'Edición video (todos los módulos)',             type:'task', start:10, dur:2, owner:'Productor' },
    { id:'t45', name:'Diseño gráfico kits + packaging',               type:'task', start:10, dur:2, owner:'Diseño' },
    { id:'t46', name:'Sourcing materiales (proveedores)',              type:'task', start:9,  dur:2, owner:'Christian' },
    { id:'h05', name:'HITO: GRABACIÓN COMPLETA',                      type:'milestone', start:12, dur:0, owner:'' },
  ]},
  { id:'f5', name:'Fase 5: Preparación Lanzamiento', tasks:[
    { id:'t50', name:'Producción 50 kits',                            type:'task', start:12, dur:1, owner:'Christian', critical:true },
    { id:'t51', name:'Formación facilitador (5 días)',                type:'task', start:12, dur:2, owner:'Miguel', critical:true },
    { id:'t52', name:'Montaje espacio piloto',                        type:'task', start:12, dur:1, owner:'Christian' },
    { id:'t53', name:'Web + plataforma reservas',                     type:'task', start:12, dur:2, owner:'Christian' },
    { id:'t54', name:'Abrir reservas',                                type:'task', start:13, dur:1, owner:'Christian' },
    { id:'t55', name:'RRSS + contenido lanzamiento',                  type:'task', start:13, dur:2, owner:'Miguel' },
    { id:'h06', name:'HITO: LISTO PARA PILOTO',                       type:'milestone', start:14, dur:0, owner:'' },
  ]},
  { id:'f6', name:'Fase 6: Piloto', tasks:[
    { id:'t60', name:'6-8 sesiones cortas',                           type:'task', start:14, dur:2, owner:'Facilitador', critical:true },
    { id:'t61', name:'1 programa largo (4 sesiones)',                 type:'task', start:14, dur:4, owner:'Facilitador', critical:true },
    { id:'t62', name:'Alquiler abierto (kits)',                       type:'task', start:14, dur:2, owner:'Espacio' },
    { id:'t63', name:'Medir NPS + completados + recurrencia',         type:'task', start:15, dur:1, owner:'Miguel+Christian' },
    { id:'t64', name:'Iterar según feedback',                         type:'task', start:15, dur:1, owner:'Equipo' },
    { id:'h07', name:'HITO: GO/NO-GO FINAL',                          type:'milestone', start:16, dur:0, owner:'', critical:true },
  ]},
];

function buildPilotoTasks() {
  const stageMap = { f0:'pre', f1:'pre', f2:'prod', f3:'pilot', f4:'prod', f5:'launch', f6:'pilot' };
  const rows = [];

  for (const phase of PILOTO_PHASES) {
    const nonMilestone = phase.tasks.filter(t => t.type !== 'milestone');
    const minStart = nonMilestone.length ? Math.min(...nonMilestone.map(t => t.start)) : 0;
    const maxEnd   = nonMilestone.length ? Math.max(...nonMilestone.map(t => t.start + t.dur)) : 1;

    rows.push({
      id: 'pil_' + phase.id,
      name: phase.name,
      status: 'Pendiente',
      priority: 'P1',
      startDate: pilotoWeek(minStart),
      endDate: pilotoWeek(maxEnd, true),
      owner: 'Christian',
      family: 'PIL',
      familyLabel: 'Piloto: Experiencias',
      level: 'epic',
      parent: null,
      pillar: 'piloto',
      stage: stageMap[phase.id] || 'prod',
      scope: 'space',
      spaces: ['E1'],
      milestone: 'piloto',
      deps: [],
      isMilestone: false,
      risk: 'MEDIO',
      deleted: false,
      ws: 'PIL',
    });

    for (const t of phase.tasks) {
      rows.push({
        id: 'pil_' + t.id,
        name: t.name,
        status: 'Pendiente',
        priority: t.critical ? 'P0' : (t.type === 'decision' ? 'P1' : 'P2'),
        startDate: pilotoWeek(t.start),
        endDate: t.type === 'milestone' ? pilotoWeek(t.start) : pilotoWeek(t.start + t.dur, true),
        owner: t.owner || 'Christian',
        family: 'PIL',
        familyLabel: 'Piloto: Experiencias',
        level: 'task',
        parent: 'pil_' + phase.id,
        pillar: 'piloto',
        stage: stageMap[phase.id] || 'prod',
        scope: 'space',
        spaces: ['E1'],
        milestone: 'piloto',
        deps: [],
        isMilestone: t.type === 'milestone',
        risk: t.critical ? 'ALTO' : 'MEDIO',
        deleted: false,
        ws: 'PIL',
      });
    }
  }

  return rows;
}

// ═══════════════════════════════════════════════════════════
// IMPORTACIÓN A SUPABASE
// ═══════════════════════════════════════════════════════════

async function upsertTasks(tasks, label) {
  console.log(`\n[${label}] Importando ${tasks.length} registros...`);

  // Supabase upsert en lotes de 50
  const BATCH = 50;
  let inserted = 0;

  for (let i = 0; i < tasks.length; i += BATCH) {
    const batch = tasks.slice(i, i + BATCH);
    const { error } = await supabase
      .from('tasks')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`  ERROR lote ${i}-${i+BATCH}:`, error.message);
      return false;
    }
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${tasks.length} OK\r`);
  }

  console.log(`  ${tasks.length}/${tasks.length} OK — DONE`);
  return true;
}

async function main() {
  const arg = process.argv[2] || 'all';

  console.log('═══════════════════════════════════════════════');
  console.log('  Import Gantts → Supabase   2026-04-23');
  console.log('═══════════════════════════════════════════════');

  if (arg === 'retail' || arg === 'all') {
    const retailTasks = buildRetailTasks();
    console.log(`\nRetail: ${retailTasks.filter(t=>t.level==='epic'&&!t.parent).length} fases, ${retailTasks.filter(t=>t.level==='epic'&&t.parent).length} grupos, ${retailTasks.filter(t=>t.level==='task').length} tareas`);
    await upsertTasks(retailTasks, 'RETAIL');
  }

  if (arg === 'piloto' || arg === 'all') {
    const pilotoTasks = buildPilotoTasks();
    console.log(`\nPiloto: ${pilotoTasks.filter(t=>t.level==='epic').length} fases, ${pilotoTasks.filter(t=>t.level==='task').length} tareas`);
    await upsertTasks(pilotoTasks, 'PILOTO');
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Importación completada');
  console.log('  Verifica en el tracker: familias RET y PIL');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);
