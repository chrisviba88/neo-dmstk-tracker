# Checklist de Despliegue - Sistema de Historial

## ✅ Prerequisitos

### Base de Datos
- [ ] Conectar a tu dashboard de Supabase
- [ ] Ir a SQL Editor
- [ ] Ejecutar el archivo `backend/migration-activity-log.sql`
- [ ] Verificar que la tabla se creó:
  ```sql
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'activity_log';
  ```
- [ ] Confirmar que hay 12 columnas: id, task_id, user_id, user_name, action, field, old_value, new_value, reason, metadata, timestamp, created_at
- [ ] Verificar los índices:
  ```sql
  SELECT indexname FROM pg_indexes
  WHERE tablename = 'activity_log';
  ```

### Variables de Entorno
- [ ] Backend tiene `.env` con:
  - `SUPABASE_URL=your_url`
  - `SUPABASE_SERVICE_KEY=your_service_key`
  - `PORT=3001`
  - `FRONTEND_URL=http://localhost:5173`

- [ ] Frontend tiene `.env` con:
  - `VITE_SUPABASE_URL=your_url`
  - `VITE_SUPABASE_ANON_KEY=your_anon_key`
  - `VITE_BACKEND_URL=http://localhost:3001`

## 🚀 Iniciar Servicios

### Backend
```bash
cd backend
npm install  # Si es primera vez
npm start
```
- [ ] Ver mensaje: `🚀 Servidor corriendo en puerto 3001`
- [ ] Ver mensaje: `🤖 Agente de monitoreo activo`
- [ ] No hay errores en consola

### Frontend
```bash
cd frontend
npm install  # Si es primera vez
npm run dev
```
- [ ] Ver mensaje: `Local: http://localhost:5173/`
- [ ] No hay errores en consola
- [ ] La aplicación abre en el navegador

## 🧪 Testing Funcional

### Test 1: Verificar UI
- [ ] Abrir http://localhost:5173
- [ ] Ver el header con logo "NEO DMSTK"
- [ ] Ver botón "History" (icono de reloj) a la derecha
- [ ] NO ver botón "RotateCcw" (fue reemplazado)
- [ ] Ver botón "Nueva tarea"

### Test 2: Crear Tarea y Verificar Logging
```bash
# 1. Crear tarea en UI
```
- [ ] Click "Nueva tarea"
- [ ] Llenar formulario:
  - Nombre: "Test Historial 1"
  - Workstream: Cualquiera
  - Estado: "Pendiente"
  - Prioridad: "Alta"
  - Fechas: Válidas
  - Owner: Cualquiera
- [ ] Click "Guardar"
- [ ] Tarea aparece en lista

```bash
# 2. Verificar en backend
```
- [ ] Ver en consola del backend: Log de conexión del usuario
- [ ] No ver errores de logChange

```sql
-- 3. Verificar en Supabase SQL Editor
SELECT * FROM activity_log
WHERE action = 'created'
ORDER BY timestamp DESC
LIMIT 1;
```
- [ ] Ver entrada con action='created'
- [ ] Ver task_id de la tarea recién creada
- [ ] Ver user_name
- [ ] Ver new_value con JSON de la tarea

### Test 3: Actualizar Tarea
```bash
# 1. Actualizar en UI
```
- [ ] Click en la tarea "Test Historial 1"
- [ ] Cambiar estado de "Pendiente" a "En curso"
- [ ] Cambiar prioridad de "Alta" a "Media"
- [ ] Click "Guardar"

```sql
-- 2. Verificar en Supabase
SELECT action, field, old_value, new_value
FROM activity_log
WHERE task_id = 'TU_TASK_ID_AQUI'
  AND action = 'updated'
ORDER BY timestamp DESC;
```
- [ ] Ver DOS entradas nuevas
- [ ] Una con field='status', old_value='Pendiente', new_value='En curso'
- [ ] Otra con field='priority', old_value='Alta', new_value='Media'

### Test 4: Ver Historial Global
```bash
# 1. Abrir panel de historial
```
- [ ] Click botón "History" en header
- [ ] Panel lateral se abre desde la derecha
- [ ] Título dice "Historial del proyecto"
- [ ] Ver 3 filtros: Todos, Actualizaciones, Cambios mayores
- [ ] Ver timeline vertical con línea
- [ ] Ver entrada "Usuario creó la tarea"
- [ ] Ver entradas "Usuario modificó Estado/Prioridad"

