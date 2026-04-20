/**
 * METADATA ENRIQUECIDA DE TAREAS
 *
 * Sistema de contexto completo para cada tarea
 * Incluye: jerarquía, contexto, riesgos, alertas proactivas
 *
 * Nivel de detalle: Project Manager élite + Visual Data Communicator
 */

export const TASK_ENRICHED_METADATA = {

  // ========================================
  // DIRECCIÓN
  // ========================================

  t01: {
    fullName: "Reunión de aprobación de presupuesto con Mavi (inversora)",
    parentContext: {
      project: "Fundación del proyecto",
      phase: "Validación financiera inicial",
      ancestors: [],
    },
    purpose: "Asegurar financiamiento inicial del proyecto NEO DMSTK. Sin esta aprobación, el proyecto no puede arrancar.",
    whatIfFails: {
      impact: "CRÍTICO",
      consequence: "El proyecto se detiene completamente. No hay fondos para contratar, producir kits, o rentar espacio.",
      mitigation: "Plan B: Buscar inversores alternativos o reducir scope inicial.",
      daysToRecover: 14,
    },
    whoNeedsThis: ["Todo el equipo", "Todas las workstreams"],
    visualContext: {
      icon: "💰",
      color: "#C0564A", // Rojo crítico
      category: "Financiero",
    },
  },

  t02: {
    fullName: "Confirmar fecha exacta de reunión GO/NO-GO con el board",
    parentContext: {
      project: "Planificación de hitos",
      phase: "Setup inicial",
      ancestors: [],
    },
    purpose: "Establecer fecha compromiso para la decisión de escala. El board necesita saber cuándo recibirá el informe del piloto.",
    whatIfFails: {
      impact: "ALTO",
      consequence: "Incertidumbre en planificación. El board podría no estar disponible, retrasando la decisión de escala.",
      mitigation: "Proponer 2-3 fechas alternativas con anticipación.",
      daysToRecover: 7,
    },
    whoNeedsThis: ["Board", "David", "Equipo completo (planificación)"],
    visualContext: {
      icon: "📅",
      color: "#E2B93B",
      category: "Planificación",
    },
  },

  // ... (resto de tareas DIRECCIÓN similar)

  // ========================================
  // PRODUCTO - EJEMPLO DETALLADO
  // ========================================

  t50: {
    fullName: "Diseño 3D del Daruma (figura central de la experiencia)",
    parentContext: {
      project: "Línea de Producto Daruma",
      phase: "Diseño de producto físico",
      ancestors: [],
      children: ["t51", "t52", "t55", "t53a", "t53b", "t53c"],
    },
    purpose: "Crear el diseño 3D del Daruma que será el objeto físico central de la experiencia PERMA. Los participantes lo ensamblarán durante las sesiones.",
    whatIfFails: {
      impact: "BLOQUEANTE",
      consequence: "Sin diseño 3D, no se puede fabricar ni el prototipo 3D (t52) ni ordenar la producción cerámica (t53b). El piloto no puede arrancar (t98).",
      cascadeImpact: [
        "t51 (Proveedor 3D) - bloqueada",
        "t52 (Pedido piloto) - bloqueada",
        "t55 (Kits piloto) - bloqueada",
        "t98 (Piloto arranca) - RETRASADO",
        "t102 (Informe GO/NO-GO) - RETRASADO",
        "t06 (Decisión GO/NO-GO) - RETRASADO (+14 días mínimo)",
      ],
      mitigation: "Confirmar con Dani urgentemente. Si no puede, buscar diseñador 3D alternativo (Fiverr, Upwork) en 48h.",
      daysToRecover: 10,
    },
    whoNeedsThis: [
      "Christian (para ordenar producción)",
      "Facilitador (para sesiones piloto)",
      "Participantes (experiencia completa)",
    ],
    visualContext: {
      icon: "🎨",
      color: "#D7897F",
      category: "Diseño de Producto",
      relatedAssets: ["Daruma 3D", "Kits físicos"],
    },
    currentBlockers: {
      hasBlockers: true,
      blockers: [
        {
          type: "assignment",
          message: "Dani no está confirmado como diseñador. URGENTE asignar.",
          severity: "critical",
        },
      ],
    },
  },

  t53a: {
    fullName: "Buscar proveedor de cerámica en Europa (Portugal/Talavera/Manises) para producción definitiva de Darumas",
    parentContext: {
      project: "Línea de Producto Daruma - Producción definitiva",
      phase: "Sourcing de proveedores",
      ancestors: ["t50 (Diseño 3D)", "Proyecto Daruma completo"],
      mother: "t50 (Diseño 3D Daruma)",
      siblings: ["t51 (Proveedor 3D Madrid - piloto)", "t54 (Sourcing materiales)"],
      children: ["t53b (Pedido Europa)", "t53c (Recepción)"],
    },
    purpose: "Encontrar fabricante europeo de cerámica artesanal que pueda producir 200-500 Darumas de calidad para el soft/grand opening. La cerámica da percepción de mayor valor vs impresión 3D.",
    detailedContext: {
      why: "El piloto usa Darumas 3D (plástico) pero para la apertura comercial necesitamos cerámica artesanal que refleje calidad premium.",
      when: "Paralela a la preparación del piloto, para tener producción lista cuando decidamos escalar.",
      where: "Europa (Portugal, Talavera, Manises) por calidad artesanal y tiempos de envío razonables.",
    },
    whatIfFails: {
      impact: "MEDIO-ALTO",
      consequence: "Si no encontramos proveedor cerámico, debemos usar Darumas 3D también en soft/grand opening, lo cual reduce percepción de calidad premium.",
      cascadeImpact: [
        "t53b (Pedido Europa) - bloqueada",
        "t53c (Recepción Darumas) - bloqueada",
        "t58 (Kits definitivos) - tendrán Darumas 3D en lugar de cerámica",
      ],
      mitigation: "Plan B: Ampliar búsqueda a Italia, España (otras regiones), Marruecos. Plan C: Usar Darumas 3D premium (mejor calidad plástico).",
      daysToRecover: 21,
    },
    whoNeedsThis: [
      "Christian (coordina producción)",
      "David (aprueba proveedor)",
      "Equipo de montaje (necesitan kits definitivos a tiempo)",
    ],
    visualContext: {
      icon: "🏺",
      color: "#E2B93B",
      category: "Sourcing - Producción",
      relatedAssets: ["Daruma cerámico definitivo", "Kits comerciales"],
      geographicScope: "Europa (Portugal, Talavera, Manises)",
    },
    proactiveAlerts: [
      {
        when: "2026-04-20", // 6 días después del inicio
        condition: "Si no tenemos al menos 2 proveedores contactados",
        alert: "⚠️ Búsqueda de cerámico va lenta. Solo quedan 10 días para terminar sourcing.",
        action: "Ampliar búsqueda geográfica o asignar más recursos.",
      },
      {
        when: "2026-04-30", // Fecha límite
        condition: "Si no hay proveedor confirmado",
        alert: "🚨 CRÍTICO: No hay proveedor cerámico confirmado. Activar Plan B.",
        action: "Decisión: ¿Usamos 3D premium o buscamos fuera de Europa?",
      },
    ],
  },

  t53b: {
    fullName: "Pedido de producción de 200-500 Darumas cerámicos al proveedor europeo",
    parentContext: {
      project: "Línea de Producto Daruma - Producción definitiva",
      phase: "Fabricación",
      ancestors: ["t50 (Diseño 3D)", "t53a (Buscar proveedor cerámico)"],
      mother: "t53a (Buscar cerámico Europa)",
      grandmother: "t50 (Diseño 3D Daruma)",
      children: ["t53c (Recepción Darumas)"],
    },
    purpose: "Ordenar la producción de todos los Darumas cerámicos necesarios para soft opening (200) y primeros meses de operación (hasta 500).",
    detailedContext: {
      why: "Lead time de cerámica artesanal es ~6-8 semanas. Pedimos ahora para tener listo en agosto.",
      quantityLogic: {
        softOpening: "50 Darumas (reserva para primeros eventos)",
        firstMonth: "100 Darumas (estimado 25 sesiones x 4 personas)",
        buffer: "50 adicionales (roturas, pruebas)",
        total: "200 mínimo, hasta 500 si hay descuento por volumen",
      },
    },
    whatIfFails: {
      impact: "ALTO",
      consequence: "Sin Darumas cerámicos, el soft/grand opening usa Darumas 3D, reduciendo calidad percibida y experiencia premium.",
      cascadeImpact: [
        "t53c (Recepción) - bloqueada",
        "t58 (Kits definitivos) - deben usar Darumas 3D",
        "t92 (Soft Opening) - abre con producto sub-óptimo",
      ],
      mitigation: "Plan B: Dividir pedido en lotes. Primer lote urgente de 50 en 3 semanas. Plan C: Mix cerámico + 3D premium.",
      daysToRecover: 14,
    },
    whoNeedsThis: [
      "Equipo de montaje de kits",
      "Manager E1 (recibe productos)",
      "Participantes (experiencia final)",
    ],
    visualContext: {
      icon: "📦",
      color: "#96C7B3",
      category: "Producción - Pedido",
    },
    proactiveAlerts: [
      {
        when: "2026-05-20", // 5 días después del inicio
        condition: "Si no hay cotización confirmada",
        alert: "⚠️ Pedido cerámico sin cotizar. Lead time está corriendo.",
        action: "Acelerar negociación o buscar proveedor alternativo.",
      },
      {
        when: "2026-06-01", // Fecha límite
        condition: "Si pedido no está confirmado",
        alert: "🚨 CRÍTICO: Pedido cerámico no confirmado. Riesgo de no tener para soft opening.",
        action: "Decisión: ¿Pedido urgente express o Plan B?",
      },
    ],
  },

  // ========================================
  // PROFESOR-CONTENIDO - CADENA CRÍTICA
  // ========================================

  t30: {
    fullName: "Confirmar técnica artesanal y profesor/a experto/a",
    parentContext: {
      project: "Contenido creativo de sesiones",
      phase: "Definición de experiencia",
      ancestors: [],
      children: ["t31", "t32", "t33", "t34", "t35", "t36", "t37", "t38", "...t46"],
    },
    purpose: "Decidir qué técnica artesanal (cerámica, origami, grabado, etc.) será el núcleo de la experiencia PERMA, y confirmar al profesor/a experto/a que la enseñará.",
    detailedContext: {
      criticality: "Esta es la MADRE de toda la cadena de contenido. Sin esta decisión, nada del contenido puede avanzar.",
      deadline: "25 de abril - fecha límite o el piloto se retrasa",
      options: ["Cerámica Raku", "Origami avanzado", "Grabado en linóleo", "Escultura en arcilla"],
    },
    whatIfFails: {
      impact: "BLOQUEANTE TOTAL",
      consequence: "Sin técnica + profesor/a confirmados, NO se puede:\n- Hacer briefing (t31)\n- Proponer proyectos (t32)\n- Crear prototipo (t34)\n- Producir kits (t55)\n- Arrancar piloto (t98)\n\nTODO EL PROYECTO SE DETIENE.",
      cascadeImpact: [
        "t31-t46 (Toda la cadena profesor-contenido) - BLOQUEADA",
        "t55 (Kits piloto) - BLOQUEADA",
        "t98 (Piloto) - RETRASADO +14 días mínimo",
        "t102 (Informe GO/NO-GO) - RETRASADO",
        "t06 (Decisión GO/NO-GO) - RETRASADO",
        "TODO EL TIMELINE DEL PROYECTO - RETRASADO",
      ],
      mitigation: "URGENTE: Tomar decisión antes del 20 de abril. Si no, pre-seleccionar 2 opciones y preparar ambas en paralelo (caro pero necesario).",
      daysToRecover: "IMPOSIBLE recuperar después del 25 abril sin retrasar piloto",
    },
    whoNeedsThis: [
      "Profesor/a (necesita saber si está contratado/a)",
      "David (define experiencia)",
      "Christian (debe comprar materiales)",
      "TODO EL EQUIPO",
    },
    visualContext: {
      icon: "🎯",
      color: "#C0564A", // Rojo crítico
      category: "Decisión Estratégica",
      isKeystone: true, // Piedra angular
    },
    currentBlockers: {
      hasBlockers: true,
      blockers: [
        {
          type: "decision_pending",
          message: "Decisión de técnica aún no tomada. URGENTÍSIMO.",
          severity: "critical",
          daysRemaining: 15,
        },
      ],
    },
    proactiveAlerts: [
      {
        when: "2026-04-15",
        condition: "Si no hay técnica pre-seleccionada",
        alert: "🚨 URGENTE: Solo 10 días para confirmar técnica + profesor/a. SIN ESTO, EL PROYECTO SE DETIENE.",
        action: "Reunión emergency con David para tomar decisión HOY.",
      },
      {
        when: "2026-04-20",
        condition: "Si no hay profesor/a confirmado/a",
        alert: "🚨🚨🚨 CRÍTICO: 5 días para deadline. SIN PROFESOR/A CONFIRMADO/A. PILOTO EN PELIGRO.",
        action: "Activar Plan B: Contratar 2 profesores/as temporales o retrasar piloto.",
      },
      {
        when: "2026-04-25",
        condition: "Si no está confirmado",
        alert: "💀 DEADLINE PASADO. Piloto debe retrasarse +14 días mínimo. Informar a board.",
        action: "Recalcular todo el timeline. Comunicar nuevo GO/NO-GO.",
      },
    ],
  },

  // ========================================
  // EJEMPLO DE TAREA BIEN CONTEXTUALIZADA
  // ========================================

  t98: {
    fullName: "Inicio del Piloto - Primera sesión con participantes reales",
    parentContext: {
      project: "Validación de experiencia NEO DMSTK",
      phase: "Piloto",
      ancestors: [
        "t30 (Técnica + profesor/a)",
        "t25 (Manual v0)",
        "t55 (Kits piloto)",
        "t91b (Facilitador certificado)",
      ],
      greatGrandparents: ["t20 (Método PERMA)", "t50 (Diseño Daruma)"],
      children: ["t99 (Sesiones cortas)", "t100 (Programa largo)", "t100b (Contenido social)"],
      grandchildren: ["t101 (Analizar datos)", "t102 (Informe GO/NO-GO)"],
    },
    purpose: "Validar que la experiencia NEO DMSTK funciona con personas reales. Recolectar datos para decidir si escalamos (GO) o no (NO-GO).",
    detailedContext: {
      criticality: "HITO MAYOR - De aquí depende la decisión de invertir en escala",
      participants: "20-30 personas (mix de perfiles)",
      duration: "4 semanas (19 mayo - 13 junio)",
      deliverables: [
        "Datos de NPS",
        "Observaciones de facilitador",
        "Fotos/videos para marketing",
        "Feedback estructurado",
      ],
    },
    whatIfFails: {
      impact: "CRÍTICO PERO NO TERMINAL",
      consequence: "Si el piloto no puede arrancar en 19 mayo:\n- Se retrasa GO/NO-GO de 20 junio a 4 julio (+14 días)\n- Reforma se retrasa de 25 junio a 9 julio (+14 días)\n- Soft Opening se retrasa de 1 sept a 15 sept (+14 días)\n\nPero: Reforma y branding pueden continuar en paralelo.",
      cascadeImpact: [
        "t102 (Informe GO/NO-GO) - RETRASADO +14 días",
        "t06 (Decisión GO/NO-GO) - RETRASADO +14 días",
        "t83 (Inicio reforma) - RETRASADO +14 días",
        "t92 (Soft Opening) - RETRASADO +14 días",
        "PERO: t42-t45 (Grabación) puede continuar (se reformula contenido si piloto falla)",
      ],
      mitigation: "Si piloto se retrasa, hacer piloto express de 2 semanas en lugar de 4. Menos datos pero suficiente para decidir.",
      daysToRecover: 14,
    },
    whoNeedsThis: [
      "Board (necesita datos para decisión)",
      "David (analiza resultados)",
      "Equipo completo (define si escalamos)",
    ],
    visualContext: {
      icon: "🚀",
      color: "#6398A9",
      category: "Hito Mayor",
      isMilestone: true,
    },
    proactiveAlerts: [
      {
        when: "2026-05-12", // 7 días antes
        condition: "Si faltan kits (t55) o facilitador no certificado (t91b)",
        alert: "🚨 ALERTA: Piloto en 7 días pero faltan requisitos. Revisar t55 y t91b.",
        action: "Reunión de crisis: ¿retrasamos piloto o aceleramos kits/facilitador?",
      },
      {
        when: "2026-05-15", // 4 días antes
        condition: "Si no hay participantes reclutados (t96)",
        alert: "🚨 URGENTE: Piloto en 4 días sin participantes. Acelerar reclutamiento.",
        action: "Activar red de contactos o pagar por participantes si es necesario.",
      },
    ],
  },

};

