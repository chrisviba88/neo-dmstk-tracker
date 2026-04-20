# 📂 ESTRUCTURA DEL PROYECTO - GUÍA VISUAL

**Fecha:** 2026-04-11
**Versión:** 1.0
**Reorganizado por:** Claude Code

---

## 🎯 PROPÓSITO DE ESTE DOCUMENTO

Este documento explica cómo está organizado TODO el proyecto Neo DMSTK para que tú (Christian), los desarrolladores, y los agentes de IA sepan exactamente dónde encontrar cada cosa.

---

## 📊 ESTRUCTURA VISUAL COMPLETA

```
📦 neo-dmstk-app/
│
├── 📄 README.md ⭐ ← EMPIEZA AQUÍ (Navegación completa)
├── 📄 .gitignore
├── 📄 setup.sh
├── 📄 vercel.json
│
├── 📁 .claude/ ← SISTEMA DE AGENTES
│   ├── AGENT_SYSTEM.md           (Arquitectura 9 agentes)
│   ├── README.md                 (Guía rápida)
│   └── commands/
│       └── pm.md                 (Comando /pm)
│
├── 📁 docs/ ← TODA LA DOCUMENTACIÓN
│   │
│   ├── 📁 01-inicio/ ← EMPIEZA POR AQUÍ
│   │   ├── 01_EMPIEZA_AQUI_v1_20260411.md
│   │   ├── 02_PASOS_SIGUIENTES_v1_20260411.md ⭐ (ACCIÓN INMEDIATA)
│   │   └── 03_QUICK_START_v1_20260410.md
│   │
│   ├── 📁 02-arquitectura/ ← DISEÑO DEL SISTEMA
│   │   ├── 01_ARQUITECTURA_SISTEMA_v1_20260411.md
│   │   ├── 02_DEPENDENCIAS_v1_20260411.md
│   │   └── 03_DEPLOYMENT_CHECKLIST_v1_20260411.md
│   │
│   ├── 📁 03-implementacion/ ← QUÉ SE CONSTRUYÓ
│   │   ├── 01_IMPLEMENTACION_COMPLETA_v1_20260411.md
│   │   ├── 02_HISTORIAL_INTEGRACION_v1_20260411.md
│   │   └── 03_RESUMEN_IMPLEMENTACION_v1_20260410.md
│   │
│   ├── 📁 04-sesiones/ ← AUDITORÍAS Y REPORTES
│   │   ├── 01_AUDITORIA_SESION_v1_20260411-1651.md
│   │   ├── 02_RESUMEN_CHRISTIAN_v1_20260411-1653.md ⭐ (LEE ESTO)
│   │   ├── 03_INSTRUCCIONES_FINALES_v1_20260411-1657.md
│   │   └── 04_MASTER_CHECKLIST_v1_20260411-1645.md
│   │
│   ├── 📁 05-agentes/ ← SISTEMA DE IA
│   │   └── 01_GUIA_SISTEMA_AGENTES_v1_20260411-1645.md
│   │
│   └── 📁 archive/ ← DOCS ANTIGUAS (no leas)
│       ├── INSTRUCCIONES_CHRISTIAN_v1_20260411-1328.md
│       ├── MASTER_PROJECT_PLAN_v1_20260411-1536.md
│       ├── PARA_EL_EQUIPO_v1_20260410-2211.md
│       └── RESUMEN_FINAL_SISTEMA_v1_20260411-1532.md
│
├── 📁 backend/ ← SERVIDOR NODE.JS
│   ├── server.js ⭐ (Servidor principal)
│   ├── package.json
│   ├── .env (gitignored)
│   │
│   ├── 📁 scripts/ ← SCRIPTS DE MIGRACIÓN
│   │   ├── 01_migrate-data_v1_20260410.js
│   │   ├── 02_migrate-data-complete_v2_20260411.js
│   │   ├── 03_run-migration_v1_20260411.js ⭐ (Ejecutar migración)
│   │   └── 04_verify-migration_v1_20260411.js ⭐ (Verificar migración)
│   │
│   ├── 📁 docs/
│   │   └── HISTORY_INTEGRATION_TEST_v1_20260411.md
│   │
│   ├── 📄 migration-activity-log.sql ⭐ (SQL para historial)
│   └── 📁 node_modules/
│
├── 📁 frontend/ ← APLICACIÓN REACT
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   ├── 📁 src/
│   │   ├── App.jsx ⭐ (Componente principal)
│   │   ├── main.jsx
│   │   │
│   │   └── 📁 components/
│   │       ├── EnhancedDashboard.jsx ⭐ (Dashboard principal)
│   │       ├── ExecutiveDashboard.jsx ⭐ (Vista ejecutiva)
│   │       ├── FiveDayCalendar.jsx
│   │       ├── ProgressRing.jsx
│   │       └── HistoryViewer.jsx
│   │
│   ├── 📁 docs/
│   │   ├── 01_ARQUITECTURA_FRONTEND_v1_20260411.md
│   │   ├── 02_VISUALIZACION_DEPS_v1_20260411.md
│   │   └── 03_GUIA_INTEGRACION_v1_20260411.md
│   │
│   └── 📁 node_modules/
│
└── 📁 shared/ ← RECURSOS COMPARTIDOS
```

