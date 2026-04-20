# Visualización de Dependencias en Timeline

## Descripción General

Se ha implementado la visualización de dependencias en el componente TimelineView con las siguientes características:

### 1. Líneas de Dependencias con SVG

- **Overlay SVG**: Se agregó una capa SVG superpuesta al timeline que dibuja líneas conectando tareas con sus dependencias
- **Flechas Direccionales**: Cada línea incluye una flecha que indica la dirección de la dependencia (de la tarea dependencia → a la tarea actual)
- **Colores Semánticos**:
  - **Verde** (`PALETTE.menthe`): Dependencia completada (status: "Hecho")
  - **Rojo** (`PALETTE.danger`): Dependencia bloqueada o vencida
  - **Amarillo** (`PALETTE.mostaza`): Dependencia en curso
  - **Azul** (`PALETTE.lagune`): Dependencia pendiente

### 2. Curvas Bezier

Las líneas de dependencia utilizan curvas Bezier para una mejor visualización:
```javascript
var midX = (sourcePos.endX + targetPos.x) / 2;
var path = "M " + sourcePos.endX + " " + sourcePos.y +
          " Q " + midX + " " + sourcePos.y + " " +
          midX + " " + ((sourcePos.y + targetPos.y) / 2) +
          " T " + (targetPos.x - 8) + " " + targetPos.y;
```

### 3. Rastreo de Posiciones

- Se agregaron IDs únicos a cada barra de tarea: `task-bar-{taskId}`
- Un efecto `useEffect` calcula las posiciones de todas las barras visibles
- Las posiciones se almacenan en el estado `taskPositions` para dibujar las líneas

### 4. Modal de Impacto de Dependencias

Se creó el componente `DependencyImpactModal` que:
- Muestra el impacto de cambiar la fecha de finalización de una tarea
- Lista todas las tareas que serán afectadas
- Permite confirmar o cancelar el cambio
- Se integra con la API `/api/dependencies/analyze-impact`

## Modificaciones Realizadas en App.jsx

### Componente TimelineView

#### Estados Agregados:
```javascript
var [depImpactModal, setDepImpactModal] = useState(null);
var [impactData, setImpactData] = useState(null);
var [taskPositions, setTaskPositions] = useState({});
```

#### Funciones Agregadas:

1. **getDependencyColor(depTask)**: Determina el color de la línea según el estado de la dependencia
2. **analyzeImpact(taskId, newEndDate)**: Llama a la API para analizar el impacto
3. **propagateDependencies(taskId, newEndDate)**: Llama a la API para propagar cambios

#### Estructura HTML:
```javascript
<div className="timeline-container">
  {/* SVG overlay para líneas de dependencias */}
  <svg>...</svg>

  {/* Contenido del timeline con zIndex: 2 */}
  <div>...</div>
</div>
```

### Componente DependencyImpactModal

Modal separado que muestra:
- Título y descripción del impacto
- Nueva fecha de finalización
- Lista de tareas afectadas con sus cambios de fecha
- Botones de Cancelar y Confirmar

## APIs Utilizadas

### 1. Analizar Impacto
```
POST /api/dependencies/analyze-impact
Body: { taskId: string, newEndDate: string }
Response: { affectedTasks: [{ name, oldEndDate, newEndDate }] }
```

### 2. Propagar Dependencias
```
POST /api/dependencies/propagate
Body: { taskId: string, newEndDate: string }
Response: { success: boolean, updatedTasks: [...] }
```

## Integración con TaskModal (Pendiente)

Para completar la funcionalidad, se debe integrar el modal de impacto al editar fechas en TaskModal:

```javascript
// En TaskModal, al cambiar endDate:
<input type="date" value={form.endDate} onChange={async function(e) {
  var newDate = e.target.value;

  // Si la tarea tiene dependencias que la bloquean, analizar impacto
  var blockedTasks = tasks.filter(t => t.deps && t.deps.includes(form.id));

  if (blockedTasks.length > 0) {
    var impact = await analyzeImpact(form.id, newDate);
    // Mostrar modal de impacto
    setDepImpactModal({ task: form, newEndDate: newDate });
    setImpactData(impact);
  } else {
    set("endDate", newDate);
  }
}} />
```

## Archivos Modificados

1. **`/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app/frontend/src/App.jsx`**
   - Agregado overlay SVG en TimelineView
   - Agregadas funciones de análisis de impacto
   - Agregado componente DependencyImpactModal
   - Agregados IDs a barras de tareas
   - Agregado efecto para rastrear posiciones

## Archivos Creados

1. **`/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app/frontend/src/components/TimelineWithDependencies.jsx`**
   - Versión standalone del componente con todas las funcionalidades
   - Puede usarse como referencia o reemplazo del TimelineView actual

## Próximos Pasos

1. **Integrar modal con TaskModal**: Hacer que el modal de impacto se muestre al cambiar fechas en el modal de edición
2. **Agregar interactividad**: Permitir hover sobre líneas para ver detalles de dependencias
3. **Optimizar rendering**: Usar refs en lugar de querySelector para mejor performance
4. **Agregar tests**: Crear tests unitarios para las funciones de dependencias

## Demostración Visual

### Ejemplo de Dependencia Completada (Verde)
```
Tarea A (Completada) ──────> Tarea B
         (verde)
```

### Ejemplo de Dependencia Bloqueada (Rojo)
```
Tarea C (Vencida) ──────> Tarea D
       (rojo)
```

### Ejemplo de Dependencia En Curso (Amarillo)
```
Tarea E (En curso) ──────> Tarea F
        (amarillo)
```

## Notas Técnicas

- Las líneas se dibujan desde el final de la barra de la tarea dependencia hacia el centro de la barra de la tarea dependiente
- El SVG tiene `pointerEvents: "none"` para no interferir con la interacción del usuario
- Los elementos del timeline tienen `zIndex: 2` para aparecer sobre el SVG
- El efecto de cálculo de posiciones se ejecuta cuando cambian: `tasks`, `expandedWs`, o `grouped`

## Compatibilidad

- Requiere navegadores modernos con soporte para SVG
- Compatible con React 18+
- No requiere librerías adicionales
