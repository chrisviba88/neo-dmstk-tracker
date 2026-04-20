# 🚀 Guía de Uso: Vista Jerárquica de Proyectos
## NEO DMSTK - Sistema Reorganizado

---

## 🎯 ¿Qué cambió?

### ANTES (Sistema Antiguo)
```
📁 Fundación & Método (45 tareas)
📁 Daruma — prototipo 3D (12 tareas)
📁 Espacio E1 — Madrid (28 tareas)
📁 Kit de Experiencia & Producto (25 tareas)
📁 Branding & Comunicación (48 tareas)
📁 Piloto & Validación (27 tareas)
📁 Escala — E2 + CDMX (22 tareas)
📁 Sin proyecto asignado (20 tareas)
```
❌ Vista plana, abrumadora, difícil de navegar

### AHORA (Sistema Nuevo)
```
🌍 PROYECTOS GLOBALES (aplican a todos los espacios)
├─ [+] Global: Branding & Comunicación (48 tareas) ████████░░ 80%
├─ [+] Global: Daruma (Producto) (13 tareas)
├─ [+] Global: Kit de Experiencia (25 tareas)
├─ [+] Global: Stack Tecnológico (15 tareas)
├─ [+] Global: Método & Piloto (57 tareas)
└─ [+] Global: Formación Facilitadores (16 tareas)

🏢 ESPACIOS FÍSICOS
├─ [+] E1 Madrid — Soft Opening Sep 2026 (28 tareas) ██████░░░░ 60%
│   └─ [Expandido]
│       ├─ [+] Legal & Licencias (10 tareas)
│       ├─ [+] Reforma & Construcción (9 tareas)
│       └─ ...
│
└─ [+] E2 Barcelona — Apertura Oct-Nov 2026 (22 tareas)

🌎 EXPANSIÓN FUTURA
└─ [+] E3 México — Investigación (3 tareas)
```
✅ Vista jerárquica clara, organizada, fácil de entender

---

## 📖 Cómo Usar la Nueva Vista

### 1. Acceder a la Vista

1. Abrir la aplicación NEO DMSTK
2. En el header superior, click en **"📁 Proyectos"**
3. Se abrirá el modal con la vista jerárquica completa

### 2. Navegar por Niveles

#### NIVEL 1: Proyectos Globales
Estos proyectos aplican a **todos los espacios** (E1, E2, E3...):

- **🎨 Global: Branding & Comunicación**
  - Naming, identidad visual, web, redes sociales
  - Todo lo relacionado con marca

- **🎯 Global: Daruma (Producto)**
  - Prototipo 3D, pedidos, protocolos
  - Producto core de la experiencia

- **📦 Global: Kit de Experiencia**
  - Mercancía, packaging, materiales
  - Todo el kit físico

- **⚙️ Global: Stack Tecnológico**
  - Plataformas, CRM, software
  - Infraestructura digital

- **🧠 Global: Método & Piloto**
  - Contenido, currículum, sesiones
  - Método PERMA y validación

- **👥 Global: Formación Facilitadores**
  - Certificación, formación, contratos
  - Equipo de facilitadores

#### NIVEL 2: Espacios Físicos
Proyectos específicos por **ubicación física**:

**🇪🇸 E1 Madrid** (Soft Opening Sep 2026)
```
├─ Legal & Licencias (licencias, contratos)
├─ Búsqueda & Negociación (local, negociación)
├─ Reforma & Construcción (obras, reformas)
├─ Equipamiento & Setup (mobiliario, setup)
├─ Operaciones & Apertura (soft/grand opening)
├─ Finanzas (presupuesto, fundraising)
└─ General (resto de tareas E1)
```

**🇪🇸 E2 Barcelona** (Apertura Oct-Nov 2026)
```
├─ Legal & Licencias
├─ Búsqueda & Negociación
├─ Reforma & Construcción
├─ Equipamiento & Setup
├─ Operaciones & Apertura
├─ Finanzas
└─ General
```

#### NIVEL 3: Expansión Futura
Proyectos de **investigación y expansión**:

