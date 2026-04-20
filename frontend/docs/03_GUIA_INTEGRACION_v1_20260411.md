# Guía de Integración - Visualización de Dependencias

## Estado Actual de la Implementación

✅ **COMPLETADO**:
1. Capa SVG overlay con líneas de dependencias
2. IDs únicos en barras de tareas (`task-bar-{id}`)
3. Cálculo de posiciones con `useEffect`
4. Colores semánticos (Verde/Rojo/Azul/Amarillo)
5. Flechas direccionales en líneas
6. Componente `DependencyImpactModal`
7. Funciones API: `analyzeImpact` y `propagateDependencies`

## Cómo Funciona

### 1. Visualización Automática

Las líneas de dependencias se dibujan automáticamente cuando:
- Una tarea tiene el campo `deps: ["taskId1", "taskId2"]`
- Las tareas están visibles en el timeline (workstream expandido)
- Las posiciones de las barras están calculadas

### 2. Flujo de Renderizado

```
1. Tasks se renderizan →
2. useEffect detecta cambios →
3. Calcula posiciones de barras →
4. SVG dibuja líneas conectando dependencias
```

### 3. Ejemplo de Uso Básico

Si tienes estas tareas:

```javascript
tasks = [
  {
    id: "t01",
    name: "Diseño UI",
    status: "Hecho",
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    deps: []
  },
  {
    id: "t02",
    name: "Implementación Frontend",
    status: "En curso",
    startDate: "2026-04-16",
    endDate: "2026-05-01",
    deps: ["t01"] // Depende de Diseño UI
  },
  {
    id: "t03",
    name: "Testing",
    status: "Pendiente",
    startDate: "2026-05-02",
    endDate: "2026-05-15",
    deps: ["t02"] // Depende de Implementación
  }
]
```

**Resultado Visual**:
```
Diseño UI (verde) ──────> Implementación (amarillo) ──────> Testing (azul)
```

## Integración Completa con Modal de Impacto

### Paso 1: Agregar Handler al Cambio de Fecha

En el componente `TaskModal`, modificar el input de fecha de fin:

```javascript
// ANTES:
<input type="date" value={form.endDate}
  onChange={function(e) { set("endDate", e.target.value); }} />

// DESPUÉS:
<input type="date" value={form.endDate}
  onChange={async function(e) {
    var newDate = e.target.value;
    var oldDate = form.endDate;

    // Solo analizar si hay cambio y la tarea ya existe
    if (newDate !== oldDate && !isNew) {
      // Buscar tareas que dependen de esta
      var blockedTasks = tasks.filter(t =>
        t.deps && t.deps.includes(form.id)
      );

      if (blockedTasks.length > 0) {
        // Analizar impacto
        try {
          const impact = await fetch(BACKEND_URL + '/api/dependencies/analyze-impact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: form.id,
              newEndDate: newDate
            })
          }).then(r => r.json());

          // Mostrar modal de impacto
          setDepImpactModal({
            task: form,
            newEndDate: newDate,
            impact: impact
          });
        } catch (error) {
          console.error('Error analyzing impact:', error);
          set("endDate", newDate); // Aplicar cambio de todas formas
        }
      } else {
        set("endDate", newDate); // No hay dependencias, aplicar directamente
      }
    } else {
      set("endDate", newDate);
    }
  }}
/>
```

### Paso 2: Manejar el Modal en TaskModal

Agregar al componente `TaskModal`:

```javascript
function TaskModal({ task, owners, addOwner, tasks, onSave, onClose }) {
  var [form, setForm] = useState({ ...task });
  var [depImpactModal, setDepImpactModal] = useState(null); // NUEVO
  var isNew = !task.id;

  // ... resto del código ...

  return (
    <>
      <div style={{ /* ... modal principal ... */ }}>
        {/* ... contenido del modal ... */}
      </div>

      {/* Modal de impacto de dependencias */}
      {depImpactModal && (
        <DependencyImpactModal
          task={depImpactModal.task}
          newEndDate={depImpactModal.newEndDate}
          impactData={depImpactModal.impact}
          onConfirm={async function() {
            // Propagar cambios a dependencias
            try {
              await fetch(BACKEND_URL + '/api/dependencies/propagate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  taskId: form.id,
                  newEndDate: depImpactModal.newEndDate
                })
              });

              // Aplicar cambio local
              set("endDate", depImpactModal.newEndDate);
              setDepImpactModal(null);
            } catch (error) {
              console.error('Error propagating:', error);
            }
          }}
          onCancel={function() {
            setDepImpactModal(null);
          }}
        />
      )}
    </>
  );
}
```

## API Backend Requerida

### Endpoint 1: Analizar Impacto