---

## 🔢 CONVENCIÓN DE NOMBRES EXPLICADA

### Para archivos de documentación:

```
[número]_[NOMBRE]_v[versión]_[fecha][hora].md
  └─┬─┘   └──┬──┘   └─┬──┘   └───┬───┘└─┬─┘
    │        │         │          │      │
    │        │         │          │      └─ Hora (opcional): 1651 = 16:51
    │        │         │          └─ Fecha: YYYYMMDD (20260411 = 11 abril 2026)
    │        │         └─ Versión: v1, v2, v3...
    │        └─ Nombre descriptivo en MAYÚSCULAS
    └─ Número de orden: 01, 02, 03...
```

**Ejemplos reales:**

| Archivo | Desglose | Significado |
|---------|----------|-------------|
| `01_EMPIEZA_AQUI_v1_20260411.md` | 01 + EMPIEZA_AQUI + v1 + 20260411 | Primer doc a leer, versión 1, del 11 abril 2026 |
| `02_RESUMEN_CHRISTIAN_v1_20260411-1653.md` | 02 + RESUMEN_CHRISTIAN + v1 + 20260411 + 1653 | Segundo doc, versión 1, del 11 abril a las 16:53 |
| `03_run-migration_v1_20260411.js` | 03 + run-migration + v1 + 20260411 | Tercer script, versión 1, del 11 abril |

**Beneficios:**

✅ **Auto-ordenamiento:** Los archivos se ordenan automáticamente por número
✅ **Cronología clara:** Sabes cuál es más nuevo por la fecha
✅ **Versionamiento:** Puedes tener v1, v2, v3 del mismo documento
✅ **Timestamp exacto:** Con hora opcional sabes la secuencia exacta

---

## 🗺️ CÓMO NAVEGAR - FLUJO RECOMENDADO

### 🚀 Primera vez en el proyecto:

```
1. README.md (raíz)
   ↓
2. docs/01-inicio/02_PASOS_SIGUIENTES_v1_20260411.md
   ↓
3. Ejecutar migración SQL (instrucciones en el paso 2)
   ↓
4. Probar app en http://localhost:5173
```

### 👨‍💻 Como desarrollador:

```
1. README.md
   ↓
2. docs/02-arquitectura/01_ARQUITECTURA_SISTEMA_v1_20260411.md
   ↓
3. frontend/docs/ (si trabajas frontend)
   o
   backend/docs/ (si trabajas backend)
```

### 🎯 Como PM/Owner (Christian):

```
1. README.md
   ↓
2. docs/04-sesiones/02_RESUMEN_CHRISTIAN_v1_20260411-1653.md
   ↓
3. docs/01-inicio/02_PASOS_SIGUIENTES_v1_20260411.md
   ↓
4. Ejecutar migración + testing
```

### 🤖 Para usar sistema de agentes:

```
1. docs/05-agentes/01_GUIA_SISTEMA_AGENTES_v1_20260411-1645.md
   ↓
2. .claude/AGENT_SYSTEM.md
   ↓
3. Usa comando /pm o pide activación explícita
```

---

## 📋 ÍNDICE RÁPIDO - QUÉ ESTÁ DÓNDE

| Necesito... | Dónde encontrarlo |
|-------------|-------------------|
| **Empezar rápido** | `docs/01-inicio/02_PASOS_SIGUIENTES_v1_20260411.md` |
| **Ver qué funciona y qué no** | `docs/04-sesiones/01_AUDITORIA_SESION_v1_20260411-1651.md` |
| **Entender arquitectura** | `docs/02-arquitectura/01_ARQUITECTURA_SISTEMA_v1_20260411.md` |
| **Saber qué se implementó** | `docs/03-implementacion/01_IMPLEMENTACION_COMPLETA_v1_20260411.md` |
| **Ejecutar migración SQL** | `backend/migration-activity-log.sql` + pasos en `02_PASOS_SIGUIENTES` |
| **Verificar migración** | `backend/scripts/04_verify-migration_v1_20260411.js` |
| **Activar agentes** | `.claude/AGENT_SYSTEM.md` + comando `/pm` |
| **Ver componentes React** | `frontend/src/components/` |
| **Servidor backend** | `backend/server.js` |
| **Docs frontend** | `frontend/docs/` |
| **Docs backend** | `backend/docs/` |

