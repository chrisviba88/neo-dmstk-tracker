# 🤖 GUÍA DEL SISTEMA DE AGENTES

**Para:** Christian (Usuario)
**De:** Claude (Tu asistente de desarrollo)
**Fecha:** 2026-04-11

---

## ✅ LO QUE ACABAMOS DE CREAR

He diseñado e implementado un **sistema permanente de agentes** que será la base de todo nuestro trabajo de ahora en adelante.

### 📁 Archivos creados:

1. **`.claude/AGENT_SYSTEM.md`**
   - Arquitectura completa del sistema
   - Definición de 9 agentes especializados
   - Guías de modelo (Opus/Sonnet/Haiku)
   - Workflow de activación
   - Optimización de costos

2. **`.claude/commands/pm.md`**
   - Comando `/pm` para activar Project Manager
   - Prompt especializado para coordinación

3. **`.claude/README.md`**
   - Resumen del sistema
   - Guía rápida de uso

4. **`GUIA_SISTEMA_AGENTES.md`** (este archivo)
   - Guía para ti de cómo usar todo esto

---

## 🎯 CÓMO FUNCIONA

### Antes (PROBLEMA):
- Claude trabajaba solo
- Dejaba cosas sin hacer
- No había especialización
- Usaba siempre el mismo modelo (ineficiente)
- No había validación de calidad

### Ahora (SOLUCIÓN):
- **9 agentes especializados** trabajan en equipo
- **Project Manager coordina** todo
- **Modelos optimizados** según complejidad (Opus/Sonnet/Haiku)
- **QA valida** antes de marcar "completo"
- **Trabajo en paralelo** cuando es posible

---

## 🚀 CÓMO LO USAS TÚ

### Opción 1: Dejar que Claude decida
Simplemente pide lo que necesitas. Claude detectará si requiere agentes y los activará automáticamente.

**Ejemplo:**
```
Tú: "Necesito implementar drag & drop para reordenar tareas en la lista"

Claude: "Esto es complejo, voy a activar el sistema de agentes:
- PM Agent para coordinar
- UX Expert para diseñar el flujo
- Frontend Developer para implementar
- QA para validar

Costo estimado: $3
Tiempo estimado: 1.5 horas

¿Procedo?"
```

### Opción 2: Invocar manualmente el PM
Usa el comando `/pm` cuando quieras que el Project Manager analice la situación.

**Ejemplo:**
```
Tú: /pm

[PM Agent se activa y analiza el estado actual del proyecto]

PM: "He revisado el proyecto. Estado:
✅ Sistema de historial implementado
❌ Migración SQL pendiente (P0 - BLOQUEANTE)
⚠️ Dashboard vs Ejecutivo tienen redundancia

Prioridades:
P0: Ejecutar migración SQL
P1: Eliminar redundancia Dashboard/Ejecutivo
P2: Mejorar diseño visual

Recomendación: Atacar P0 ya. ¿Procedo?"
```

### Opción 3: Pedir agente específico
Si sabes qué necesitas, pídelo directamente.

**Ejemplo:**
```
Tú: "Necesito que el QA Agent revise toda la app para ver qué está roto"

Claude: "Activando QA Agent (Haiku 3.5 - barato)..."
```

---

## 💰 OPTIMIZACIÓN DE COSTOS

### Modelos y cuándo usarlos:

| Modelo | Costo/1M tokens | Cuándo usar | Ejemplo |
|--------|----------------|-------------|---------|
| **Opus 4** | $15.00 | Arquitectura compleja, decisiones críticas | "¿Deberíamos usar WebSockets o Server-Sent Events?" |
| **Sonnet 4.5** | $3.00 | Features normales, coordinación, diseño | "Implementar modal editable para tareas" |
| **Haiku 3.5** | $0.25 | Testing, validación, CRUD simple | "Validar que todas las tareas tienen owner" |

### Tu presupuesto aproximado:

**Tareas típicas:**
- Feature simple (ej: nuevo botón): **$0.50 - $2** (Sonnet/Haiku)
- Feature compleja (ej: drag & drop): **$3 - $8** (Sonnet + Haiku QA)
- Decisión arquitectónica: **$15 - $30** (Opus, solo cuando realmente lo necesites)
- QA completo de la app: **$1 - $3** (Haiku)