```bash
# 2. Verificar detalles
```
- [ ] Cada entrada tiene icono (✨ para created, ✏️ para updated)
- [ ] Cada entrada tiene tiempo relativo ("hace X minutos")
- [ ] Cada entrada tiene color distintivo

### Test 5: Expandir y Ver Diff
```bash
# 1. Expandir entrada de cambio de estado
```
- [ ] Click en entrada "Usuario cambió el estado..."
- [ ] Se expande mostrando diff
- [ ] Ver "Antes: Pendiente" con fondo rojo
- [ ] Ver "Después: En curso" con fondo verde
- [ ] Ver botón "Restaurar a esta versión"
- [ ] Ver timestamp completo

### Test 6: Filtros de Historial
```bash
# 1. Probar filtros
```
- [ ] Click "Actualizaciones"
- [ ] Solo ver entradas con action='updated'
- [ ] Click "Cambios mayores"
- [ ] Solo ver entradas created/deleted/restored
- [ ] Click "Todos"
- [ ] Ver todas las entradas de nuevo

### Test 7: Restaurar Tarea
```bash
# 1. Restaurar versión anterior
```
- [ ] Expandir entrada de cambio de estado (cuando era "Pendiente")
- [ ] Click "Restaurar a esta versión"
- [ ] Ver confirmación: "¿Restaurar la tarea al estado del..."
- [ ] Click OK
- [ ] Ver alerta: "✅ Tarea restaurada exitosamente"

```bash
# 2. Verificar restauración
```
- [ ] Cerrar historial
- [ ] Tarea en lista muestra estado "Pendiente" de nuevo
- [ ] Abrir historial nuevamente
- [ ] Ver nueva entrada con acción 'restored'
- [ ] Icono ↩️

```sql
-- 3. Verificar en base de datos
SELECT * FROM activity_log
WHERE action = 'restored'
ORDER BY timestamp DESC
LIMIT 1;
```
- [ ] Ver entrada restored
- [ ] Ver metadata con snapshotId

### Test 8: Eliminar Tarea
```bash
# 1. Eliminar en UI
```
- [ ] Click icono basura en tarea "Test Historial 1"
- [ ] Confirmar eliminación
- [ ] Tarea desaparece de lista

```bash
# 2. Verificar logging
```
- [ ] Abrir historial
- [ ] Ver entrada "Usuario eliminó la tarea"
- [ ] Icono 🗑️
- [ ] Expandir para ver estado completo antes de eliminar

```sql
-- 3. Verificar en base de datos
SELECT * FROM activity_log
WHERE action = 'deleted'
ORDER BY timestamp DESC
LIMIT 1;
```
- [ ] Ver entrada deleted
- [ ] Ver old_value con JSON completo de la tarea

### Test 9: Múltiples Usuarios (Opcional)
```bash
# 1. Abrir en dos navegadores/pestañas
```
- [ ] Tab 1: Crear tarea
- [ ] Tab 2: Ver que aparece automáticamente (Socket.IO)
- [ ] Tab 2: Editar la tarea
- [ ] Tab 1: Ver actualización en tiempo real
- [ ] Ambos tabs: Ver historial actualizado

### Test 10: Performance
```bash
# 1. Crear 20+ tareas
```
- [ ] Crear varias tareas rápidamente
- [ ] Editar múltiples campos
- [ ] Abrir historial
- [ ] Verificar que carga rápido (<2 segundos)
- [ ] Scroll suave en timeline
- [ ] Expandir/colapsar entradas sin lag

## 📊 Métricas de Éxito

### Funcionalidad
- [ ] ✅ Todas las creaciones se registran
- [ ] ✅ Todas las actualizaciones se registran (por campo)
- [ ] ✅ Todas las eliminaciones se registran
- [ ] ✅ Todas las restauraciones se registran
- [ ] ✅ Historial global carga correctamente
- [ ] ✅ Diffs visuales funcionan para todos los tipos
- [ ] ✅ Restauración funciona sin errores
- [ ] ✅ Panel se abre/cierra correctamente

### UI/UX
- [ ] ✅ Botón History visible y accesible
- [ ] ✅ Panel lateral se ve bien en pantalla
- [ ] ✅ Timeline es clara y legible
- [ ] ✅ Iconos y colores son distintivos
- [ ] ✅ Tiempos relativos se muestran correctamente
- [ ] ✅ No hay botón reset peligroso

### Performance
- [ ] ✅ Historial carga en <2 segundos
- [ ] ✅ No lag al expandir entradas
- [ ] ✅ Socket.IO conecta inmediatamente
- [ ] ✅ Actualizaciones en tiempo real

