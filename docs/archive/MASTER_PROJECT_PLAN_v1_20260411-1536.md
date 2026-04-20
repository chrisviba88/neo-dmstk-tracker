# 🎯 MASTER PROJECT PLAN - NEO DMSTK

**Project Manager Principal**: AI Orchestrator
**Sub-PM de Control**: Project Tracker Agent
**Fecha**: 2026-04-11 (Sábado)
**Tiempo disponible**: 3-4 horas
**Modo**: Ejecución en paralelo con equipo de élite

---

## 👥 EQUIPO DE SUB-AGENTES ACTIVOS

### **TIER 1: AGENTES CORE** (Superiores - Siempre activos)

1. **🏗️ Chief Architect** (Superior al PM)
   - Responsabilidad: Arquitectura escalable, patrones, estructura modular
   - Decisiones: Stack tech, performance, seguridad
   - Output: Código production-ready
   - Status: ✅ ACTIVO

2. **📊 Senior Project Manager** (Superior al PM)
   - Responsabilidad: Dependencias, timeline, riesgos críticos
   - Decisiones: Priorización, resource allocation
   - Output: Plans, forecasts, alerts
   - Status: ✅ ACTIVO

3. **🎨 Lead Visual Data Communicator** (Superior al PM)
   - Responsabilidad: UX/UI, dashboards, gráficas, claridad visual
   - Decisiones: Colores semánticos, layouts, información architecture
   - Output: Componentes visuales profesionales
   - Status: ✅ ACTIVO

4. **⚡ Performance Engineer** (Superior al PM)
   - Responsabilidad: Optimización, escalabilidad, eficiencia
   - Decisiones: Algorithms, caching, virtualización
   - Output: Sistema rápido con 1000+ tareas
   - Status: ✅ ACTIVO

5. **🔒 Security & Permissions Lead** (Superior al PM)
   - Responsabilidad: RBAC, audit logs, data integrity
   - Decisiones: Permisos granulares, encryption
   - Output: Sistema seguro y auditable
   - Status: ✅ ACTIVO

### **TIER 2: AGENTES ESPECIALIZADOS** (On-demand)

6. **📈 Data Scientist**
   - Responsabilidad: Analytics, forecasting, ML
   - Output: Predicciones, insights
   - Status: ⏸️ STANDBY

7. **🔗 Integration Specialist**
   - Responsabilidad: Slack, Email, Push, APIs
   - Output: Notificaciones multicanal
   - Status: ⏸️ STANDBY

8. **🧪 QA Engineer**
   - Responsabilidad: Testing, validación, edge cases
   - Output: Sistema sin bugs
   - Status: ⏸️ STANDBY

9. **📝 Technical Writer**
   - Responsabilidad: Documentación clara
   - Output: Docs para usuarios
   - Status: ⏸️ STANDBY

### **TIER 3: AGENTE DE COORDINACIÓN**

10. **🎯 Project Tracker Agent** (Sub-PM de Control)
    - Responsabilidad: Tracking de TODO, nada se olvida
    - Decisiones: Qué falta, qué está bloqueado
    - Output: Status reports en tiempo real
    - Status: ✅ ACTIVO PERMANENTE

---

## 🚨 ANÁLISIS CRÍTICO DE GAPS

### **LO QUE FALTA IMPLEMENTAR (Priorizado)**

#### **P0 - BLOQUEANTE** (Hacer en las próximas 4 horas)

1. ✅ **Sistema de Colores Semánticos** (Visual Data Communicator)
   - Rojo: Vencidas, bloqueantes
   - Amarillo: En riesgo, próximas a vencer
   - Verde: Completadas, on track
   - Azul: Hitos próximos
   - Gris: Bloqueadas por dependencias
   - **Owner**: Lead Visual Data Communicator
   - **Time**: 30 min
   - **Status**: 🟡 EN COLA

2. ✅ **Dashboard Ejecutivo Visual** (Visual Data Communicator + Data Scientist)
   - Gráficas hermosas (Recharts)
   - Calendario 5 días hábiles próximos
   - Progress rings por workstream
   - Próximos 5 hitos (clickeables → 5Ws)
   - Burn-down chart
   - **Owner**: Lead Visual Data Communicator
   - **Time**: 2 horas
   - **Status**: 🟡 EN COLA

