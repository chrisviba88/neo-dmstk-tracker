/**
 * GENERADOR AUTOMÁTICO DE HASHTAGS
 * Genera hashtags inteligentes basados en:
 * 1. Workstream
 * 2. Palabras clave del nombre
 * 3. Owner
 * 4. Categorías funcionales
 * 5. Estado temporal
 */

// Taxonomía de hashtags
const HASHTAG_TAXONOMY = {
  // Sponsors/Partners
  SPONSORS: {
    DARUMA: ['daruma', 'patrocinador', 'sponsor'],
  },

  // Hitos
  MILESTONES: {
    PILOTO: ['piloto', 'pilot', 'prueba'],
    SOFT_OPENING: ['softopening', 'soft opening', 'apertura', 'pre-apertura', 'preapertura'],
    GRAN_APERTURA: ['gran apertura', 'opening', 'inauguracion', 'inauguración'],
    PRIMER_CURSO: ['primer curso', '1er curso', 'primercurso'],
  },

  // Categorías funcionales
  CATEGORIES: {
    CONTRATO: ['contrato', 'acuerdo', 'agreement', 'negociar', 'negociacion', 'negociación'],
    PAGO: ['pago', 'factura', 'payment', 'cobro'],
    CAPACITACION: ['capacitacion', 'capacitación', 'training', 'formacion', 'formación'],
    EVENTO: ['evento', 'event', 'celebracion', 'celebración'],
    MARKETING: ['marketing', 'comunicacion', 'comunicación', 'prensa', 'difusion', 'difusión'],
    INFRAESTRUCTURA: ['infraestructura', 'obras', 'construccion', 'construcción', 'espacio'],
    LEGAL: ['legal', 'juridico', 'jurídico', 'abogado'],
    DISEÑO: ['diseño', 'design', 'grafico', 'gráfico', 'visual'],
    CONTENIDO: ['contenido', 'content', 'material', 'curriculum'],
    TECNOLOGIA: ['tecnologia', 'tecnología', 'tech', 'software', 'plataforma'],
  },

  // Estados temporales
  TEMPORAL: {
    URGENTE: ['urgente', 'critico', 'crítico', 'inmediato'],
    BLOQUEADO: ['bloqueado', 'blocked', 'esperando'],
  }
};

/**
 * Normaliza texto para matching
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .trim();
}

/**
 * Extrae palabras clave del nombre de la tarea
 */
function extractKeywords(taskName) {
  if (!taskName) return [];

  const normalized = normalizeText(taskName);
  const words = normalized.split(/\s+/);

  // Filtrar palabras comunes (stopwords)
  const stopwords = ['de', 'la', 'el', 'en', 'y', 'a', 'con', 'para', 'por', 'del', 'los', 'las', 'un', 'una', 'al'];

  return words
    .filter(word => word.length > 3 && !stopwords.includes(word))
    .slice(0, 5); // Máximo 5 keywords
}

/**
 * Detecta categorías funcionales basadas en el nombre de la tarea
 */
function detectCategories(taskName) {
  const normalized = normalizeText(taskName);
  const categories = [];

  Object.entries(HASHTAG_TAXONOMY.CATEGORIES).forEach(([category, keywords]) => {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      categories.push(`#${category.charAt(0) + category.slice(1).toLowerCase()}`);
    }
  });

  return categories;
}

/**
 * Detecta sponsors/partners mencionados
 */
function detectSponsors(taskName) {
  const normalized = normalizeText(taskName);
  const sponsors = [];

  Object.entries(HASHTAG_TAXONOMY.SPONSORS).forEach(([sponsor, keywords]) => {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      sponsors.push(`#${sponsor}`);
    }
  });

  return sponsors;
}

/**
 * Detecta hitos relacionados
 */
function detectMilestones(taskName) {
  const normalized = normalizeText(taskName);
  const milestones = [];

  Object.entries(HASHTAG_TAXONOMY.MILESTONES).forEach(([milestone, keywords]) => {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      milestones.push(`#${milestone}`);
    }
  });

  return milestones;
}

/**
 * Genera hashtags temporales basados en estado y fechas
 */
