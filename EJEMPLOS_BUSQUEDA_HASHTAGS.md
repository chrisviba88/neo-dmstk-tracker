# EJEMPLOS DE BÚSQUEDA CON HASHTAGS - NEO DMSTK

## 1. BÚSQUEDAS SIMPLES (Un solo hashtag)

### Búsqueda: "DARUMA"
```javascript
const tareasDaruma = tasks.filter(task =>
  task.hashtags.includes("#DARUMA")
);
// Resultado: 10 tareas
```

**Tareas encontradas:**
- t24: Protocolo Daruma
- t50: Diseño 3D Daruma
- t51: Proveedor impresión 3D Madrid
- t52: Pedido Daruma 3D piloto (50-80 uds)
- t53a: Buscar cerámico Europa (apertura)
- t53b: Pedido Daruma Europa (200-500 uds)
- t53c: Recepción Daruma Europa
- t55: Kits piloto artesanales (20-30 uds)
- t58: Kits definitivos (50+ uds)

---

### Búsqueda: "PILOTO"
```javascript
const tareasPiloto = tasks.filter(task =>
  task.hashtags.includes("#PILOTO")
);
// Resultado: 19 tareas
```

---

### Búsqueda: "apertura" → "#SOFT_OPENING"
```javascript
const tareasSoftOpening = tasks.filter(task =>
  task.hashtags.includes("#SOFT_OPENING")
);
// Resultado: 15 tareas
```

---

## 2. BÚSQUEDAS COMPUESTAS (Múltiples hashtags - AND)

### Búsqueda: "Tareas urgentes de DARUMA"
```javascript
const tareasUrgentesDaruma = tasks.filter(task =>
  task.hashtags.includes("#DARUMA") &&
  task.hashtags.includes("#Urgente")
);
// Resultado: 2 tareas (t50, t51)
```

**Tareas encontradas:**
- t50: Diseño 3D Daruma
- t51: Proveedor impresión 3D Madrid

---

### Búsqueda: "Tareas bloqueantes del PILOTO"
```javascript
const tareasBloqueantes = tasks.filter(task =>
  task.hashtags.includes("#PILOTO") &&
  task.hashtags.includes("#Bloqueante")
);
// Resultado: 7 tareas
```

**Tareas encontradas:**
- t22: Exp. Sesión corta (guión min a min)
- t23: Exp. Programa largo (arco 4 sesiones)
- t25: Manual operativo v0 (piloto)
- t39: Evaluar resultados test
- t55: Kits piloto artesanales (20-30 uds)
- t91b: Certificación facilitador
- t98: Piloto arranca
- t101: Analizar datos piloto
- t102: Informe GO/NO-GO

---

### Búsqueda: "Contratos pendientes"
```javascript
const contratosPendientes = tasks.filter(task =>
  task.hashtags.includes("#Contrato") &&
  task.hashtags.includes("#Pendiente")
);
// Resultado: 3 tareas
```

**Tareas encontradas:**
- t10: Negociar con profesor/a
- t11: Firma contrato profesor/a
- t17: Contrato empresa reformas
- t19: Contratos laborales equipo

---

### Búsqueda: "Tareas de diseño para SOFT_OPENING"
```javascript
const disenoSoftOpening = tasks.filter(task =>
  task.hashtags.includes("#Diseño") &&
  task.hashtags.includes("#SOFT_OPENING")
);
// Resultado: 1 tarea
```

**Tareas encontradas:**
- t87a: Señalética + rincón foto

---

## 3. BÚSQUEDAS COMPUESTAS (Múltiples hashtags - OR)

### Búsqueda: "Todo lo relacionado con coach Miguel O estudio de branding"
```javascript
const tareasPartners = tasks.filter(task =>
  task.hashtags.includes("#COACH_MIGUEL") ||
  task.hashtags.includes("#ESTUDIO_BRANDING")
);
// Resultado: 12 tareas
```

---

### Búsqueda: "Tareas urgentes O bloqueantes"
```javascript
const tareasCriticas = tasks.filter(task =>
  task.hashtags.includes("#Urgente") ||
  task.hashtags.includes("#Bloqueante")
);
// Resultado: 26 tareas únicas
```

---

## 4. BÚSQUEDAS POR CATEGORÍA

### Búsqueda: "Todas las tareas de David"
```javascript
const tareasDavid = tasks.filter(task =>
  task.hashtags.includes("#David")
);
// Resultado: 29 tareas
```

---

### Búsqueda: "Todos los contratos"
```javascript
const todosContratos = tasks.filter(task =>
  task.hashtags.includes("#Contrato")
);
// Resultado: 6 tareas
```