3. ✅ **Sistema de Dependencias en Frontend** (Chief Architect + Senior PM)
   - Modal de impacto al cambiar fechas
   - Árbol de dependencias visual
   - Propagación con preview
   - **Owner**: Chief Architect
   - **Time**: 1.5 horas
   - **Status**: 🟡 EN COLA

4. ✅ **Timeline Robusto** (Lead Visual Data Communicator + Performance Engineer)
   - Zoom dinámico (2px, 4px, 8px/día)
   - Líneas de dependencias (SVG arrows)
   - Drag & drop con preview
   - Indicador HOY
   - **Owner**: Lead Visual Data Communicator
   - **Time**: 2 horas
   - **Status**: 🟡 EN COLA

5. ✅ **Sistema de Permisos RBAC** (Security & Permissions Lead)
   - Admin: David + Jefe
   - Editor: Christian, Cristina
   - Viewer: Compañeros
   - **Owner**: Security Lead
   - **Time**: 1 hora
   - **Status**: 🟡 EN COLA

#### **P1 - ALTA PRIORIDAD** (Si queda tiempo)

6. ⏸️ **Validación de Datos** (Chief Architect)
   - Fechas start < end
   - Dependencias circulares
   - IDs válidos
   - **Time**: 30 min

7. ⏸️ **Error Handling Robusto** (Chief Architect)
   - Try/catch en todos los endpoints
   - Rollback en errores
   - **Time**: 30 min

8. ⏸️ **Notificaciones Slack** (Integration Specialist)
   - Setup básico
   - Alertas críticas
   - **Time**: 1 hora

---

## 🎨 SISTEMA DE COLORES SEMÁNTICOS (DETALLADO)

### **Reglas de Color por Estado**

```javascript
const SEMANTIC_COLORS = {
  // Estados de tarea
  taskStatus: {
    'Hecho': { bg: '#E5F8F0', text: '#2C8A66', border: '#96C7B3' },
    'En curso': { bg: '#E5F3FF', text: '#2E7DB8', border: '#6398A9' },
    'Pendiente': { bg: '#FFF9E5', text: '#D68910', border: '#E2B93B' },
    'Urgente': { bg: '#FFE5CC', text: '#D66310', border: '#D7897F' },
    'Bloqueado': { bg: '#F0F0F0', text: '#666666', border: '#9A948C' },
  },

  // Prioridad
  priority: {
    'Crítica': { bg: '#FFE5E5', text: '#C0564A', icon: '🔥' },
    'Alta': { bg: '#FFE5CC', text: '#D68910', icon: '⚠️' },
    'Media': { bg: '#FFF9E5', text: '#9A8A66', icon: '📌' },
  },

  // Condiciones temporales
  temporal: {
    overdue: { bg: '#FFE5E5', text: '#C0564A', pulse: true, icon: '🚨' },
    dueSoon: { bg: '#FFE5CC', text: '#D68910', icon: '⏰' }, // <7 días
    onTrack: { bg: '#E5F8F0', text: '#2C8A66', icon: '✅' },
  },

  // Dependencias
  dependencies: {
    blocked: { color: '#9A948C', icon: '🔒', style: 'dashed' },
    blocking: { color: '#D7897F', icon: '⚠️', weight: 3 },
    normal: { color: '#6398A9', icon: '→', weight: 2 },
  },

  // Camino crítico
  criticalPath: {
    critical: { border: '3px solid #C0564A', glow: true },
    nearCritical: { border: '2px solid #E2B93B' },
    normal: { border: '1px solid #D8D2CA' },
  },

  // Hitos
  milestone: {
    completed: { color: '#96C7B3', icon: '◆', size: 24 },
    upcoming: { color: '#6398A9', icon: '◆', size: 24, pulse: true },
    overdue: { color: '#C0564A', icon: '◆', size: 24, pulse: true },
  },
};
```

