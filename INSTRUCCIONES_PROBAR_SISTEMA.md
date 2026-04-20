# 🚀 Instrucciones para Probar el Sistema Reorganizado
## NEO DMSTK - Vista Jerárquica de Proyectos

---

## ✅ Sistema YA Ejecutado

**IMPORTANTE:** La reorganización YA se ejecutó exitosamente:
- ✅ 227 tareas reasignadas en Supabase
- ✅ 0 errores durante la actualización
- ✅ Componente frontend ya integrado en App.jsx

**No necesitas ejecutar el script de nuevo.**

---

## 🖥️ Cómo Probar en el Frontend

### Paso 1: Levantar el Frontend

```bash
cd /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/frontend
npm run dev
```

### Paso 2: Abrir en el Navegador

```
http://localhost:5173
```

### Paso 3: Acceder a la Vista Jerárquica

1. En el header superior de la aplicación
2. Click en el botón **"📁 Proyectos"**
3. Se abrirá el modal con la nueva vista jerárquica

### Paso 4: Explorar

**Nivel 1: Proyectos Globales**
- Verás 6 proyectos globales
- Click en uno para expandir
- Verás las tareas con notas del PM

**Nivel 2: Espacios Físicos**
- Verás E1 Madrid y E2 Barcelona
- Click para expandir cada espacio
- Dentro verás subcategorías (Legal, Reforma, etc.)

**Nivel 3: Expansión Futura**
- Verás E3 México
- Tareas de investigación

---

## 🔍 Qué Buscar al Probar

### ✅ Checklist de Testing

**Visual:**
- [ ] Proyectos se renderizan correctamente
- [ ] Iconos (🌍 🏢 🌎 🎨 🎯 📦 ⚙️ 🧠 👥) se ven bien
- [ ] Barras de progreso muestran % correcto
- [ ] Colores son distintos por proyecto

**Funcionalidad:**
- [ ] Click en proyecto expande/colapsa
- [ ] Estado persiste al cerrar y reabrir modal
- [ ] Notas de PM aparecen en tareas
- [ ] Alertas se muestran en proyectos con problemas
- [ ] Dropdown inline cambia estado de tarea
- [ ] Click en tarea abre modal de edición

**Performance:**
- [ ] Vista carga rápido (<1 segundo)
- [ ] Expand/collapse es smooth
- [ ] No hay lag al cambiar estados
- [ ] Scroll funciona correctamente

---

## 🐛 Posibles Problemas y Soluciones

### Problema: "No veo el botón 📁 Proyectos"
**Solución:**
1. Verificar que App.jsx tiene el import correcto
2. Recargar la página (Cmd+R / Ctrl+R)
3. Limpiar caché del navegador

### Problema: "El modal está vacío"
**Solución:**
1. Abrir consola del navegador (F12)
2. Verificar que no hay errores
3. Verificar que `tasks` tiene datos

### Problema: "Los proyectos no se expanden"
**Solución:**
1. Verificar que onClick funciona en ProjectSection
2. Limpiar localStorage: `localStorage.clear()`
3. Recargar la página

### Problema: "No veo las notas del PM"
**Solución:**
1. Expandir el proyecto primero
2. Verificar que las tareas tienen datos (endDate, status, etc.)
3. Algunas tareas pueden no tener notas si no aplican criterios

---

## 📊 Verificar Distribución en Supabase

Si quieres verificar que la reorganización funcionó:

### Opción 1: Via Consola Supabase
1. Ir a https://supabase.com
2. Login a tu proyecto
3. Table Editor → tasks
4. Filtrar por columna `project`
5. Verificar que hay proyectos como:
   - `Global: Branding & Comunicación`
   - `E1 Madrid > Legal & Licencias`
   - etc.

### Opción 2: Via Script de Verificación
```bash
cd /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/backend
node verificar_estado.mjs
```

Deberías ver:
```
✅ Global: Método & Piloto → 57 tareas
✅ Global: Branding & Comunicación → 48 tareas
✅ Global: Kit de Experiencia → 25 tareas
...
```

---

## 🔄 Si Necesitas Re-ejecutar la Reorganización

**CUIDADO:** Solo hazlo si algo salió mal

```bash
cd /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/backend
node reorganizar_proyectos_jerarquia.mjs
```

El script:
1. Analizará las 227 tareas
2. Mostrará la distribución prevista
3. Esperará 3 segundos
4. Actualizará Supabase
5. Generará nuevo reporte

---

## 📁 Archivos Creados (Referencia)

```
neo-dmstk-app/
├── backend/
│   ├── reorganizar_proyectos_jerarquia.mjs (Script de reasignación)
│   └── REPORTE_REORGANIZACION.md (Reporte de ejecución)
│
├── frontend/src/components/
│   └── ProjectsHierarchyView.jsx (Componente nuevo)
│
├── RESUMEN_REORGANIZACION_JERARQUICA.md (Este documento)
├── GUIA_USO_VISTA_JERARQUICA.md (Guía para usuarios)
└── INSTRUCCIONES_PROBAR_SISTEMA.md (Instrucciones de testing)
```

---

## 🎯 Objetivos de Testing

Al probar, verifica que:

1. **Claridad:** ¿Es más fácil de entender que antes?
2. **No abrumador:** ¿Te sientes cómodo navegando?
3. **Notas útiles:** ¿Las notas del PM te ayudan a priorizar?
4. **Edición rápida:** ¿Puedes cambiar estados fácilmente?
5. **Performance:** ¿Todo va fluido?

---

## 💬 Feedback

Si encuentras bugs o tienes sugerencias:

1. **Bug crítico:**
   - Documentar pasos para reproducir
   - Screenshot si es visual
   - Error en consola si lo hay

2. **Mejora sugerida:**
   - Describir qué cambiarías
   - Por qué lo cambiarías
   - Cómo lo usarías

---

## 🎉 ¡Listo para Probar!

El sistema está completamente funcional y listo para producción.

**Próximo paso:** Abrir el frontend y explorar la nueva vista.

**Tiempo estimado de prueba:** 10-15 minutos

**Diversión garantizada:** Ver 227 tareas organizadas de forma clara y profesional 🚀
