/**
 * RETAIL MIGRATION — Adds 61 tasks (5 phase epics + 4 group epics + 52 tasks) to the tracker
 *
 * Run modes:
 *   1. NODE: node scripts/retail-migration.js --dry-run     (preview only)
 *   2. NODE: node scripts/retail-migration.js --apply        (insert into Supabase)
 *   3. MANUAL: copy RETAIL_TASKS array into tasks-v2.js
 *
 * Hierarchy:
 *   t60 (existing RET epic) ← parent of all retail
 *   ├── retail_f0 (Decisiones)           ← phase epic, parent: t60
 *   │   └── retail_d1..d7, dm1           ← tasks, parent: retail_f0
 *   ├── retail_f1 (Sourcing + Diseno)    ← phase epic, parent: t60
 *   │   ├── retail_f1_sourcing           ← group epic, parent: retail_f1
 *   │   │   └── retail_s1..s10, sm1      ← tasks, parent: retail_f1_sourcing
 *   │   └── retail_f1_design             ← group epic, parent: retail_f1
 *   │       └── retail_ds1..ds8          ← tasks, parent: retail_f1_design
 *   ├── retail_f2 (Produccion)           ← phase epic, parent: t60
 *   │   ├── retail_f2_production         ← group epic, parent: retail_f2
 *   │   │   └── retail_p1..p9            ← tasks, parent: retail_f2_production
 *   │   └── retail_f2_reception          ← group epic, parent: retail_f2
 *   │       └── retail_r1..r6, rm1       ← tasks, parent: retail_f2_reception
 *   ├── retail_f3 (Ensamblaje)           ← phase epic, parent: t60
 *   │   └── retail_a1..a6, am1           ← tasks, parent: retail_f3
 *   └── retail_f4 (Montaje)              ← phase epic, parent: t60
 *       └── retail_t0..t5, tm1           ← tasks, parent: retail_f4
 *
 * Generated: 2026-04-21
 */

// ═══ HELPER: week number to date ═══
function w2d(wn, end) {
  const base = new Date(2026, 3, 21); // April 21, 2026
  base.setDate(base.getDate() + (wn - 1) * 7 + (end ? 6 : 0));
  return base.toISOString().slice(0, 10);
}

// ═══ PHASE EPICS (5) ═══
const PHASE_EPICS = [
  { id: "retail_f0", name: "Retail F0: Decisiones criticas", ws: 1, we: 2, stage: "pre" },
  { id: "retail_f1", name: "Retail F1: Sourcing + Diseno", ws: 3, we: 7, stage: "pre" },
  { id: "retail_f2", name: "Retail F2: Produccion + Pedidos", ws: 8, we: 14, stage: "prod" },
  { id: "retail_f3", name: "Retail F3: Ensamblaje + Stock", ws: 13, we: 17, stage: "prod" },
  { id: "retail_f4", name: "Retail F4: Montaje tienda", ws: 17, we: 20, stage: "launch" },
].map(p => ({
  id: p.id, name: p.name, status: "Pendiente", priority: "P1",
  startDate: w2d(p.ws), endDate: w2d(p.we, true),
  owner: "Christian", ws: "RET", risk: "MEDIO", isMilestone: false,
  deps: [], notes: "",
  family: "RET", familyLabel: "Retail: Productos",
  level: "epic", parent: "t60", pillar: "retail",
  stage: p.stage, scope: "space", spaces: ["E1"],
  milestone: "softOpeningE1", deleted: false,
}));

