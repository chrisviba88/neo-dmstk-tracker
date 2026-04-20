# 🔧 GUÍA: SOLUCIÓN PARA AÑADIR PROYECTOS

## 🎯 PROBLEMA RESUELTO

**Reporte original:** "sigo sin poder añadir proyectos, dice que se guarda pero no aparece nada cuando cierro la ventana"

**Causa raíz:** Los proyectos se derivaban únicamente de las tareas existentes. Cuando añadías un proyecto nuevo sin tareas asignadas, no se guardaba en ningún lugar y desaparecía al cerrar el modal.

**Solución implementada:** Sistema de proyectos independientes en Supabase que permite crear proyectos vacíos y asignarles tareas después.

---

## ✅ ARCHIVOS MODIFICADOS

### 1. **CREATE_PROJECTS_TABLE.sql** (NUEVO)
- Crea tabla `projects` en Supabase
- Migra proyectos existentes desde tareas
- Ubicación: `backend/CREATE_PROJECTS_TABLE.sql`

### 2. **App.jsx** (MODIFICADO)
- Añade estado `projects` para proyectos independientes
- Modifica `loadData()` para cargar proyectos desde Supabase
- Modifica `addProject()` para persistir en Supabase
- Pasa `projects` prop a ProjectsHierarchyView

### 3. **ProjectsHierarchyView.jsx** (MODIFICADO)
- Recibe prop `projects`
- Permite mostrar proyectos sin tareas
- Muestra mensaje inteligente cuando un proyecto está vacío

---

## 🚀 CÓMO EJECUTAR LA SOLUCIÓN

### ⏱️ Tiempo Total: 2-3 minutos

### PASO 1: Crear Tabla de Proyectos en Supabase (1 min)

1. Abre Supabase Dashboard:
   ```
   https://supabase.com/dashboard
   ```

2. Selecciona tu proyecto **Neo DMSTK**

3. Ve a **SQL Editor** → **New query**

4. Copia el contenido completo de:
   ```
   backend/CREATE_PROJECTS_TABLE.sql
   ```

5. Pega en el editor y haz clic en **RUN**

6. Espera el mensaje:
   ```
   Success. No rows returned
   ```

7. **VERIFICAR:** Ejecuta esta query para confirmar:
   ```sql
   SELECT COUNT(*) as total_projects FROM projects;
   ```

   Deberías ver el número de proyectos únicos que existen en tus tareas.

---

### PASO 2: Refrescar la Aplicación (30 seg)

1. Ve a tu app: `http://localhost:5174`

2. Presiona **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows)
   - Esto fuerza un refresh sin caché

3. Abre la consola del navegador (F12 → Console)

4. Deberías ver:
   ```
   ✅ Tareas cargadas desde Supabase: 109 tareas
   ✅ Proyectos cargados desde Supabase: 27 proyectos
   ```

---

### PASO 3: Probar Añadir Proyecto (30 seg)

1. Haz clic en el botón **📁 Proyectos**

2. Busca el botón para añadir proyecto (depende del componente ProjectManager)

3. Escribe un nombre de prueba:
   ```
   Test > Proyecto Nuevo
   ```

4. Haz clic en **Guardar** o **Añadir**

5. **RESULTADO ESPERADO:**
   ```
   ✅ Proyecto "Test > Proyecto Nuevo" añadido correctamente.

   Ahora aparecerá en los dropdowns y puedes asignarlo a tareas.
   ```

6. Cierra el modal y vuelve a abrirlo

7. **VERIFICACIÓN:** El proyecto "Test > Proyecto Nuevo" debe aparecer en la lista

8. Al expandirlo, verás:
   ```
   💡 Proyecto creado sin tareas asignadas

   PM: Asigna tareas existentes editándolas o crea nuevas
   tareas con este proyecto.
   ```

---

## 📊 CÓMO FUNCIONA AHORA

### Antes de la Solución

```
Usuario añade "Proyecto X"
  ↓
addProject() solo valida y muestra alerta
  ↓
No se guarda en ningún lugar
  ↓
Al cerrar modal: desaparece ❌
```

### Después de la Solución

