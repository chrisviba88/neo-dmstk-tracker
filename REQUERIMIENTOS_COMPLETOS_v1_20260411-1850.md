# 📋 REQUERIMIENTOS COMPLETOS - NEO DMSTK

**Fecha:** 2026-04-11 18:50
**Solicitado por:** Christian
**Estado:** CRÍTICO - Nada está funcionando correctamente

---

## 🚨 PROBLEMAS CRÍTICOS ACTUALES

### 1. **Botón History - SE ROMPE LA PÁGINA**
**Problema:** Al hacer click en "History" la página se rompe
**Ubicación:** Header de la app
**Prioridad:** P0 - CRÍTICO
**Causa probable:** Error en componente HistoryViewer
**Acción:** Debuggear y arreglar completamente

---

### 2. **Dropdown Owner en Vista Ejecutiva - NO FUNCIONA**
**Problema:** No permite seleccionar todos los perfiles activos
**Ubicación:** Vista Ejecutiva → Owner dropdown
**Prioridad:** P0 - CRÍTICO
**Causa probable:** Dropdown no renderiza opciones correctamente
**Acción:** Verificar que `owners` array está disponible y renderizar correctamente

---

### 3. **Dashboard Principal - NO FUNCIONA NADA**
**Problema:** Las funcionalidades prometidas no están trabajando
**Prioridad:** P0 - CRÍTICO
**Acción:** Testing completo y arreglar CADA función

---

### 4. **Timeline - NO FUNCIONA NADA**
**Problema:** Las funcionalidades no están operativas
**Prioridad:** P0 - CRÍTICO
**Acción:** Testing completo y arreglar CADA función

---

## ✨ NUEVOS REQUERIMIENTOS

### 5. **SISTEMA FRACTAL EN TODAS LAS VISTAS**

**Concepto:** TODA información debe ser clickeable para profundizar

#### Dashboard:
- Click en "109 tareas" → Pop-up con lista de 109 tareas
- Click en "Completadas" → Pop-up con tareas completadas
- Click en "Vencidas" → Pop-up con vencidas
- Click en "Esta semana" → Pop-up con tareas de la semana
- Click en workstream → Pop-up con tareas del workstream
- Click en owner → Pop-up con tareas del owner
- Click en hito → Pop-up con detalles del hito

**IMPORTANTE:**
- Pop-ups rápidos (NO cambiar de página)
- Información resumida y clara
- TODO editable inline
- Navegación profunda: Click en tarea → Modal 5Ws completo

#### Vista Ejecutiva:
- Mismo sistema fractal
- Cada métrica clickeable

#### Timeline:
- Click en barra → Pop-up con detalles editables
- Click en dependencia → Pop-up con tareas relacionadas

**Prioridad:** P0 - Fundamental para UX

---

### 6. **DRAG & DROP DE FECHAS EN CALENDARIO**

**Requerimiento:**
"Cuando me aparecen los próximos días, si selecciono algún día y quiero llevar una tarea a ese día, deberías permitirme llevarla de manera fácil y sencilla"

**Implementación:**
- En FiveDayCalendar, permitir drag & drop
- Arrastrar tarea de un día a otro día
- Actualizar fecha automáticamente
- Validar que no rompe dependencias
- Confirmación visual del cambio

**Flujo:**
1. Usuario ve calendario de 5 días
2. Arrastra tarea del día 1 al día 3
3. Sistema valida dependencias
4. Si OK: Actualiza fecha, guarda en DB
5. Si hay conflicto: Muestra advertencia, permite forzar o cancelar

**Prioridad:** P1 - Alta

---

### 7. **FINDER EN VISTA DE DEPENDENCIAS**

**Problema:**
"En la ventana de dependencias me aparecen todas pero me es muy difícil dar en el clavo con una porque hay muchas"

**Solución:**
Implementar buscador/filtro en vista de dependencias

**Componentes:**
1. Input de búsqueda en la parte superior
2. Filtrar en tiempo real mientras escribe
3. Buscar en: nombre de tarea, workstream, owner
4. Destacar matches visualmente

**Ubicación:** Donde se muestran dependencias (Timeline)

**Prioridad:** P1 - Alta

---

### 8. **SISTEMA DE HASHTAGS INTELIGENTE**

**Requerimiento CRÍTICO:**
"Necesito que cada tarea tenga hashtags clave bastante bien pensadas"

**Objetivo:**
Buscar por palabra clave y encontrar TODAS las tareas relacionadas