```javascript
// POST /api/dependencies/analyze-impact
app.post('/api/dependencies/analyze-impact', async (req, res) => {
  const { taskId, newEndDate } = req.body;

  try {
    // Obtener todas las tareas
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*');

    // Encontrar tareas que dependen de esta
    const affectedTasks = tasks
      .filter(t => t.deps && t.deps.includes(taskId))
      .map(t => {
        // Calcular nueva fecha basada en el retraso
        const sourceTask = tasks.find(st => st.id === taskId);
        const oldEndDate = new Date(sourceTask.endDate);
        const newEnd = new Date(newEndDate);
        const delay = Math.ceil((newEnd - oldEndDate) / (1000 * 60 * 60 * 24));

        const taskOldEnd = new Date(t.endDate);
        const taskNewEnd = new Date(taskOldEnd.getTime() + delay * 24 * 60 * 60 * 1000);

        return {
          id: t.id,
          name: t.name,
          oldEndDate: t.endDate,
          newEndDate: taskNewEnd.toISOString().split('T')[0]
        };
      });

    res.json({ affectedTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Endpoint 2: Propagar Dependencias

```javascript
// POST /api/dependencies/propagate
app.post('/api/dependencies/propagate', async (req, res) => {
  const { taskId, newEndDate } = req.body;

  try {
    // Obtener todas las tareas
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*');

    const sourceTask = tasks.find(t => t.id === taskId);
    const oldEndDate = new Date(sourceTask.endDate);
    const newEnd = new Date(newEndDate);
    const delay = Math.ceil((newEnd - oldEndDate) / (1000 * 60 * 60 * 24));

    // Actualizar tarea fuente
    await supabase
      .from('tasks')
      .update({ endDate: newEndDate })
      .eq('id', taskId);

    // Propagar a tareas dependientes
    const affectedTasks = tasks.filter(t => t.deps && t.deps.includes(taskId));
    const updates = [];

    for (const task of affectedTasks) {
      const taskOldEnd = new Date(task.endDate);
      const taskNewEnd = new Date(taskOldEnd.getTime() + delay * 24 * 60 * 60 * 1000);
      const newEndDateStr = taskNewEnd.toISOString().split('T')[0];

      await supabase
        .from('tasks')
        .update({ endDate: newEndDateStr })
        .eq('id', task.id);

      updates.push({ id: task.id, newEndDate: newEndDateStr });
    }

    res.json({ success: true, updatedTasks: updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Testing

### Test Manual 1: Visualización de Líneas

1. Crear dos tareas en el timeline
2. Editar la segunda tarea y agregar dependencia a la primera
3. Verificar que aparece una línea conectando las barras
4. Cambiar el estado de la primera tarea a "Hecho"
5. Verificar que la línea cambia a color verde

### Test Manual 2: Modal de Impacto

1. Crear Tarea A con endDate: 2026-04-15
2. Crear Tarea B con deps: ["Tarea A"] y endDate: 2026-04-20
3. Editar Tarea A y cambiar endDate a 2026-04-20 (5 días de retraso)
4. Verificar que aparece el modal mostrando que Tarea B será afectada
5. Confirmar cambio
6. Verificar que Tarea B ahora tiene endDate: 2026-04-25

## Troubleshooting

### Las líneas no se muestran

- ✅ Verificar que las tareas tienen `deps` correctamente definidos
- ✅ Verificar que el workstream está expandido
- ✅ Abrir DevTools y revisar `taskPositions` en estado
- ✅ Verificar que los IDs `task-bar-{id}` existen en el DOM

### El modal no aparece

- ✅ Verificar que BACKEND_URL está definido
- ✅ Verificar que la API responde correctamente
- ✅ Verificar que hay tareas dependientes
- ✅ Revisar consola de errores

### Las posiciones son incorrectas

- ✅ Verificar que `.timeline-container` existe
- ✅ Esperar a que el DOM esté completamente renderizado
- ✅ Agregar un setTimeout de 100ms antes de calcular posiciones

## Mejoras Futuras

1. **Caché de Posiciones**: Guardar posiciones calculadas para evitar recálculos innecesarios
2. **Animaciones**: Animar la aparición/desaparición de líneas
3. **Hover Effects**: Mostrar tooltip con detalles al pasar sobre una línea
4. **Edición Drag & Drop**: Permitir cambiar fechas arrastrando barras
5. **Vista de Camino Crítico**: Resaltar la cadena de dependencias más larga
6. **Exportar a PDF**: Incluir las líneas de dependencias en la exportación

## Soporte

Para preguntas o problemas, revisar:
- `/frontend/DEPENDENCY_VISUALIZATION.md` - Documentación técnica detallada
- `/frontend/src/components/TimelineWithDependencies.jsx` - Implementación standalone
- Console del navegador para errores de renderizado