### **Lógica de Aplicación de Colores**

```javascript
function getTaskColor(task, today) {
  const endDate = new Date(task.endDate);
  const daysUntilDue = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));

  // Prioridad 1: Vencidas
  if (task.status !== 'Hecho' && endDate < today) {
    return SEMANTIC_COLORS.temporal.overdue;
  }

  // Prioridad 2: Próximas a vencer (<7 días)
  if (task.status !== 'Hecho' && daysUntilDue < 7 && daysUntilDue >= 0) {
    return SEMANTIC_COLORS.temporal.dueSoon;
  }

  // Prioridad 3: Bloqueadas
  if (task.status === 'Bloqueado') {
    return SEMANTIC_COLORS.taskStatus['Bloqueado'];
  }

  // Prioridad 4: Por estado
  if (task.status === 'Hecho') {
    return SEMANTIC_COLORS.temporal.onTrack;
  }

  // Default: Por estado actual
  return SEMANTIC_COLORS.taskStatus[task.status] || SEMANTIC_COLORS.taskStatus['Pendiente'];
}
```

---

## 📊 DASHBOARD EJECUTIVO (ESPECIFICACIÓN DETALLADA)

### **Layout del Dashboard**

```
┌─────────────────────────────────────────────────────────────┐
│  NEO DMSTK - Dashboard Ejecutivo                     🟢 100 │
│                                                   Health Score│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│ │ 🔥 Próximos  │  │ ⚠️  En Riesgo│  │ ✅ Completado│        │
│ │  5 Hitos     │  │   12 tareas  │  │  45 / 109    │        │
│ │ [Clickeable] │  │ [Clickeable] │  │    41%       │        │
│ └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │  📅 Próximos 5 Días Hábiles                          │   │
│ │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│ │                                                       │   │
│ │  Lun 14 Abr  │ 🔥 t30 Confirmar profesor/a          │   │
│ │              │ ⚠️  t51 Proveedor 3D                  │   │
│ │                                                       │   │
│ │  Mar 15 Abr  │ 📌 t03 Reporting semanal             │   │
│ │                                                       │   │
│ │  Mié 16 Abr  │ (Sin tareas críticas)                │   │
│ │                                                       │   │
│ │  Jue 17 Abr  │ 🔥 t08 Contrato profesor/a          │   │
│ │              │ 🔥 t50 Diseño 3D Daruma              │   │
│ │                                                       │   │
│ │  Vie 18 Abr  │ ⚠️  t09 Contrato coach Miguel        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌──────────────────────┐  ┌─────────────────────────────┐   │
│ │ 📊 Progreso por Área │  │ 📈 Burn-down Chart         │   │
│ │ (Progress Rings)     │  │ (Line Chart)               │   │
│ │                      │  │                            │   │
│ │ ◯ Dirección    43%   │  │      Ideal ┄┄┄┄            │   │
│ │ ◯ Legal        31%   │  │      Real  ━━━━            │   │
│ │ ◯ Método       28%   │  │                            │   │
│ │ [Click → 5Ws]        │  │ Abr  May  Jun  Jul  Ago    │   │
│ └──────────────────────┘  └─────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🎯 Próximos Hitos (Click para detalles)              │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│ │                                                       │   │
│ │ ◆ t06 GO/NO-GO (20 Jun) - 69 días     [Click]      │   │
│ │   Depende de: t05 → t102 → t101 → t99/t100          │   │
│ │   Crítico: Si falla, reforma se retrasa +14 días    │   │
│ │                                                       │   │
│ │ ◆ t55 Kits piloto (16 May) - 35 días  [Click]      │   │
│ │   Depende de: t35, t50                              │   │
│ │   Crítico: Sin kits, piloto no arranca              │   │
│ │                                                       │   │
│ │ ... (3 más)                                          │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### **Modal de Hito (Al hacer click)**

```
┌─────────────────────────────────────────────────┐
│ 🎯 HITO: GO/NO-GO con board                    │
│ Fecha: 20 Junio 2026 (69 días)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📋 LAS 5Ws:                                    │
│                                                 │
│ WHO (Quién):                                    │
│ • David (presenta)                              │
│ • Board (decide)                                │
│ • Equipo completo (afectado)                    │
│                                                 │
│ WHAT (Qué):                                     │
│ Decisión de escala. El board aprueba (GO) o    │
│ rechaza (NO-GO) invertir en escalar NEO DMSTK   │
│ basado en resultados del piloto.                │
│                                                 │
│ WHEN (Cuándo):                                  │
│ 20 Junio 2026, 10:00 AM (estimado)             │
│ En 69 días desde hoy                            │
│                                                 │
│ WHERE (Dónde):                                  │
│ Oficina central / Zoom con board               │
│                                                 │
│ WHY (Por qué):                                  │
│ Sin GO, no hay fondos para:                     │
│ • Reforma del espacio                           │
│ • Contratar equipo permanente                   │
│ • Producción a escala                           │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                 │
│ 🔗 DEPENDENCIAS (Para que esto suceda):        │
│                                                 │
│ ✅ t05: Presentación GO/NO-GO preparada         │
│    └─ ✅ t102: Informe GO/NO-GO completo        │
│       └─ ✅ t101: Datos del piloto analizados   │
│          └─ ⏳ t99: Sesiones cortas (8x2)       │
│          └─ ⏳ t100: Programa largo (4x1)       │
│             └─ ⏳ t98: Piloto arrancado         │
│                └─ ⏳ t55: Kits listos           │
│                └─ ⏳ t91b: Facilitador cert.    │
│                └─ ⏳ t25: Manual v0 completo    │
│                                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                 │
│ ⚠️  RIESGOS:                                   │
│                                                 │
│ 🔴 Si se retrasa:                              │
│    • Reforma se mueve de 25 Jun a 9 Jul        │
│    • Soft Opening de 1 Sep a 15 Sep            │
│    • Budget overrun estimado: +15K€             │
│                                                 │
│ 🟡 Plan B si NO-GO:                            │
│    • Reformular método con datos piloto        │
│    • Segundo piloto en 4 semanas                │
│    • Nueva decisión GO/NO-GO en Ago            │
│                                                 │
│ [Cerrar]                    [Ver en Timeline]   │
└─────────────────────────────────────────────────┘
```

---

## 🌐 DEPLOYMENT Y ACCESO MULTI-USUARIO

### **Pregunta: ¿Puede tu jefe verlo desde otra computadora/red?**

**Respuesta Actual**: ❌ NO

**Por qué**:
- Frontend: http://localhost:5173 (solo tu máquina)
- Backend: http://localhost:3001 (solo tu máquina)
- Si apagas tu compu: ❌ Todo se cae

**Solución: Deployment a producción**

#### **Opción A: Vercel (Frontend) + Railway (Backend)** ⭐ RECOMENDADO

**Setup** (15 minutos):

1. **Frontend en Vercel**:
   ```bash
   cd frontend
   vercel login
   vercel --prod
   ```
   - URL resultante: https://neo-dmstk.vercel.app
   - Actualización automática con cada push a GitHub

2. **Backend en Railway**:
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```
   - URL resultante: https://neo-dmstk-backend.railway.app
   - Variables de entorno (Supabase, etc.) en dashboard