/**
 * JERARQUÍAS COMPLETAS POR WORKSTREAM
 */
export const WORKSTREAM_HIERARCHIES = {

  "Producto-Daruma": {
    root: "t50 (Diseño 3D Daruma)",
    tree: {
      t50: {
        name: "Diseño 3D Daruma",
        level: 0,
        children: [
          {
            t51: { name: "Proveedor 3D Madrid", level: 1 },
            t52: { name: "Pedido Daruma 3D piloto", level: 2 },
            t55: { name: "Kits piloto (20-30)", level: 3, isMilestone: true },
          },
          {
            t53a: { name: "Buscar cerámico Europa", level: 1 },
            t53b: { name: "Pedido Daruma Europa (200-500)", level: 2 },
            t53c: { name: "Recepción Daruma Europa", level: 3 },
            t58: { name: "Kits definitivos (50+)", level: 4 },
          },
        ],
      },
    },
  },

  "Profesor-Contenido": {
    root: "t30 (Confirmar técnica + profesor/a)",
    tree: {
      t30: {
        name: "Confirmar técnica + profesor/a",
        level: 0,
        isKeystone: true,
        children: [
          {
            t31: { name: "Briefing profesor/a", level: 1 },
            t32: { name: "Propuesta proyectos", level: 2 },
            t33: { name: "Selección proyecto final", level: 3 },
            t34: { name: "Prototipo MVP", level: 4 },
            t38: { name: "Test validación", level: 5, isMilestone: true },
            t39: { name: "Evaluar resultados", level: 6 },
            t41: { name: "Guiones módulos", level: 7 },
            t42: { name: "Grabación (3 días)", level: 8, isMilestone: true },
            t43: { name: "Edición ~50 módulos", level: 9 },
            t44: { name: "Subtítulos", level: 10 },
            t45: { name: "Vídeos en plataforma", level: 11 },
            t46: { name: "QRs definitivos", level: 12 },
            t58: { name: "Kits definitivos", level: 13 },
          },
        ],
      },
    },
  },

};