---

## 🎨 CÓDIGO DE COLORES (en este doc)

- ⭐ = Archivo crítico / Acción inmediata
- 📄 = Archivo
- 📁 = Carpeta
- ← = Explicación adicional

---

## 📊 MÉTRICAS DE LA REORGANIZACIÓN

**ANTES:**
- ❌ 18 archivos .md en la raíz sin orden
- ❌ Scripts de migración mezclados con código
- ❌ Sin convención de nombres
- ❌ Imposible saber qué doc es el más reciente

**DESPUÉS:**
- ✅ 5 carpetas temáticas numeradas
- ✅ Scripts organizados en `backend/scripts/`
- ✅ Convención clara: `número_NOMBRE_vVERSION_FECHA.md`
- ✅ Fácil saber qué leer primero y cuál es más nuevo

---

## 🔄 ACTUALIZACIÓN DE DOCUMENTOS

Cuando necesites crear una **nueva versión** de un documento existente:

**Ejemplo:** Quieres actualizar `02_PASOS_SIGUIENTES_v1_20260411.md`

**Pasos:**
1. Copia el archivo
2. Incrementa la versión: `v1` → `v2`
3. Actualiza la fecha: `20260411` → `20260412` (nueva fecha)
4. Opcional: Agrega hora si hay múltiples versiones el mismo día

**Resultado:**
```
02_PASOS_SIGUIENTES_v2_20260412-1430.md
```

**NO BORRES** la versión anterior - múvela a `archive/` si ya no sirve.

---

## 🚨 ARCHIVOS QUE NO DEBES MOVER/RENOMBRAR

Estos archivos tienen rutas fijas que el sistema espera:

- ✋ `README.md` (raíz)
- ✋ `.gitignore`
- ✋ `package.json` (backend y frontend)
- ✋ `vercel.json`
- ✋ `server.js` (backend)
- ✋ `App.jsx` (frontend/src)
- ✋ `.env` (backend)
- ✋ `migration-activity-log.sql` (backend)

**Todos los demás archivos .md** siguen la nueva convención.

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Por qué números antes del nombre?**
R: Para que se ordenen automáticamente y sepas el orden de lectura.

**P: ¿Por qué fecha en el nombre?**
R: Para saber cuál es más reciente sin abrir el archivo.

**P: ¿Por qué versiones (v1, v2)?**
R: Para poder tener múltiples versiones del mismo documento sin perder la original.

**P: ¿Qué pasa con los docs en `archive/`?**
R: Son documentos antiguos o reemplazados. Solo úsalos para contexto histórico.

**P: ¿Puedo mover archivos entre carpetas?**
R: Sí, pero actualiza las referencias en README.md y otros documentos que los mencionen.

**P: ¿Los agentes entienden esta estructura?**
R: Sí. Claude Code lee el README.md y sabe exactamente dónde buscar cada cosa.

---

## ✅ CHECKLIST DE VERIFICACIÓN

Para comprobar que la estructura está correcta:

- [ ] Existe `README.md` en la raíz con mapa completo
- [ ] Carpeta `docs/` contiene 6 subcarpetas (01 a 05 + archive)
- [ ] Cada documento sigue convención `número_NOMBRE_vX_FECHA.md`
- [ ] `backend/scripts/` contiene 4 scripts numerados
- [ ] `backend/docs/` existe y contiene docs del backend
- [ ] `frontend/docs/` existe y contiene docs del frontend
- [ ] `.claude/` contiene sistema de agentes
- [ ] Archivos más recientes tienen fechas/horas mayores

---

## 🎯 PRÓXIMOS PASOS

Después de leer este documento:

1. **Ve al README.md** (raíz) para navegación completa
2. **Lee** `docs/01-inicio/02_PASOS_SIGUIENTES_v1_20260411.md`
3. **Ejecuta** migración SQL
4. **Prueba** la app

---

**Creado:** 2026-04-11 17:50
**Por:** Claude Code
**Versión:** 1.0
**Ubicación:** `docs/00_ESTRUCTURA_PROYECTO_v1_20260411.md`

---

**SIGUIENTE PASO:** Abre el `README.md` en la raíz del proyecto 👆