3. **Conectar Frontend con Backend**:
   ```javascript
   // frontend/.env.production
   VITE_BACKEND_URL=https://neo-dmstk-backend.railway.app
   ```

**Resultado**:
- ✅ Tu jefe accede desde cualquier lugar
- ✅ Funciona 24/7
- ✅ Si apagas tu compu, sigue funcionando
- ✅ Múltiples usuarios simultáneos
- ✅ Actualizaciones en tiempo real para todos

**Costo**: $0-10/mes (free tier de ambos)

#### **Opción B: Todo en Vercel** (Más simple)

- Frontend: Vercel
- Backend: Vercel Serverless Functions
- **Limitación**: No WebSockets (no tiempo real)

#### **Opción C: Render.com** (Alternativa)

- Todo en una plataforma
- $7/mes por servicio

---

## 📋 MASTER TASK LIST (Tracking Completo)

### **Estado Actual del Proyecto**

```
✅ COMPLETADO (7 tareas)
├─ Base de datos (109 tareas migradas)
├─ Sistema de grafos (algoritmos)
├─ Propagación de dependencias
├─ Historial profesional (5Ws)
├─ Metadata enriquecida
├─ Arquitectura modular
└─ Documentación completa

🟡 EN PROGRESO (5 tareas)
├─ Sistema de colores semánticos
├─ Dashboard ejecutivo visual
├─ Modal de impacto de dependencias
├─ Timeline robusto
└─ Sistema de permisos

⏸️ PENDIENTE (8 tareas)
├─ Validación de datos
├─ Error handling
├─ Notificaciones Slack
├─ Email semanal
├─ Push notifications
├─ Agente IA mejorado
├─ Deployment a producción
└─ Testing completo

🚫 BLOQUEADO (0 tareas)
```

