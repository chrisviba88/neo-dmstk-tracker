-- =====================================================
-- DIAGNÓSTICO RÁPIDO - Identificar estado actual
-- =====================================================
-- Ejecuta este script COMPLETO en Supabase SQL Editor
-- para ver el estado actual de tu base de datos
-- =====================================================

-- 1. ¿Qué triggers existen en la tabla tasks?
SELECT
    '=== TRIGGERS EN TABLA TASKS ===' AS seccion,
    NULL AS trigger_name,
    NULL AS enabled,
    NULL AS function_name;

SELECT
    'Trigger' AS seccion,
    tgname AS trigger_name,
    CASE tgenabled
        WHEN 'O' THEN 'Habilitado'
        WHEN 'D' THEN 'Deshabilitado'
        ELSE 'Otro'
    END AS enabled,
    proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'tasks'::regclass;

-- Si aparece 'log_task_changes_trigger' ← ESTE ES EL PROBLEMA

-- 2. ¿Qué columnas tiene activity_log?
SELECT
    '' AS separator,
    '=== COLUMNAS DE ACTIVITY_LOG ===' AS seccion,
    NULL AS column_name,
    NULL AS data_type,
    NULL AS is_nullable;

SELECT
    '' AS separator,
    'Columna' AS seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;

-- Si aparece 'changes' ← Schema ANTIGUO (incorrecto)
-- Si aparece 'field', 'old_value', 'new_value' ← Schema NUEVO (correcto)

-- 3. ¿Cuántos registros hay en activity_log?
SELECT
    '' AS separator,
    '=== RESUMEN ACTIVITY_LOG ===' AS seccion,
    NULL AS count;

SELECT
    '' AS separator,
    'Total registros' AS seccion,
    COUNT(*) AS count
FROM activity_log;

-- 4. Últimos 3 intentos de logging (si existen)
SELECT
    '' AS separator,
    '=== ÚLTIMOS 3 REGISTROS ===' AS seccion,
    NULL AS id,
    NULL AS task_id,
    NULL AS action,
    NULL AS created_at;

SELECT
    '' AS separator,
    'Registro' AS seccion,
    id,
    task_id,
    action,
    created_at
FROM activity_log
ORDER BY created_at DESC
LIMIT 3;

-- =====================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- =====================================================
--
-- ESCENARIO 1: Problema confirmado
-- - Triggers: aparece 'log_task_changes_trigger'
-- - Columnas: aparece 'changes' (schema antiguo)
-- → SOLUCIÓN: Ejecutar FIX-ACTIVITY-LOG-TRIGGER.sql
--
-- ESCENARIO 2: Solo trigger problemático
-- - Triggers: aparece 'log_task_changes_trigger'
-- - Columnas: aparece 'field', 'old_value', 'new_value' (schema nuevo)
-- → SOLUCIÓN: Ejecutar solo la parte del fix que elimina el trigger
--
-- ESCENARIO 3: Solo schema antiguo
-- - Triggers: NO aparece 'log_task_changes_trigger'
-- - Columnas: aparece 'changes' (schema antiguo)
-- → SOLUCIÓN: Ejecutar migration-activity-log.sql
--
-- ESCENARIO 4: Ya está correcto
-- - Triggers: solo aparece 'update_tasks_updated_at'
-- - Columnas: aparece 'field', 'old_value', 'new_value'
-- → Ya está bien! El error debe venir de otro lado
-- =====================================================