// ═══ GROUP EPICS (4) ═══
const GROUP_EPICS = [
  { id: "retail_f1_sourcing", name: "Sourcing proveedores", parent: "retail_f1", ws: 3, we: 7 },
  { id: "retail_f1_design", name: "Diseno producto", parent: "retail_f1", ws: 3, we: 7 },
  { id: "retail_f2_production", name: "Pedidos y produccion", parent: "retail_f2", ws: 8, we: 12 },
  { id: "retail_f2_reception", name: "Recepciones", parent: "retail_f2", ws: 11, we: 14 },
].map(g => ({
  id: g.id, name: g.name, status: "Pendiente", priority: "P1",
  startDate: w2d(g.ws), endDate: w2d(g.we, true),
  owner: "Christian", ws: "RET", risk: "BAJO", isMilestone: false,
  deps: [], notes: "",
  family: "RET", familyLabel: "Retail: Productos",
  level: "epic", parent: g.parent, pillar: "retail",
  stage: "prod", scope: "space", spaces: ["E1"],
  milestone: "softOpeningE1", deleted: false,
}));

// ═══ TASKS (52) ═══
const RAW_TASKS = [
  // F0 Decisiones
  {id:'retail_d1',name:'Enviar catalogo a Dupo',phase:'retail_f0',ws:1,we:1,type:'decision',owner:'Christian',desc:'Enviar DMSTK-Catalogo-Retail standalone HTML para aprobacion',critical:true},
  {id:'retail_d2',name:'Reunion scope opening (cuantos SKUs)',phase:'retail_f0',ws:1,we:2,type:'decision',owner:'Christian',desc:'Definir cuantos de los 80 productos entran en opening',critical:true,deps:['retail_d1']},
  {id:'retail_d3',name:'Aprobar presupuesto stock inicial',phase:'retail_f0',ws:2,we:2,type:'decision',owner:'Dupo',desc:'Rango: 18K-32K EUR segun scope',critical:true,deps:['retail_d2']},
  {id:'retail_d4',name:'Decidir art toys custom (sept o Q4)',phase:'retail_f0',ws:1,we:2,type:'decision',owner:'Christian'},
  {id:'retail_d5',name:'Decidir licensing (diferir/sustituir)',phase:'retail_f0',ws:1,we:2,type:'decision',owner:'Christian'},
  {id:'retail_d6',name:'Decidir libro (sept o navidad)',phase:'retail_f0',ws:2,we:2,type:'decision',owner:'Christian'},
  {id:'retail_d7',name:'Definir almacen temporal',phase:'retail_f0',ws:2,we:2,type:'decision',owner:'Christian'},
  {id:'retail_dm1',name:'HITO: Catalogo aprobado + presupuesto',phase:'retail_f0',ws:2,we:2,milestone:true,critical:true},

  // F1 Sourcing
  {id:'retail_s1',name:'Contactar proveedor kits DIY (24)',phase:'retail_f1_sourcing',ws:3,we:3,type:'sourcing',owner:'Christian',critical:true,deps:['retail_dm1']},
  {id:'retail_s2',name:'Contactar DMC Espana — cuenta B2B',phase:'retail_f1_sourcing',ws:3,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s3',name:'Contactar Royal Talens (Sakura)',phase:'retail_f1_sourcing',ws:3,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s4',name:'Contactar Paleta Art (Kuretake)',phase:'retail_f1_sourcing',ws:3,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s5',name:'Contactar Katia lanas (Barcelona)',phase:'retail_f1_sourcing',ws:3,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s6',name:'Contactar proveedores PBN',phase:'retail_f1_sourcing',ws:4,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s7',name:'Buscar ceramista Madrid (darumas)',phase:'retail_f1_sourcing',ws:4,we:5,type:'sourcing',owner:'Christian'},
  {id:'retail_s8',name:'Contactar La Real Lana (telares)',phase:'retail_f1_sourcing',ws:3,we:4,type:'sourcing',owner:'Christian'},
  {id:'retail_s9',name:'Negociar precios + MOQ',phase:'retail_f1_sourcing',ws:5,we:6,type:'sourcing',owner:'Christian',deps:['retail_s1','retail_s2','retail_s3','retail_s4','retail_s5','retail_s6','retail_s7','retail_s8']},
  {id:'retail_s10',name:'Confirmar pedidos iniciales',phase:'retail_f1_sourcing',ws:7,we:7,type:'sourcing',owner:'Christian',critical:true,deps:['retail_s9']},
  {id:'retail_sm1',name:'HITO: Proveedores cerrados',phase:'retail_f1_sourcing',ws:7,we:7,milestone:true,critical:true},

  // F1 Diseno
  {id:'retail_ds1',name:'Disenar packaging DMSTK (3 tamanos)',phase:'retail_f1_design',ws:3,we:5,type:'design',owner:'Christian',critical:true,deps:['retail_dm1']},
  {id:'retail_ds2',name:'Disenar instrucciones 7 kits',phase:'retail_f1_design',ws:4,we:7,type:'design',owner:'Christian',critical:true},
  {id:'retail_ds3',name:'Disenar tarjeta regalo',phase:'retail_f1_design',ws:3,we:4,type:'design',owner:'Christian'},
  {id:'retail_ds4',name:'Disenar merch: tote + delantal',phase:'retail_f1_design',ws:4,we:6,type:'design',owner:'Christian'},
  {id:'retail_ds5',name:'Disenar 3-5 pins esmaltados',phase:'retail_f1_design',ws:4,we:6,type:'design',owner:'Christian'},
  {id:'retail_ds6',name:'Disenar mapas acuarela (kit P3)',phase:'retail_f1_design',ws:5,we:6,type:'design',owner:'Christian'},
  {id:'retail_ds7',name:'Disenar plantillas/patrones',phase:'retail_f1_design',ws:5,we:6,type:'design',owner:'Christian'},
  {id:'retail_ds8',name:'Pedir presupuesto packaging',phase:'retail_f1_design',ws:5,we:6,type:'design',owner:'Christian',deps:['retail_ds1']},

  // F2 Pedidos
  {id:'retail_p1',name:'Cursar pedido kits DIY',phase:'retail_f2_production',ws:8,we:8,type:'production',owner:'Christian',critical:true,deps:['retail_s10']},
  {id:'retail_p2',name:'Cursar pedido materiales marca',phase:'retail_f2_production',ws:8,we:8,type:'production',owner:'Christian',deps:['retail_s10']},
  {id:'retail_p3',name:'Cursar pedido PBN',phase:'retail_f2_production',ws:8,we:8,type:'production',owner:'Christian'},
  {id:'retail_p4',name:'Enviar packaging a produccion',phase:'retail_f2_production',ws:8,we:10,type:'production',owner:'Christian',critical:true,deps:['retail_ds1','retail_ds8']},
  {id:'retail_p5',name:'Enviar merch a produccion',phase:'retail_f2_production',ws:9,we:11,type:'production',owner:'Christian',deps:['retail_ds4']},
  {id:'retail_p6',name:'Enviar pins a produccion',phase:'retail_f2_production',ws:9,we:12,type:'production',owner:'Christian',deps:['retail_ds5']},
  {id:'retail_p7',name:'Enviar a imprenta',phase:'retail_f2_production',ws:9,we:11,type:'production',owner:'Christian',deps:['retail_ds2','retail_ds3','retail_ds6','retail_ds7']},
  {id:'retail_p8',name:'Comprar componentes sueltos BOM',phase:'retail_f2_production',ws:9,we:10,type:'production',owner:'Christian',critical:true},
  {id:'retail_p9',name:'Producir darumas ceramica',phase:'retail_f2_production',ws:8,we:12,type:'production',owner:'Christian',deps:['retail_s7']},

  // F2 Recepciones
  {id:'retail_r1',name:'Recibir packaging DMSTK',phase:'retail_f2_reception',ws:11,we:11,type:'reception',owner:'Christian',critical:true,deps:['retail_p4']},
  {id:'retail_r2',name:'Recibir kits DIY proveedor',phase:'retail_f2_reception',ws:12,we:13,type:'reception',owner:'Christian',critical:true,deps:['retail_p1']},
  {id:'retail_r3',name:'Recibir materiales marca',phase:'retail_f2_reception',ws:11,we:12,type:'reception',owner:'Christian',deps:['retail_p2','retail_p3']},
  {id:'retail_r4',name:'Recibir imprenta',phase:'retail_f2_reception',ws:12,we:12,type:'reception',owner:'Christian',deps:['retail_p7']},
  {id:'retail_r5',name:'Recibir merch',phase:'retail_f2_reception',ws:12,we:13,type:'reception',owner:'Christian',deps:['retail_p5']},
  {id:'retail_r6',name:'Recibir darumas',phase:'retail_f2_reception',ws:13,we:14,type:'reception',owner:'Christian',deps:['retail_p9']},
  {id:'retail_rm1',name:'HITO: Todo material recibido',phase:'retail_f2_reception',ws:14,we:14,milestone:true,critical:true},

  // F3 Ensamblaje
  {id:'retail_a1',name:'Ensamblar 200 kits taller (P1-P7)',phase:'retail_f3',ws:13,we:16,type:'assembly',owner:'Christian',critical:true,deps:['retail_r1','retail_r4','retail_p8']},
  {id:'retail_a2',name:'Montar 290 complementos satelite',phase:'retail_f3',ws:13,we:16,type:'assembly',owner:'Christian'},
  {id:'retail_a3',name:'Montar cajas regalo Primera Vez',phase:'retail_f3',ws:15,we:16,type:'assembly',owner:'Christian'},
  {id:'retail_a4',name:'Etiquetar + preciar producto curado',phase:'retail_f3',ws:15,we:16,type:'assembly',owner:'Christian'},
  {id:'retail_a5',name:'Fotografia producto real',phase:'retail_f3',ws:16,we:17,type:'assembly',owner:'Christian'},
  {id:'retail_a6',name:'Inventario completo pre-opening',phase:'retail_f3',ws:17,we:17,type:'assembly',owner:'Christian',critical:true},
  {id:'retail_am1',name:'HITO: Stock completo listo',phase:'retail_f3',ws:17,we:17,milestone:true,critical:true},

  // F4 Montaje
  {id:'retail_t0',name:'Recepcion espacio reformado',phase:'retail_f4',ws:17,we:17,type:'store',owner:'CULDESAC',critical:true},
  {id:'retail_t1',name:'Instalar mobiliario tienda',phase:'retail_f4',ws:17,we:18,type:'store',owner:'Christian',critical:true,deps:['retail_t0']},
  {id:'retail_t2',name:'Visual merchandising',phase:'retail_f4',ws:18,we:18,type:'store',owner:'Christian',critical:true,deps:['retail_t1','retail_am1']},
  {id:'retail_t3',name:'Senaletica + precios',phase:'retail_f4',ws:18,we:19,type:'store',owner:'Christian'},
  {id:'retail_t4',name:'Instalar TPV',phase:'retail_f4',ws:19,we:19,type:'store',owner:'Christian'},
  {id:'retail_t5',name:'Dry run + revision final',phase:'retail_f4',ws:19,we:19,type:'store',owner:'Christian'},
  {id:'retail_tm1',name:'SOFT OPENING — Tienda retail',phase:'retail_f4',ws:20,we:20,milestone:true,critical:true},
];

// Transform raw tasks to tracker format
const TASKS = RAW_TASKS.map(t => ({
  id: t.id,
  name: t.name,
  status: "Pendiente",
  priority: t.critical ? "P0" : "P1",
  startDate: w2d(t.ws),
  endDate: w2d(t.we, true),
  owner: t.owner || "Christian",
  ws: "RET",
  risk: t.critical ? "ALTO" : "MEDIO",
  isMilestone: t.milestone || false,
  deps: t.deps || [],
  notes: t.desc || "",
  family: "RET",
  familyLabel: "Retail: Productos",
  level: "task",
  parent: t.phase,
  pillar: "retail",
  stage: t.phase.includes('f0') ? "pre" : t.phase.includes('f4') ? "launch" : "prod",
  scope: "space",
  spaces: ["E1"],
  milestone: "softOpeningE1",
  deleted: false,
}));

// ═══ COMBINED: all entries ═══
const ALL_RETAIL_ENTRIES = [...PHASE_EPICS, ...GROUP_EPICS, ...TASKS];

// ═══ SOFT-DELETE existing placeholder RET tasks ═══
const TASKS_TO_SOFT_DELETE = ["t61", "t62", "t63", "t64", "t65", "t66", "t67", "t68", "t69", "t70", "t71", "t72"];

// ═══ FAMILY UPDATE: change RET color to nectarine ═══
const FAMILY_UPDATE = {
  code: "RET",
  label: "Retail: Productos",
  color: "#D7897F",  // nectarine (was #a3a3a3 gray)
  milestone: "softOpeningE1",  // was grandOpeningE1
};

// ═══ OUTPUT ═══
console.log("=== RETAIL MIGRATION ===");
console.log(`Phase epics: ${PHASE_EPICS.length}`);
console.log(`Group epics: ${GROUP_EPICS.length}`);
console.log(`Tasks: ${TASKS.length}`);
console.log(`Total entries: ${ALL_RETAIL_ENTRIES.length}`);
console.log(`Tasks to soft-delete: ${TASKS_TO_SOFT_DELETE.length}`);
console.log("");

const mode = process.argv[2];
if (mode === "--dry-run") {
  console.log("DRY RUN — preview of first 3 entries:");
  ALL_RETAIL_ENTRIES.slice(0, 3).forEach(t => console.log(JSON.stringify(t, null, 2)));
  console.log("...");
  console.log("\nFamily update:", JSON.stringify(FAMILY_UPDATE));
} else if (mode === "--apply") {
  console.log("APPLY mode — inserting into Supabase...");
  applyToSupabase();
} else {
  console.log("Usage:");
  console.log("  node scripts/retail-migration.js --dry-run");
  console.log("  node scripts/retail-migration.js --apply");
  console.log("");
  console.log("Or: import ALL_RETAIL_ENTRIES from this file and merge into tasks-v2.js");
}

async function applyToSupabase() {
  // Load env
  const dotenv = require('dotenv');
  const path = require('path');
  // Try backend .env first, then frontend .env
  dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });
  dotenv.config({ path: path.join(__dirname, '..', 'frontend', '.env') });

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use service key to bypass RLS (needed for INSERT)
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
    process.exit(1);
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
  };

  // 1. Soft-delete old placeholder tasks
  console.log("Soft-deleting old placeholder RET tasks...");
  for (const id of TASKS_TO_SOFT_DELETE) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ deleted: true }),
    });
    if (res.ok) console.log(`  Soft-deleted: ${id}`);
  }

  // 2. Upsert all retail entries
  console.log("\nUpserting retail entries...");
  const batchSize = 20;
  for (let i = 0; i < ALL_RETAIL_ENTRIES.length; i += batchSize) {
    const batch = ALL_RETAIL_ENTRIES.slice(i, i + batchSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(batch),
    });
    if (res.ok) {
      console.log(`  Inserted batch ${Math.floor(i/batchSize)+1}: ${batch.length} entries`);
    } else {
      const err = await res.text();
      console.error(`  ERROR batch ${Math.floor(i/batchSize)+1}:`, err);
    }
  }

  console.log("\nDone! Total entries inserted:", ALL_RETAIL_ENTRIES.length);
  console.log("Refresh the tracker to see retail tasks.");
}

// Export for use in other scripts
if (typeof module !== 'undefined') {
  module.exports = { ALL_RETAIL_ENTRIES, PHASE_EPICS, GROUP_EPICS, TASKS, FAMILY_UPDATE };
}