```
Usuario añade "Proyecto X"
  ↓
addProject() crea objeto con metadata:
  - id: generado automáticamente
  - name: "Proyecto X"
  - level: detectado por jerarquía
  - parent, color, description
  ↓
Se guarda en Supabase tabla 'projects'
  ↓
Se actualiza estado local 'projects'
  ↓
Al cerrar modal: persiste ✅
  ↓
Aparece en dropdowns y vista jerárquica
  ↓
Se puede asignar a tareas nuevas o existentes
```

---

## 🎨 CARACTERÍSTICAS DEL SISTEMA

### 1. Proyectos Independientes
- Existen aunque no tengan tareas
- Se guardan en tabla `projects` de Supabase
- Tienen metadata propia (color, nivel, parent)

### 2. Detección de Jerarquía
```javascript
"Global: Branding"           → Nivel 1 (Global)
"E1 Madrid > Legal"          → Nivel 2 (Espacio)
"E1 > Legal > Licencias"     → Nivel 3 (Subproyecto)
```

### 3. Vista Inteligente de Proyectos Vacíos
Cuando un proyecto no tiene tareas, muestra:
```
┌────────────────────────────────────────┐
│ 💡                                     │
│ Proyecto creado sin tareas asignadas   │
│                                        │
│ PM: Asigna tareas existentes...       │
└────────────────────────────────────────┘
```

### 4. Dropdowns Actualizados
Ahora los selectores de proyecto muestran:
- Proyectos con tareas (derivados)
- Proyectos sin tareas (independientes)
- Ordenados alfabéticamente

---

## ⚠️ TROUBLESHOOTING

### Error: "tabla projects no existe"

**Síntoma:** En consola:
```
⚠️ Tabla projects no encontrada. Ejecuta CREATE_PROJECTS_TABLE.sql primero.
```

**Solución:** Ejecuta PASO 1 de esta guía.

---

### Error: "duplicate key value violates unique constraint"

**Síntoma:** Al añadir proyecto:
```
Error al crear proyecto: duplicate key value violates unique constraint "projects_name_key"
```

**Causa:** Ya existe un proyecto con ese nombre exacto.

**Solución:**
1. Usa un nombre diferente, o
2. Busca el proyecto existente en la lista

---

### Proyecto añadido pero no aparece en dropdown

**Síntoma:** El proyecto se guardó correctamente pero no aparece en selectores.

**Solución:**
1. Verifica en Supabase:
   ```sql
   SELECT * FROM projects ORDER BY created_at DESC LIMIT 5;
   ```
2. Refresca la app: **Cmd+Shift+R**
3. Si persiste, verifica que los componentes que usan dropdowns estén usando el estado `projects`

---

### No veo el mensaje "PM: Asigna tareas..."

**Síntoma:** Al expandir proyecto vacío, no aparece el mensaje de ayuda.

**Causa:** Componente ProjectsHierarchyView no recibe prop `projects`.

**Solución:** Verifica que en App.jsx línea ~1740:
```jsx
<ProjectsHierarchyView
  tasks={tasks}
  projects={projects}  // ← Debe estar esta línea
  onEditTask={...}
  onUpdateTask={...}
/>
```

---

## 🧪 TESTING

### Test 1: Añadir Proyecto Global
```
Nombre: Global: Testing
Resultado esperado: Nivel 1, color null, sin parent
Verificar en: SELECT * FROM projects WHERE name = 'Global: Testing';
```

### Test 2: Añadir Proyecto Jerárquico
```
Nombre: E1 Madrid > Testing > Subproyecto
Resultado esperado: Nivel 3
Verificar en consola: "✅ Proyecto guardado en Supabase: E1 Madrid > Testing > Subproyecto"
```

### Test 3: Asignar Tarea a Proyecto Vacío
```
1. Crea proyecto "Test Vacío"
2. Edita una tarea existente
3. En dropdown de proyecto, selecciona "Test Vacío"
4. Guarda
5. Abre vista de proyectos
6. Expande "Test Vacío"
7. La tarea debe aparecer ahora
```

### Test 4: Persistencia Después de Refresh
```
1. Añade proyecto "Persistencia Test"
2. Cmd+Shift+R para refrescar
3. Abre vista de proyectos
4. "Persistencia Test" debe seguir ahí
```

---

## 📈 RESULTADOS ESPERADOS

