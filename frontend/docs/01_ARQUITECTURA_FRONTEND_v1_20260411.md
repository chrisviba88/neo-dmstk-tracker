# Arquitectura de Visualización de Dependencias

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.jsx                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    TimelineView                         │    │
│  │                                                          │    │
│  │  Estados:                                                │    │
│  │  - depImpactModal: null | { task, newEndDate }         │    │
│  │  - impactData: null | { affectedTasks: [...] }         │    │
│  │  - taskPositions: { taskId: { x, y, endX } }           │    │
│  │                                                          │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │         SVG Overlay (zIndex: 1)                 │    │    │
│  │  │                                                  │    │    │
│  │  │  ┌──────────────────────────────────────┐      │    │    │
│  │  │  │  Markers (Arrowheads)                │      │    │    │
│  │  │  │  - arrowhead-green                    │      │    │    │
│  │  │  │  - arrowhead-red                      │      │    │    │
│  │  │  │  - arrowhead-blue                     │      │    │    │
│  │  │  │  - arrowhead-yellow                   │      │    │    │
│  │  │  └──────────────────────────────────────┘      │    │    │
│  │  │                                                  │    │    │
│  │  │  {tasks.map(t => {                             │    │    │
│  │  │    if (!t.deps) return null;                   │    │    │
│  │  │                                                  │    │    │
│  │  │    return t.deps.map(depId => {                │    │    │
│  │  │      ┌─────────────────────────────┐           │    │    │
│  │  │      │  <path>                      │           │    │    │
│  │  │      │  - Curva Bezier              │           │    │    │
│  │  │      │  - Color según estado        │           │    │    │
│  │  │      │  - Flecha en final           │           │    │    │
│  │  │      └─────────────────────────────┘           │    │    │
│  │  │    });                                          │    │    │
│  │  │  })}                                            │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  ┌────────────────────────────────────────────────┐    │    │
│  │  │      Timeline Content (zIndex: 2)              │    │    │
│  │  │                                                  │    │    │
│  │  │  ┌──────────────────────────────────┐          │    │    │
│  │  │  │  Workstream Groups                │          │    │    │
│  │  │  │                                    │          │    │    │
│  │  │  │  {grouped.map(g => {              │          │    │    │
│  │  │  │    return (                        │          │    │    │
│  │  │  │      <div id="task-bar-{t.id}">   │◄─────── ID para rastreo
│  │  │  │        [==========]                │          │    │    │
│  │  │  │      </div>                        │          │    │    │
│  │  │  │    );                               │          │    │    │
│  │  │  │  })}                                │          │    │    │
│  │  │  └──────────────────────────────────┘          │    │    │
│  │  └────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  useEffect(() => {                                      │    │
│  │    // Calcular posiciones de barras                    │    │
│  │    getElementById('task-bar-{id}')                      │    │
│  │    getBoundingClientRect()                              │    │
│  │    → taskPositions[taskId] = { x, y, endX }            │    │
│  │  }, [tasks, expandedWs, grouped]);                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         DependencyImpactModal                       │    │
│  │         (zIndex: 200)                                │    │
│  │                                                      │    │
│  │  Props:                                              │    │
│  │  - task: { id, name, ... }                          │    │
│  │  - newEndDate: "2026-05-01"                         │    │
│  │  - impactData: { affectedTasks: [...] }            │    │
│  │  - onConfirm: () => propagateDependencies()         │    │
│  │  - onCancel: () => setDepImpactModal(null)         │    │
│  │                                                      │    │
│  │  Render:                                             │    │
│  │  ┌──────────────────────────────────────┐          │    │
│  │  │  Header: "Impacto en Dependencias"   │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │  Nueva fecha: {newEndDate}           │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │  Tareas afectadas:                    │          │    │
│  │  │  - Tarea X: 04/15 → 04/20            │          │    │
│  │  │  - Tarea Y: 04/21 → 04/26            │          │    │
│  │  ├──────────────────────────────────────┤          │    │
│  │  │  [Cancelar]  [Confirmar cambio]     │          │    │
│  │  └──────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Renderizado Inicial