**Estimado mensual para este proyecto:**
- Desarrollo activo: **$100 - $300/mes** (depende de cuánto implementes)
- Mantenimiento: **$20 - $50/mes**

**Cómo ahorrar:**
1. Usa QA Agent (barato) en vez de probar manualmente
2. Deja que PM coordine en vez de pedir features sin plan
3. Solo usa Opus cuando la decisión sea realmente compleja
4. Trabaja en paralelo (más rápido, mismo costo)

---

## 🎨 LOS 9 AGENTES

### 1. Project Manager (Sonnet)
**Para qué:** Coordinar todo, priorizar, detectar errores
**Cuándo:** Solicitudes complejas, múltiples features, cuando algo está mal
**Activa con:** `/pm` o automáticamente

### 2. Chief Architect (Opus - CARO)
**Para qué:** Decisiones arquitectónicas complejas
**Cuándo:** Cambios grandes de arquitectura, tech stack, escalabilidad
**Activa con:** PM lo activará si es necesario

### 3. Visual Data Communicator (Sonnet)
**Para qué:** Diseño visual, estética, colores semánticos
**Cuándo:** Nuevo componente, mejorar diseño, inconsistencias visuales
**Activa con:** "Mejorar el diseño de X"

### 4. Frontend Developer (Sonnet/Haiku)
**Para qué:** Implementar componentes React
**Cuándo:** Nuevos componentes, cambios de UI
**Activa con:** Automáticamente cuando se necesita

### 5. Backend Developer (Sonnet/Haiku)
**Para qué:** APIs, base de datos, lógica de servidor
**Cuándo:** Nuevos endpoints, cambios en DB, lógica compleja
**Activa con:** Automáticamente cuando se necesita

### 6. QA Engineer (Haiku - BARATO)
**Para qué:** Testing, encontrar bugs, validar
**Cuándo:** Después de feature nueva, antes de deploy, usuario reporta bug
**Activa con:** "QA Agent, revisa X" o automáticamente

### 7. UX Expert (Sonnet)
**Para qué:** Interactividad fractal, flujos de usuario
**Cuándo:** Diseñar interacciones, mejorar usabilidad
**Activa con:** "Mejorar la UX de X"

### 8. Data Analyst (Haiku - BARATO)
**Para qué:** Validar lógica de datos, dependencias
**Cuándo:** Validar dependencias, analizar inconsistencias
**Activa con:** "Validar que los datos sean coherentes"

### 9. DevOps (Haiku - BARATO)
**Para qué:** Deploy, infraestructura
**Cuándo:** Deploy a producción, problemas de servidor
**Activa con:** "Deployar a producción"

---

## 🔄 WORKFLOW TÍPICO (Ejemplo real)

**Tu solicitud:** "Quiero que el timeline sea editable arrastrando las barras para cambiar fechas"

### Claude analiza:
```
¿Es simple? No (drag & drop + lógica de fechas + dependencias)
→ Activar sistema de agentes
```

### PM Agent crea plan:
```markdown
## PLAN DE EJECUCIÓN

**Agentes a activar:**
1. UX Expert (Sonnet) - Diseñar interacción de drag
2. Frontend Developer (Sonnet) - Implementar drag & drop
3. Backend Developer (Haiku) - Actualizar fechas en DB
4. Data Analyst (Haiku) - Validar que dependencias siguen coherentes
5. QA Engineer (Haiku) - Probar end-to-end

**Ejecución:**
- Paralelo: UX Expert + Backend Developer
- Secuencial: Frontend Developer (después de UX) → Data Analyst → QA

**Costo:** ~$5
**Tiempo:** 2 horas
```

### Activación en paralelo:
```
[UX Expert diseñando...]
[Backend Developer preparando endpoint...]
[Frontend Developer implementando...]
[Data Analyst validando...]
[QA Engineer probando...]
```

### Reporte final:
```
✅ Feature implementada
✅ Validada por QA
✅ No rompe dependencias
✅ MASTER_CHECKLIST.md actualizado

Próximos pasos sugeridos: [...]
```