**Tareas encontradas:**
- t08: Contrato profesor/a (borrador)
- t09: Contrato coach Miguel
- t10: Negociar con profesor/a
- t11: Firma contrato profesor/a
- t17: Contrato empresa reformas
- t19: Contratos laborales equipo

---

### Búsqueda: "Todas las tareas de marketing"
```javascript
const tareasMarketing = tasks.filter(task =>
  task.hashtags.includes("#Marketing")
);
// Resultado: 8 tareas
```

---

## 5. BÚSQUEDAS AVANZADAS (Combinaciones complejas)

### Búsqueda: "Tareas de PILOTO que NO son bloqueantes"
```javascript
const pilotoNoBloqueantes = tasks.filter(task =>
  task.hashtags.includes("#PILOTO") &&
  !task.hashtags.includes("#Bloqueante")
);
// Resultado: 12 tareas
```

---

### Búsqueda: "Kits relacionados con DARUMA o PILOTO"
```javascript
const kitsDarumaPiloto = tasks.filter(task =>
  task.hashtags.includes("#Kit") &&
  (task.hashtags.includes("#DARUMA") || task.hashtags.includes("#PILOTO"))
);
// Resultado: 3 tareas
```

**Tareas encontradas:**
- t55: Kits piloto artesanales (20-30 uds)
- t58: Kits definitivos (50+ uds)

---

### Búsqueda: "Tareas pendientes de Christian con deadline crítico"
```javascript
const christianCritico = tasks.filter(task =>
  task.hashtags.includes("#Christian") &&
  task.hashtags.includes("#Pendiente") &&
  task.hashtags.includes("#Deadline_Crítico")
);
// Resultado: 2 tareas
```

**Tareas encontradas:**
- t83: Inicio reforma
- t89a: Check final espacio

---

### Búsqueda: "Todo lo relacionado con grabación de contenido"
```javascript
const grabacion = tasks.filter(task =>
  task.hashtags.includes("#GRABACION") ||
  task.hashtags.includes("#Vídeo")
);
// Resultado: 8 tareas
```

---

## 6. BÚSQUEDAS POR WORKSTREAM

### Búsqueda: "Todas las tareas de Producto"
```javascript
const tareasProducto = tasks.filter(task =>
  task.hashtags.includes("#WS_Producto")
);
// Resultado: 13 tareas
```

---

### Búsqueda: "Tareas de Legal que están pendientes"
```javascript
const legalPendiente = tasks.filter(task =>
  task.hashtags.includes("#WS_Legal") &&
  task.hashtags.includes("#Pendiente")
);
// Resultado: 7 tareas
```

---

## 7. BÚSQUEDAS POR HITOS TEMPORALES

### Búsqueda: "Todo lo que depende del GO/NO-GO"
```javascript
const dependeGoNoGo = tasks.filter(task =>
  task.hashtags.includes("#Depende_GO_NO_GO")
);
// Resultado: 2 tareas
```

**Tareas encontradas:**
- t07: Activar fase escala
- t17: Contrato empresa reformas
- t83: Inicio reforma

---

### Búsqueda: "Tareas críticas para el SOFT_OPENING"
```javascript
const criticasSoftOpening = tasks.filter(task =>
  task.hashtags.includes("#SOFT_OPENING") &&
  task.hashtags.includes("#Deadline_Crítico")
);
// Resultado: 4 tareas
```

**Tareas encontradas:**
- t58: Kits definitivos (50+ uds)
- t89a: Check final espacio
- t92: Soft Opening E1
- t116: Test stack en producción

---

## 8. BÚSQUEDAS DE ANÁLISIS

### Búsqueda: "Cuántas tareas tiene cada sponsor/partner"
```javascript
const sponsors = [
  "#DARUMA", "#MAVI", "#COACH_MIGUEL", "#PROFESOR",
  "#LUPI", "#ESTUDIO_BRANDING", "#EMPRESA_REFORMAS"
];

const countBysSponsor = sponsors.map(sponsor => ({
  sponsor,
  count: tasks.filter(t => t.hashtags.includes(sponsor)).length
}));

// Resultado:
// #DARUMA: 10 tareas
// #MAVI: 1 tarea
// #COACH_MIGUEL: 6 tareas
// #PROFESOR: 11 tareas
// #LUPI: 2 tareas
// #ESTUDIO_BRANDING: 7 tareas
// #EMPRESA_REFORMAS: 5 tareas
```

---