```
App.jsx
  │
  ├─> tasks = [{ id, name, deps: [...], ... }]
  │
  └─> TimelineView({ tasks, expandedWs, setExpandedWs })
       │
       ├─> Renderiza barras con ID: task-bar-{id}
       │
       ├─> useEffect detecta cambios
       │    │
       │    └─> Calcula posiciones
       │         │
       │         └─> taskPositions = { t01: { x, y, endX }, ... }
       │
       └─> SVG lee taskPositions
            │
            └─> Dibuja líneas entre dependencias
```

### 2. Cambio de Fecha (Futuro - con integración)

```
Usuario edita fecha en TaskModal
  │
  └─> onChange del input date
       │
       ├─> Busca tareas dependientes
       │    │
       │    └─> blockedTasks = tasks.filter(t => t.deps.includes(taskId))
       │
       ├─> Si hay dependientes:
       │    │
       │    └─> analyzeImpact(taskId, newEndDate)
       │         │
       │         ├─> POST /api/dependencies/analyze-impact
       │         │
       │         └─> impactData = { affectedTasks: [...] }
       │              │
       │              └─> setDepImpactModal({ task, newEndDate })
       │                   │
       │                   └─> Muestra DependencyImpactModal
       │                        │
       │                        ├─> Usuario click "Cancelar"
       │                        │    └─> setDepImpactModal(null)
       │                        │
       │                        └─> Usuario click "Confirmar"
       │                             │
       │                             └─> propagateDependencies(taskId, newEndDate)
       │                                  │
       │                                  ├─> POST /api/dependencies/propagate
       │                                  │
       │                                  └─> Actualiza todas las tareas
       │                                       │
       │                                       └─> setDepImpactModal(null)
       │
       └─> Si NO hay dependientes:
            │
            └─> set("endDate", newEndDate) directamente
```

### 3. Actualización de Líneas

```
tasks cambian (nuevas deps, status, fechas)
  │
  └─> useEffect detecta cambio
       │
       ├─> Recalcula posiciones de barras
       │    │
       │    └─> taskPositions actualizado
       │
       └─> React re-renderiza SVG
            │
            └─> Nuevas líneas con nuevos colores/posiciones
```

## Estructura de Datos

### taskPositions

```javascript
{
  "t01": {
    x: 450,      // Centro de la barra
    y: 120,      // Centro vertical
    endX: 550    // Extremo derecho
  },
  "t02": {
    x: 650,
    y: 145,
    endX: 750
  }
}
```

### impactData

```javascript
{
  affectedTasks: [
    {
      id: "t02",
      name: "Implementación Frontend",
      oldEndDate: "2026-05-01",
      newEndDate: "2026-05-06"
    },
    {
      id: "t03",
      name: "Testing",
      oldEndDate: "2026-05-02",
      newEndDate: "2026-05-07"
    }
  ]
}
```

### depImpactModal

```javascript
{
  task: {
    id: "t01",
    name: "Diseño UI",
    endDate: "2026-04-15",
    // ... otros campos
  },
  newEndDate: "2026-04-20"
}
```

## Capas Z-Index

```
┌─────────────────────────────────────┐
│  DependencyImpactModal (z: 200)     │  ◄─ Modal flotante
├─────────────────────────────────────┤
│  "Hoy" marker (z: 5)                │  ◄─ Línea vertical "Hoy"
├─────────────────────────────────────┤
│  Timeline Content (z: 2)            │  ◄─ Barras de tareas
├─────────────────────────────────────┤
│  SVG Dependency Lines (z: 1)        │  ◄─ Líneas de fondo
├─────────────────────────────────────┤
│  Background                          │  ◄─ Fondo blanco
└─────────────────────────────────────┘
```

## Algoritmo de Cálculo de Curva Bezier

```javascript
// Posiciones
sourcePos = { endX: 550, y: 120 }  // Final de tarea dependencia
targetPos = { x: 650, y: 145 }      // Centro de tarea dependiente

// Punto medio horizontal
midX = (sourcePos.endX + targetPos.x) / 2 = 600

// Curva cuadrática bezier
path = "M 550 120                    // Inicio (fin de source)
        Q 600 120                     // Control 1 (horizontal desde source)
        600 132.5                     // Control 2 (punto medio vertical)
        T 642 145"                    // Final (centro de target - 8px para flecha)

Resultado:
  sourceTask     curva      targetTask
  [========]───────╮           [========]
              ╭────╯
              │
              └──────────────────────>
```

## APIs Backend

### Endpoint 1: Analizar Impacto

