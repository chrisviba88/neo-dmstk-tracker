# Análisis Completo: Error "column 'changes' does not exist"

## Resumen Ejecutivo

**Error:** `column 'changes' of relation 'activity_log' does not exist`
**Causa Raíz:** Trigger SQL automático incompatible con el schema actual de la tabla
**Solución:** Deshabilitar el trigger ejecutando `FIX-ACTIVITY-LOG-TRIGGER.sql`

---

## 1. Causa Exacta del Error

### El Culpable: Trigger Automático en Supabase

Incluso después de comentar todas las llamadas a `logChange()` en el código Node.js, el error persiste porque **existe un trigger SQL automático en Supabase** que se ejecuta cada vez que se guarda una tarea.

**Ubicación del trigger:**
```
Archivo: /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/backend/supabase-schema.sql
Líneas: 103-105
```

**Código del trigger:**
```sql
CREATE TRIGGER log_task_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_changes();
```

**¿Qué hace este trigger?**
Cada vez que ocurre un INSERT, UPDATE o DELETE en la tabla `tasks`, automáticamente ejecuta la función `log_task_changes()` que intenta insertar en `activity_log`.

### La Función del Trigger

**Ubicación:**
```
Archivo: supabase-schema.sql
Líneas: 83-101
```

**Código relevante:**
```sql
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO activity_log (task_id, action, changes)  -- ❌ PROBLEMA AQUÍ
    VALUES (NEW.id, 'UPDATE', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
  -- ... más código
END;
```

**El problema:** La función intenta insertar usando la columna `changes` (JSONB), pero la tabla actual de `activity_log` NO tiene esa columna.

---

## 2. Por Qué Ocurre el Conflicto

Existen **dos versiones diferentes** del schema de `activity_log`:

### Versión 1: Schema Antiguo (supabase-schema.sql)

```sql
-- Línea 44-51 de supabase-schema.sql
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  task_id TEXT REFERENCES tasks(id),
  action TEXT NOT NULL,
  user_name TEXT,
  changes JSONB,  -- ← Columna en formato JSONB monolítico
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Formato:** Almacena todos los cambios en una sola columna JSONB llamada `changes`.

### Versión 2: Schema Nuevo (migration-activity-log.sql)

```sql
-- Líneas 8-21 de migration-activity-log.sql
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  field TEXT,        -- ← Campo modificado
  old_value TEXT,    -- ← Valor antiguo
  new_value TEXT,    -- ← Valor nuevo
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Formato:** Almacena cambios en columnas separadas (`field`, `old_value`, `new_value`), que es lo que espera `history.service.js`.

### El Desajuste

| Componente | Espera/Usa |
|------------|------------|
| Trigger SQL (`log_task_changes`) | Schema Antiguo (columna `changes`) |
| Tabla actual en Supabase | Schema Nuevo (columnas `field`, `old_value`, `new_value`) |
| Código Node.js (`history.service.js`) | Schema Nuevo |

**Resultado:** El trigger intenta insertar en una columna que no existe → ERROR.

---

## 3. Referencias a activity_log en el Backend

### Archivos que mencionan activity_log:

1. **`/backend/server.js`**
   - Líneas 76-116, 138-155, 201-214 (COMENTADAS)
   - Llamadas a `logChange()` para registrar cambios desde Node.js
   - **Estado:** Deshabilitadas temporalmente

2. **`/backend/modules/history/history.service.js`**
   - Todo el archivo trabaja con activity_log
   - Funciones: `logChange()`, `getTaskHistory()`, `restoreTaskToSnapshot()`, etc.
   - **Formato esperado:** Schema nuevo (field, old_value, new_value)

3. **`/backend/supabase-schema.sql`**
   - Líneas 44-51: Definición de tabla (schema antiguo)
   - Líneas 83-105: Función y trigger automático (**CAUSA DEL ERROR**)

4. **`/backend/migration-activity-log.sql`**
   - Schema nuevo y correcto de activity_log
   - Compatible con history.service.js

5. **`/backend/scripts/03_run-migration_v1_20260411.js`**
   - Script para ejecutar la migración
   - Requiere ejecución manual en Supabase

---

## 4. Flujo del Error

```
Usuario guarda tarea en frontend
    ↓
Socket.io envía evento 'task:update'
    ↓
server.js ejecuta supabase.from('tasks').upsert(task)
    ↓
Supabase ejecuta UPSERT en tabla tasks
    ↓
⚡ TRIGGER log_task_changes_trigger se activa automáticamente
    ↓
Función log_task_changes() intenta:
    INSERT INTO activity_log (task_id, action, changes) VALUES (...)
    ↓
❌ ERROR: column 'changes' does not exist
    ↓
Operación completa falla (rollback)
    ↓
Usuario recibe error en frontend
```

**Clave:** El trigger se ejecuta **automáticamente a nivel de base de datos**, independientemente del código Node.js.