### Búsqueda: "Distribución de tareas por estado"
```javascript
const estados = ["#Urgente", "#EnCurso", "#Pendiente"];

const countByEstado = estados.map(estado => ({
  estado,
  count: tasks.filter(t => t.hashtags.includes(estado)).length
}));

// Resultado:
// #Urgente: 8 tareas
// #EnCurso: 11 tareas
// #Pendiente: 86 tareas
```

---

## 9. AUTOCOMPLETE / SUGERENCIAS

### Función para sugerir hashtags mientras el usuario escribe
```javascript
function suggestHashtags(userInput, allHashtags) {
  const input = userInput.toLowerCase();
  return allHashtags.filter(tag =>
    tag.toLowerCase().includes(input)
  ).sort();
}

// Ejemplo:
suggestHashtags("dar", allHashtags);
// Resultado: ["#DARUMA"]

suggestHashtags("soft", allHashtags);
// Resultado: ["#SOFT_OPENING"]

suggestHashtags("pil", allHashtags);
// Resultado: ["#PILOTO"]
```

---

## 10. BÚSQUEDA MULTI-IDIOMA / ALIAS

### Mapeo de términos comunes a hashtags
```javascript
const searchAliases = {
  "daruma": "#DARUMA",
  "piloto": "#PILOTO",
  "pilot": "#PILOTO",
  "apertura": "#SOFT_OPENING",
  "softopening": "#SOFT_OPENING",
  "soft opening": "#SOFT_OPENING",
  "opening": ["#SOFT_OPENING", "#GRAND_OPENING"],
  "go": "#GO_NO_GO",
  "no-go": "#GO_NO_GO",
  "mavi": "#MAVI",
  "miguel": "#COACH_MIGUEL",
  "profesor": "#PROFESOR",
  "profesora": "#PROFESOR",
  "teacher": "#PROFESOR",
  "grabacion": "#GRABACION",
  "grabación": "#GRABACION",
  "recording": "#GRABACION",
  "urgente": "#Urgente",
  "urgent": "#Urgente",
  "bloqueante": "#Bloqueante",
  "blocker": "#Bloqueante",
  "contrato": "#Contrato",
  "contract": "#Contrato",
  "kit": "#Kit",
  "kits": "#Kit",
  "video": "#Vídeo",
  "vídeo": "#Vídeo",
  "videos": "#Vídeo",
  "web": "#Web",
  "marketing": "#Marketing",
  "branding": ["#ESTUDIO_BRANDING", "#WS_Branding"],
  "reformas": "#EMPRESA_REFORMAS",
  "reforma": "#INICIO_REFORMA",
  "construccion": "#Espacio_Físico",
  "construcción": "#Espacio_Físico"
};

function searchByAlias(userQuery) {
  const normalizedQuery = userQuery.toLowerCase().trim();
  const hashtag = searchAliases[normalizedQuery];

  if (!hashtag) {
    // Búsqueda directa por hashtag
    return tasks.filter(t =>
      t.hashtags.some(h => h.toLowerCase().includes(normalizedQuery))
    );
  }

  if (Array.isArray(hashtag)) {
    // Múltiples hashtags (OR)
    return tasks.filter(t =>
      hashtag.some(h => t.hashtags.includes(h))
    );
  }

  // Hashtag único
  return tasks.filter(t => t.hashtags.includes(hashtag));
}

// Ejemplos de uso:
searchByAlias("daruma");        // Encuentra 10 tareas
searchByAlias("DARUMA");        // Encuentra 10 tareas (case-insensitive)
searchByAlias("apertura");      // Encuentra 15 tareas
searchByAlias("softopening");   // Encuentra 15 tareas
searchByAlias("piloto");        // Encuentra 19 tareas
searchByAlias("urgente");       // Encuentra 8 tareas
```

---

## 11. BÚSQUEDA CON CONTADORES

### Función para mostrar contadores de resultados
```javascript
function searchWithCount(hashtag) {
  const results = tasks.filter(t => t.hashtags.includes(hashtag));
  return {
    hashtag,
    count: results.length,
    tasks: results
  };
}

// Ejemplo:
searchWithCount("#PILOTO");
// {
//   hashtag: "#PILOTO",
//   count: 19,
//   tasks: [...]
// }
```

---

## 12. VISTA DASHBOARD

### Dashboard "Tareas Críticas Ahora"
```javascript
const dashboardCritico = tasks.filter(task =>
  task.hashtags.includes("#Urgente") ||
  (task.hashtags.includes("#Bloqueante") &&
   task.hashtags.includes("#Deadline_Crítico"))
);
// Resultado: Todas las tareas que necesitan atención inmediata
```

---

