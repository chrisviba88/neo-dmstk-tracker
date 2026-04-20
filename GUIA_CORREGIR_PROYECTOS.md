# 🔧 GUÍA PARA CORREGIR ORGANIZACIÓN POR PROYECTOS

## 🎯 PROBLEMA IDENTIFICADO

Cuando agrupas por "Proyecto" en la app, aparecen la mayoría de las tareas como "Sin proyecto asignado".

**CAUSA RAÍZ:** La columna `project` **NO EXISTE** en la tabla `tasks` de Supabase.

**SOLUCIÓN:** Añadir la columna y actualizar todas las tareas con sus proyectos correctos.

---

## ✅ PASO 1: AÑADIR COLUMNA EN SUPABASE (2 minutos)

### 1.1. Abrir Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto **Neo DMSTK**
3. Click en **SQL Editor** (menú izquierdo)
4. Click en **New query**

### 1.2. Ejecutar SQL

1. Abre el archivo: `backend/ADD_PROJECT_COLUMN.sql`
2. Copia **TODO** el contenido
3. Pega en Supabase SQL Editor
4. Click en **RUN** (botón verde)

### 1.3. Verificar Éxito

Deberías ver:
```
Success. No rows returned
```

Si ves un error, cópialo y me lo envías.

---

## ✅ PASO 2: ACTUALIZAR PROYECTOS EN TODAS LAS TAREAS (1 minuto)

### 2.1. Ejecutar Script de Actualización

Abre tu terminal y ejecuta:

```bash
cd /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app/backend
node actualizar_proyectos.mjs
```

### 2.2. Qué Esperar

Verás algo como:

```
🔄 ACTUALIZANDO PROYECTOS EN SUPABASE...

📋 Total de tareas en JSON: 227

📊 Total de tareas en Supabase: 109

✅ 20 tareas actualizadas...
✅ 40 tareas actualizadas...
✅ 60 tareas actualizadas...
✅ 80 tareas actualizadas...
✅ 100 tareas actualizadas...

========================================
📊 RESUMEN DE ACTUALIZACIÓN
========================================
✅ Tareas actualizadas: 109
❌ Errores: 0
⚠️  No encontradas en JSON: 0
========================================

🎉 ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO!

📊 DISTRIBUCIÓN FINAL POR PROYECTO:
========================================
Sin proyecto: 0
27 - Fundación & Método
25 - Espacio E1
17 - Piloto & Validación
...
========================================
```

### 2.3. Si Hay Errores

- Copia todo el output de la terminal
- Envíamelo para analizar

---

## ✅ PASO 3: VERIFICAR EN LA APP (30 segundos)

### 3.1. Refrescar la App

1. Ve a: http://localhost:5174
2. Presiona **F5** (o Cmd+R en Mac) para refrescar

### 3.2. Agrupar por Proyecto

1. Busca el botón de agrupación (probablemente arriba)
2. Selecciona **"Agrupar por Proyecto"**

### 3.3. Resultado Esperado

Deberías ver las tareas organizadas así:

```
📂 Fundación & Método (27 tareas)
  ├─ Tarea 1
  ├─ Tarea 2
  └─ ...

📂 Espacio E1 (25 tareas)
  ├─ Espacio E1 > Legal (5 tareas)
  ├─ Espacio E1 > Reforma (7 tareas)
  └─ ...

📂 Piloto & Validación (17 tareas)
  └─ ...

📂 Branding & Comunicación (12 tareas)
  └─ ...
```

**Ya NO debe haber tareas en "Sin proyecto asignado"** (o muy pocas).

---

## 🎨 PRÓXIMO PASO: MEJORAR LA VISUALIZACIÓN

Una vez que los proyectos estén asignados correctamente, voy a:

1. **Actualizar el frontend** para mostrar la jerarquía de proyectos con indentación visual
2. **Añadir colores** por proyecto padre
3. **Crear vistas guardables** que puedas nombrar ("Mi Vista Semanal", "Timeline Crítico", etc.)
4. **Añadir iconos** y emojis por tipo de proyecto

---

## ⚠️ TROUBLESHOOTING

### Error: "column already exists"

✅ **Solución:** La columna ya fue añadida, pasa directamente al PASO 2.

### Error: "permission denied"

❌ **Problema:** Permisos de Supabase

🔧 **Solución:**
1. Verifica que estás usando `SUPABASE_SERVICE_KEY` en `.env`
2. No uses `SUPABASE_ANON_KEY`

### Tareas siguen sin proyecto después del script

🔧 **Solución:**
1. Ejecuta en Supabase SQL Editor:
   ```sql
   SELECT id, name, project FROM tasks LIMIT 10;
   ```
2. Verifica que la columna `project` tiene valores
3. Si está vacía, reejecuta: `node actualizar_proyectos.mjs`

### Script dice "No encontradas en JSON"

⚠️ **Interpretación:** Hay tareas en Supabase que no están en el JSON.

🔧 **Solución:** Esas tareas son antiguas o fueron creadas manualmente. Puedes:
- Eliminarlas si son obsoletas
- Asignarles un proyecto manualmente desde la app

---

## 📞 NECESITAS AYUDA

Si algo falla, envíame:

1. El error completo que ves
2. Screenshot de lo que muestra la app
3. Output del script `actualizar_proyectos.mjs`

Analizaré y te daré la solución exacta.

---

**Creado:** 2026-04-13
**Prioridad:** 🔥 CRÍTICA (bloqueante para organización)
**Tiempo estimado:** 3-4 minutos total