---

## 5. Solución Definitiva

### Paso 1: Aplicar el Fix Inmediato

**Ejecutar en Supabase SQL Editor:**

```sql
-- Archivo: FIX-ACTIVITY-LOG-TRIGGER.sql

-- Deshabilitar el trigger
DROP TRIGGER IF EXISTS log_task_changes_trigger ON tasks;

-- Eliminar la función
DROP FUNCTION IF EXISTS log_task_changes();
```

**Cómo ejecutarlo:**
1. Ir a: https://supabase.com/dashboard
2. Seleccionar tu proyecto Neo DMSTK
3. Ir a: SQL Editor → New query
4. Copiar contenido de `backend/FIX-ACTIVITY-LOG-TRIGGER.sql`
5. Ejecutar (Run)

### Paso 2: Verificar que el Trigger Fue Eliminado

**Ejecutar en Supabase:**
```sql
SELECT * FROM pg_trigger WHERE tgrelid = 'tasks'::regclass;
```

**Resultado esperado:**
- Debe mostrar SOLO `update_tasks_updated_at` (para actualizar updated_at)
- NO debe aparecer `log_task_changes_trigger`

### Paso 3: Verificar Schema de activity_log

**Ejecutar en Supabase:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;
```

**Resultado esperado (schema nuevo):**
- `id` - integer
- `task_id` - text
- `user_id` - text
- `user_name` - text
- `action` - text
- `field` - text
- `old_value` - text
- `new_value` - text
- `reason` - text
- `metadata` - jsonb
- `timestamp` - timestamp with time zone
- `created_at` - timestamp with time zone

**Si el schema es incorrecto:**
Ejecutar primero `migration-activity-log.sql` antes del fix del trigger.

### Paso 4: Probar el Guardado

1. Reiniciar backend (si no se reinició automáticamente)
2. Abrir frontend
3. Intentar guardar/editar una tarea
4. **Debe funcionar sin errores**

### Paso 5: (Opcional) Reactivar Logging desde Node.js

Una vez que el trigger está deshabilitado y la tabla tiene el schema correcto:

1. Descomentar llamadas a `logChange()` en `server.js` (líneas 76-116, 138-155, 201-214)
2. Reiniciar backend
3. Los cambios se registrarán desde Node.js usando el schema correcto

---

## 6. Comandos SQL de Verificación

### Verificar triggers activos:
```sql
SELECT
  tgname AS trigger_name,
  tgtype AS trigger_type,
  tgenabled AS is_enabled
FROM pg_trigger
WHERE tgrelid = 'tasks'::regclass;
```

### Ver definición de la tabla:
```sql
\d activity_log
```

### Contar registros en activity_log:
```sql
SELECT COUNT(*) FROM activity_log;
```

### Ver últimos 5 registros (si existen):
```sql
SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 5;
```

---

## 7. Arquitectura de Logging (Estado Final)

### ANTES (con problemas):
```
Operación en tasks
    ↓
⚡ Trigger SQL automático (formato antiguo) ❌ ERROR
    ↓
🚫 Operación falla
```

### DESPUÉS (funcionando):
```
Operación en tasks
    ↓
✅ Se guarda exitosamente (sin trigger automático)
    ↓
Node.js ejecuta logChange() (opcional, cuando esté descomentado)
    ↓
✅ Se registra en activity_log con schema correcto
```

**Ventajas:**
- Control total desde el código
- Posibilidad de agregar lógica custom
- Sin dependencias circulares
- Más fácil de debuggear

---

## 8. Archivos Clave (Paths Absolutos)

```
/Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/backend/
├── FIX-ACTIVITY-LOG-TRIGGER.sql ← EJECUTAR ESTE
├── supabase-schema.sql (líneas 83-105: trigger problemático)
├── migration-activity-log.sql (schema correcto)
├── server.js (líneas 76-116, 138-155, 201-214: logChange comentado)
└── modules/history/history.service.js (funciones de historial)
```

---

## 9. Checklist de Verificación

- [ ] Ejecutado `FIX-ACTIVITY-LOG-TRIGGER.sql` en Supabase
- [ ] Verificado que trigger `log_task_changes_trigger` ya no existe
- [ ] Verificado que tabla `activity_log` tiene schema correcto
- [ ] Probado guardar tarea en frontend
- [ ] ✅ Guardado funciona sin errores
- [ ] (Opcional) Descomentado `logChange()` en server.js
- [ ] (Opcional) Verificado que logging desde Node.js funciona

---

## 10. Contacto y Soporte

Si después de aplicar el fix persisten problemas:

1. Verificar logs del backend: `npm run dev` (buscar errores en consola)
2. Verificar logs de Supabase: Dashboard → Logs
3. Revisar permisos RLS en Supabase
4. Verificar que variables de entorno estén correctas (.env)

---

**Última actualización:** 2026-04-13
**Archivo generado por:** Claude Code Analysis