---

## ⚠️ SISTEMA DE ALERTAS

El PM Agent te alertará cuando:

1. **Trabajo incompleto**
   ```
   ⚠️ ALERTA: Frontend creó componente pero no lo integró en App.jsx
   ```

2. **Prioridades incorrectas**
   ```
   ⚠️ ALERTA: Trabajando en P2 cuando hay P0 pendientes
   ```

3. **Costos excesivos**
   ```
   ⚠️ ALERTA: Usando Opus para tarea que Sonnet puede hacer
   ```

4. **Calidad comprometida**
   ```
   ⚠️ ALERTA: Feature marcada completa sin pasar QA
   ```

---

## 📋 PRIORIDADES

El sistema usa 4 niveles:

- **P0 - CRÍTICO:** Bugs que rompen la app, security, data loss
  - **Regla:** No avanzar hasta resolver P0

- **P1 - ALTA:** Features que pediste, UX importante
  - **Plazo:** 2 horas

- **P2 - MEDIA:** Nice to have, refactoring
  - **Plazo:** 4 horas

- **P3 - BAJA:** Polish, optimizaciones
  - **Plazo:** Backlog

---

## ✅ VALIDACIÓN DE CALIDAD

Antes de marcar feature como "completa", QA verifica:

- [ ] Implementada según especificaciones
- [ ] Integrada en la aplicación (no archivo huérfano)
- [ ] Probada en navegador (funciona end-to-end)
- [ ] Edge cases manejados
- [ ] Error handling apropiado
- [ ] No rompe features existentes
- [ ] Diseño consistente
- [ ] Performance aceptable
- [ ] MASTER_CHECKLIST.md actualizado

**No más "ya está hecho" cuando no está realmente hecho.**

---

## 🎯 TUS NUEVOS PODERES

### Ahora puedes:

1. **Pedir features complejas con confianza**
   - El sistema las descompondrá y ejecutará correctamente

2. **Ver transparencia total**
   - Sabrás qué agente está trabajando en qué

3. **Optimizar costos**
   - Ves estimado antes de aprobar

4. **Trabajo en paralelo**
   - Múltiples agentes trabajan simultáneamente

5. **Calidad garantizada**
   - QA valida todo antes de marcar "hecho"

6. **Cuestionar decisiones**
   - Agentes te dirán si algo no tiene sentido (pero respetan tu decisión final)

---

## 🚦 EJEMPLOS DE USO

### Ejemplo 1: Feature nueva
```
Tú: "Quiero un botón para exportar todas las tareas a Excel"

Claude: [Analiza]
"Esta es tarea P1 mediana. Activando:
- Backend Developer (Haiku) - Generar Excel
- Frontend Developer (Haiku) - Botón UI
- QA (Haiku) - Validar export

Costo: ~$1.50
Tiempo: 45min
¿Procedo?"

Tú: "Sí"

[Agentes trabajan en paralelo]

Claude: "✅ Completado. Botón en header, descarga Excel con todas las tareas.
Probado con 109 tareas, funciona correctamente."
```

### Ejemplo 2: Algo está roto
```
Tú: "El dashboard no carga"

Claude: [PM se activa automáticamente]

PM: "⚠️ P0 CRÍTICO detectado
Activando QA Agent para diagnosticar..."

QA: "Error encontrado: TaskList.jsx línea 45 - undefined.map()
Causa: tasks es null cuando se carga componente

Activando Frontend Developer (Haiku) para fix..."

Frontend: "✅ Fixed. Agregado null check.
Probado: Dashboard carga correctamente ahora."
```