function generateTemporalHashtags(task) {
  const hashtags = [];

  if (task.status === 'Urgente' || task.priority === 'Crítica') {
    hashtags.push('#Urgente');
  }

  if (task.status === 'Bloqueado') {
    hashtags.push('#Bloqueado');
  }

  // Detectar si está vencida
  const endDate = new Date(task.endDate);
  const today = new Date();
  if (task.status !== 'Hecho' && endDate < today) {
    hashtags.push('#Vencida');
  }

  return hashtags;
}

/**
 * FUNCIÓN PRINCIPAL: Genera todos los hashtags para una tarea
 */
export function generateHashtags(task) {
  const hashtags = new Set();

  // 1. Workstream
  if (task.ws) {
    hashtags.add(`#${task.ws.replace(/\s+/g, '')}`);
  }

  // 2. Owner
  if (task.owner && task.owner !== 'Por asignar') {
    const ownerTag = task.owner.split(' ')[0]; // Solo primer nombre
    hashtags.add(`#${ownerTag}`);
  }

  // 3. Sponsors/Partners
  const sponsors = detectSponsors(task.name);
  sponsors.forEach(tag => hashtags.add(tag));

  // 4. Hitos
  const milestones = detectMilestones(task.name);
  milestones.forEach(tag => hashtags.add(tag));

  // 5. Categorías funcionales
  const categories = detectCategories(task.name);
  categories.forEach(tag => hashtags.add(tag));

  // 6. Temporal
  const temporal = generateTemporalHashtags(task);
  temporal.forEach(tag => hashtags.add(tag));

  // 7. Si es milestone
  if (task.isMilestone) {
    hashtags.add('#Hito');
  }

  return Array.from(hashtags);
}

/**
 * Busca tareas por hashtag o texto
 */
export function searchTasks(tasks, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) {
    return tasks;
  }

  const query = normalizeText(searchQuery);
  const isHashtagSearch = query.startsWith('#');

  return tasks.filter(task => {
    // Generar hashtags para la tarea
    const taskHashtags = generateHashtags(task);
    const normalizedHashtags = taskHashtags.map(tag => normalizeText(tag));

    if (isHashtagSearch) {
      // Búsqueda por hashtag
      return normalizedHashtags.some(tag => tag.includes(query.slice(1)));
    } else {
      // Búsqueda general (nombre, hashtags, owner, workstream)
      const searchFields = [
        normalizeText(task.name),
        normalizeText(task.owner),
        normalizeText(task.ws),
        normalizeText(task.notes || ''),
        ...normalizedHashtags
      ].join(' ');

      return searchFields.includes(query);
    }
  });
}

/**
 * Agrupa resultados de búsqueda por categoría
 */
export function categorizeSearchResults(tasks, searchQuery) {
  const results = searchTasks(tasks, searchQuery);
  const query = normalizeText(searchQuery);

  const categorized = {
    byHashtag: {},
    byWorkstream: {},
    byOwner: {},
    direct: []
  };

  results.forEach(task => {
    const hashtags = generateHashtags(task);

    // Agrupar por hashtag si coincide
    hashtags.forEach(tag => {
      if (normalizeText(tag).includes(query.replace('#', ''))) {
        if (!categorized.byHashtag[tag]) {
          categorized.byHashtag[tag] = [];
        }
        categorized.byHashtag[tag].push(task);
      }
    });

    // Agrupar por workstream
    if (!categorized.byWorkstream[task.ws]) {
      categorized.byWorkstream[task.ws] = [];
    }
    categorized.byWorkstream[task.ws].push(task);

    // Agrupar por owner
    if (!categorized.byOwner[task.owner]) {
      categorized.byOwner[task.owner] = [];
    }
    categorized.byOwner[task.owner].push(task);

    // Tareas directas (nombre coincide)
    if (normalizeText(task.name).includes(query)) {
      categorized.direct.push(task);
    }
  });

  return categorized;
}

/**
 * Aplica hashtags a un array de tareas
 * (Agrega el campo 'hashtags' a cada tarea)
 */
export function applyHashtagsToTasks(tasks) {
  return tasks.map(task => ({
    ...task,
    hashtags: generateHashtags(task)
  }));
}