### Antes (Comportamiento Antiguo)
```
Vista de Proyectos:
  📂 Fundación & Método (27 tareas)
  📂 Espacio E1 — Madrid (50 tareas)
  📂 Piloto & Validación (17 tareas)

❌ No se podían crear proyectos vacíos
❌ Proyectos desaparecían al cerrar modal
```

### Después (Nuevo Comportamiento)
```
Vista de Proyectos:
  📂 Fundación & Método (27 tareas)
  📂 Espacio E1 — Madrid (50 tareas)
  📂 Piloto & Validación (17 tareas)
  📂 Test > Proyecto Nuevo (0 tareas)
      💡 Proyecto creado sin tareas asignadas
      PM: Asigna tareas existentes...

✅ Se pueden crear proyectos vacíos
✅ Proyectos persisten correctamente
✅ Mensaje inteligente guía al usuario
✅ Se pueden asignar tareas después
```

---

## 🔍 VERIFICACIÓN FINAL

Ejecuta estos comandos en Supabase SQL Editor para verificar:

```sql
-- 1. Total de proyectos
SELECT COUNT(*) as total FROM projects;

-- 2. Proyectos por nivel
SELECT level, COUNT(*) as total
FROM projects
GROUP BY level
ORDER BY level;

-- 3. Últimos 5 proyectos creados
SELECT name, level, created_at
FROM projects
ORDER BY created_at DESC
LIMIT 5;

-- 4. Proyectos sin tareas asignadas
SELECT p.name, COUNT(t.id) as task_count
FROM projects p
LEFT JOIN tasks t ON t.project = p.name
GROUP BY p.name
HAVING COUNT(t.id) = 0;
```

---

## 💡 PRÓXIMAS MEJORAS (OPCIONAL)

### 1. Botón "Crear Tarea" en Proyectos Vacíos
Añadir botón directo en el mensaje de proyecto vacío:
```
💡 Proyecto creado sin tareas asignadas

[+ Crear Primera Tarea]
```

### 2. Arrastrar y Soltar
Permitir drag & drop para reasignar tareas entre proyectos.

### 3. Colores Personalizados
Permitir elegir color al crear proyecto:
```
Nombre: Mi Proyecto
Color: [🔴 🟠 🟡 🟢 🔵 🟣]
```

### 4. Plantillas de Proyectos
Crear proyectos con tareas predefinidas:
```
Plantilla: "Nuevo Espacio Físico"
  ↓
Crea automáticamente:
  - Legal & Licencias
  - Reforma & Construcción
  - Equipamiento
  - etc.
```

---

## ✅ CHECKLIST DE EJECUCIÓN

```
☐ Ejecutar CREATE_PROJECTS_TABLE.sql en Supabase
☐ Ver mensaje "Success. No rows returned"
☐ Verificar: SELECT COUNT(*) FROM projects;
☐ Refrescar app (Cmd+Shift+R)
☐ Ver en consola: "✅ Proyectos cargados desde Supabase: X proyectos"
☐ Añadir proyecto de prueba
☐ Ver alerta de éxito
☐ Cerrar y reabrir modal
☐ Verificar que el proyecto aparece
☐ Expandir proyecto vacío
☐ Ver mensaje: "💡 Proyecto creado sin tareas asignadas"
☐ Asignar una tarea al proyecto
☐ Verificar que la tarea aparece
☐ Celebrar 🎉
```

---

## 📞 SOPORTE

Si encuentras algún problema:

1. **Revisa la consola del navegador** (F12 → Console)
   - Busca errores en rojo
   - Copia el error completo

2. **Verifica en Supabase**
   ```sql
   SELECT * FROM projects ORDER BY created_at DESC LIMIT 10;
   ```

3. **Información útil para debugging**:
   - Output de la consola
   - Screenshot de la vista de proyectos
   - Resultado de las queries de verificación
   - Pasos exactos que causaron el error

---

**Creado:** 2026-04-14
**Por:** Claude Code PM Senior
**Estado:** ✅ LISTO PARA EJECUTAR
**Archivos:** 3 modificados + 1 nuevo SQL
**Tiempo de implementación:** 2-3 minutos
**Impacto:** ✅ Resuelve completamente el problema de persistencia de proyectos