**Ejemplos de búsqueda:**
- `DARUMA` → Todas las tareas relacionadas con DARUMA
- `PILOTO` → Todas las tareas del piloto
- `apertura` o `softopening` → Tareas de apertura/soft opening
- `legal` → Tareas legales
- `branding` → Tareas de marca
- etc.

**Implementación:**

#### Fase 1: Generación automática de hashtags

Para cada tarea, generar hashtags basados en:
1. **Workstream** → `#Dirección`, `#Legal`, `#Producto`, etc.
2. **Nombre de tarea** → Extraer palabras clave
3. **Owner** → `#Miguel`, `#Cristina`, etc.
4. **Hitos relacionados** → `#DARUMA`, `#PILOTO`, `#SoftOpening`
5. **Categorías** → `#Contrato`, `#Pago`, `#Evento`, `#Capacitación`

**Hashtags para DARUMA:**
```javascript
{
  id: "task-daruma-1",
  name: "Negociar contrato con DARUMA",
  ws: "Legal",
  hashtags: [
    "#DARUMA",
    "#Legal",
    "#Contrato",
    "#Negociación",
    "#Sponsor"
  ]
}
```

**Hashtags para PILOTO:**
```javascript
{
  id: "task-piloto-ventas-1",
  name: "Preparar lista de contactos para piloto",
  ws: "Pilot-Ventas",
  hashtags: [
    "#PILOTO",
    "#Ventas",
    "#Contactos",
    "#PreApertura"
  ]
}
```

**Hashtags para APERTURA/SOFT OPENING:**
```javascript
{
  id: "task-apertura-1",
  name: "Evento de soft opening",
  ws: "Comunicación",
  hashtags: [
    "#SoftOpening",
    "#Apertura",
    "#Evento",
    "#Comunicación",
    "#PreLanzamiento"
  ]
}
```

#### Fase 2: Buscador inteligente

**Ubicación:** Header de la app (siempre visible)

**Funcionalidades:**
1. Input de búsqueda global
2. Búsqueda en tiempo real (mientras escribe)
3. Buscar en:
   - Hashtags
   - Nombre de tarea
   - Descripción
   - Owner
   - Workstream
4. Resultados agrupados por categoría
5. Click en resultado → Abre modal 5Ws

**UI del buscador:**
```
┌─────────────────────────────────────────┐
│ 🔍 Buscar tareas... (ej: DARUMA)       │
└─────────────────────────────────────────┘
       ↓ (mientras escribe "DAR")
┌─────────────────────────────────────────┐
│ Resultados para "DAR" (8 encontradas)   │
├─────────────────────────────────────────┤
│ 📌 Por hashtag:                         │
│   • #DARUMA (5 tareas)                  │
│                                         │
│ 📋 Tareas directas:                     │
│   • Negociar contrato con DARUMA        │
│   • Firmar acuerdo DARUMA               │
│   • Validar términos con DARUMA         │
│   ...                                   │
└─────────────────────────────────────────┘
```

**Prioridad:** P0 - CRÍTICO para navegación

---

#### Fase 3: Taxonomía de hashtags

**Categorías principales:**

1. **SPONSORS/PARTNERS:**
   - `#DARUMA`
   - `#[Otro Partner]`

2. **HITOS:**
   - `#PILOTO`
   - `#SoftOpening`
   - `#GranApertura`
   - `#PrimerCurso`

3. **CATEGORÍAS FUNCIONALES:**
   - `#Contrato`
   - `#Pago`
   - `#Capacitación`
   - `#Evento`
   - `#Marketing`
   - `#Infraestructura`

4. **WORKSTREAMS:** (automático)
   - `#Dirección`
   - `#Legal`
   - `#Producto`
   - etc.

5. **ESTADO/TEMPORAL:**
   - `#Urgente`
   - `#Bloqueado`
   - `#Esperando`

---

## 📊 ANÁLISIS DE HASHTAGS POR TAREA

**Ejemplo real - Task: "Negociar contrato con DARUMA"**

```javascript
{
  id: "task-123",
  name: "Negociar contrato con DARUMA",
  ws: "Legal",
  owner: "Cristina",
  status: "En curso",

  // HASHTAGS GENERADOS AUTOMÁTICAMENTE:
  hashtags: [
    // De workstream:
    "#Legal",

    // De nombre (palabras clave):
    "#Negociar",
    "#Contrato",
    "#DARUMA",

    // De categoría funcional:
    "#Sponsor",
    "#Acuerdo",

    // De owner:
    "#Cristina",

    // Temporal (si aplica):
    "#Urgente" // (si vence pronto)
  ]
}
```

---

