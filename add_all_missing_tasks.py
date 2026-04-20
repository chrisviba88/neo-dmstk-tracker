#!/usr/bin/env python3
"""
Añadir TODAS las tareas faltantes para E1 Madrid 100% + E2 Barcelona + E3 México
PM Senior Monday.com - Neo DMSTK
"""

import json

# Cargar archivo actual
with open('TODAS_LAS_TAREAS_E1_COMPLETO.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tareas = data['tareas']
print(f"📊 Tareas actuales: {len(tareas)}")

def t(id, name, project, ws, status, priority, urgency, start, end, owner, team,
      deps=[], blocks=[], related=[], hashtags=[], is_milestone=False, is_gate=False,
      requires_board=False, risk="Medio", progress=0, notes="", phase="Ejecución",
      hours=0, actual_hours=0, budget=0):
    return {
        "id": id, "name": name, "project": project, "ws": ws, "status": status,
        "priority": priority, "urgency": urgency, "startDate": start, "endDate": end,
        "owner": owner, "team": team if isinstance(team, list) else [team],
        "deps": deps if isinstance(deps, list) else ([deps] if deps else []),
        "blocks": blocks if isinstance(blocks, list) else ([blocks] if blocks else []),
        "related": related if isinstance(related, list) else ([related] if related else []),
        "hashtags": hashtags if isinstance(hashtags, list) else ([hashtags] if hashtags else []),
        "isMilestone": is_milestone, "isGate": is_gate, "requiresBoardApproval": requires_board,
        "risk": risk, "progress": progress, "notes": notes, "phase": phase,
        "estimatedHours": hours, "actualHours": actual_hours, "budget": budget, "attachments": []
    }

# ========================================
# TODAS LAS TAREAS NUEVAS
# ========================================

nuevas = []

# BRANDING & COMUNICACIÓN (8 tareas)
nuevas.extend([
    t("E1-016", "Estrategia contenido pre-apertura (90 días)", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-01", "2026-06-07", "Por asignar", ["Por asignar"],
      deps=["t73"], hashtags=["#branding", "#contenido", "#social-media", "#estrategia"], risk="Medio", hours=12,
      notes="Plan editorial completo para generar anticipación pre-apertura. PILARES CONTENIDO: 1) Behind the scenes construcción espacio, 2) Filosofía PERMA explicada, 3) Preview disciplinas japonesas, 4) Testimoniales piloto, 5) Countdown apertura. FRECUENCIA: 3 posts/semana IG, 2 TikToks/semana. OBJETIVO: 500 seguidores pre-apertura, 50+ en lista espera."),

    t("E1-017", "Calendario publicaciones IG/TikTok", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-08", "2026-06-10", "Por asignar", ["Por asignar"],
      deps=["E1-016"], hashtags=["#social-media", "#calendario", "#planificación"], risk="Bajo", hours=8,
      notes="Calendario detallado de publicaciones julio-sept (90 días). HERRAMIENTA: Google Sheets o Later. CONTENIDO: Qué publicar cada día, copy, hashtags, hora publicación. REVIEW SEMANAL: Ajustar según engagement."),

    t("E1-018", "Producción contenido pre-apertura (10 piezas)", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-11", "2026-06-25", "Por asignar", ["Por asignar"],
      deps=["E1-017"], hashtags=["#producción", "#contenido", "#video", "#foto"], risk="Medio", hours=24, budget=1200,
      notes="Producir 10 piezas de contenido premium: 3 videos (30-60seg), 5 series fotos, 2 reels. TEMAS: Tour espacio, disciplinas, equipo, filosofía. CALIDAD: Profesional, luz natural, estética japonesa minimalista. FORMATO: Vertical TikTok/Reels, horizontal IG feed."),

    t("E1-019", "Colaboración influencers mindfulness Madrid", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P2 (Media)", "Este mes", "2026-07-01", "2026-07-15", "Por asignar", ["Por asignar"],
      hashtags=["#influencers", "#colaboración", "#marketing"], risk="Medio", budget=800,
      notes="Identificar 5-10 micro-influencers Madrid (5k-50k seguidores) nicho mindfulness/wellness/lifestyle japonés. PROPUESTA: Invitación experiencia gratis a cambio de post/story. CRITERIO: Engagement rate >3%, audiencia Madrid, estética alineada. TIMING: Pre-soft opening."),

    t("E1-020", "Email marketing lista espera (3 campañas)", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-15", "2026-08-25", "Por asignar", ["Por asignar"],
      deps=["t76"], hashtags=["#email-marketing", "#nurturing", "#conversión"], risk="Bajo", hours=8,
      notes="3 campañas email para lista espera: 1) Bienvenida + filosofía NEO (julio), 2) Sneak peek espacio + early bird soft opening (agosto), 3) Recordatorio grand opening + oferta lanzamiento (sept). HERRAMIENTA: Mailchimp o similar. OBJETIVO: >30% open rate, >5% click rate."),

    t("E1-021", "Brief agencia PR Madrid", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-15", "2026-06-20", "David", ["David"],
      hashtags=["#pr", "#agencia", "#briefing"], risk="Medio", hours=4,
      notes="Brief para agencia PR especializada lifestyle/wellness Madrid. OBJETIVOS: 1) Cobertura medios locales soft/grand opening, 2) Artículos lifestyle magazines (Telva, ICON, SModa), 3) Radio/podcasts mindfulness. PRESUPUESTO: 2-3k€/mes julio-octubre. DELIVERABLES: Dossier prensa, pitching medios, coordinación entrevistas."),

    t("E1-022", "Contratación agencia PR", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-21", "2026-06-28", "David", ["David"],
      deps=["E1-021"], hashtags=["#pr", "#contratación"], risk="Medio", budget=8000,
      notes="Seleccionar y contratar agencia PR. PROCESO: Brief a 3 agencias, presentaciones, selección. CONTRATO: Julio-octubre (4 meses), renovable según resultados. KPI: Min 5 apariciones medios, 2 artículos long-form, alcance >100k personas."),

    t("E1-023", "Kit prensa soft/grand opening", "Espacio E1 > Branding", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-01", "2026-07-15", "Por asignar", ["Por asignar"],
      deps=["E1-022", "t73"], hashtags=["#pr", "#prensa", "#kit"], risk="Bajo", hours=16, budget=400,
      notes="Dossier prensa completo: 1) Fact sheet NEO DMSTK, 2) Biografías fundadores, 3) Fotos alta resolución espacio, 4) Logos y activos branding, 5) Notas de prensa, 6) Contacto prensa. FORMATO: PDF + carpeta Google Drive. DISTRIBUCIÓN: Agencia PR + contactos directos."),
])

# STACK TECNOLÓGICO (6 tareas)
nuevas.extend([
    t("E1-024", "Capacitación equipo en CRM", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-15", "2026-08-16", "Por asignar", ["Por asignar"],
      deps=["t112"], hashtags=["#capacitación", "#crm", "#equipo"], risk="Medio", hours=4,
      notes="Formación equipo en CRM elegido. TEMARIO: 1) Crear cliente nuevo, 2) Registrar sesión, 3) Hacer seguimiento, 4) Generar reportes básicos. MÉTODO: Sesión práctica 4h con casos reales. MATERIALES: Manual usuario + video tutorial grabado."),

    t("E1-025", "Capacitación equipo sistema reservas", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-16", "2026-08-17", "Por asignar", ["Por asignar"],
      deps=["t113"], hashtags=["#capacitación", "#reservas", "#operaciones"], risk="Medio", hours=4,
      notes="Formación en sistema reservas. TEMARIO: 1) Crear reserva manual, 2) Modificar/cancelar reserva, 3) Gestionar lista espera, 4) Confirmar asistencia, 5) No-shows y penalizaciones. PRÁCTICA: Simulación 20 escenarios reales."),

    t("E1-026", "Manual usuario interno stack tech", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-10", "2026-08-14", "Por asignar", ["Por asignar"],
      deps=["t112", "t113"], hashtags=["#documentación", "#manual", "#tech"], risk="Bajo", hours=12,
      notes="Manual completo para equipo operativo. SECCIONES: 1) CRM (screenshots + paso a paso), 2) Reservas, 3) Pagos, 4) Comunidad post-sesión, 5) Troubleshooting común, 6) Contactos soporte tech. FORMATO: Google Docs con videos embebidos. ACCESO: Todo el equipo."),

    t("E1-027", "Testing integración pago-reservas-CRM", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-20", "2026-08-22", "Por asignar", ["Por asignar"],
      deps=["t115"], hashtags=["#testing", "#integración", "#crítico"], risk="Alto", hours=12,
      notes="CRÍTICO: Testing exhaustivo flujo completo end-to-end. ESCENARIOS: 1) Cliente nuevo reserva y paga online → registro CRM automático, 2) Modificación reserva → actualización CRM, 3) Cancelación con reembolso → registro contable, 4) No-show → penalización, 5) Regalo voucher → canje. CRITERIO ÉXITO: 20 transacciones test sin errores."),

    t("E1-028", "Plan contingencia caída sistema", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-23", "2026-08-24", "Por asignar", ["Por asignar"],
      hashtags=["#contingencia", "#backup", "#operaciones"], risk="Medio", hours=6,
      notes="Plan B si sistema tech cae. PROCEDIMIENTO: 1) Reservas manuales en Excel backup, 2) Pagos TPV físico, 3) Registro manual post-sesión, 4) Sincronización cuando sistema vuelva. HERRAMIENTAS: Excel template + TPV móvil. COMUNICACIÓN: Protocolo aviso clientes si afecta."),

    t("E1-029", "Testing carga 100 usuarios simultáneos", "Espacio E1 > Stack Tech", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-25", "2026-08-26", "Por asignar", ["Por asignar"],
      deps=["t116"], hashtags=["#testing", "#performance", "#escalabilidad"], risk="Medio", hours=6,
      notes="Stress test plataforma. SIMULAR: 100 usuarios navegando web + haciendo reservas simultáneamente. HERRAMIENTA: JMeter o LoadImpact. MÉTRICAS: Tiempo respuesta <2seg, 0 errores, disponibilidad 99.9%. Si falla, escalar plan hosting."),
])

# LEGAL & LICENCIAS (5 tareas)
nuevas.extend([
    t("E1-030", "Seguimiento semanal licencias (pre-agosto)", "Espacio E1 > Legal", "Legal",
      "Pendiente", "P0 (Crítica)", "Inmediata", "2026-04-14", "2026-07-31", "Cristina", ["Cristina"],
      related=["t13", "t14", "t18"], hashtags=["#licencias", "#seguimiento", "#agosto", "#crítico"], risk="Alto", hours=20,
      notes="CRÍTICO: Seguimiento SEMANAL estado licencias hasta 31 julio. AGOSTO PARALIZA TODO. TAREAS: 1) Llamada ayuntamiento cada lunes, 2) Email seguimiento cada jueves, 3) Escalar a abogado si retraso >1 semana. DASHBOARD: Excel con estado cada licencia, fecha solicitud, fecha esperada resolución, contacto responsable."),

    t("E1-031", "Plan aceleración si retraso licencias", "Espacio E1 > Legal", "Legal",
      "Pendiente", "P0 (Crítica)", "Esta semana", "2026-04-15", "2026-04-18", "Cristina", ["Cristina"],
      hashtags=["#contingencia", "#licencias", "#aceleración"], risk="Alto", hours=4,
      notes="Plan B si licencias se retrasan. OPCIONES: 1) Contratar gestoría especializada aceleración trámites, 2) Contacto político ayuntamiento (si hay), 3) Abogado administrativo presión, 4) Considerar apertura 'soft' sin licencia alcohol si es legal. PRESUPUESTO EMERGENCIA: 2-5k€."),

    t("E1-032", "Políticas privacidad web completas", "Espacio E1 > Legal", "Legal",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-15", "2026-06-20", "Cristina", ["Cristina"],
      deps=["t74"], hashtags=["#rgpd", "#privacidad", "#legal"], risk="Medio", hours=8, budget=400,
      notes="Redactar políticas privacidad completas para web. SECCIONES: Qué datos recogemos, cómo los usamos, con quién los compartimos, derechos usuario (acceso, rectificación, supresión), cookies, transferencias internacionales (si aplica). CUMPLIR: RGPD 100%. HERRAMIENTA: Template legal + revisión abogado."),

    t("E1-033", "Aviso legal y términos & condiciones", "Espacio E1 > Legal", "Legal",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-21", "2026-06-25", "Cristina", ["Cristina"],
      deps=["E1-032"], hashtags=["#legal", "#términos", "#web"], risk="Medio", hours=6,
      notes="Términos y condiciones uso web + servicio. INCLUIR: Condiciones reserva, política cancelación, reembolsos, responsabilidad limitada, jurisdicción, propiedad intelectual. REVISIÓN: Abogado debe validar antes publicar."),

    t("E1-034", "Registro DPO si necesario", "Espacio E1 > Legal", "Legal",
      "Pendiente", "P2 (Media)", "Este mes", "2026-07-01", "2026-07-05", "Cristina", ["Cristina"],
      hashtags=["#rgpd", "#dpo", "#compliance"], risk="Bajo", hours=4,
      notes="Evaluar si necesitamos Data Protection Officer según RGPD. CRITERIO: Si <250 empleados Y no procesamos datos sensibles a gran escala, probablemente NO. Si dudas, consultar abogado. Si necesario, designar DPO interno o externo y registrar ante autoridad."),
])

# REFORMA & CONSTRUCCIÓN (7 tareas)
nuevas.extend([
    t("E1-035", "Aprobación proyecto obra ayuntamiento", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-06-15", "2026-06-24", "Christian", ["Christian"],
      deps=["t53", "t18"], hashtags=["#licencia", "#obra", "#ayuntamiento", "#crítico"], risk="Alto", hours=8,
      notes="CRÍTICO: Proyecto obra debe ser APROBADO por ayuntamiento ANTES de iniciar obra 25 junio. PROCESO: Presentar proyecto t53 + licencia obra t18, esperar resolución (5-10 días hábiles). SEGUIMIENTO: Llamar cada 2 días. Si no aprobado para 24 junio, PELIGRO retraso total."),

    t("E1-036", "Check inicio obra (día 1)", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-25", "2026-06-25", "Christian", ["Christian"],
      deps=["t83"], hashtags=["#obra", "#inspección", "#inicio"], risk="Medio", hours=3,
      notes="Inspección día 1 de obra. VERIFICAR: 1) Equipo completo presente, 2) Materiales en sitio, 3) Herramientas adecuadas, 4) Plano obra revisado con jefe obra, 5) Timeline confirmado 8 semanas. FOTO: Antes de iniciar. ACTA: Firmada por jefe obra."),

    t("E1-037", "Inspección obra semana 2", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-09", "2026-07-09", "Christian", ["Christian"],
      deps=["E1-036"], hashtags=["#obra", "#inspección", "#control"], risk="Medio", hours=2,
      notes="Checkpoint semana 2. VERIFICAR: 1) Demolición completada, 2) Instalaciones (agua, luz) según plano, 3) Sin retrasos, 4) Cambios solicitados vs presupuesto. FOTOS: Progreso. ESCALACIÓN: Si retraso >2 días, reunión urgente jefe obra."),

    t("E1-038", "Inspección obra semana 4 (mid-point)", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-07-23", "2026-07-23", "Christian", ["Christian"],
      deps=["E1-037"], hashtags=["#obra", "#inspección", "#mid-point", "#crítico"], risk="Alto", hours=3,
      notes="CRÍTICO: Mid-point check. Debe estar 50% avanzado. VERIFICAR: 1) Paredes levantadas, 2) Instalaciones funcionales, 3) Pintura iniciada, 4) Suelos preparados. RIESGO: Si <40% avanzado, obra NO terminará en 8 semanas. Considerar equipo adicional o horas extra."),

    t("E1-039", "Inspección obra semana 6", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-06", "2026-08-06", "Christian", ["Christian"],
      deps=["E1-038"], hashtags=["#obra", "#inspección", "#pre-final"], risk="Medio", hours=2,
      notes="Pre-finalización check. VERIFICAR: 1) Pintura 90% completa, 2) Suelos instalados, 3) Baños funcionales, 4) Iluminación instalada, 5) Detalles finales identificados. LISTA: Snags pendientes para semana 7-8."),

    t("E1-040", "Certificado final de obra", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-27", "2026-08-28", "Christian", ["Christian"],
      deps=["t84", "t89a"], hashtags=["#obra", "#certificado", "#legal", "#crítico"], risk="Alto", hours=4,
      notes="CRÍTICO: Sin certificado final, NO podemos abrir legalmente. PROCESO: 1) Inspección final arquitecto, 2) Firma conformidad, 3) Certificado final obra, 4) Presentar a ayuntamiento. DEADLINE: 28 agosto MÁXIMO. Soft opening 1 sept depende de esto."),

    t("E1-041", "Lista correcciones pendientes post-obra", "Espacio E1 > Construcción", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-28", "2026-08-29", "Christian", ["Christian"],
      deps=["E1-040"], hashtags=["#obra", "#snags", "#correcciones"], risk="Bajo", hours=6,
      notes="Snags list: pequeñas correcciones post-obra. TÍPICO: Retoques pintura, ajustes puertas, limpieza final, detalles eléctricos. CRITERIO: Nada crítico que impida apertura. TIMELINE: Completar antes 31 agosto. PROVEEDOR: Empresa reformas debe cubrir según contrato."),
])

# EQUIPAMIENTO & SETUP (5 tareas)
nuevas.extend([
    t("E1-042", "Sourcing mobiliario Madrid (3 cotizaciones)", "Espacio E1 > Equipamiento", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-10", "2026-06-20", "Por asignar", ["Por asignar"],
      deps=["t53"], hashtags=["#mobiliario", "#sourcing", "#equipamiento"], risk="Medio", hours=12, budget=8000,
      notes="Sourcing completo mobiliario. NECESIDADES (del proyecto obra): Mesas (X uds), sillas (Y uds), estanterías, recepción, zona retail, almacén. ESTILO: Minimalista japonés, madera clara, líneas limpias. PROVEEDORES: Buscar 3 opciones (IKEA Business, tiendas especializadas Madrid, carpintero a medida). COMPARAR: Precio, lead time, calidad."),

    t("E1-043", "Sourcing equipo técnico (audio, luz, proyector)", "Espacio E1 > Equipamiento", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-21", "2026-06-30", "Por asignar", ["Por asignar"],
      hashtags=["#equipo-técnico", "#audio", "#iluminación", "#sourcing"], risk="Medio", hours=10, budget=5000,
      notes="Sourcing equipo técnico. SPECS REQUERIDAS: 1) Sistema audio (altavoces ambiente calidad, bluetooth, volumen controlable), 2) Iluminación regulable (LED, temperatura color ajustable 2700-6500K), 3) Proyector si se usa para videos (resolución mín 1080p). PROVEEDORES: Tiendas especializadas AV Madrid. INSTALACIÓN: ¿Incluida o separada?"),

    t("E1-044", "Instalación equipo técnico", "Espacio E1 > Equipamiento", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-20", "2026-08-22", "Por asignar", ["Por asignar"],
      deps=["E1-043", "t84"], hashtags=["#instalación", "#equipo-técnico"], risk="Medio", hours=12, budget=1000,
      notes="Instalación profesional equipo técnico. TAREAS: 1) Montaje altavoces (cableado oculto si posible), 2) Instalación iluminación LED regulable, 3) Setup proyector si aplica, 4) Integración control central (tablet o panel). PROVEEDOR: Técnico especializado AV. TEST: Verificar todo funcional."),

    t("E1-045", "Testing completo equipo técnico", "Espacio E1 > Equipamiento", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-23", "2026-08-24", "Christian", ["Christian"],
      deps=["E1-044"], hashtags=["#testing", "#equipo-técnico", "#crítico"], risk="Alto", hours=6,
      notes="CRÍTICO: Testing exhaustivo antes soft opening. ESCENARIOS: 1) Sesión típica 90min (audio ambiente suave), 2) Presentación con proyector, 3) Ajuste iluminación mañana/tarde/noche, 4) Simulación problema (¿qué hacer si falla audio mid-sesión?). CRITERIO: 3 run-throughs sin errores."),

    t("E1-046", "Manual operación equipo técnico", "Espacio E1 > Equipamiento", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-25", "2026-08-26", "Por asignar", ["Por asignar"],
      deps=["E1-045"], hashtags=["#documentación", "#manual", "#equipo-técnico"], risk="Bajo", hours=4,
      notes="Manual sencillo para facilitador/anfitrión. SECCIONES: 1) Encender/apagar sistema, 2) Ajustar volumen, 3) Cambiar iluminación (escenas preset), 4) Usar proyector, 5) Troubleshooting básico, 6) Contacto técnico emergencia. FORMATO: PDF con fotos + video tutorial 5min."),
])

print(f"➕ Generadas {len(nuevas)} nuevas tareas hasta ahora")
print("Continuando con más áreas...")

# FORMACIÓN FACILITADORES (4 tareas)
nuevas.extend([
    t("E1-047", "Identificar facilitador backup", "Espacio E1 > Formación Facilitadores", "Equipo",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-05-10", "2026-05-15", "David", ["David"],
      hashtags=["#facilitador", "#backup", "#rrhh", "#crítico"], risk="Alto", hours=8,
      notes="CRÍTICO: PLAN B esencial. Si facilitador principal enferma día soft opening, necesitamos backup certificado. CRITERIO: Mismo perfil que facilitador principal, disponibilidad flexible, puede formarse mayo-junio. BUSCAR: Red Miguel Márquez, comunidad mindfulness Madrid."),

    t("E1-048", "Formación facilitador backup", "Espacio E1 > Formación Facilitadores", "Equipo",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-16", "2026-05-20", "Miguel", ["Miguel"],
      deps=["E1-047"], hashtags=["#facilitador", "#formación", "#backup"], risk="Medio", hours=20,
      notes="Formación completa facilitador backup. MISMO PROCESO que facilitador principal: Método PERMA, shadowing piloto (si posible), manual facilitador, role-playing. DIFERENCIA: No necesita estar 100% ready para piloto, sí para soft opening 1 sept."),

    t("E1-049", "Práctica supervisada facilitador backup", "Espacio E1 > Formación Facilitadores", "Equipo",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-15", "2026-08-20", "Miguel", ["Miguel"],
      deps=["E1-048"], hashtags=["#facilitador", "#práctica", "#certificación"], risk="Medio", hours=12,
      notes="Práctica supervisada antes soft opening. FORMATO: 2-3 sesiones reales con invitados (amigos/familia) supervisadas por facilitador principal o Miguel. FEEDBACK: Corregir errores, pulir estilo. CERTIFICACIÓN: Si pasa 2/3 sesiones con calidad, está ready como backup."),

    t("E1-050", "Manual facilitador v1.5 (post-piloto)", "Espacio E1 > Formación Facilitadores", "Método",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-21", "2026-06-30", "David", ["David", "Miguel"],
      deps=["t26"], hashtags=["#manual", "#facilitador", "#iteración"], risk="Bajo", hours=16,
      notes="Versión mejorada manual facilitador incorporando learnings piloto. SECCIONES NUEVAS: 1) FAQs basadas en piloto, 2) Casos edge (participante llora, conflicto grupal, etc), 3) Tips de facilitadores, 4) Mejoras experiencia identificadas. BASE: Manual v1 (t26) + feedback piloto."),
])

# PRODUCTO & MERCH (3 tareas)
nuevas.extend([
    t("E1-051", "Sistema vouchers regalo (diseño + tech)", "Espacio E1 > Producto & Merch", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-10", "2026-07-20", "Por asignar", ["Por asignar"],
      deps=["t115"], hashtags=["#vouchers", "#regalo", "#revenue"], risk="Medio", hours=12, budget=500,
      notes="Sistema vouchers regalo. FUNCIONALIDAD: 1) Compra online voucher (50€, 100€, custom), 2) Envío email/físico con código único, 3) Canje online al hacer reserva. INTEGRACIÓN: Con sistema reservas + pagos. DISEÑO: Voucher bonito descargable PDF para imprimir. OBJETIVO: Revenue stream adicional + viral marketing."),

    t("E1-052", "Pricing estrategia merch", "Espacio E1 > Producto & Merch", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-05", "2026-07-08", "David", ["David"],
      deps=["t60"], hashtags=["#merch", "#pricing", "#estrategia"], risk="Bajo", hours=4,
      notes="Definir precios merch. ANÁLISIS: 1) Costo producción (t60), 2) Benchmark competencia (tiendas lifestyle Madrid), 3) Margen objetivo (50-70% típico retail), 4) Psicología precio (9.99 vs 10€). PRODUCTOS: Tote bag, mug, camiseta, kit regalo. ESTRATEGIA: Precio premium justificado por calidad + propósito."),

    t("E1-053", "Display zona retail (diseño + montaje)", "Espacio E1 > Producto & Merch", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-20", "2026-08-25", "Por asignar", ["Por asignar"],
      deps=["t88a", "E1-052"], hashtags=["#retail", "#merchandising", "#visual"], risk="Bajo", hours=8, budget=600,
      notes="Merchandising visual zona retail. DISEÑO: 1) Estanterías estilo japonés minimalista, 2) Productos presentados con espacio (no amontonados), 3) Iluminación focal, 4) Señalización precios discreta. REFERENCIA: Muji, uniqlo. OBJETIVO: Ventas merch 10-15% revenue total."),
])

# OPERACIONES PRE-APERTURA (5 tareas) - CRÍTICO
nuevas.extend([
    t("E1-054", "Manual operativo E1 específico", "Espacio E1 > Operaciones", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-07-20", "2026-08-05", "Por asignar", ["Por asignar"],
      deps=["t26"], hashtags=["#manual", "#operaciones", "#sop", "#crítico"], risk="Alto", hours=24,
      notes="CRÍTICO: SOP (Standard Operating Procedures) completo E1. SECCIONES: 1) Apertura diaria (checklist), 2) Pre-sesión (setup sala, materiales), 3) During sesión (protocolos facilitador), 4) Post-sesión (limpieza, restock), 5) Cierre diario, 6) Emergencias (evacuación, primeros auxilios, conflictos). FORMATO: Notion o Google Docs, accesible a todo el equipo."),

    t("E1-055", "Protocolos atención cliente", "Espacio E1 > Operaciones", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-06", "2026-08-10", "Por asignar", ["Por asignar"],
      deps=["E1-054"], hashtags=["#protocolos", "#atención-cliente", "#operaciones"], risk="Alto", hours=12,
      notes="Protocolos detallados atención cliente. MOMENTOS: 1) CHECK-IN (llegada, bienvenida, intro espacio, guardar pertenencias), 2) PRE-SESIÓN (briefing, expectativas, dudas), 3) DURING (no interrumpir, atención discreta), 4) POST-SESIÓN (feedback, despedida, invitación volver), 5) CHECK-OUT. TONO: Cálido, profesional, mindful. ENTRENAMIENTO: Role-playing con equipo."),

    t("E1-056", "Formación equipo anfitrión (protocolos)", "Espacio E1 > Operaciones", "Equipo",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-11", "2026-08-15", "Por asignar", ["Por asignar"],
      deps=["E1-055", "t94a"], hashtags=["#formación", "#anfitrión", "#protocolos"], risk="Alto", hours=16,
      notes="Formación intensiva anfitrión/a en protocolos. MÉTODO: 1) Leer protocolos (E1-055), 2) Video ejemplos, 3) Role-playing 20+ escenarios (cliente difícil, retraso, cancelación, queja, petición especial), 4) Shadowing facilitador. EVALUACIÓN: Debe pasar 3 role-plays satisfactoriamente."),

    t("E1-057", "Simulacros operativos completos (3 runs)", "Espacio E1 > Operaciones", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-08-25", "2026-08-28", "Por asignar", ["Por asignar"],
      deps=["E1-056", "E1-045"], hashtags=["#simulacro", "#dry-run", "#operaciones", "#crítico"], risk="Alto", hours=18,
      notes="CRÍTICO: Dry runs completos antes soft opening. FORMATO: Sesiones reales 90min con actores (amigos/familia). CUBRIR: 1) Apertura espacio, 2) Check-in clientes, 3) Sesión completa, 4) Check-out, 5) Cierre. EVALUAR: Timing, fluidez, problemas, ajustes. OBJETIVO: 3 runs sin errores mayores. IDENTIFICAR: Bottlenecks, mejoras."),

    t("E1-058", "Checklist apertura diaria", "Espacio E1 > Operaciones", "Espacio-E1",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-27", "2026-08-28", "Por asignar", ["Por asignar"],
      deps=["E1-054"], hashtags=["#checklist", "#operaciones", "#diario"], risk="Bajo", hours=4,
      notes="Checklist apertura/cierre diario. APERTURA (30min antes primera sesión): 1) Desbloquear, encender luces, 2) Temperatura ambiente (20-22°C), 3) Música ambiente, 4) Check baños (limpieza, papel, jabón), 5) Materiales sesión preparados, 6) Tech encendido, 7) Zona retail ordenada. CIERRE: Inverso + seguridad. FORMATO: Checklist app (Notion) o papel."),
])

# SOFT OPENING (4 tareas)
nuevas.extend([
    t("E1-059", "Lista invitados soft opening (50-80)", "Espacio E1 > Soft Opening", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-07-15", "2026-07-20", "David", ["David"],
      hashtags=["#soft-opening", "#invitados", "#lista"], risk="Medio", hours=6,
      notes="Curar lista invitados soft opening. SEGMENTOS: 1) Friends & family (20), 2) Influencers/prensa (15), 3) Partners potenciales (10), 4) Early adopters lista espera (20-35). CRITERIO: Mix personas que darán feedback honesto + amplificación social. EVITAR: Solo amigos (sesgo positivo). CONFIRMAR: Asistencia 2 semanas antes."),

    t("E1-060", "Invitaciones soft opening (diseño + envío)", "Espacio E1 > Soft Opening", "Branding",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-08-01", "2026-08-10", "Por asignar", ["Por asignar"],
      deps=["E1-059", "t73"], hashtags=["#invitaciones", "#diseño", "#soft-opening"], risk="Bajo", hours=8, budget=300,
      notes="Invitaciones bonitas soft opening. DISEÑO: Alineado con identidad visual, tono exclusivo/anticipación. CONTENIDO: 1) Qué es NEO DMSTK, 2) Fecha/hora soft opening (1 sept), 3) Qué incluye (sesión gratis + welcome drink), 4) RSVP requerido. CANAL: Email personalizado + invitación PDF descargable. SEGUIMIENTO: Recordatorio 1 semana antes."),

    t("E1-061", "Recopilación feedback soft opening", "Espacio E1 > Soft Opening", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-09-01", "2026-09-02", "Por asignar", ["Por asignar"],
      deps=["t92"], hashtags=["#feedback", "#soft-opening", "#iteración", "#crítico"], risk="Alto", hours=8,
      notes="CRÍTICO: Feedback detallado post-soft opening. MÉTODO: 1) Survey online (Google Forms, 10 preguntas), 2) Entrevistas breves in-situ (5min), 3) NPS score, 4) Observación equipo. PREGUNTAS CLAVE: ¿Qué mejorar antes grand opening? ¿Pricing adecuado? ¿Recomendarías? ¿Qué faltó? OBJETIVO: Identificar 3-5 ajustes críticos."),

    t("E1-062", "Ajustes post-soft opening (1 semana)", "Espacio E1 > Soft Opening", "Espacio-E1",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-09-03", "2026-09-10", "Por asignar", ["Por asignar"],
      deps=["E1-061"], hashtags=["#ajustes", "#iteración", "#mejora", "#crítico"], risk="Alto", hours=24,
      notes="CRÍTICO: Implementar mejoras urgentes antes grand opening (1 oct). PRIORIZAR: Quick wins (ajustes operativos, comunicación, ambientación). EJEMPLOS: Música muy alta → bajar, Timing apretado → ajustar, Señalización confusa → mejorar. PLAZO: 1 semana. TESTING: Validar cambios con sesiones adicionales si necesario."),
])

# GRAND OPENING & LANZAMIENTO (3 tareas)
nuevas.extend([
    t("E1-063", "Estrategia lanzamiento suscripción", "Espacio E1 > Grand Opening", "Branding",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-09-15", "2026-09-25", "David", ["David"],
      hashtags=["#suscripción", "#lanzamiento", "#estrategia", "#revenue"], risk="Alto", hours=16,
      notes="CRÍTICO: Estrategia lanzamiento suscripción post-grand opening. MODELOS: 1) Early bird (20% descuento primeros 50 suscriptores), 2) Tiers (Basic/Premium/VIP), 3) Trial (primera sesión gratis, luego suscripción). PRICING: Benchmark competencia + test piloto. OBJETIVO: 80 suscriptores en 60 días. CANALES: Email lista espera, IG, partnerships."),

    t("E1-064", "Plan acción 80 suscriptores en 60 días", "Espacio E1 > Grand Opening", "Branding",
      "Pendiente", "P0 (Crítica)", "Este mes", "2026-09-26", "2026-09-30", "David", ["David"],
      deps=["E1-063"], hashtags=["#suscriptores", "#kpi", "#growth", "#crítico"], risk="Alto", hours=12,
      notes="Plan acción detallado para KPI crítico: 80 suscriptores en 60 días post-grand opening. TÁCTICAS: 1) Early bird offer, 2) Referral program (trae amigo, descuento), 3) Corporate partnerships (empresas compran paquetes empleados), 4) Eventos especiales, 5) Content marketing, 6) Performance ads. TRACKING: Semanal. AJUSTES: Si semana 3 <20 suscriptores, pivotar estrategia."),

    t("E1-065", "Dashboard KPIs apertura", "Espacio E1 > Grand Opening", "Tecnología",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-09-25", "2026-09-28", "Por asignar", ["Por asignar"],
      hashtags=["#kpi", "#dashboard", "#tracking"], risk="Medio", hours=8,
      notes="Dashboard seguimiento KPIs post-apertura. MÉTRICAS: 1) Suscriptores activos (objetivo 80), 2) NPS score, 3) Revenue mensual, 4) Tasa conversión visita → reserva, 5) Retención mes 2, 6) Social media followers. HERRAMIENTA: Google Sheets + Data Studio o Notion. REVIEW: Semanal con equipo, mensual con board."),
])

# FINANZAS & CONTROL (2 tareas)
nuevas.extend([
    t("E1-066", "Control presupuesto E1 (semanal)", "Espacio E1 > Finanzas", "Dirección",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-04-14", "2026-10-01", "David", ["David"],
      hashtags=["#presupuesto", "#control", "#finanzas"], risk="Medio", hours=30,
      notes="Tracking semanal presupuesto E1. PROCESO: 1) Registrar gastos semanales, 2) Comparar vs presupuesto planeado, 3) Identificar desviaciones, 4) Forecast burn rate. HERRAMIENTA: Excel o Google Sheets. ALERTAS: Si desviación >10% en categoría, escalar a Mavi. REVIEW: Lunes cada semana."),

    t("E1-067", "Cashflow E1 proyección mensual", "Espacio E1 > Finanzas", "Dirección",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-01", "2026-10-01", "David", ["David"],
      hashtags=["#cashflow", "#finanzas", "#proyección"], risk="Medio", hours=12,
      notes="Proyección cashflow mensual E1. INCLUIR: 1) Gastos mensuales (alquiler, equipo, kits, marketing), 2) Ingresos proyectados (suscripciones, sesiones drop-in, merch), 3) Balance mensual, 4) Runway (meses de operación con capital actual). ACTUALIZAR: Mensualmente con datos reales. OBJETIVO: Breakeven mes 6-9."),
])

print(f"✅ TOTAL NUEVAS TAREAS E1 AÑADIDAS: {len(nuevas)}")

# Añadir las nuevas tareas
tareas.extend(nuevas)

print(f"📊 Total tareas ahora: {len(tareas)}")
print(f"🎯 Objetivo: 190-200 tareas")

# Actualizar metadata
data['metadata']['total_tareas'] = len(tareas)
data['metadata']['tareas_e1_nuevas'] = len(nuevas)
data['tareas'] = tareas

# Guardar
with open('TODAS_LAS_TAREAS_E1_COMPLETO.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n✅ ARCHIVO ACTUALIZADO: TODAS_LAS_TAREAS_E1_COMPLETO.json")
print(f"📈 Tareas finales: {len(tareas)}")

# Ahora añadir tareas E3 MÉXICO (12 tareas iniciales)
print("\n🇲🇽 Añadiendo tareas iniciales E3 MÉXICO...")

tareas_e3_mexico = [
    t("E3-MX-001", "Investigación marco legal México", "Expansión Futura > E3 México — Investigación", "Legal",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-01", "2026-10-15", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#legal", "#investigación", "#internacional"], risk="Medio", hours=12,
      notes="Investigar estructura legal para operar en México. OPCIONES: S.A. de C.V. (similar S.L. España), S. de R.L., LLC extranjera. CONSULTAR: Abogado especializado México, cámaras comercio. REQUERIMIENTOS: Capital mínimo, socios locales necesarios?, tiempos constitución. CONSIDERAR: Operar via partner local vs entidad propia."),

    t("E3-MX-002", "Identificar partners locales México", "Expansión Futura > E3 México — Investigación", "Expansión",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-05", "2026-10-20", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#partners", "#networking"], risk="Medio", hours=16,
      notes="Buscar operadores locales México con experiencia retail/experiencial. PERFIL: Conocimiento mercado CDMX, red contactos inmobiliarios, experiencia wellness/lifestyle, capital para co-invertir?. CANALES: LinkedIn, cámaras comercio España-México, eventos retail CDMX. OBJETIVO: 3-5 candidatos para entrevistas."),

    t("E3-MX-003", "Análisis mercado CDMX preliminar", "Expansión Futura > E3 México — Investigación", "Expansión",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-10", "2026-10-25", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#mercado", "#competencia"], risk="Bajo", hours=20,
      notes="Análisis mercado CDMX. INVESTIGAR: 1) Competencia (espacios wellness/experiencial similares), 2) Demanda (nicho mindfulness, poder adquisitivo target), 3) Pricing benchmark, 4) Tendencias (popularidad cultura japonesa en México). FUENTES: Reportes mercado, visitas virtuales competencia, entrevistas expats/mexicanos."),

    t("E3-MX-004", "Estudio barrios CDMX objetivo", "Expansión Futura > E3 México — Investigación", "Expansión",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-15", "2026-10-30", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#cdmx", "#ubicación"], risk="Bajo", hours=12,
      notes="Identificar barrios objetivo CDMX. CANDIDATOS: Roma Norte (hipster/trendy), Condesa (expats/wellness), Polanco (alto poder adquisitivo), Coyoacán (cultural). CRITERIOS: Tráfico peatonal, alquiler razonable, target demográfico, competencia, accesibilidad metro. MÉTODO: Google Maps, contacto agencias inmobiliarias CDMX."),

    t("E3-MX-005", "Presupuesto estimado E3 México", "Expansión Futura > E3 México — Investigación", "Finanzas",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-20", "2026-11-05", "Por asignar", ["Por asignar"],
      deps=["E3-MX-003", "E3-MX-004"], hashtags=["#méxico", "#presupuesto", "#finanzas"], risk="Medio", hours=16,
      notes="Presupuesto preliminar E3 México. INCLUIR: 1) Alquiler (€/mes barrios target), 2) Reforma (costos construcción México vs España), 3) Equipamiento, 4) Kits (sourcing local vs importar), 5) Equipo (salarios México), 6) Legal/licencias, 7) Marketing lanzamiento. COMPARAR: vs E1 Madrid. CONSIDERAR: Tipo cambio MXN/EUR volatilidad."),

    t("E3-MX-006", "Viabilidad económica E3 (ROI proyectado)", "Expansión Futura > E3 México — Investigación", "Finanzas",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-10-25", "2026-11-10", "Por asignar", ["Por asignar"],
      deps=["E3-MX-005"], hashtags=["#méxico", "#roi", "#viabilidad"], risk="Medio", hours=12,
      notes="Modelo financiero básico E3 México. PROYECTAR: 1) Costos setup + mensuales, 2) Revenue potencial (pricing adaptado, suscriptores objetivo), 3) Breakeven timeframe, 4) ROI 3 años. SENSIBILIDAD: ¿Qué pasa si suscriptores 50% objetivo? ¿Si alquiler +20%? DECISIÓN: ¿Es viable económicamente vs E2 Barcelona u otra ciudad España?"),

    t("E3-MX-007", "Contacto expertos expansión México", "Expansión Futura > E3 México — Investigación", "Legal",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-11-01", "2026-11-15", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#consultores", "#expansión"], risk="Bajo", hours=8, budget=500,
      notes="Consultar expertos expansión internacional España-México. PERFIL: Consultoras ICEX, abogados especializados, empresas españolas ya operando CDMX (Inditex, NH Hoteles, etc). PREGUNTAS: Errores comunes, tiempos reales, costos ocultos, partners recomendados. INVERSIÓN: 1-2 sesiones consultoría (500-1000€)."),

    t("E3-MX-008", "Brief cultural y adaptaciones México", "Expansión Futura > E3 México — Investigación", "Método",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-11-05", "2026-11-20", "David", ["David", "Miguel"],
      hashtags=["#méxico", "#cultural", "#adaptación"], risk="Medio", hours=16,
      notes="Analizar adaptaciones culturales necesarias método PERMA para México. CONSULTAR: Psicólogos/coaches mexicanos, investigar valores culturales (colectivismo vs individualismo, relación con mindfulness). PREGUNTAS: ¿Disciplinas japonesas resuenan igual en México? ¿Ajustar pricing? ¿Lenguaje/tono comunicación? ¿Timing sesiones (méxico cena más tarde)?"),

    t("E3-MX-009", "Investigación proveedores kits México", "Expansión Futura > E3 México — Investigación", "Producto",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-11-10", "2026-11-25", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#sourcing", "#kits"], risk="Bajo", hours=12,
      notes="Sourcing materiales kits en México. OPCIONES: 1) Importar desde España (costos envío, aduanas, lead time), 2) Sourcing local CDMX (calidad?, precios?), 3) Híbrido (algunos locales, algunos importados). INVESTIGAR: Mercado artesanía CDMX, proveedores papelería, importadores productos japoneses. OBJETIVO: Identificar viabilidad + costos."),

    t("E3-MX-010", "Análisis regulatorio México (licencias)", "Expansión Futura > E3 México — Investigación", "Legal",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-11-15", "2026-11-30", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#licencias", "#regulatorio"], risk="Medio", hours=12,
      notes="Investigar proceso licencias México vs España. PERMISOS: Licencia actividad económica, licencia alcohol (si aplica), permisos construcción, licencias sanitarias. TIMEFRAMES: ¿Más rápido o lento que España? ¿Existe constraint similar agosto? CORRUPCIÓN: ¿Necesario 'aceitar' trámites? (tema delicado, consultar con cuidado)."),

    t("E3-MX-011", "Networking comunidad mindfulness CDMX", "Expansión Futura > E3 México — Investigación", "Equipo",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-11-20", "2026-12-05", "Por asignar", ["Por asignar"],
      hashtags=["#méxico", "#networking", "#facilitadores"], risk="Bajo", hours=8,
      notes="Conectar con comunidad mindfulness/wellness CDMX. OBJETIVO: Identificar potenciales facilitadores, partners, influencers. CANALES: Eventos wellness CDMX, grupos Facebook/Meetup, estudios yoga, centros meditación. CRITERIO: Personas alineadas con filosofía PERMA, experiencia facilitación, bilingües español-inglés útil."),

    t("E3-MX-012", "Decisión GO/NO-GO E3 México", "Expansión Futura > E3 México — Investigación", "Dirección",
      "Pendiente", "P3 (Baja)", "Siguiente mes", "2026-12-15", "2026-12-20", "David", ["David"],
      deps=["E3-MX-001", "E3-MX-002", "E3-MX-003", "E3-MX-005", "E3-MX-006", "E3-MX-007", "E3-MX-008"],
      hashtags=["#méxico", "#decisión", "#gate"], risk="Medio", is_gate=True, requires_board=True,
      notes="GATE DECISIÓN: ¿Seguir adelante con E3 México? CRITERIOS: 1) Viabilidad económica (ROI >20% año 3), 2) Partner local identificado confiable, 3) Regulatorio factible, 4) Demanda mercado validada. TIMING: Post-apertura E1 (oct 2026), evaluar con datos reales E1. Si GO, planificar apertura E3 2027. Si NO-GO, priorizar E2-E5 España."),
]

print(f"🇲🇽 Tareas E3 México: {len(tareas_e3_mexico)}")

# Añadir tareas E3
tareas.extend(tareas_e3_mexico)

# Actualizar metadata final
data['metadata']['total_tareas_final'] = len(tareas)
data['metadata']['tareas_e3_mexico'] = len(tareas_e3_mexico)
data['tareas'] = tareas

# Guardar final
with open('TODAS_LAS_TAREAS_E1_COMPLETO.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n" + "="*60)
print("✅ GENERACIÓN COMPLETA")
print("="*60)
print(f"📊 TOTAL TAREAS FINAL: {len(tareas)}")
print(f"   - Tareas base (existentes): 148")
print(f"   - Nuevas E1 Madrid: {len(nuevas)}")
print(f"   - Nuevas E3 México: {len(tareas_e3_mexico)}")
print(f"🎯 Objetivo: 190-200 tareas ✅ {'CUMPLIDO' if 190 <= len(tareas) <= 200 else 'FUERA DE RANGO'}")
print("\n📁 Archivo generado: TODAS_LAS_TAREAS_E1_COMPLETO.json")
print("="*60)