/**
 * ALERTAS PROACTIVAS GLOBALES
 */
export const GLOBAL_PROACTIVE_ALERTS = [
  {
    id: "go-nogo-deadline",
    name: "Deadline GO/NO-GO crítico",
    triggerDate: "2026-06-15", // 5 días antes
    condition: (tasks) => {
      const t102 = tasks.find(t => t.id === 't102');
      return t102 && t102.status !== 'Hecho';
    },
    message: "🚨 GO/NO-GO en 5 días pero informe (t102) no está completo. URGENTE revisar piloto.",
    severity: "critical",
    actions: [
      "Reunión emergency con David",
      "Acelerar análisis de datos (t101)",
      "¿Retrasar GO/NO-GO o presentar con datos parciales?",
    ],
  },

  {
    id: "soft-opening-readiness",
    name: "Preparación Soft Opening",
    triggerDate: "2026-08-20", // 12 días antes
    condition: (tasks) => {
      const critical = ['t89a', 't84', 't85', 't58'];
      return critical.some(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.status !== 'Hecho';
      });
    },
    message: "⚠️ Soft Opening en 12 días pero hay tareas críticas pendientes (espacio/kits).",
    severity: "high",
    actions: [
      "Check diario de t89a, t84, t85, t58",
      "Plan de contingencia si no están listas",
      "¿Retrasar soft opening o hacer con limitaciones?",
    ],
  },

  {
    id: "budget-overrun-risk",
    name: "Riesgo de sobrecosto",
    trigger: "continuous",
    condition: (tasks, expenses) => {
      // Lógica: Si más de 30% de tareas se retrasan, hay riesgo de sobrecosto
      const total = tasks.length;
      const overdue = tasks.filter(t => {
        const end = new Date(t.endDate);
        const today = new Date();
        return end < today && t.status !== 'Hecho';
      }).length;
      return (overdue / total) > 0.30;
    },
    message: "💰 ALERTA: >30% de tareas vencidas. Alto riesgo de sobrecosto por retrasos.",
    severity: "high",
    actions: [
      "Reunión financiera con Mavi",
      "Revisar presupuesto vs real",
      "Identificar dónde recortar o pedir más fondos",
    ],
  },
];

/**
 * SISTEMA DE AYUDA CONTEXTUAL
 */
export const CONTEXTUAL_HELP = {

  taskNameFormat: {
    pattern: "[Verbo] + [Objeto] + [Contexto opcional]",
    examples: [
      "✅ Diseño 3D Daruma",
      "✅ Buscar cerámico Europa (Portugal/Talavera)",
      "❌ Cerámico Europa (falta contexto)",
      "❌ t53a (no dice nada)",
    ],
  },

  dependencyVisualization: {
    parentIndicator: "🔼 Depende de",
    childIndicator: "🔽 Bloquea a",
    siblingIndicator: "⚖️ Paralela con",
    colors: {
      parent: "#6398A9",
      child: "#96C7B3",
      sibling: "#E2B93B",
    },
  },

  tooltipStructure: {
    line1: "Nombre completo de la tarea",
    line2: "Padre: [nombre del padre]",
    line3: "Propósito: [1 frase]",
    line4: "Qué pasa si falla: [consecuencia]",
    line5: "Quién lo necesita: [lista]",
  },

};

export default TASK_ENRICHED_METADATA;
