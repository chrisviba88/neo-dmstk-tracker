/**
 * TAREAS COMPLETAS - 109 tareas
 * Sistema NEO DMSTK
 *
 * Principios de dependencias:
 * - Buffer contractual: 1 día
 * - Buffer creativo: 3 días
 * - Buffer producción: 7 días
 * - Buffer construcción: 14 días
 * - Hitos: 0 buffer (fecha exacta)
 *
 * Actualizado: 2026-04-11
 */

export const COMPLETE_TASKS = [
  // ========================================
  // DIRECCIÓN (7 tareas)
  // ========================================
  { id: "t01", name: "Reunión presupuesto Mavi", ws: "Dirección", status: "Urgente", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-15", owner: "David", isMilestone: false, risk: "Sin presupuesto no arranca nada", notes: "", deps: [] },
  { id: "t02", name: "Confirmar fecha GO/NO-GO", ws: "Dirección", status: "Urgente", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-11", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t03", name: "Reporting semanal", ws: "Dirección", status: "Pendiente", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-18", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t04", name: "Weekly standup", ws: "Dirección", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-06-20", owner: "David", isMilestone: false, risk: "", notes: "Reunión semanal de seguimiento", deps: [] },
  { id: "t05", name: "Presentación GO/NO-GO", ws: "Dirección", status: "Pendiente", priority: "Crítica", startDate: "2026-06-08", endDate: "2026-06-15", owner: "David", isMilestone: false, risk: "", notes: "", deps: ["t102"] },
  { id: "t06", name: "GO/NO-GO con board", ws: "Dirección", status: "Pendiente", priority: "Crítica", startDate: "2026-06-20", endDate: "2026-06-20", owner: "David", isMilestone: true, risk: "Si se retrasa, reforma no arranca", notes: "HITO CRÍTICO - Decisión de escala", deps: ["t05"] },
  { id: "t07", name: "Activar fase escala", ws: "Dirección", status: "Pendiente", priority: "Crítica", startDate: "2026-06-21", endDate: "2026-06-25", owner: "David", isMilestone: false, risk: "", notes: "", deps: ["t06"] },

  // ========================================
  // LEGAL (13 tareas)
  // ========================================
  { id: "t08", name: "Contrato profesor/a (borrador)", ws: "Legal", status: "Urgente", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-18", owner: "Cristina", isMilestone: false, risk: "Sin contrato no se trabaja con profesor/a", notes: "", deps: [] },
  { id: "t09", name: "Contrato coach Miguel", ws: "Legal", status: "Urgente", priority: "Alta", startDate: "2026-04-10", endDate: "2026-04-18", owner: "Cristina", isMilestone: false, risk: "Formalizar honorarios", notes: "", deps: [] },
  { id: "t10", name: "Negociar con profesor/a", ws: "Legal", status: "Pendiente", priority: "Crítica", startDate: "2026-04-19", endDate: "2026-04-25", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t08 y t30", deps: ["t08", "t30"] },
  { id: "t11", name: "Firma contrato profesor/a", ws: "Legal", status: "Pendiente", priority: "Crítica", startDate: "2026-04-26", endDate: "2026-04-28", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t10", deps: ["t10"] },
  { id: "t12", name: "Registro marca OEPM", ws: "Legal", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-30", owner: "Cristina", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t13", name: "Licencia actividad Monteagudo", ws: "Legal", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-06-30", owner: "Cristina", isMilestone: false, risk: "Iniciar antes de julio", notes: "", deps: [] },
  { id: "t14", name: "Licencia servir alcohol", ws: "Legal", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-06-30", owner: "Cristina", isMilestone: false, risk: "Sin ella, soft opening sin alcohol", notes: "", deps: [] },
  { id: "t15", name: "RGPD consentimiento", ws: "Legal", status: "Pendiente", priority: "Alta", startDate: "2026-05-01", endDate: "2026-05-15", owner: "Cristina", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t16", name: "Formulario derechos imagen", ws: "Legal", status: "Pendiente", priority: "Alta", startDate: "2026-05-01", endDate: "2026-05-15", owner: "Cristina", isMilestone: false, risk: "", notes: "Para grabaciones y contenido", deps: [] },
  { id: "t17", name: "Contrato empresa reformas", ws: "Legal", status: "Pendiente", priority: "Crítica", startDate: "2026-06-25", endDate: "2026-07-05", owner: "Cristina", isMilestone: false, risk: "", notes: "", deps: ["t06"] },
  { id: "t18", name: "Licencia de obra", ws: "Legal", status: "Pendiente", priority: "Alta", startDate: "2026-06-01", endDate: "2026-06-15", owner: "Cristina", isMilestone: false, risk: "", notes: "", deps: ["t53"] },
  { id: "t19", name: "Contratos laborales equipo", ws: "Legal", status: "Pendiente", priority: "Alta", startDate: "2026-06-01", endDate: "2026-06-30", owner: "Cristina", isMilestone: false, risk: "", notes: "Facilitador, manager, anfitrión/a", deps: [] },
  { id: "t19b", name: "Seguros espacio", ws: "Legal", status: "Pendiente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-07-15", owner: "Cristina", isMilestone: false, risk: "", notes: "Responsabilidad civil, contenido", deps: [] },

  // ========================================
  // MÉTODO (10 tareas)
  // ========================================
  { id: "t20", name: "Método PERMA ejecutable", ws: "Método", status: "En curso", priority: "Crítica", startDate: "2026-03-01", endDate: "2026-04-18", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t21", name: "Exp. Alquiler+Kit", ws: "Método", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-04-28", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 3 días tras t20", deps: ["t20"] },
  { id: "t22", name: "Exp. Sesión corta (guión min a min)", ws: "Método", status: "Pendiente", priority: "Crítica", startDate: "2026-04-21", endDate: "2026-04-28", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 3 días tras t20", deps: ["t20"] },
  { id: "t23", name: "Exp. Programa largo (arco 4 sesiones)", ws: "Método", status: "Pendiente", priority: "Crítica", startDate: "2026-04-21", endDate: "2026-05-05", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 3 días tras t20", deps: ["t20"] },
  { id: "t24", name: "Protocolo Daruma", ws: "Método", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-04-28", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t25", name: "Manual operativo v0 (piloto)", ws: "Método", status: "Pendiente", priority: "Crítica", startDate: "2026-05-01", endDate: "2026-05-12", owner: "David", isMilestone: false, risk: "Sin manual, facilitador improvisa", notes: "Buffer: 3 días tras t22/t23", deps: ["t22", "t23"] },
  { id: "t26", name: "Manual operativo v1 (datos piloto)", ws: "Método", status: "Pendiente", priority: "Crítica", startDate: "2026-06-22", endDate: "2026-07-15", owner: "David", isMilestone: false, risk: "", notes: "Mejora con insights del piloto", deps: ["t102"] },
  { id: "t27", name: "Manual operativo v2 (certificación)", ws: "Método", status: "Pendiente", priority: "Alta", startDate: "2026-07-15", endDate: "2026-08-01", owner: "David", isMilestone: false, risk: "", notes: "Versión final certificable", deps: ["t26"] },
  { id: "t28", name: "Protocolo perfiles extremos", ws: "Método", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-05-05", owner: "David", isMilestone: false, risk: "", notes: "Manejo de participantes difíciles", deps: [] },
  { id: "t29", name: "Protocolo alcohol", ws: "Método", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-05-05", owner: "David", isMilestone: false, risk: "", notes: "Política y manejo", deps: [] },

  // ========================================
  // PROFESOR-CONTENIDO (17 tareas)
  // ========================================
  { id: "t30", name: "Confirmar técnica + profesor/a", ws: "Profesor-Contenido", status: "Urgente", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-25", owner: "David", isMilestone: false, risk: "Deadline 25 abr o piloto en peligro", notes: "", deps: [] },
  { id: "t31", name: "Briefing profesor/a (90 min)", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-04-29", endDate: "2026-05-01", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t30 y t11", deps: ["t30", "t11"] },
  { id: "t32", name: "Propuesta 2-3 proyectos", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-02", endDate: "2026-05-04", owner: "Profesora", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t31", deps: ["t31"] },
  { id: "t33", name: "Selección proyecto final", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-05", endDate: "2026-05-07", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t32", deps: ["t32"] },
  { id: "t34", name: "Prototipo MVP (novato cronometrado)", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-08", endDate: "2026-05-14", owner: "Profesora", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t33", deps: ["t33"] },
  { id: "t35", name: "Lista materiales exactos", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-08", endDate: "2026-05-12", owner: "Profesora", isMilestone: false, risk: "", notes: "Paralela con t34", deps: ["t33"] },
  { id: "t36", name: "Paletas de colores (3-4)", ws: "Profesor-Contenido", status: "Pendiente", priority: "Alta", startDate: "2026-05-08", endDate: "2026-05-12", owner: "Profesora", isMilestone: false, risk: "", notes: "Paralela con t34/t35", deps: ["t33"] },
  { id: "t37", name: "Reclutar 5-8 testers", ws: "Profesor-Contenido", status: "Pendiente", priority: "Alta", startDate: "2026-05-05", endDate: "2026-05-16", owner: "David", isMilestone: false, risk: "", notes: "Paralela con prototipo", deps: [] },
  { id: "t38", name: "Test validación", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-19", endDate: "2026-05-19", owner: "David", isMilestone: true, risk: "Si NO-GO, +2 semanas", notes: "HITO - Validación proyecto", deps: ["t34", "t37"] },
  { id: "t39", name: "Evaluar resultados test", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-20", endDate: "2026-05-21", owner: "David", isMilestone: false, risk: "", notes: "Análisis inmediato post-test", deps: ["t38"] },
  { id: "t40", name: "Reservar estudio grabación", ws: "Profesor-Contenido", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-28", owner: "Miguel Márquez", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t41", name: "Guiones todos módulos (~50 piezas)", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-05-24", endDate: "2026-06-03", owner: "Miguel Márquez", isMilestone: false, risk: "", notes: "Buffer: 3 días tras t39", deps: ["t39"] },
  { id: "t42", name: "Grabación (3 días de set)", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-06-09", endDate: "2026-06-11", owner: "Miguel Márquez", isMilestone: true, risk: "", notes: "HITO - Buffer: 6 días tras t41", deps: ["t41"] },
  { id: "t43", name: "Edición ~50 módulos", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-06-18", endDate: "2026-07-08", owner: "Miguel Márquez", isMilestone: false, risk: "", notes: "Buffer: 7 días tras grabación", deps: ["t42"] },
  { id: "t44", name: "Subtítulos ES+EN + espejo zurdos", ws: "Profesor-Contenido", status: "Pendiente", priority: "Alta", startDate: "2026-06-25", endDate: "2026-07-05", owner: "Miguel Márquez", isMilestone: false, risk: "", notes: "Paralela parcial con t43", deps: ["t43"] },
  { id: "t45", name: "Vídeos en plataforma", ws: "Profesor-Contenido", status: "Pendiente", priority: "Crítica", startDate: "2026-07-09", endDate: "2026-07-16", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t44", deps: ["t44"] },
  { id: "t46", name: "QRs definitivos para kits", ws: "Profesor-Contenido", status: "Pendiente", priority: "Alta", startDate: "2026-07-17", endDate: "2026-07-22", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t45", deps: ["t45"] },

  // ========================================
  // PRODUCTO (13 tareas)
  // ========================================
  { id: "t50", name: "Diseño 3D Daruma", ws: "Producto", status: "Urgente", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-18", owner: "Por asignar", isMilestone: false, risk: "¿Dani puede hacerlo? Necesita confirmación urgente", notes: "", deps: [] },
  { id: "t51", name: "Proveedor impresión 3D Madrid", ws: "Producto", status: "Urgente", priority: "Crítica", startDate: "2026-04-14", endDate: "2026-04-18", owner: "Christian", isMilestone: false, risk: "", notes: "Paralela con t50", deps: [] },
  { id: "t52", name: "Pedido Daruma 3D piloto (50-80 uds)", ws: "Producto", status: "Pendiente", priority: "Crítica", startDate: "2026-04-22", endDate: "2026-04-28", owner: "Christian", isMilestone: false, risk: "", notes: "Buffer: 4 días para coordinar", deps: ["t50", "t51"] },
  { id: "t53a", name: "Buscar cerámico Europa (apertura)", ws: "Producto", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-30", owner: "Por asignar", isMilestone: false, risk: "Portugal, Talavera, Manises", notes: "", deps: [] },
  { id: "t53b", name: "Pedido Daruma Europa (200-500 uds)", ws: "Producto", status: "Pendiente", priority: "Alta", startDate: "2026-05-15", endDate: "2026-06-01", owner: "Por asignar", isMilestone: false, risk: "", notes: "Buffer: 15 días para negociar", deps: ["t53a"] },
  { id: "t53c", name: "Recepción Daruma Europa", ws: "Producto", status: "Pendiente", priority: "Alta", startDate: "2026-07-15", endDate: "2026-08-10", owner: "Por asignar", isMilestone: false, risk: "", notes: "Lead time internacional", deps: ["t53b"] },
  { id: "t54", name: "Sourcing materiales (Katia, Casasol, DMC)", ws: "Producto", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-30", owner: "Por asignar", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t55", name: "Kits piloto artesanales (20-30 uds)", ws: "Producto", status: "Pendiente", priority: "Crítica", startDate: "2026-05-13", endDate: "2026-05-17", owner: "Por asignar", isMilestone: true, risk: "Si no están 19 may, piloto no arranca", notes: "HITO - Buffer: 1 día tras t35/t50", deps: ["t35", "t50"] },
  { id: "t56", name: "Diseño instrucciones kit (tarjeta A5)", ws: "Producto", status: "Pendiente", priority: "Alta", startDate: "2026-05-08", endDate: "2026-05-19", owner: "Por asignar", isMilestone: false, risk: "", notes: "Paralela con t55", deps: ["t33"] },
  { id: "t57", name: "Diseño packaging", ws: "Producto", status: "Pendiente", priority: "Alta", startDate: "2026-05-08", endDate: "2026-05-19", owner: "Por asignar", isMilestone: false, risk: "", notes: "Necesita identidad visual", deps: ["t73"] },
  { id: "t58", name: "Kits definitivos (50+ uds)", ws: "Producto", status: "Pendiente", priority: "Crítica", startDate: "2026-07-23", endDate: "2026-08-13", owner: "Por asignar", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t46", deps: ["t46"] },
  { id: "t59", name: "Merch diseño (tote, mug, pins)", ws: "Producto", status: "Pendiente", priority: "Media", startDate: "2026-06-01", endDate: "2026-06-30", owner: "Por asignar", isMilestone: false, risk: "", notes: "Necesita branding", deps: ["t73"] },
  { id: "t60", name: "Merch producción", ws: "Producto", status: "Pendiente", priority: "Media", startDate: "2026-07-01", endDate: "2026-08-15", owner: "Por asignar", isMilestone: false, risk: "", notes: "", deps: ["t59"] },

  // ========================================
  // BRANDING (11 tareas)
  // ========================================
  { id: "t70", name: "Confirmar estudio branding", ws: "Branding", status: "Urgente", priority: "Alta", startDate: "2026-04-10", endDate: "2026-04-14", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t71", name: "Brief branding + naming", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-04-15", endDate: "2026-04-21", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t70", deps: ["t70"] },
  { id: "t72", name: "Naming final", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-04-28", endDate: "2026-05-12", owner: "Estudio Branding", isMilestone: false, risk: "", notes: "Buffer: 7 días tras brief", deps: ["t71"] },
  { id: "t73", name: "Identidad visual final", ws: "Branding", status: "Pendiente", priority: "Crítica", startDate: "2026-04-28", endDate: "2026-05-30", owner: "Estudio Branding", isMilestone: true, risk: "Sin identidad, packaging+web+social se retrasan", notes: "HITO - Paralela con naming", deps: ["t71"] },
  { id: "t74", name: "Web lista de espera", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-06-03", endDate: "2026-06-10", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Buffer: 4 días tras identidad", deps: ["t73"] },
  { id: "t75", name: "Canal IG+TikTok activo", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-06-03", endDate: "2026-06-10", owner: "Por asignar", isMilestone: false, risk: "", notes: "Paralela con t74", deps: ["t73"] },
  { id: "t76", name: "Lista espera (obj 300-500)", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-06-11", endDate: "2026-08-31", owner: "Por asignar", isMilestone: false, risk: "", notes: "Campaña continua", deps: ["t74", "t75"] },
  { id: "t77", name: "Performance marketing (~3K€/mes)", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-06-15", endDate: "2026-10-01", owner: "Por asignar", isMilestone: false, risk: "", notes: "Ads continuas hasta apertura", deps: ["t75"] },
  { id: "t78", name: "Narrativa PR", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-07-31", owner: "David", isMilestone: false, risk: "", notes: "Historia para medios", deps: [] },
  { id: "t79", name: "PR con soft opening", ws: "Branding", status: "Pendiente", priority: "Alta", startDate: "2026-08-25", endDate: "2026-09-01", owner: "Por asignar", isMilestone: false, risk: "", notes: "Contacto con prensa", deps: ["t78"] },
  { id: "t80", name: "Grand Opening", ws: "Branding", status: "Pendiente", priority: "Crítica", startDate: "2026-10-01", endDate: "2026-10-01", owner: "David", isMilestone: true, risk: "", notes: "HITO FINAL", deps: ["t92"] },

  // ========================================
  // ESPACIO-E1 (11 tareas)
  // ========================================
  { id: "t53", name: "Proyecto obra Monteagudo (PB+P1)", ws: "Espacio-E1", status: "En curso", priority: "Crítica", startDate: "2026-04-14", endDate: "2026-05-30", owner: "Christian", isMilestone: false, risk: "Empezar ya", notes: "", deps: [] },
  { id: "t81", name: "Empresa reformas (QUE TRABAJE AGOSTO)", ws: "Espacio-E1", status: "En curso", priority: "Crítica", startDate: "2026-04-14", endDate: "2026-05-15", owner: "Christian", isMilestone: false, risk: "Si no trabaja agosto, obra tarda 2-3 sem más", notes: "", deps: [] },
  { id: "t82", name: "Presupuestos obra (mín 3)", ws: "Espacio-E1", status: "Pendiente", priority: "Alta", startDate: "2026-05-01", endDate: "2026-05-30", owner: "Christian", isMilestone: false, risk: "", notes: "", deps: ["t53"] },
  { id: "t83", name: "Inicio reforma", ws: "Espacio-E1", status: "Pendiente", priority: "Crítica", startDate: "2026-06-25", endDate: "2026-06-25", owner: "Empresa Reformas", isMilestone: true, risk: "Cada semana de retraso = -1 sem apertura", notes: "HITO - Depende de GO/NO-GO", deps: ["t06", "t17", "t18"] },
  { id: "t84", name: "Obra y acondicionamiento (8-10 sem)", ws: "Espacio-E1", status: "Pendiente", priority: "Crítica", startDate: "2026-06-25", endDate: "2026-08-20", owner: "Empresa Reformas", isMilestone: false, risk: "", notes: "", deps: ["t83"] },
  { id: "t85", name: "Equipamiento (mesas, luz, audio, pantallas)", ws: "Espacio-E1", status: "Pendiente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-08-10", owner: "Christian", isMilestone: false, risk: "", notes: "Puede comenzar durante obra", deps: ["t83"] },
  { id: "t86", name: "Diseño sensorial (aroma, temp, flujo)", ws: "Espacio-E1", status: "Pendiente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-08-15", owner: "Christian", isMilestone: false, risk: "", notes: "Paralela con equipamiento", deps: ["t83"] },
  { id: "t87a", name: "Señalética + rincón foto", ws: "Espacio-E1", status: "Pendiente", priority: "Alta", startDate: "2026-08-10", endDate: "2026-08-25", owner: "Christian", isMilestone: false, risk: "", notes: "Necesita obra terminada e identidad", deps: ["t84", "t73"] },
  { id: "t88a", name: "Montaje zona retail", ws: "Espacio-E1", status: "Pendiente", priority: "Alta", startDate: "2026-08-10", endDate: "2026-08-25", owner: "Christian", isMilestone: false, risk: "", notes: "Paralela con señalética", deps: ["t84"] },
  { id: "t89a", name: "Check final espacio", ws: "Espacio-E1", status: "Pendiente", priority: "Crítica", startDate: "2026-08-26", endDate: "2026-08-29", owner: "Christian", isMilestone: true, risk: "", notes: "HITO - Verificación completa", deps: ["t84", "t85", "t87a"] },
  { id: "t92", name: "Soft Opening E1", ws: "Espacio-E1", status: "Pendiente", priority: "Crítica", startDate: "2026-09-01", endDate: "2026-09-01", owner: "David", isMilestone: true, risk: "", notes: "HITO MAYOR - Apertura al público", deps: ["t89a"] },

  // ========================================
  // EQUIPO (10 tareas)
  // ========================================
  { id: "t87", name: "Perfil facilitador con Coach", ws: "Equipo", status: "En curso", priority: "Crítica", startDate: "2026-04-10", endDate: "2026-04-18", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t88", name: "Reunión Lupi (perfiles externos)", ws: "Equipo", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-18", owner: "Christian", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t89", name: "Búsqueda facilitador", ws: "Equipo", status: "Pendiente", priority: "Crítica", startDate: "2026-04-19", endDate: "2026-04-28", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras perfil", deps: ["t87"] },
  { id: "t90", name: "Selección facilitador (mín 2 candidatos)", ws: "Equipo", status: "Pendiente", priority: "Crítica", startDate: "2026-04-29", endDate: "2026-05-05", owner: "David", isMilestone: false, risk: "Sin facilitador 5 may, fundadores facilitan", notes: "Buffer: 1 día tras búsqueda", deps: ["t89"] },
  { id: "t91", name: "Formación facilitador (5 días)", ws: "Equipo", status: "Pendiente", priority: "Crítica", startDate: "2026-05-06", endDate: "2026-05-12", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras selección", deps: ["t90", "t25"] },
  { id: "t91b", name: "Certificación facilitador", ws: "Equipo", status: "Pendiente", priority: "Crítica", startDate: "2026-05-19", endDate: "2026-05-23", owner: "David", isMilestone: true, risk: "", notes: "HITO - Buffer: 7 días tras formación", deps: ["t91"] },
  { id: "t93", name: "Selección manager E1", ws: "Equipo", status: "Pendiente", priority: "Alta", startDate: "2026-06-01", endDate: "2026-06-30", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t93b", name: "Formación manager", ws: "Equipo", status: "Pendiente", priority: "Alta", startDate: "2026-07-01", endDate: "2026-07-31", owner: "David", isMilestone: false, risk: "", notes: "Necesita manual v1", deps: ["t93", "t26"] },
  { id: "t94", name: "Selección anfitrión/a", ws: "Equipo", status: "Pendiente", priority: "Alta", startDate: "2026-06-15", endDate: "2026-07-15", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t94b", name: "Formación anfitrión/a", ws: "Equipo", status: "Pendiente", priority: "Alta", startDate: "2026-07-16", endDate: "2026-08-15", owner: "Por asignar", isMilestone: false, risk: "", notes: "Buffer: 1 día tras selección", deps: ["t94"] },

  // ========================================
  // PILOTO (10 tareas)
  // ========================================
  { id: "t95", name: "Criterios GO/NO-GO por escrito", ws: "Piloto", status: "Urgente", priority: "Crítica", startDate: "2026-04-14", endDate: "2026-04-21", owner: "David", isMilestone: false, risk: "Comunicar a board ANTES del piloto", notes: "", deps: [] },
  { id: "t96", name: "Reclutar participantes piloto", ws: "Piloto", status: "Pendiente", priority: "Alta", startDate: "2026-04-21", endDate: "2026-05-16", owner: "David", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t97", name: "Monteagudo para piloto (ambiental básico)", ws: "Piloto", status: "Pendiente", priority: "Alta", startDate: "2026-05-01", endDate: "2026-05-16", owner: "Christian", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t97b", name: "Encuesta NPS (5 preguntas)", ws: "Piloto", status: "Pendiente", priority: "Alta", startDate: "2026-04-28", endDate: "2026-05-05", owner: "David", isMilestone: false, risk: "", notes: "Para medir satisfacción", deps: [] },
  { id: "t98", name: "Piloto arranca", ws: "Piloto", status: "Pendiente", priority: "Crítica", startDate: "2026-05-19", endDate: "2026-05-19", owner: "Facilitador", isMilestone: true, risk: "", notes: "HITO - Depende de kits, facilitador y manual", deps: ["t55", "t91b", "t25"] },
  { id: "t99", name: "Sesiones cortas (8x2/sem)", ws: "Piloto", status: "Pendiente", priority: "Crítica", startDate: "2026-05-19", endDate: "2026-06-13", owner: "Facilitador", isMilestone: false, risk: "", notes: "", deps: ["t98"] },
  { id: "t100", name: "Programa largo (4x1/sem)", ws: "Piloto", status: "Pendiente", priority: "Crítica", startDate: "2026-05-19", endDate: "2026-06-13", owner: "Facilitador", isMilestone: false, risk: "", notes: "Paralela con t99", deps: ["t98"] },
  { id: "t100b", name: "Contenido social durante piloto", ws: "Piloto", status: "Pendiente", priority: "Alta", startDate: "2026-05-19", endDate: "2026-06-13", owner: "Miguel Márquez", isMilestone: false, risk: "", notes: "Documentar para marketing", deps: ["t98"] },
  { id: "t101", name: "Analizar datos piloto", ws: "Piloto", status: "Pendiente", priority: "Crítica", startDate: "2026-06-14", endDate: "2026-06-17", owner: "David", isMilestone: false, risk: "", notes: "Buffer: 1 día tras sesiones", deps: ["t99", "t100"] },
  { id: "t102", name: "Informe GO/NO-GO", ws: "Piloto", status: "Pendiente", priority: "Crítica", startDate: "2026-06-18", endDate: "2026-06-19", owner: "David", isMilestone: true, risk: "", notes: "HITO - Decisión crítica", deps: ["t101"] },

  // ========================================
  // TECNOLOGÍA (7 tareas)
  // ========================================
  { id: "t110", name: "Reunión Lupi tech", ws: "Tecnología", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-18", owner: "Christian", isMilestone: false, risk: "", notes: "", deps: [] },
  { id: "t111", name: "Decidir stack tech", ws: "Tecnología", status: "En curso", priority: "Alta", startDate: "2026-04-14", endDate: "2026-04-25", owner: "Christian", isMilestone: false, risk: "Sin decisión, implementación no arranca", notes: "", deps: [] },
  { id: "t112", name: "Reservas (proyecto+paleta+pago)", ws: "Tecnología", status: "Pendiente", priority: "Alta", startDate: "2026-04-26", endDate: "2026-05-15", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Buffer: 1 día tras decisión", deps: ["t111"] },
  { id: "t113", name: "CRM básico", ws: "Tecnología", status: "Pendiente", priority: "Alta", startDate: "2026-05-01", endDate: "2026-05-30", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Gestión de clientes", deps: ["t111"] },
  { id: "t114", name: "Web vídeos (player simple, QR)", ws: "Tecnología", status: "Pendiente", priority: "Crítica", startDate: "2026-05-16", endDate: "2026-07-05", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Buffer: 1 día tras t112", deps: ["t111"] },
  { id: "t115", name: "Emails automáticos pre/post sesión", ws: "Tecnología", status: "Pendiente", priority: "Alta", startDate: "2026-05-16", endDate: "2026-06-15", owner: "Equipo Tech", isMilestone: false, risk: "", notes: "Paralela con t114", deps: ["t112"] },
  { id: "t116", name: "Test stack en producción", ws: "Tecnología", status: "Pendiente", priority: "Crítica", startDate: "2026-08-20", endDate: "2026-08-28", owner: "Equipo Tech", isMilestone: true, risk: "", notes: "HITO - Verificación técnica final", deps: ["t114"] },
];

// Metadata del proyecto
export const PROJECT_META = {
  totalTasks: 109,
  totalMilestones: 15,
  startDate: "2026-04-10",
  endDate: "2026-10-01",
  criticalMilestones: [
    { id: "t06", date: "2026-06-20", name: "GO/NO-GO con board" },
    { id: "t92", date: "2026-09-01", name: "Soft Opening E1" },
    { id: "t80", date: "2026-10-01", name: "Grand Opening" },
  ],
  workstreams: [
    "Dirección",
    "Legal",
    "Método",
    "Profesor-Contenido",
    "Producto",
    "Branding",
    "Espacio-E1",
    "Equipo",
    "Piloto",
    "Tecnología",
  ],
  owners: [
    "David",
    "Christian",
    "Cristina",
    "Miguel Márquez",
    "Profesora",
    "Estudio Branding",
    "Facilitador",
    "Empresa Reformas",
    "Equipo Tech",
    "Por asignar",
  ],
};

// Reglas de buffer por tipo de tarea
export const BUFFER_RULES = {
  contractual: 1,     // Tareas administrativas/legales
  creative: 3,        // Tareas creativas
  production: 7,      // Producción/grabación
  construction: 14,   // Obra/construcción
  milestone: 0,       // Hitos (fecha exacta)
};

// Tareas que pueden continuar si piloto falla
export const RESILIENT_TO_PILOT_FAILURE = [
  "t53", "t81", "t82", "t83", "t84", "t85", "t86", "t87a", "t88a", // Espacio
  "t42", "t43", "t44", "t45", // Grabación (se reformula contenido)
  "t70", "t71", "t72", "t73", "t74", "t75", "t76", "t77", "t78", // Branding
];
