import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Datos desde tu archivo original
const SEED_DATA = [
  ["t01","Reunión presupuesto Mavi","Dirección","Urgente","Crítica","2026-04-10","2026-04-15","David",false,"Sin presupuesto no arranca nada",[]],
  ["t02","Confirmar fecha GO/NO-GO","Dirección","Urgente","Crítica","2026-04-10","2026-04-11","David",false,"",[]],
  ["t03","Reporting semanal","Dirección","Pendiente","Alta","2026-04-14","2026-04-18","David",false,"",[]],
  ["t05","Presentación GO/NO-GO","Dirección","Pendiente","Crítica","2026-06-08","2026-06-15","David",false,"",["t42"]],
  ["t06","GO/NO-GO con board","Dirección","Pendiente","Crítica","2026-06-20","2026-06-20","David",true,"Si se retrasa, reforma no arranca",["t05"]],
  ["t07","Activar fase escala","Dirección","Pendiente","Crítica","2026-06-21","2026-06-25","David",false,"",["t06"]],
  ["t08","Contrato profesor/a","Legal","Urgente","Crítica","2026-04-10","2026-04-18","Cristina",false,"Sin contrato no se trabaja con profesor/a",[]],
  ["t09","Contrato coach Miguel","Legal","Urgente","Alta","2026-04-10","2026-04-18","Cristina",false,"Formalizar honorarios",[]],
  ["t10","Negociar con profesor/a","Legal","Pendiente","Crítica","2026-04-18","2026-04-25","David",false,"",["t08","t30"]],
  ["t11","Firma contrato profesor/a","Legal","Pendiente","Crítica","2026-04-25","2026-04-28","David",false,"",["t10"]],
  ["t12","Registro marca OEPM","Legal","En curso","Alta","2026-04-14","2026-04-30","Cristina",false,"",[]],
  ["t13","Licencia actividad Monteagudo","Legal","En curso","Alta","2026-04-14","2026-06-30","Cristina",false,"Iniciar antes de julio",[]],
  ["t14","Licencia servir alcohol","Legal","En curso","Alta","2026-04-14","2026-06-30","Cristina",false,"Sin ella, soft opening sin alcohol",[]],
  ["t15","RGPD consentimiento","Legal","Pendiente","Alta","2026-05-01","2026-05-15","Cristina",false,"",[]],
  ["t17","Contrato empresa reformas","Legal","Pendiente","Crítica","2026-06-25","2026-07-05","Cristina",false,"",["t06"]],
  ["t18","Licencia de obra","Legal","Pendiente","Alta","2026-06-01","2026-06-15","Cristina",false,"",["t53"]],
  ["t20","Método PERMA ejecutable","Método","En curso","Crítica","2026-03-01","2026-04-18","David",false,"",[]],
  ["t21","Exp. Alquiler+Kit","Método","Pendiente","Alta","2026-04-14","2026-04-28","David",false,"",["t20"]],
  ["t22","Exp. Sesión corta","Método","Pendiente","Crítica","2026-04-14","2026-04-28","David",false,"",["t20"]],
  ["t23","Exp. Programa largo","Método","Pendiente","Crítica","2026-04-14","2026-05-05","David",false,"",["t20"]],
  ["t24","Protocolo Daruma","Método","Pendiente","Alta","2026-04-21","2026-04-28","David",false,"",[]],
  ["t25","Manual operativo v0","Método","Pendiente","Crítica","2026-04-28","2026-05-12","David",false,"Sin manual, facilitador improvisa",["t22","t23"]],
  ["t26","Manual operativo v1","Método","Pendiente","Crítica","2026-06-22","2026-07-15","David",false,"",["t42"]],
  ["t30","Confirmar técnica + profesor/a","Profesor-Contenido","Urgente","Crítica","2026-04-10","2026-04-25","David",false,"Deadline 25 abr o piloto en peligro",[]],
  ["t31","Briefing profesor/a","Profesor-Contenido","Pendiente","Crítica","2026-04-25","2026-04-28","David",false,"",["t30","t11"]],
  ["t32","Propuesta 2-3 proyectos","Profesor-Contenido","Pendiente","Crítica","2026-04-28","2026-05-02","Profesora",false,"",["t31"]],
  ["t33","Selección proyecto final","Profesor-Contenido","Pendiente","Crítica","2026-05-02","2026-05-05","David",false,"",["t32"]],
  ["t34","Prototipo MVP (novato)","Profesor-Contenido","Pendiente","Crítica","2026-05-05","2026-05-12","Profesora",false,"",["t33"]],
  ["t35","Lista materiales exactos","Profesor-Contenido","Pendiente","Crítica","2026-05-05","2026-05-09","Profesora",false,"",["t33"]],
  ["t36","Reclutar 5-8 testers","Profesor-Contenido","Pendiente","Alta","2026-05-05","2026-05-16","David",false,"",[]],
  ["t37","Test validación","Profesor-Contenido","Pendiente","Crítica","2026-05-19","2026-05-19","David",true,"Si NO-GO, +2 semanas",["t34","t36"]],
  ["t38","Reservar estudio grabación","Profesor-Contenido","En curso","Alta","2026-04-14","2026-04-28","Miguel Márquez",false,"",[]],
  ["t39","Guiones todos módulos","Profesor-Contenido","Pendiente","Crítica","2026-05-21","2026-05-30","Miguel Márquez",false,"",["t37"]],
  ["t40","Grabación (3 días)","Profesor-Contenido","Pendiente","Crítica","2026-06-09","2026-06-11","Miguel Márquez",true,"",["t39"]],
  ["t41","Edición ~50 módulos","Profesor-Contenido","Pendiente","Crítica","2026-06-12","2026-06-30","Miguel Márquez",false,"",["t40"]],
  ["t42","Vídeos en plataforma","Profesor-Contenido","Pendiente","Crítica","2026-07-05","2026-07-12","Equipo Tech",false,"",["t41"]],
  ["t43","QRs definitivos","Profesor-Contenido","Pendiente","Alta","2026-07-12","2026-07-15","Equipo Tech",false,"",["t42"]],
  ["t50","Diseño 3D Daruma","Producto","Urgente","Crítica","2026-04-10","2026-04-18","Por asignar",false,"¿Dani?",[]],
  ["t51","Proveedor 3D Madrid","Producto","Urgente","Crítica","2026-04-14","2026-04-18","Christian",false,"",[]],
  ["t52","Pedido Daruma 3D piloto","Producto","Pendiente","Crítica","2026-04-21","2026-04-25","Christian",false,"",["t50","t51"]],
  ["t53a","Buscar cerámico Europa","Producto","En curso","Alta","2026-04-14","2026-04-30","Por asignar",false,"Portugal, Talavera",[]],
  ["t54","Sourcing materiales","Producto","En curso","Alta","2026-04-14","2026-04-30","Por asignar",false,"Katia, Casasol, DMC",[]],
  ["t55","Kits piloto (20-30)","Producto","Pendiente","Crítica","2026-05-12","2026-05-16","Por asignar",true,"Si no están 19 may, piloto no arranca",["t35","t50"]],
  ["t56","Kits definitivos (50+)","Producto","Pendiente","Crítica","2026-07-01","2026-08-01","Por asignar",false,"",["t43"]],
  ["t70","Confirmar estudio branding","Branding","Urgente","Alta","2026-04-10","2026-04-14","David",false,"",[]],
  ["t71","Brief branding + naming","Branding","Pendiente","Alta","2026-04-14","2026-04-18","David",false,"",["t70"]],
  ["t72","Naming final","Branding","Pendiente","Alta","2026-04-28","2026-05-12","Estudio Branding",false,"",["t71"]],
  ["t73","Identidad visual","Branding","Pendiente","Crítica","2026-04-28","2026-05-30","Estudio Branding",true,"Sin identidad, todo se retrasa",["t71"]],
  ["t74","Web lista de espera","Branding","Pendiente","Alta","2026-05-20","2026-06-05","Equipo Tech",false,"",["t73"]],
  ["t75","Canal IG+TikTok","Branding","Pendiente","Alta","2026-06-01","2026-06-05","Por asignar",false,"",["t73"]],
  ["t76","Lista espera 300-500","Branding","Pendiente","Alta","2026-06-05","2026-08-31","Por asignar",false,"",["t74","t75"]],
  ["t77","Grand Opening","Branding","Pendiente","Crítica","2026-10-01","2026-10-01","David",true,"",["t92"]],
  ["t53","Proyecto obra Monteagudo","Espacio-E1","En curso","Crítica","2026-04-14","2026-05-30","Christian",false,"Empezar ya",[]],
  ["t80","Empresa reformas (AGOSTO)","Espacio-E1","En curso","Crítica","2026-04-14","2026-05-15","Christian",false,"Si no trabaja agosto, obra para 2-3 sem",[]],
  ["t81","Presupuestos obra (x3)","Espacio-E1","Pendiente","Alta","2026-05-01","2026-05-30","Christian",false,"",["t53"]],
  ["t82","Inicio reforma","Espacio-E1","Pendiente","Crítica","2026-06-25","2026-06-25","Empresa Reformas",true,"Cada sem retraso = -1 sem apertura",["t06","t17","t18"]],
  ["t83","Obra (8-10 sem)","Espacio-E1","Pendiente","Crítica","2026-06-25","2026-08-20","Empresa Reformas",false,"",["t82"]],
  ["t84","Equipamiento","Espacio-E1","Pendiente","Alta","2026-07-01","2026-08-10","Christian",false,"",["t82"]],
  ["t85","Señalética + foto","Espacio-E1","Pendiente","Alta","2026-08-10","2026-08-25","Christian",false,"",["t83","t73"]],
  ["t86","Check final espacio","Espacio-E1","Pendiente","Crítica","2026-08-25","2026-08-28","Christian",true,"",["t83","t84","t85"]],
  ["t92","Soft Opening E1","Espacio-E1","Pendiente","Crítica","2026-09-01","2026-09-01","David",true,"",["t86"]],
  ["t87","Perfil facilitador","Equipo","En curso","Crítica","2026-04-10","2026-04-18","David",false,"",[]],
  ["t88","Reunión Lupi","Equipo","En curso","Alta","2026-04-14","2026-04-18","Christian",false,"",[]],
  ["t89","Búsqueda facilitador","Equipo","Pendiente","Crítica","2026-04-14","2026-04-28","David",false,"",["t87"]],
  ["t90","Selección facilitador","Equipo","Pendiente","Crítica","2026-04-28","2026-05-05","David",false,"Sin facilitador 5 may, fundadores facilitan",["t89"]],
  ["t91","Formación facilitador (5d)","Equipo","Pendiente","Crítica","2026-05-05","2026-05-09","David",false,"",["t90","t25"]],
  ["t91b","Certificación facilitador","Equipo","Pendiente","Crítica","2026-05-19","2026-05-23","David",true,"",["t91"]],
  ["t95","Criterios GO/NO-GO","Piloto","Urgente","Crítica","2026-04-14","2026-04-21","David",false,"Comunicar a board ANTES del piloto",[]],
  ["t96","Reclutar participantes","Piloto","Pendiente","Alta","2026-04-21","2026-05-16","David",false,"",[]],
  ["t97","Monteagudo para piloto","Piloto","Pendiente","Alta","2026-05-01","2026-05-16","Christian",false,"",[]],
  ["t98","Piloto arranca","Piloto","Pendiente","Crítica","2026-05-19","2026-05-19","Facilitador",true,"",["t55","t91b","t25"]],
  ["t99","Sesiones cortas (8x2/sem)","Piloto","Pendiente","Crítica","2026-05-19","2026-06-13","Facilitador",false,"",["t98"]],
  ["t100","Programa largo (4x1/sem)","Piloto","Pendiente","Crítica","2026-05-19","2026-06-13","Facilitador",false,"",["t98"]],
  ["t101","Analizar datos","Piloto","Pendiente","Crítica","2026-06-15","2026-06-18","David",false,"",["t99","t100"]],
  ["t102","Informe GO/NO-GO","Piloto","Pendiente","Crítica","2026-06-15","2026-06-18","David",true,"",["t101"]],
  ["t110","Reunión Lupi tech","Tecnología","En curso","Alta","2026-04-14","2026-04-18","Christian",false,"",[]],
  ["t111","Decidir stack tech","Tecnología","En curso","Alta","2026-04-14","2026-04-25","Christian",false,"",[]],
  ["t112","Reservas (pago+paleta)","Tecnología","Pendiente","Alta","2026-04-25","2026-05-15","Equipo Tech",false,"",["t111"]],
  ["t113","Web vídeos (player, QR)","Tecnología","Pendiente","Crítica","2026-05-15","2026-07-05","Equipo Tech",false,"",["t111"]],
  ["t114","Test stack producción","Tecnología","Pendiente","Crítica","2026-08-20","2026-08-28","Equipo Tech",true,"",["t113"]],
].map(function(row) {
  return {
    id: row[0],
    name: row[1],
    ws: row[2],
    status: row[3],
    priority: row[4],
    startDate: row[5],
    endDate: row[6],
    owner: row[7],
    isMilestone: row[8],
    risk: row[9],
    notes: "",
    deps: row[10] || [],
  };
});

async function migrate() {
  console.log('🔄 Iniciando migración de datos...');
  console.log(`📝 Procesando ${SEED_DATA.length} tareas con UPSERT...`);

  try {
    // Usar UPSERT para actualizar tareas existentes o insertar nuevas
    // Esto evita problemas con duplicados
    const { data, error } = await supabase
      .from('tasks')
      .upsert(SEED_DATA, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 ${SEED_DATA.length} tareas procesadas (insertadas/actualizadas)`);

    // Verificar
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    console.log(`✓ Total de tareas en la base de datos: ${count}`);

    // Verificar cuántas tareas de cada workstream
    const { data: tasks } = await supabase
      .from('tasks')
      .select('ws');

    if (tasks) {
      const wsCount = tasks.reduce((acc, t) => {
        acc[t.ws] = (acc[t.ws] || 0) + 1;
        return acc;
      }, {});
      console.log('\n📊 Desglose por workstream:');
      Object.entries(wsCount).forEach(([ws, count]) => {
        console.log(`   ${ws}: ${count} tareas`);
      });
    }

  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

migrate();