**🇲🇽 E3 México**
```
├─ Investigación (research, viabilidad)
└─ General (resto)
```

### 3. Expandir/Colapsar Proyectos

**Para ver tareas de un proyecto:**
- Click en el proyecto
- Se expande mostrando todas sus tareas
- Click de nuevo para colapsar

**Estado se guarda automáticamente:**
- Tu configuración de expand/collapse persiste
- Al reabrir, verás los mismos proyectos expandidos

### 4. Entender las Barras de Progreso

```
Global: Branding & Comunicación (48 tareas) ████████░░ 80%
                                              ↑         ↑
                                    Progreso visual   Porcentaje
```

- **Verde oscuro** = Porcentaje completado
- **Gris claro** = Porcentaje pendiente
- **Número** = % exacto de completado

### 5. Leer las Alertas del Proyecto

Al expandir un proyecto, verás alertas si hay:

```
⚠️ PM: 5 tareas vencidas. Review urgente requerido.
🚧 PM: 3 tareas bloqueadas. Desbloquear esta semana.
👤 PM: 8 tareas sin owner. Asignar ASAP.
```

Tipos de alertas:
- ⚠️ **CRÍTICO** (rojo) = Acción urgente
- 🚧 **WARNING** (amarillo) = Atención esta semana
- 👤 **INFO** (azul) = Acción requerida pronto

### 6. Interpretar las Notas de PM en Cada Tarea

Cada tarea muestra **notas inteligentes del PM**:

```
✓ Brief naming (Hecho)
  💡 PM: Siguiente paso: Validar brief con stakeholders antes de ejecutar.

⏳ Identidad visual cerrada (En curso)
  ⚠️ PM: CRÍTICO - Deadline en 5 días. Revisar con estudio mañana.

📋 Licencia actividad (Pendiente)
  🇪🇸 PM: CONSTRAINT AGOSTO - España paraliza licencias. DEBE completarse antes 1 julio.
  👤 PM: ACCIÓN: Asignar owner ESTA SEMANA. Tarea sin dueño = tarea que no avanza.
```

**Tipos de notas:**

| Icono | Tipo | Significado |
|-------|------|-------------|
| 🔥 | URGENTE | Vence en <3 días o ya vencida |
| ⚠️ | CRÍTICO | Vence en <7 días |
| 🚧 | BLOQUEADA | Depende de tareas pendientes |
| ⭐ | HITO | Tarea estratégica, impacta timeline |
| 🎯 | PRIORIDAD MÁXIMA | No puede retrasarse |
| 💡 | ACCIÓN | Recomendación del PM |
| 🇪🇸 | CONSTRAINT ESPAÑA | Limitación agosto (vacaciones) |
| ⏱️ | LEAD TIME | Pedido con tiempo de entrega largo |
| ➡️ | SIGUIENTE PASO | Qué hacer después |
| 👤 | SIN OWNER | Necesita asignación urgente |

### 7. Editar Tareas Rápidamente

**Cambio rápido de estado:**
```
[Dropdown inline] → Click para cambiar estado directamente
                    Sin abrir modal
```

**Edición completa:**
```
[Click en la tarea] → Abre modal de edición
                      Cambia todos los campos
```

### 8. Entender los Estados de Tarea

Cada tarea tiene un **icono de estado** visual:

| Icono | Estado | Color |
|-------|--------|-------|
| ✓ | Hecho | Verde |
| ⏰ | En curso | Amarillo |
| 🔥 | Urgente | Rojo |
| ⭕ | Pendiente | Azul |
| ✕ | Bloqueado | Gris |

---

## 💡 Mejores Prácticas

### Para Product Managers

1. **Revisar alertas semanalmente:**
   - Expandir todos los proyectos
   - Leer alertas en rojo (⚠️)
   - Actuar sobre tareas vencidas

2. **Seguir recomendaciones del PM:**
   - Las notas 💡 son proactivas
   - Actúa sobre constraints (🇪🇸)
   - Monitorea lead times (⏱️)