## 🎯 SISTEMA DE AGENTES - CÓMO ACTIVARLO

**Problema identificado:**
No estoy usando el sistema de agentes correctamente. Trabajo solo y sin coordinación.

**Solución:**

### Agentes a activar para este proyecto:

1. **PM Agent (Coordinador)**
   - Prioriza tareas
   - Asigna trabajo a otros agentes
   - Valida que todo está completo

2. **Frontend Dev**
   - Implementa componentes React
   - Arregla bugs de UI
   - Testing de componentes

3. **QA Engineer**
   - Testing exhaustivo de CADA funcionalidad
   - Reporta bugs encontrados
   - Valida fixes

4. **UX Expert**
   - Diseña interacciones fractales
   - Valida que UX es intuitiva
   - Sugiere mejoras

5. **Data Analyst**
   - Genera hashtags inteligentes
   - Valida búsquedas
   - Optimiza taxonomía

**Cómo activarlos:**

Usar el Task tool en PARALELO:

```javascript
// PM Agent
Task({
  subagent_type: "general-purpose",
  description: "PM coordina implementación",
  prompt: "Actúa como PM Agent. Lee REQUERIMIENTOS_COMPLETOS. Prioriza y asigna trabajo a Frontend Dev, QA, UX Expert, Data Analyst."
})

// Frontend Dev
Task({
  subagent_type: "general-purpose",
  description: "Frontend implementa features",
  prompt: "Actúa como Frontend Dev. Implementa: 1) Fix History button, 2) Fix owner dropdown, 3) Drag & drop fechas, 4) Finder dependencias, 5) Sistema hashtags"
})

// QA Engineer
Task({
  subagent_type: "general-purpose",
  description: "QA prueba todo",
  prompt: "Actúa como QA Engineer. Prueba TODAS las funcionalidades. Reporta qué funciona y qué no."
})

// UX Expert
Task({
  subagent_type: "general-purpose",
  description: "UX diseña fractales",
  prompt: "Actúa como UX Expert. Diseña sistema fractal completo para Dashboard, Ejecutivo, Timeline."
})

// Data Analyst
Task({
  subagent_type: "general-purpose",
  description: "Data genera hashtags",
  prompt: "Actúa como Data Analyst. Genera taxonomía de hashtags inteligentes para las 109 tareas."
})
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### P0 - CRÍTICO (Hacer PRIMERO):

- [ ] **Activar sistema de agentes en paralelo**
- [ ] **Arreglar botón History (se rompe página)**
- [ ] **Arreglar dropdown owner en Ejecutivo**
- [ ] **Testing completo Dashboard** (validar QUÉ funciona)
- [ ] **Testing completo Timeline** (validar QUÉ funciona)
- [ ] **Implementar sistema de hashtags**
- [ ] **Implementar buscador global**

### P1 - ALTA (Hacer DESPUÉS):

- [ ] **Implementar drag & drop fechas en calendario**
- [ ] **Implementar finder en vista dependencias**
- [ ] **Aplicar sistema fractal a Dashboard**
- [ ] **Aplicar sistema fractal a Timeline**

### P2 - MEDIA:

- [ ] **Optimizar velocidad de pop-ups**
- [ ] **Mejorar diseño visual**
- [ ] **Agregar animaciones suaves**

---

## 🎓 LECCIONES APRENDIDAS

**Lo que hice mal:**
1. ❌ Implementé sin probar
2. ❌ Trabajé solo sin agentes
3. ❌ No validé que funciona ANTES de decir "hecho"
4. ❌ No documenté requerimientos completos

**Lo que debo hacer:**
1. ✅ Activar agentes en paralelo
2. ✅ PM Agent coordina TODO
3. ✅ QA Engineer prueba TODO
4. ✅ Documentar ANTES de implementar
5. ✅ Testing exhaustivo ANTES de reportar

---

## 📞 SIGUIENTE ACCIÓN

**AHORA MISMO:**

1. Christian revisa y confirma que este documento captura TODO
2. Yo activo 5 agentes en paralelo usando Task tool
3. PM Agent coordina y asigna trabajo
4. Cada agente trabaja en paralelo
5. PM Agent reporta progreso
6. QA Engineer valida TODO
7. Reporto a Christian qué funciona REALMENTE

---

**¿Este documento captura TODO lo que necesitas, Christian?**

Si sí, activo los agentes AHORA.
Si falta algo, dime qué agregar.

---

**Creado:** 2026-04-11 18:50
**Por:** Claude Code (sin agentes - por eso falló)
**Versión:** 1.0
**Estado:** Esperando confirmación para activar agentes