### Base de Datos
- [ ] ✅ activity_log tiene índices correctos
- [ ] ✅ Queries son rápidos (<100ms)
- [ ] ✅ No hay errores en logs de Supabase
- [ ] ✅ RLS políticas configuradas

## 🐛 Troubleshooting

### Historial vacío
**Síntoma:** Panel se abre pero no muestra entradas

**Soluciones:**
1. [ ] Verificar que ejecutaste migration-activity-log.sql
2. [ ] Verificar en Supabase SQL Editor:
   ```sql
   SELECT COUNT(*) FROM activity_log;
   ```
3. [ ] Revisar consola del backend para errores de logChange
4. [ ] Verificar que SUPABASE_SERVICE_KEY es correcta en .env

### Error al restaurar
**Síntoma:** "❌ Error al restaurar la tarea"

**Soluciones:**
1. [ ] Verificar que la tarea existe en tasks table
2. [ ] Verificar en backend logs para error específico
3. [ ] Comprobar que el snapshot_id es válido:
   ```sql
   SELECT * FROM activity_log WHERE id = SNAPSHOT_ID;
   ```
4. [ ] Verificar que user object se pasa correctamente

### Cambios no se registran
**Síntoma:** Editas tarea pero no aparece en historial

**Soluciones:**
1. [ ] Verificar que backend está corriendo
2. [ ] Ver consola del backend para errores
3. [ ] Verificar que Socket.IO está conectado (ver en UI: "En línea")
4. [ ] Verificar que logChange no lanza errores:
   ```javascript
   // En server.js, añadir logs:
   console.log('Logging change:', change);
   ```

### Panel no se abre
**Síntoma:** Click en History no hace nada

**Soluciones:**
1. [ ] Verificar en consola del navegador errores de importación
2. [ ] Verificar que HistoryViewer.jsx existe en src/modules/History/
3. [ ] Verificar que import en App.jsx es correcto
4. [ ] Revisar estado showHistory en React DevTools

### Socket.IO desconectado
**Síntoma:** Ver "Desconectado" en header

**Soluciones:**
1. [ ] Verificar que backend está corriendo en puerto 3001
2. [ ] Verificar CORS en backend/server.js
3. [ ] Verificar VITE_BACKEND_URL en frontend .env
4. [ ] Revisar firewall/antivirus bloqueando puerto

## 🎉 Confirmación Final

Todo está funcionando si:
- [ ] ✅ Puedes crear, editar, eliminar tareas
- [ ] ✅ Cada acción genera entradas en historial
- [ ] ✅ Puedes ver historial global del proyecto
- [ ] ✅ Puedes expandir entradas y ver diffs
- [ ] ✅ Puedes restaurar versiones anteriores
- [ ] ✅ Panel se abre/cierra suavemente
- [ ] ✅ No ves errores en consola (frontend o backend)
- [ ] ✅ Base de datos activity_log crece con cada acción

## 📁 Archivos Clave para Revisar

Si algo falla, revisar estos archivos en orden:

1. **Backend:**
   - `backend/migration-activity-log.sql` - Schema correcto
   - `backend/server.js` - Líneas 52-155 (socket handlers)
   - `backend/modules/history/history.service.js` - Función logChange
   - `backend/.env` - Variables de entorno

2. **Frontend:**
   - `frontend/src/App.jsx` - Líneas 792, 814, 733-739
   - `frontend/src/modules/History/HistoryViewer.jsx` - Todo el archivo
   - `frontend/.env` - Variables de entorno

3. **Documentación:**
   - `HISTORY_INTEGRATION_TEST.md` - Guía de tests
   - `HISTORY_INTEGRATION_SUMMARY.md` - Resumen completo
   - `ARCHITECTURE_DIAGRAM.md` - Arquitectura visual

## 🚢 Listo para Producción

Antes de deploy a producción:
- [ ] Actualizar URLs en .env (no localhost)
- [ ] Configurar autenticación real de usuarios
- [ ] Revisar políticas RLS en Supabase
- [ ] Configurar limpieza de logs antiguos (>6 meses)
- [ ] Monitorear tamaño de activity_log table
- [ ] Configurar backups automáticos de Supabase
- [ ] Testing de carga con múltiples usuarios
- [ ] Documentar para el equipo

---

**¡Felicidades!** El sistema de historial está completamente integrado y funcional. 🎉