---

## ⚡ PLAN DE EJECUCIÓN (Próximas 4 horas)

### **Hora 1 (00:00 - 01:00)**

**EN PARALELO**:

1. **Lead Visual Data Communicator**:
   - ✅ Implementar sistema de colores semánticos (20 min)
   - ✅ Crear componente de Progress Rings (20 min)
   - ✅ Calendario de 5 días hábiles (20 min)

2. **Chief Architect**:
   - ✅ API endpoints de dependencias (30 min)
   - ✅ Validación de datos (20 min)
   - ✅ Error handling (10 min)

3. **Security Lead**:
   - ✅ Sistema RBAC backend (40 min)
   - ✅ Middleware de permisos (20 min)

### **Hora 2 (01:00 - 02:00)**

**EN PARALELO**:

1. **Lead Visual Data Communicator**:
   - ✅ Dashboard ejecutivo (layout) (30 min)
   - ✅ Gráficas (Recharts integration) (30 min)

2. **Chief Architect**:
   - ✅ Modal de impacto de dependencias (40 min)
   - ✅ Integrar con API (20 min)

3. **Performance Engineer**:
   - ✅ Optimizar cálculos de KPIs (30 min)
   - ✅ Memoización agresiva (30 min)

### **Hora 3 (02:00 - 03:00)**

**EN PARALELO**:

1. **Lead Visual Data Communicator**:
   - ✅ Timeline robusto (zoom) (30 min)
   - ✅ Líneas de dependencias SVG (30 min)

2. **Chief Architect**:
   - ✅ Modal de hito (5Ws) (30 min)
   - ✅ Vista de dependencias (árbol) (30 min)

3. **Integration Specialist** (ACTIVADO):
   - ✅ Slack notifications (setup) (40 min)
   - ✅ Testing (20 min)

### **Hora 4 (03:00 - 04:00)**

**EN PARALELO**:

1. **QA Engineer** (ACTIVADO):
   - ✅ Testing completo (40 min)
   - ✅ Edge cases (20 min)

2. **Technical Writer** (ACTIVADO):
   - ✅ Documentación de usuario (30 min)
   - ✅ Guía de deployment (30 min)

3. **Project Tracker Agent**:
   - ✅ Generar reporte final (20 min)
   - ✅ Lista de pendientes (10 min)
   - ✅ Plan para mañana (10 min)

---

## 🎯 SUCCESS CRITERIA (¿Cuándo habremos terminado?)

✅ **Dashboard ejecutivo funcionando**
✅ **Colores semánticos aplicados**
✅ **Modal de impacto funcional**
✅ **Timeline con zoom y dependencias**
✅ **Sistema de permisos activo**
✅ **5Ws de hitos clickeables**
✅ **Progreso por área clickeable**
✅ **Notificaciones Slack básicas**
✅ **Testing sin errores críticos**
✅ **Documentación completa**

---

## 🚀 ¡COMENZANDO EJECUCIÓN!

**Project Tracker Agent** iniciando monitoreo...
**Sub-agentes** activándose en paralelo...
**Cronómetro** iniciado: 4:00:00

¿Listo para empezar? 🔥