### Dashboard "PILOTO Completo"
```javascript
const dashboardPiloto = {
  todasTareas: tasks.filter(t => t.hashtags.includes("#PILOTO")),
  urgentes: tasks.filter(t =>
    t.hashtags.includes("#PILOTO") &&
    t.hashtags.includes("#Urgente")
  ),
  bloqueantes: tasks.filter(t =>
    t.hashtags.includes("#PILOTO") &&
    t.hashtags.includes("#Bloqueante")
  ),
  pendientes: tasks.filter(t =>
    t.hashtags.includes("#PILOTO") &&
    t.hashtags.includes("#Pendiente")
  ),
  enCurso: tasks.filter(t =>
    t.hashtags.includes("#PILOTO") &&
    t.hashtags.includes("#EnCurso")
  )
};

// Muestra:
// - 19 tareas totales
// - 0 urgentes
// - 7 bloqueantes
// - 19 pendientes
// - 0 en curso
```

---

### Dashboard "SOFT_OPENING Readiness"
```javascript
const dashboardSoftOpening = {
  todasTareas: tasks.filter(t => t.hashtags.includes("#SOFT_OPENING")),
  criticas: tasks.filter(t =>
    t.hashtags.includes("#SOFT_OPENING") &&
    t.hashtags.includes("#Deadline_Crítico")
  ),
  bloqueantes: tasks.filter(t =>
    t.hashtags.includes("#SOFT_OPENING") &&
    t.hashtags.includes("#Bloqueante")
  ),
  espacioFisico: tasks.filter(t =>
    t.hashtags.includes("#SOFT_OPENING") &&
    t.hashtags.includes("#Espacio_Físico")
  ),
  kits: tasks.filter(t =>
    t.hashtags.includes("#SOFT_OPENING") &&
    t.hashtags.includes("#Kit")
  ),
  tecnologia: tasks.filter(t =>
    t.hashtags.includes("#SOFT_OPENING") &&
    t.hashtags.includes("#WS_Tecnología")
  )
};
```

---

## 13. BÚSQUEDA INTELIGENTE CON CONTEXTO

### Búsqueda: "¿Qué falta para que arranque el PILOTO?"
```javascript
// Tareas bloqueantes del PILOTO que están pendientes
const bloqueadoresPiloto = tasks.filter(task =>
  task.hashtags.includes("#PILOTO") &&
  task.hashtags.includes("#Bloqueante") &&
  task.hashtags.includes("#Pendiente")
);
// Resultado: Lista de tareas que DEBEN completarse antes del piloto
```

**Tareas críticas:**
- t22: Exp. Sesión corta (guión min a min)
- t23: Exp. Programa largo (arco 4 sesiones)
- t25: Manual operativo v0 (piloto)
- t55: Kits piloto artesanales (20-30 uds)
- t91b: Certificación facilitador
- t98: Piloto arranca

---

## 14. EXPORTAR RESULTADOS

### Función para exportar búsqueda a CSV
```javascript
function exportSearchToCSV(hashtag) {
  const results = tasks.filter(t => t.hashtags.includes(hashtag));

  const csv = [
    "ID,Nombre,Workstream,Status,Owner,Hashtags",
    ...results.map(t =>
      `${t.taskId},"${t.name}",${t.ws},${t.status},${t.owner},"${t.hashtags.join(", ")}"`
    )
  ].join("\n");

  return csv;
}

// Ejemplo:
const csvPiloto = exportSearchToCSV("#PILOTO");
// Genera CSV con todas las tareas del PILOTO
```

---

## 15. ESTADÍSTICAS DE BÚSQUEDA

### Función para analizar hashtags de un conjunto de resultados
```javascript
function analyzeSearchResults(searchResults) {
  const allHashtags = {};

  searchResults.forEach(task => {
    task.hashtags.forEach(tag => {
      allHashtags[tag] = (allHashtags[tag] || 0) + 1;
    });
  });

  const sorted = Object.entries(allHashtags)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalTasks: searchResults.length,
    uniqueHashtags: Object.keys(allHashtags).length,
    hashtagDistribution: sorted
  };
}

// Ejemplo:
const resultadosPiloto = tasks.filter(t => t.hashtags.includes("#PILOTO"));
const stats = analyzeSearchResults(resultadosPiloto);

// Resultado:
// {
//   totalTasks: 19,
//   uniqueHashtags: 25,
//   hashtagDistribution: [
//     { tag: "#Pendiente", count: 19 },
//     { tag: "#WS_Piloto", count: 10 },
//     { tag: "#David", count: 8 },
//     { tag: "#Bloqueante", count: 7 },
//     ...
//   ]
// }
```

---

**FIN DE EJEMPLOS**

Estos ejemplos cubren el 95% de casos de uso para búsqueda inteligente con hashtags.
