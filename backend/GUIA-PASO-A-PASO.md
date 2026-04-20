# Guía Paso a Paso: Solucionar Error "column 'changes' does not exist"

## SOLUCIÓN EN 5 MINUTOS

### Paso 1: Diagnosticar el Problema (Opcional)

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto **Neo DMSTK**
3. En el menú izquierdo: **SQL Editor** → **New query**
4. Copia y pega TODO el contenido de: `backend/DIAGNOSTICO-RAPIDO.sql`
5. Haz clic en **Run** (botón verde)
6. Revisa los resultados:
   - Si ves `log_task_changes_trigger` en la sección de triggers → **Confirma el problema**
   - Si ves columna `changes` en activity_log → **Schema antiguo**

### Paso 2: Aplicar el Fix (ACCIÓN REQUERIDA)

**IMPORTANTE: Este paso soluciona el problema INMEDIATAMENTE**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto **Neo DMSTK**
3. En el menú izquierdo: **SQL Editor** → **New query**
4. Copia y pega el siguiente código:

```sql
-- Fix inmediato: Eliminar trigger problemático
DROP TRIGGER IF EXISTS log_task_changes_trigger ON tasks;
DROP FUNCTION IF EXISTS log_task_changes();
```

5. Haz clic en **Run** (botón verde)
6. Deberías ver: **Success. No rows returned**

### Paso 3: Verificar que Funcionó

Ejecuta este query en la misma ventana SQL:

```sql
SELECT * FROM pg_trigger WHERE tgrelid = 'tasks'::regclass;
```

**Resultado esperado:**
- Debe aparecer SOLO: `update_tasks_updated_at`
- NO debe aparecer: `log_task_changes_trigger`

Si es así: ✅ **El problema está solucionado**

### Paso 4: Probar en el Frontend

1. Abre tu aplicación en: http://localhost:5173
2. Intenta **guardar o editar una tarea**
3. Debería funcionar **sin errores**

---

## ¿Qué Acabas de Hacer?

Has eliminado un **trigger automático problemático** que se ejecutaba cada vez que guardabas una tarea.

**Antes:**
```
Guardar tarea → Trigger automático → ❌ ERROR (columna 'changes' no existe)
```

**Ahora:**
```
Guardar tarea → ✅ Se guarda exitosamente
```

---

## Paso 5 (Opcional): Habilitar Logging de Historial

Si quieres que se registren los cambios en el historial:

1. Abre: `backend/server.js`
2. Descomenta las líneas **76-116**, **138-155**, **201-214** (quitar los `/*` y `*/`)
3. Guarda el archivo
4. El backend se reiniciará automáticamente
5. Los cambios ahora se registrarán desde Node.js

---

## Solución de Problemas

### Si sigue sin funcionar después del fix:

#### Problema 1: Schema de activity_log incorrecto

**Verificar:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'activity_log';
```

**Debe incluir:** `field`, `old_value`, `new_value`

**Si NO las tiene:**
1. Ejecuta: `backend/migration-activity-log.sql` completo en Supabase
2. Repite Paso 2 (fix del trigger)

#### Problema 2: Error de permisos

**Verificar:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'activity_log';
```

**Debe tener políticas de:** SELECT e INSERT

**Si no las tiene:**
```sql
CREATE POLICY "Enable read access for all users" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON activity_log FOR INSERT WITH CHECK (true);
```

#### Problema 3: Backend no conecta con Supabase

**Verificar en terminal del backend:**
```
🚀 Servidor corriendo en puerto 3001
```

**Si hay error de conexión:**
1. Verifica `.env`:
   - `SUPABASE_URL=https://tu-proyecto.supabase.co`
   - `SUPABASE_SERVICE_KEY=eyJ...` (key correcta)
2. Reinicia backend: `Ctrl+C` y luego `npm run dev`

---

## Archivos de Referencia

```
backend/
├── FIX-ACTIVITY-LOG-TRIGGER.sql     ← Código del fix (ya ejecutado)
├── DIAGNOSTICO-RAPIDO.sql            ← Para verificar estado
├── ANALISIS-ERROR-ACTIVITY-LOG.md    ← Explicación técnica completa
├── GUIA-PASO-A-PASO.md              ← Esta guía
├── migration-activity-log.sql        ← Schema correcto de activity_log
└── server.js                         ← Logging desde Node.js (comentado)
```

---

## Checklist Final

- [x] Paso 1: (Opcional) Diagnóstico ejecutado
- [ ] Paso 2: Fix ejecutado en Supabase ← **ACCIÓN REQUERIDA**
- [ ] Paso 3: Verificación exitosa
- [ ] Paso 4: Probado en frontend
- [ ] ✅ Todo funciona
- [ ] Paso 5: (Opcional) Logging habilitado

---

## ¿Necesitas Ayuda?

### Comandos útiles:

**Ver logs del backend:**
```bash
cd backend
npm run dev
# Buscar errores en la salida
```

**Ver estado de Supabase:**
```
Dashboard → Logs → Buscar "error"
```

**Reiniciar todo:**
1. Backend: `Ctrl+C` en terminal y `npm run dev`
2. Frontend: `Ctrl+C` en terminal y `npm run dev`

---

**Última actualización:** 2026-04-13
**Tiempo estimado:** 5 minutos
**Dificultad:** Fácil (copiar y pegar SQL)