### Ejemplo 3: Decisión arquitectónica
```
Tú: "¿Deberíamos migrar de Supabase a Firebase?"

Claude: [PM detecta decisión compleja]

PM: "Esta es decisión arquitectónica mayor.
Activando Chief Architect (Opus 4 - $25 estimado)
¿Procedo?"

Tú: "Sí"

Architect: "Analicé ambas opciones:

SUPABASE (actual):
+ Ya implementado (no hay costo de migración)
+ PostgreSQL robusto
+ Self-hosted option
- Menos integración con Google services

FIREBASE:
+ Mejor real-time
+ Más servicios integrados
- Vendor lock-in
- Costo variable impredecible
- Migración compleja (100+ horas)

RECOMENDACIÓN: Quedarse con Supabase
RAZÓN: Costo/beneficio no justifica migración

Si en futuro necesitas features específicas de Firebase, podemos usar hybrid approach."
```

---

## 🎓 MEJORES PRÁCTICAS

### DO ✅:
1. **Deja que PM coordine** tareas complejas
2. **Pide QA** antes de considerar algo "terminado"
3. **Revisa estimados** de costo antes de aprobar
4. **Sé específico** en lo que quieres
5. **Cuestiona** si algo no te convence

### DON'T ❌:
1. **No pidas features sin contexto** - PM necesita entender el porqué
2. **No apruebes sin ver estimado** - podrías gastar más de lo necesario
3. **No asumas que está completo** - espera validación de QA
4. **No pidas todo Opus** - es caro e innecesario
5. **No ignores alertas de PM** - están ahí por una razón

---

## 🔮 PRÓXIMOS PASOS

### Para activar completamente el sistema:

1. **Probarlo ahora**
   - Pide algo complejo y ve cómo funciona
   - Ejemplo: "Quiero mejorar el diseño visual de todo el dashboard"

2. **Ejecutar P0 pendientes**
   - Migración SQL (requiere tu acción en Supabase)
   - Cualquier bug crítico

3. **Usar regularmente**
   - Cada solicitud compleja → Sistema de agentes
   - Validación frecuente con QA
   - PM monitorea progreso

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Cuándo debo usar `/pm`?**
R: Cuando quieras análisis del estado actual o coordinar múltiples tareas. Claude también lo activará automáticamente cuando detecte complejidad.

**P: ¿Cómo sé si usará Opus (caro) u otro modelo?**
R: Siempre te mostrará estimado de costo antes de proceder. Opus solo se usa para decisiones arquitectónicas complejas.

**P: ¿Los agentes trabajarán siempre en paralelo?**
R: Cuando sea posible. Si hay dependencias (Agente B necesita resultado de Agente A), trabajarán secuencialmente.

**P: ¿Puedo cancelar si el costo es muy alto?**
R: Sí, siempre ves el estimado antes de que se active. Puedes decir "no" o "busca alternativa más barata".

**P: ¿Qué pasa si un agente se equivoca?**
R: QA Agent valida todo. Si encuentra error, PM activará al agente correspondiente para fix.

**P: ¿Funciona para cualquier proyecto o solo NEO DMSTK?**
R: La arquitectura es reusable. La configuración en `.claude/` puede copiarse a otros proyectos.

---

## 📞 SOPORTE

Si algo no funciona como esperas:

1. **Pide a PM que analice:** `/pm`
2. **Pide QA que revise:** "QA Agent, revisa [X]"
3. **Pregunta directamente:** "¿Por qué usaste Opus en vez de Sonnet?"

Los agentes están programados para ser transparentes y explicar sus decisiones.

---

## 🎉 RESUMEN FINAL

### Lo que logramos hoy:

✅ **Sistema de agentes permanente** creado
✅ **9 agentes especializados** definidos
✅ **Optimización de costos** por modelo
✅ **Workflow de coordinación** establecido
✅ **Comando `/pm`** disponible
✅ **Validación QA** automática
✅ **Trabajo en paralelo** habilitado

### Lo que cambia para ti:

✅ **Más calidad** - QA valida todo
✅ **Más velocidad** - Trabajo paralelo
✅ **Más transparencia** - Sabes qué pasa
✅ **Mejor costo** - Modelo apropiado para cada tarea
✅ **Menos frustración** - No más trabajo a medias

---

**Este es el nuevo estándar. De aquí en adelante, trabajamos con agentes especializados en paralelo.**

**¿Listo para probarlo? Pide algo complejo y ve la magia.** 🚀

---

_Documento creado: 2026-04-11_
_Versión: 1.0_
_Status: ACTIVO_