3. **Mantener owners asignados:**
   - Alerta 👤 = prioridad alta
   - Tarea sin owner = tarea que no avanza

### Para el Equipo

1. **Actualizar estados inline:**
   - Cambio rápido cuando completas algo
   - No necesitas abrir modal

2. **Revisar tus tareas por espacio:**
   - Si trabajas en E1 → Expandir solo E1
   - Si trabajas en Global → Expandir globales

3. **Leer notas del PM:**
   - Te ayudan a priorizar
   - Te alertan de problemas

---

## 🔧 Solución de Problemas

### "No veo mis proyectos"
→ Scroll hacia abajo, hay 3 niveles

### "Todo aparece colapsado"
→ Click en proyectos para expandir
→ Tu estado se guarda automáticamente

### "Una tarea está en el proyecto incorrecto"
→ Click en la tarea
→ Editar campo "Proyecto"
→ Guardar

### "No veo las notas del PM"
→ Expandir el proyecto primero
→ Las notas aparecen dentro de cada tarea

### "Quiero ver solo E1 Madrid"
→ Expandir solo "E1 Madrid"
→ Colapsar el resto
→ Tu configuración se guarda

---

## 📊 Ejemplo de Uso Diario

### Lunes por la mañana (Review semanal)

1. **Abrir vista jerárquica**
   - Click en "📁 Proyectos"

2. **Revisar proyectos críticos**
   - Expandir "E1 Madrid" (próximo opening)
   - Leer alertas en rojo: ⚠️ 5 tareas vencidas
   - Expandir "Legal & Licencias"

3. **Actuar sobre alertas**
   - Ver tarea "Licencia actividad"
   - Leer nota: 🇪🇸 Constraint agosto - debe completarse antes 1 julio
   - Click en tarea → Asignar a Cristina
   - Cambiar estado a "En curso"

4. **Revisar progreso global**
   - Ver barra "E1 Madrid": 60%
   - Comparar con E2: 40%
   - Priorizar E1 (deadline más cercano)

### Viernes por la tarde (Cierre de semana)

1. **Actualizar tareas completadas**
   - Expandir proyectos trabajados
   - Cambiar estados inline a "Hecho"
   - Ver cómo sube el % de progreso

2. **Planificar próxima semana**
   - Leer notas ⏰ (En curso)
   - Ver qué tareas están a <7 días
   - Priorizar según notas del PM

---

## 🎓 Conceptos Clave

### ¿Por qué 3 niveles?

**NIVEL 1: GLOBAL**
→ Tareas que sirven para TODOS los espacios
→ Ejemplo: El branding es el mismo en E1, E2, E3

**NIVEL 2: ESPACIOS**
→ Tareas específicas de UNA ubicación física
→ Ejemplo: Licencia de E1 Madrid no sirve para E2 Barcelona

**NIVEL 3: EXPANSIÓN**
→ Investigación de espacios futuros
→ Ejemplo: Viabilidad de abrir en México

### ¿Cómo se decidió la clasificación?

**Automática con IA:**
- Script lee el nombre de cada tarea
- Analiza keywords (ej: "licencia" → Legal)
- Asigna al proyecto correcto
- 227 tareas reasignadas en segundos

**Puedes cambiarla manualmente:**
- Click en tarea → Editar → Cambiar proyecto
- El sistema aprende de tus cambios

---

## 🚀 Próximos Pasos

1. **Familiarízate con la vista**
   - Abre y cierra proyectos
   - Lee las notas del PM
   - Cambia algunos estados

2. **Ajusta según tu workflow**
   - Expande solo lo que necesitas ver
   - Colapsa el resto para claridad

3. **Usa las notas del PM**
   - Son tus alertas tempranas
   - Te ayudan a priorizar

4. **Comparte con el equipo**
   - Enseña la nueva estructura
   - Explica los 3 niveles
   - Define quién monitorea qué

---

**¿Dudas o sugerencias?**
Esta vista está diseñada para evolucionar contigo.
Si algo no funciona, ajústalo. El sistema es tuyo.

🎯 **Objetivo cumplido:** Vista clara, profesional, no abrumadora.
