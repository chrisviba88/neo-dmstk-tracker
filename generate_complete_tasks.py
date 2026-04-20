#!/usr/bin/env python3
"""
Generador de Tareas Completas NEO DMSTK
Senior PM con 15+ años de experiencia en Monday.com
"""

import json
from datetime import datetime, timedelta

# Cargar tareas actuales
with open('TODAS_LAS_TAREAS_REORGANIZADAS.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    tareas_actuales = data['tareas']

# Encontrar el último ID numérico
max_id = 0
for task in tareas_actuales:
    task_id = task['id']
    if task_id.startswith('t') and task_id[1:].isdigit():
        num = int(task_id[1:])
        if num > max_id:
            max_id = num

print(f"Último ID numérico encontrado: t{max_id}")

# Función para crear nueva tarea
def create_task(id_num, name, project, ws, status, priority, urgency, start, end, owner, team,
                deps=None, blocks=None, related=None, hashtags=None, is_milestone=False, is_gate=False,
                requires_board=False, risk="Medio", progress=0, notes="", phase="Ejecución",
                hours=0, actual_hours=0, budget=0):
    return {
        "id": f"t{id_num}",
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
        "deps": deps or [],
        "blocks": blocks or [],
        "related": related or [],
        "hashtags": hashtags or [],
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

# ========================================
# TAREAS NUEVAS PARA E1 MADRID - 100% COMPLETO
# ========================================

nuevas_tareas_e1 = []
current_id = max_id + 1

# ============================================================
# ÁREA 1: DARUMA 3D - Completar todas las tareas faltantes
# ============================================================

nuevas_tareas_e1.append(create_task(
    current_id,
    "¿Dani puede diseñar Daruma? - Confirmar",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P0 (Crítica)",
    "Inmediata",
    "2026-04-14",
    "2026-04-16",
    "David",
    ["David"],
    hashtags=["#daruma", "#diseño", "#urgente", "#decisión"],
    risk="Alto",
    notes="URGENTE: Confirmar si Dani puede diseñar el Daruma o necesitamos buscar diseñador 3D externo. Esto bloquea todo el flujo de producción de Daruma. CRITERIO: Si Dani no confirma antes del 16 abril, buscar diseñador externo inmediatamente."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Briefing completo diseño Daruma 3D",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P0 (Crítica)",
    "Inmediata",
    "2026-04-17",
    "2026-04-18",
    "David",
    ["David"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#diseño", "#briefing", "#producto"],
    risk="Medio",
    hours=4,
    notes="Brief detallado para diseño Daruma: dimensiones exactas (15-20cm alto), materiales preferidos (cerámica, resina, madera), estética (minimalista, japonés, moderno), peso máximo, si puede tener partes móviles, colores corporativos, textura. INCLUIR: referencias visuales, presupuesto máximo por unidad, cantidad mínima pedido."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Buscar proveedor fabricación 3D Madrid",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P0 (Crítica)",
    "Esta semana",
    "2026-04-18",
    "2026-04-22",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#sourcing", "#madrid", "#proveedor"],
    risk="Alto",
    hours=8,
    notes="Buscar 3-5 proveedores en Madrid que puedan fabricar Daruma (impresión 3D, cerámica, resina). CRITERIOS: lead time <6 semanas, calidad portfolio, precio competitivo, MOQ razonable, capacidad de hacer 50-80 unidades iniciales + 200-300 unidades escala. CONTACTAR: FabLab Madrid, empresas cerámica Vallecas, estudios diseño 3D Malasaña."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Cotizaciones y lead times proveedores Daruma",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Esta semana",
    "2026-04-23",
    "2026-04-25",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#presupuesto", "#sourcing"],
    risk="Medio",
    hours=4,
    notes="Solicitar cotizaciones a los 3-5 proveedores preseleccionados. INFORMACIÓN REQUERIDA: precio unitario (50 uds vs 300 uds), lead time producción, costo tooling/moldes si aplica, opciones de material, muestras disponibles, condiciones pago. Comparar en spreadsheet."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Selección proveedor Daruma final",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P0 (Crítica)",
    "Esta semana",
    "2026-04-26",
    "2026-04-28",
    "David",
    ["David"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#decisión", "#proveedor"],
    risk="Alto",
    is_milestone=True,
    notes="DECISIÓN CRÍTICA: Seleccionar proveedor final basándose en: 1) Lead time (debe entregar antes 15 junio para piloto), 2) Calidad, 3) Precio, 4) Capacidad de escalar a 300+ uds. CRITERIO GO: Lead time <6 semanas desde pedido."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Pedido URGENTE Daruma 50-80 unidades",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P0 (Crítica)",
    "Esta semana",
    "2026-04-29",
    "2026-04-30",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#pedido", "#urgente", "#piloto"],
    risk="Alto",
    budget=3000,
    notes="PEDIDO URGENTE: 50-80 unidades para piloto + soft opening. Confirmar: especificaciones finales, cantidad exacta, fecha entrega (antes 15 junio), condiciones pago, penalizaciones por retraso. PAGAR ADELANTO SI ES NECESARIO PARA ACELERAR."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Seguimiento producción Daruma (semanal)",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-05-05",
    "2026-06-15",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#seguimiento", "#producción"],
    risk="Medio",
    hours=12,
    notes="Seguimiento SEMANAL con proveedor: % avance, fotos progreso, confirm fecha entrega. Si hay retrasos, escalar inmediatamente. TENER PLAN B: proveedor alternativo identificado por si falla el principal."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Recepción y QC Daruma primera producción",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-06-16",
    "2026-06-18",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#calidad", "#recepción"],
    risk="Medio",
    hours=6,
    notes="Quality Control al recibir Darumas: verificar 100% de unidades, dimensiones correctas, acabado, peso, sin defectos. CRITERIO: <5% defectuosos aceptable. Si >5%, negociar reposición con proveedor. Fotografiar todo para evidencia."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Integración Daruma en kits de experiencia",
    "Daruma — prototipo 3D",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-06-19",
    "2026-06-20",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#daruma", "#kit", "#integración"],
    risk="Bajo",
    hours=4,
    notes="Integrar Darumas en los kits de experiencia: packaging, instrucciones de uso, posición en kit. Testear que cabe bien en packaging diseñado."
))
current_id += 1

# =================================================================
# ÁREA 2: KIT DE EXPERIENCIA - Tareas faltantes detalladas
# =================================================================

nuevas_tareas_e1.append(create_task(
    current_id,
    "Definir elementos kit por disciplina (9 disci)",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Esta semana",
    "2026-04-21",
    "2026-04-25",
    "David",
    ["David", "Miguel"],
    hashtags=["#kit", "#producto", "#diseño", "#experiencia"],
    risk="Medio",
    hours=12,
    notes="Definir elementos específicos de cada kit por disciplina (Origami, Ikebana, Caligrafía, Cerámica, Té, Sumi-e, Kokeshi, Furoshiki, Kintsugi). Por disciplina especificar: materiales, herramientas, instrucciones, nivel dificultad. CRITERIO: Todos los elementos deben caber en caja 30x30x10cm max, costo <20€/kit."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Sourcing materiales Madrid (9 disciplinas)",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-04-26",
    "2026-05-05",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#kit", "#sourcing", "#madrid", "#materiales"],
    risk="Medio",
    hours=20,
    budget=1500,
    notes="Buscar proveedores en Madrid/España para materiales de las 9 disciplinas. PRIORIZAR: Proveedores locales Madrid para rápida reposición, calidad consistente, precio escalable. ÁREAS: Papelerías especializadas, tiendas manualidades, importadores japoneses Madrid, mercados artesanía."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Diseño packaging kit",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-05-06",
    "2026-05-12",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}", "t73"],
    hashtags=["#kit", "#packaging", "#diseño", "#branding"],
    risk="Medio",
    hours=16,
    budget=800,
    notes="Diseño packaging que refleje identidad visual. REQUERIMIENTOS: Caja reutilizable, sostenible (cartón reciclado?), compartimentos internos, instrucciones integradas, branding sutil, fácil apertura/cierre. INSPIRACIÓN: Packaging Apple, kits japoneses, unboxing experience."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Prototipo kit completo (todas disciplinas)",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-05-13",
    "2026-05-16",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#kit", "#prototipo", "#validación"],
    risk="Medio",
    hours=24,
    notes="Crear prototipo físico completo de 1 kit por disciplina (9 kits totales). VALIDAR: Todos los elementos caben, instrucciones claras, experiencia completa funciona, packaging resiste, estética correcta. TESTEAR con 2-3 personas no involucradas en proyecto."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Test kits en piloto - Feedback usuarios",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-05-19",
    "2026-06-13",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}", "t98"],
    hashtags=["#kit", "#piloto", "#feedback", "#iteración"],
    risk="Medio",
    hours=8,
    notes="Durante piloto (4 semanas), recoger feedback detallado de kits: ¿falta algo? ¿sobra algo? ¿instrucciones claras? ¿calidad materiales? ¿packaging adecuado? MÉTODO: Encuesta post-sesión + observación facilitador. Iterar diseño basándose en feedback."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Ajustes kit post-piloto",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-06-14",
    "2026-06-20",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#kit", "#iteración", "#mejora"],
    risk="Bajo",
    hours=12,
    notes="Implementar mejoras basadas en feedback piloto. POSIBLES AJUSTES: cambiar materiales, añadir/quitar elementos, mejorar instrucciones, ajustar packaging. DEADLINE: Diseño final debe estar cerrado 20 junio para producción a escala."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Producción kits soft opening (80-100 uds)",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-06-21",
    "2026-07-15",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#kit", "#producción", "#soft-opening"],
    risk="Medio",
    hours=40,
    budget=2000,
    notes="Producir 80-100 kits para soft opening (1 sept). DISTRIBUCIÓN: ~10 kits por disciplina (9 disciplinas). GESTIÓN: Coordinar con todos los proveedores, recibir materiales, ensamblar kits, empaquetar, almacenar. PLAZO: Todo listo antes 25 agosto."
))
current_id += 1

nuevas_tareas_e1.append(create_task(
    current_id,
    "Stock kits preparado para apertura",
    "Kit de Experiencia & Producto",
    "Producto",
    "Pendiente",
    "P1 (Alta)",
    "Este mes",
    "2026-08-16",
    "2026-08-28",
    "Por asignar",
    ["Por asignar"],
    deps=[f"t{current_id-1}"],
    hashtags=["#kit", "#stock", "#logística"],
    risk="Bajo",
    hours=8,
    notes="Verificar stock completo de kits listo para soft opening y grand opening. INVENTARIO: Contar todos los kits, verificar calidad, organizar en almacén espacio E1, sistema de tracking inventario básico (Excel). PLAN REPOSICIÓN: Identificar proveedores para reposición rápida post-apertura."
))
current_id += 1

# Print nuevas tareas generadas
print(f"\nGeneradas {len(nuevas_tareas_e1)} nuevas tareas para E1 Madrid")
print(f"Nuevo current_id: {current_id}")

# Exportar a archivo temporal para revisión
with open('/tmp/nuevas_tareas_e1_parte1.json', 'w', encoding='utf-8') as f:
    json.dump(nuevas_tareas_e1, f, ensure_ascii=False, indent=2)

print("\nTareas exportadas a /tmp/nuevas_tareas_e1_parte1.json")