```
┌─────────────┐         POST          ┌─────────────┐
│  Frontend   │──────────────────────►│   Backend   │
│             │  /api/dependencies/   │             │
│             │    analyze-impact     │             │
│             │                        │             │
│             │  Body:                 │             │
│             │  {                     │             │
│             │    taskId: "t01",     │             │
│             │    newEndDate: "..."  │             │
│             │  }                     │             │
│             │                        │             │
│             │◄──────────────────────│             │
│             │  Response:             │             │
│             │  {                     │             │
│             │    affectedTasks: [   │             │
│             │      {                 │             │
│             │        name,           │             │
│             │        oldEndDate,     │             │
│             │        newEndDate      │             │
│             │      }                 │             │
│             │    ]                   │             │
│             │  }                     │             │
└─────────────┘                        └─────────────┘
```

### Endpoint 2: Propagar Cambios

```
┌─────────────┐         POST          ┌─────────────┐         UPDATE        ┌──────────┐
│  Frontend   │──────────────────────►│   Backend   │─────────────────────►│ Supabase │
│             │  /api/dependencies/   │             │                       │          │
│             │    propagate          │             │  tasks.endDate        │          │
│             │                        │             │                       │          │
│             │  Body:                 │             │◄─────────────────────│          │
│             │  {                     │             │                       └──────────┘
│             │    taskId: "t01",     │             │
│             │    newEndDate: "..."  │             │
│             │  }                     │             │
│             │                        │             │
│             │◄──────────────────────│             │
│             │  Response:             │             │
│             │  {                     │             │
│             │    success: true,      │             │
│             │    updatedTasks: [    │             │
│             │      { id, newEndDate }│             │
│             │    ]                   │             │
│             │  }                     │             │
└─────────────┘                        └─────────────┘
```

## Ciclo de Vida Completo

```
1. CARGA INICIAL
   App.jsx monta → tasks cargadas → TimelineView renderiza

2. PRIMERA RENDERIZACIÓN
   Barras con IDs → useEffect → calcular posiciones → SVG dibuja líneas

3. INTERACCIÓN USUARIO (expandir/colapsar)
   Click workstream → setExpandedWs → re-render → recalcular posiciones → actualizar líneas

4. EDICIÓN DE FECHA (futuro)
   Cambio fecha → analizar impacto → mostrar modal → confirmar → propagar → actualizar UI

5. TIEMPO REAL (con Socket.IO)
   Socket recibe update → tasks actualizadas → re-render → nuevas posiciones → nuevas líneas
```

## Optimizaciones Futuras

### 1. Memoización de Posiciones

```javascript
const taskPositions = useMemo(() => {
  // Calcular solo si cambian IDs o visibilidad
}, [taskIds, expandedWs]);
```

### 2. Refs en lugar de querySelector

```javascript
const taskRefs = useRef({});

// En render:
<div ref={el => taskRefs.current[t.id] = el}>

// En useEffect:
const rect = taskRefs.current[taskId].getBoundingClientRect();
```

### 3. Debounce de Recálculo

```javascript
const debouncedRecalc = useMemo(
  () => debounce(recalculatePositions, 100),
  []
);

useEffect(() => {
  debouncedRecalc();
}, [tasks, expandedWs]);
```

## Testing Visual

### Test 1: Línea Verde (Completada)
```
Tarea A: Diseño UI
  status: "Hecho"
  endDate: "2026-04-15"
  ────────> (Línea VERDE con flecha)

Tarea B: Frontend
  deps: ["taskaId"]
  startDate: "2026-04-16"
```

### Test 2: Línea Roja (Bloqueada)
```
Tarea C: API Backend
  status: "Bloqueado"
  endDate: "2026-03-30" (pasada)
  ────────> (Línea ROJA con flecha)

Tarea D: Integración
  deps: ["taskcId"]
  startDate: "2026-04-01"
```

### Test 3: Múltiples Dependencias
```
Tarea E ────────>
  (verde)    \
              \
Tarea F ──────── Tarea H
  (amarillo) /
            /
Tarea G ────────>
  (azul)
```

## Recursos

- **Documentación SVG**: https://developer.mozilla.org/en-US/docs/Web/SVG
- **Curvas Bezier**: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#curve_commands
- **React Refs**: https://react.dev/learn/manipulating-the-dom-with-refs
- **getBoundingClientRect**: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
