#!/usr/bin/env python3
"""
GENERADOR MAESTRO DE TAREAS - NEO DMSTK
PM Senior Monday.com - 15+ años experiencia
Genera TODAS las tareas faltantes para E1 Madrid 100%
"""

import json
from datetime import datetime, timedelta

# Cargar archivo base
with open('TODAS_LAS_TAREAS_E1_COMPLETO.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

tareas_actuales = data['tareas']
print(f"Tareas actuales: {len(tareas_actuales)}")

# Función auxiliar para crear tareas
def t(id, name, project, ws, status, priority, urgency, start, end, owner, team,
      deps=[], blocks=[], related=[], hashtags=[], is_milestone=False, is_gate=False,
      requires_board=False, risk="Medio", progress=0, notes="", phase="Ejecución",
      hours=0, actual_hours=0, budget=0):
    return {
        "id": id,
        "name": name,
        "project": project,
        "ws": ws,
        "status": status,
        "priority": priority,
        "urgency": urgency,
        "startDate": start,
        "endDate": end,
        "owner": owner,
        "team": team if isinstance(team, list) else [team],
        "deps": deps if isinstance(deps, list) else [deps],
        "blocks": blocks if isinstance(blocks, list) else [blocks],
        "related": related if isinstance(related, list) else [related],
        "hashtags": hashtags if isinstance(hashtags, list) else [hashtags],
        "isMilestone": is_milestone,
        "isGate": is_gate,
        "requiresBoardApproval": requires_board,
        "risk": risk,
        "progress": progress,
        "notes": notes,
        "phase": phase,
        "estimatedHours": hours,
        "actualHours": actual_hours,
        "budget": budget,
        "attachments": []
    }

# ==============================================
# NUEVAS TAREAS PARA E1 MADRID - COMPLETO
# ==============================================

nuevas = []

# ====== DARUMA 3D ======
nuevas.extend([
    t("E1-001", "¿Dani puede diseñar Daruma? - Confirmar", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P0 (Crítica)", "Inmediata", "2026-04-14", "2026-04-16", "David", ["David"],
      hashtags=["#daruma", "#diseño", "#urgente", "#decisión"], risk="Alto",
      notes="URGENTE: Confirmar si Dani puede diseñar el Daruma o necesitamos buscar diseñador 3D externo. Esto bloquea todo el flujo de producción de Daruma. CRITERIO: Si Dani no confirma antes del 16 abril, buscar diseñador externo inmediatamente."),

    t("E1-002", "Briefing completo diseño Daruma 3D", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P0 (Crítica)", "Inmediata", "2026-04-17", "2026-04-18", "David", ["David"],
      deps=["E1-001"], hashtags=["#daruma", "#diseño", "#briefing", "#producto"], risk="Medio", hours=4,
      notes="Brief detallado para diseño Daruma: dimensiones exactas (15-20cm alto), materiales preferidos (cerámica, resina, madera), estética (minimalista, japonés, moderno), peso máximo, si puede tener partes móviles, colores corporativos, textura. INCLUIR: referencias visuales, presupuesto máximo por unidad, cantidad mínima pedido."),

    t("E1-003", "Buscar proveedor fabricación 3D Madrid", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P0 (Crítica)", "Esta semana", "2026-04-18", "2026-04-22", "Por asignar", ["Por asignar"],
      deps=["E1-002"], hashtags=["#daruma", "#sourcing", "#madrid", "#proveedor"], risk="Alto", hours=8,
      notes="Buscar 3-5 proveedores en Madrid que puedan fabricar Daruma (impresión 3D, cerámica, resina). CRITERIOS: lead time <6 semanas, calidad portfolio, precio competitivo, MOQ razonable, capacidad de hacer 50-80 unidades iniciales + 200-300 unidades escala. CONTACTAR: FabLab Madrid, empresas cerámica Vallecas, estudios diseño 3D Malasaña."),

    t("E1-004", "Cotizaciones y lead times proveedores", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P1 (Alta)", "Esta semana", "2026-04-23", "2026-04-25", "Por asignar", ["Por asignar"],
      deps=["E1-003"], hashtags=["#daruma", "#presupuesto", "#sourcing"], risk="Medio", hours=4,
      notes="Solicitar cotizaciones a los 3-5 proveedores preseleccionados. INFORMACIÓN REQUERIDA: precio unitario (50 uds vs 300 uds), lead time producción, costo tooling/moldes si aplica, opciones de material, muestras disponibles, condiciones pago. Comparar en spreadsheet."),

    t("E1-005", "Selección proveedor Daruma final", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P0 (Crítica)", "Esta semana", "2026-04-26", "2026-04-28", "David", ["David"],
      deps=["E1-004"], hashtags=["#daruma", "#decisión", "#proveedor"], risk="Alto", is_milestone=True,
      notes="DECISIÓN CRÍTICA: Seleccionar proveedor final basándose en: 1) Lead time (debe entregar antes 15 junio para piloto), 2) Calidad, 3) Precio, 4) Capacidad de escalar a 300+ uds. CRITERIO GO: Lead time <6 semanas desde pedido."),

    t("E1-006", "Pedido URGENTE Daruma 50-80 unidades", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P0 (Crítica)", "Esta semana", "2026-04-29", "2026-04-30", "Por asignar", ["Por asignar"],
      deps=["E1-005"], hashtags=["#daruma", "#pedido", "#urgente", "#piloto"], risk="Alto", budget=3000,
      notes="PEDIDO URGENTE: 50-80 unidades para piloto + soft opening. Confirmar: especificaciones finales, cantidad exacta, fecha entrega (antes 15 junio), condiciones pago, penalizaciones por retraso. PAGAR ADELANTO SI ES NECESARIO PARA ACELERAR."),

    t("E1-007", "Seguimiento producción Daruma (semanal)", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-05", "2026-06-15", "Por asignar", ["Por asignar"],
      deps=["E1-006"], hashtags=["#daruma", "#seguimiento", "#producción"], risk="Medio", hours=12,
      notes="Seguimiento SEMANAL con proveedor: % avance, fotos progreso, confirm fecha entrega. Si hay retrasos, escalar inmediatamente. TENER PLAN B: proveedor alternativo identificado por si falla el principal."),

    t("E1-008", "Recepción y QC Daruma primera producción", "Espacio E1 > Daruma 3D", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-16", "2026-06-18", "Por asignar", ["Por asignar"],
      deps=["E1-007"], hashtags=["#daruma", "#calidad", "#recepción"], risk="Medio", hours=6,
      notes="Quality Control al recibir Darumas: verificar 100% de unidades, dimensiones correctas, acabado, peso, sin defectos. CRITERIO: <5% defectuosos aceptable. Si >5%, negociar reposición con proveedor. Fotografiar todo para evidencia."),
])

# ====== KIT DE EXPERIENCIA ======
nuevas.extend([
    t("E1-009", "Definir elementos kit por disciplina (9)", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Esta semana", "2026-04-21", "2026-04-25", "David", ["David", "Miguel"],
      hashtags=["#kit", "#producto", "#diseño", "#experiencia"], risk="Medio", hours=12,
      notes="Definir elementos específicos de cada kit por disciplina (Origami, Ikebana, Caligrafía, Cerámica, Té, Sumi-e, Kokeshi, Furoshiki, Kintsugi). Por disciplina especificar: materiales, herramientas, instrucciones, nivel dificultad. CRITERIO: Todos los elementos deben caber en caja 30x30x10cm max, costo <20€/kit."),

    t("E1-010", "Sourcing materiales Madrid (9 disciplinas)", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-04-26", "2026-05-05", "Por asignar", ["Por asignar"],
      deps=["E1-009"], hashtags=["#kit", "#sourcing", "#madrid", "#materiales"], risk="Medio", hours=20, budget=1500,
      notes="Buscar proveedores en Madrid/España para materiales de las 9 disciplinas. PRIORIZAR: Proveedores locales Madrid para rápida reposición, calidad consistente, precio escalable. ÁREAS: Papelerías especializadas, tiendas manualidades, importadores japoneses Madrid, mercados artesanía."),

    t("E1-011", "Diseño packaging kit", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-06", "2026-05-12", "Por asignar", ["Por asignar"],
      deps=["E1-010", "t73"], hashtags=["#kit", "#packaging", "#diseño", "#branding"], risk="Medio", hours=16, budget=800,
      notes="Diseño packaging que refleje identidad visual. REQUERIMIENTOS: Caja reutilizable, sostenible (cartón reciclado?), compartimentos internos, instrucciones integradas, branding sutil, fácil apertura/cierre. INSPIRACIÓN: Packaging Apple, kits japoneses, unboxing experience."),

    t("E1-012", "Prototipo kit completo (9 disciplinas)", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-13", "2026-05-16", "Por asignar", ["Por asignar"],
      deps=["E1-011"], hashtags=["#kit", "#prototipo", "#validación"], risk="Medio", hours=24,
      notes="Crear prototipo físico completo de 1 kit por disciplina (9 kits totales). VALIDAR: Todos los elementos caben, instrucciones claras, experiencia completa funciona, packaging resiste, estética correcta. TESTEAR con 2-3 personas no involucradas en proyecto."),

    t("E1-013", "Test kits en piloto - Feedback", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-05-19", "2026-06-13", "Por asignar", ["Por asignar"],
      deps=["E1-012", "t98"], hashtags=["#kit", "#piloto", "#feedback", "#iteración"], risk="Medio", hours=8,
      notes="Durante piloto (4 semanas), recoger feedback detallado de kits: ¿falta algo? ¿sobra algo? ¿instrucciones claras? ¿calidad materiales? ¿packaging adecuado? MÉTODO: Encuesta post-sesión + observación facilitador. Iterar diseño basándose en feedback."),

    t("E1-014", "Ajustes kit post-piloto", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-14", "2026-06-20", "Por asignar", ["Por asignar"],
      deps=["E1-013"], hashtags=["#kit", "#iteración", "#mejora"], risk="Bajo", hours=12,
      notes="Implementar mejoras basadas en feedback piloto. POSIBLES AJUSTES: cambiar materiales, añadir/quitar elementos, mejorar instrucciones, ajustar packaging. DEADLINE: Diseño final debe estar cerrado 20 junio para producción a escala."),

    t("E1-015", "Producción kits soft opening (80-100)", "Espacio E1 > Kit Experiencia", "Producto",
      "Pendiente", "P1 (Alta)", "Este mes", "2026-06-21", "2026-07-15", "Por asignar", ["Por asignar"],
      deps=["E1-014"], hashtags=["#kit", "#producción", "#soft-opening"], risk="Medio", hours=40, budget=2000,
      notes="Producir 80-100 kits para soft opening (1 sept). DISTRIBUCIÓN: ~10 kits por disciplina (9 disciplinas). GESTIÓN: Coordinar con todos los proveedores, recibir materiales, ensamblar kits, empaquetar, almacenar. PLAZO: Todo listo antes 25 agosto."),
])

# Añadir las nuevas tareas a las existentes
tareas_actuales.extend(nuevas)

# Actualizar metadata
data['metadata']['total_tareas'] = len(tareas_actuales)
data['metadata']['tareas_nuevas_añadidas'] = len(nuevas)
data['tareas'] = tareas_actuales

# Guardar
with open('TODAS_LAS_TAREAS_E1_COMPLETO.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Archivo actualizado")
print(f"📊 Total tareas: {len(tareas_actuales)}")
print(f"➕ Nuevas añadidas: {len(nuevas)}")
print(f"🎯 Objetivo: 190-200 tareas")
print(f"📍 Faltan por añadir: ~{195 - len(tareas_actuales)} tareas")

SCRIPT_END