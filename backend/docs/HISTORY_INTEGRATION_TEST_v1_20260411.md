# Historia de Versiones - Guía de Testing

## Prerequisitos

### 1. Ejecutar la migración de la base de datos
Antes de probar el sistema de historial, debes actualizar la tabla `activity_log` en Supabase:

1. Abre tu dashboard de Supabase
2. Ve a SQL Editor
3. Ejecuta el archivo `migration-activity-log.sql`
4. Verifica que la tabla se creó correctamente:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'activity_log';
   ```

### 2. Iniciar los servidores

**Backend:**
```bash
cd backend
npm start
# Debería mostrar: 🚀 Servidor corriendo en puerto 3001
```

**Frontend:**
```bash
cd frontend
npm run dev
# Debería abrir en http://localhost:5173
```

## Tests de Integración

### Test 1: Crear una nueva tarea (acción 'created')

1. Abre la aplicación en el navegador
2. Haz clic en el botón "Nueva tarea"
3. Completa los campos:
   - Nombre: "Test Historia"
   - Workstream: Selecciona cualquiera
   - Estado: "Pendiente"
   - Prioridad: "Alta"
   - Fechas: Selecciona fechas válidas
   - Owner: Selecciona un owner
4. Haz clic en "Guardar"
5. **Verificación:**
   - La tarea debe aparecer en la lista
   - En la consola del backend debería aparecer un log de creación

### Test 2: Ver historial global del proyecto

1. Haz clic en el botón de "History" (icono de reloj) en el header
2. **Verificación esperada:**
   - Se abre un panel lateral a la derecha
   - El título dice "Historial del proyecto"
   - Aparece la entrada "Usuario creó la tarea" para la tarea recién creada
   - Muestra el icono ✨ (created)
   - Muestra el tiempo relativo ("hace unos segundos")

### Test 3: Actualizar una tarea (acción 'updated')

1. Haz clic en la tarea "Test Historia" para editarla
2. Cambia el estado de "Pendiente" a "En curso"
3. Cambia la prioridad de "Alta" a "Media"
4. Guarda los cambios
5. **Verificación:**
   - Abre el historial (botón History)
   - Deberías ver DOS nuevas entradas:
     - "Usuario cambió el estado de 'Pendiente' a 'En curso'"
     - "Usuario modificó Prioridad"

### Test 4: Ver diff de cambios

1. Con el historial abierto
2. Haz clic en una de las entradas de actualización
3. **Verificación:**
   - Se expande mostrando el diff visual
   - Para el cambio de estado, deberías ver:
     - Antes: "Pendiente" (en rojo)
     - Después: "En curso" (en verde)
   - Aparece un botón "Restaurar a esta versión"

### Test 5: Restaurar una versión anterior (acción 'restored')

1. En el historial, expande la primera entrada de actualización
2. Haz clic en "Restaurar a esta versión"
3. Confirma la acción
4. **Verificación:**
   - Aparece alerta "✅ Tarea restaurada exitosamente"
   - La tarea vuelve al estado anterior
   - En el historial aparece una nueva entrada con acción 'restored'
   - Icono ↩️

### Test 6: Eliminar una tarea (acción 'deleted')

1. En la lista de tareas, haz clic en el icono de basura de la tarea "Test Historia"
2. Confirma la eliminación
3. Abre el historial global
4. **Verificación:**
   - La tarea ya no aparece en la lista
   - En el historial aparece "Usuario eliminó la tarea"
   - Icono 🗑️
   - La entrada muestra el estado completo de la tarea antes de eliminarse

### Test 7: Múltiples cambios consecutivos

1. Crea una nueva tarea
2. Actualiza varios campos en secuencia:
   - Cambiar nombre
   - Cambiar fechas
   - Añadir dependencias
   - Cambiar owner
3. **Verificación:**
   - Cada cambio genera una entrada separada en el historial
   - Los cambios están ordenados cronológicamente (más reciente arriba)
   - Los tiempos relativos se actualizan correctamente

### Test 8: Filtros de historial

1. Con el historial abierto y múltiples entradas
2. Prueba los 3 filtros:
   - **Todos**: Muestra todas las entradas
   - **Actualizaciones**: Solo muestra entradas 'updated'
   - **Cambios mayores**: Muestra 'created', 'deleted', 'restored'
3. **Verificación:**
   - Los filtros funcionan correctamente
   - La lista se actualiza al cambiar de filtro

## Verificación en Base de Datos

Ejecuta estos queries en Supabase SQL Editor:

```sql
-- Ver todas las entradas del historial
SELECT
  id,
  task_id,
  user_name,
  action,
  field,
  old_value,
  new_value,
  timestamp
FROM activity_log
ORDER BY timestamp DESC
LIMIT 20;

-- Contar entradas por tipo de acción
SELECT
  action,
  COUNT(*) as count
FROM activity_log
GROUP BY action;

-- Ver historial de una tarea específica
SELECT
  action,
  field,
  old_value,
  new_value,
  user_name,
  timestamp
FROM activity_log
WHERE task_id = 'TU_TASK_ID_AQUI'
ORDER BY timestamp DESC;
```

## Problemas Comunes

### El historial está vacío
- Verifica que ejecutaste la migración de la base de datos
- Revisa la consola del backend para errores
- Verifica que Supabase está conectado correctamente

### Error al restaurar
- Asegúrate de que el objeto `user` se está pasando correctamente
- Verifica que la tarea existe en la base de datos
- Revisa los logs del backend

### Los cambios no se registran
- Verifica que los socket handlers tienen el código de logging
- Revisa que `logChange` está importado en server.js
- Comprueba que no hay errores en la consola del backend

## Resultado Esperado

Al finalizar todos los tests exitosamente:

✅ El sistema registra automáticamente cada acción (crear, actualizar, eliminar)
✅ El historial muestra quién hizo qué y cuándo
✅ Los diffs visuales muestran claramente los cambios
✅ La restauración funciona y genera su propia entrada en el historial
✅ El botón peligroso "reset" ha sido reemplazado por el botón "History"
✅ El panel lateral se abre y cierra correctamente
✅ Los filtros funcionan para organizar el historial

## Archivos Modificados

### Backend
- `/backend/server.js` - Integración de logChange en socket handlers
- `/backend/modules/history/history.service.js` - Ya existía
- `/backend/routes/history.routes.js` - Ya existía
- `/backend/migration-activity-log.sql` - **NUEVO** - Migración de schema

### Frontend
- `/frontend/src/App.jsx` - Integración de HistoryViewer y reemplazo de botón reset
- `/frontend/src/modules/History/HistoryViewer.jsx` - Actualizado para soportar historial global

## Próximos Pasos (Opcional)

- [ ] Añadir autenticación real para usuarios
- [ ] Implementar permisos de restauración (solo admins)
- [ ] Añadir búsqueda en el historial
- [ ] Exportar historial a PDF/CSV
- [ ] Notificaciones cuando alguien restaura una tarea
- [ ] Vista de timeline visual del historial
