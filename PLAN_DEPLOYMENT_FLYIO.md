# 🚀 Plan de Deployment - Fly.io (100% GRATIS)

**Fecha:** 2026-04-11
**Autor:** Claude
**Costo estimado:** $0/mes
**Tiempo estimado:** 30-45 minutos

---

## 📊 Resumen Ejecutivo

### ¿Por qué Fly.io?

| Característica | Fly.io | Railway | Render | Vercel+Railway |
|---------------|--------|---------|--------|----------------|
| **Costo** | **$0/mes** | $5/mes | $0 (se duerme) o $14/mes | $5/mes |
| **WebSockets** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Cron Jobs** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Sin dormir** | ✅ Sí | ✅ Sí | ❌ No (free) | ✅ Sí |
| **Global CDN** | ✅ Sí | ❌ No | ❌ No | ✅ Sí (Vercel) |
| **Apps gratis** | 3 | 1-2 | Ilimitadas | 1 frontend |
| **Facilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Ganador:** Fly.io - Mejor balance costo/beneficio/rendimiento

---

## 🏗️ Arquitectura Final

```
Internet
    │
    ├─► neo-dmstk.fly.dev (Frontend)
    │       │
    │       └─► Nginx sirviendo build de React
    │
    └─► neo-dmstk-api.fly.dev (Backend)
            │
            ├─► Express + Socket.IO
            ├─► Cron jobs (monitoreo diario)
            └─► Supabase (PostgreSQL en la nube)
```

---

## ✅ Pre-requisitos

Antes de empezar, necesitas:

- [ ] Cuenta de GitHub (para subir tu código)
- [ ] Cuenta de Fly.io (gratis - https://fly.io/app/sign-up)
- [ ] Flyctl CLI instalado
- [ ] Supabase ya configurado (✅ Ya lo tienes)
- [ ] Git instalado

---

## 📝 FASE 1: Preparación del Código

### 1.1 Crear repositorio Git

```bash
cd /Users/chrisviba/Documents/CLAUDE_CODE/PROYECTOS/01_NEO_DMSTK/neo-dmstk-app

# Inicializar git si no existe
git init

# Crear .gitignore
cat > .gitignore << 'EOF'
# Node modules
node_modules/
**/node_modules/

# Environment variables
.env
.env.local
.env.production
**/.env

# Build outputs
dist/
build/
**/dist/
**/build/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Fly.io
.fly/
EOF

# Commit inicial
git add .
git commit -m "Initial commit - NEO DMSTK Tracker"
```

### 1.2 Subir a GitHub

```bash
# Crear repo en GitHub (desde web: github.com/new)
# Nombre sugerido: neo-dmstk-tracker

# Conectar y subir
git remote add origin https://github.com/TU_USUARIO/neo-dmstk-tracker.git
git branch -M main
git push -u origin main
```

---

## 📝 FASE 2: Configurar Backend en Fly.io

### 2.1 Instalar Fly CLI

```bash
# macOS
brew install flyctl

# O descarga desde: https://fly.io/docs/hands-on/install-flyctl/

# Autenticarse
flyctl auth login
```

### 2.2 Crear archivo de configuración del backend

```bash
cd backend

# Crear fly.toml
cat > fly.toml << 'EOF'
app = "neo-dmstk-api"
primary_region = "mad" # Madrid - cambia si prefieres otra región

[build]
  [build.args]
    NODE_VERSION = "24"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false  # ← IMPORTANTE: No apagar servidor
  auto_start_machines = true
  min_machines_running = 1     # ← Siempre 1 máquina activa

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[deploy]
  strategy = "immediate"
EOF
```

### 2.3 Crear Dockerfile para backend

```bash
cat > Dockerfile << 'EOF'
FROM node:24-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 8080

# Comando de inicio
CMD ["node", "server.js"]
EOF
```

### 2.4 Ajustar server.js para Fly.io

**IMPORTANTE:** Cambiar esta línea en `server.js`:

```javascript
// ANTES:
const PORT = process.env.PORT || 3001;

// DESPUÉS:
const PORT = process.env.PORT || 8080;
```

### 2.5 Configurar variables de entorno en Fly.io

```bash
# Desde el directorio backend/

# Crear la app
flyctl apps create neo-dmstk-api

# Configurar secrets (variables de entorno)
flyctl secrets set \
  SUPABASE_URL="https://sfpdqurpmysbnwcofvcf.supabase.co" \
  SUPABASE_SERVICE_KEY="tu_service_key_aqui" \
  FRONTEND_URL="https://neo-dmstk.fly.dev" \
  NODE_ENV="production"
```

### 2.6 Deploy del backend

```bash
# Desde backend/
flyctl deploy

# Ver logs en vivo
flyctl logs

# Verificar que está corriendo
curl https://neo-dmstk-api.fly.dev/api/health
# Debería responder: {"status":"ok","timestamp":"..."}
```

---

## 📝 FASE 3: Configurar Frontend en Fly.io

### 3.1 Crear configuración del frontend

```bash
cd ../frontend

# Crear fly.toml
cat > fly.toml << 'EOF'
app = "neo-dmstk"
primary_region = "mad" # Madrid

[build]
  [build.args]
    NODE_VERSION = "24"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[deploy]
  strategy = "immediate"
EOF
```

### 3.2 Crear Dockerfile multi-stage para frontend

```bash
cat > Dockerfile << 'EOF'
# Etapa 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las dependencias (incluidas dev)
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno de build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build de producción
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de nginx
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINX_EOF'
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Comprimir respuestas
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA: todas las rutas devuelven index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
EOF
```

### 3.3 Configurar variables de entorno del frontend

```bash
# Desde frontend/

# Crear la app
flyctl apps create neo-dmstk

# Configurar build args (para Vite)
flyctl secrets set \
  VITE_SUPABASE_URL="https://sfpdqurpmysbnwcofvcf.supabase.co" \
  VITE_SUPABASE_ANON_KEY="tu_anon_key_aqui" \
  VITE_BACKEND_URL="https://neo-dmstk-api.fly.dev"
```

### 3.4 Deploy del frontend

```bash
# Desde frontend/
flyctl deploy --build-arg VITE_SUPABASE_URL="https://sfpdqurpmysbnwcofvcf.supabase.co" \
              --build-arg VITE_SUPABASE_ANON_KEY="tu_anon_key" \
              --build-arg VITE_BACKEND_URL="https://neo-dmstk-api.fly.dev"

# Abrir en navegador
flyctl open
```

---

## 📝 FASE 4: Verificación y Testing

### 4.1 Verificar backend

```bash
# Health check
curl https://neo-dmstk-api.fly.dev/api/health

# Ver logs
flyctl logs -a neo-dmstk-api

# Ver estado de la app
flyctl status -a neo-dmstk-api
```

### 4.2 Verificar frontend

```bash
# Abrir en navegador
open https://neo-dmstk.fly.dev

# Ver logs
flyctl logs -a neo-dmstk

# Ver estado
flyctl status -a neo-dmstk
```

### 4.3 Testing funcional

- [ ] ✅ Frontend carga correctamente
- [ ] ✅ Se conecta al backend (ver indicador "En línea")
- [ ] ✅ Puede crear tareas
- [ ] ✅ Puede editar tareas
- [ ] ✅ Historial funciona
- [ ] ✅ Socket.IO conecta correctamente
- [ ] ✅ No hay errores en consola del navegador

---

## 🔧 FASE 5: Configuración de CORS

Si tienes problemas de CORS, actualiza `backend/server.js`:

```javascript
// En server.js, línea 16-21
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',           // Desarrollo local
      'https://neo-dmstk.fly.dev'        // Producción
    ],
    methods: ['GET', 'POST']
  }
});

// Y línea 33
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://neo-dmstk.fly.dev'
  ]
}));
```

Luego redeploy:
```bash
cd backend
flyctl deploy
```

---

## 🔄 FASE 6: Actualización Continua

### Workflow recomendado:

```bash
# 1. Hacer cambios en tu código local
# 2. Testear localmente
npm start  # backend
npm run dev  # frontend

# 3. Commit a Git
git add .
git commit -m "Descripción de cambios"
git push

# 4. Deploy backend
cd backend
flyctl deploy

# 5. Deploy frontend
cd ../frontend
flyctl deploy --build-arg VITE_SUPABASE_URL="..." \
              --build-arg VITE_SUPABASE_ANON_KEY="..." \
              --build-arg VITE_BACKEND_URL="https://neo-dmstk-api.fly.dev"
```

### Automatizar con GitHub Actions (Opcional avanzado)

Crear `.github/workflows/deploy.yml` para CI/CD automático.

---

## 💰 COSTOS DETALLADOS

### Fly.io Free Tier:

- **3 aplicaciones gratis** (usarás 2: frontend + backend)
- **160 GB bandwidth** al mes
- **3 GB almacenamiento persistente** (no lo necesitas)
- **Shared CPU 1x** (256-512MB RAM)

**Tu uso estimado:**
- Frontend: ~50 MB/mes (static files)
- Backend: ~100 MB/mes (API calls + WebSockets)
- **Total: ~150 MB/mes** de 160 GB disponibles

**Costo:** $0/mes ✅

### Supabase Free Tier:

- **500 MB base de datos** (más que suficiente)
- **2 GB bandwidth** al mes
- **50,000 requests** al mes

**Tu uso estimado:**
- Tareas: ~100 filas × 2KB = 200 KB
- Historial: ~1000 entradas × 1KB = 1 MB
- **Total: ~1.2 MB** de 500 MB disponibles

**Costo:** $0/mes ✅

### TOTAL: $0/mes 🎉

---

## 📈 Escalabilidad

### Si creces y necesitas más recursos:

**Fly.io:**
- **Hobby Plan:** $5/mes por VM adicional
- Puedes escalar RAM/CPU según necesidad
- **Pricing:** https://fly.io/pricing

**Supabase:**
- **Pro Plan:** $25/mes (8 GB DB, 50 GB bandwidth)
- **Pricing:** https://supabase.com/pricing

---

## 🐛 Troubleshooting Común

### Error: "Could not find app"
```bash
flyctl apps list  # Ver tus apps
flyctl apps create nombre-app  # Crear si no existe
```

### Error: "Build failed"
```bash
flyctl logs  # Ver logs detallados
# Revisar Dockerfile
# Verificar que package.json está completo
```

### Error: "Health checks failing"
```bash
flyctl logs -a nombre-app
# Revisar que el puerto es 8080
# Verificar que la app inicia correctamente
```

### Backend no responde
```bash
# Ver estado
flyctl status -a neo-dmstk-api

# Reiniciar
flyctl apps restart neo-dmstk-api

# Ver logs en vivo
flyctl logs -a neo-dmstk-api -f
```

### Frontend no conecta con backend
- Verificar CORS en `server.js`
- Verificar `VITE_BACKEND_URL` en frontend
- Abrir consola del navegador para ver errores

---

## 🎯 Checklist Final

### Pre-deployment:
- [ ] Código subido a GitHub
- [ ] Fly.io CLI instalado y autenticado
- [ ] Variables de entorno copiadas
- [ ] Dockerfiles creados
- [ ] fly.toml configurados

### Backend deployment:
- [ ] App creada en Fly.io
- [ ] Secrets configurados
- [ ] Dockerfile funcional
- [ ] Deploy exitoso
- [ ] Health check responde

### Frontend deployment:
- [ ] App creada en Fly.io
- [ ] Build args configurados
- [ ] Dockerfile multi-stage funcional
- [ ] Deploy exitoso
- [ ] Frontend carga en navegador

### Testing:
- [ ] Crear tarea funciona
- [ ] Editar tarea funciona
- [ ] Eliminar tarea funciona
- [ ] Historial carga
- [ ] Socket.IO conecta
- [ ] Sin errores en consola

---

## 🚀 Alternativas si Fly.io no funciona

### Opción B: Railway ($5/mes)
- Más simple, GUI amigable
- Excelente para principiantes
- $5 de crédito gratis, luego $5/mes
- **Guía:** https://railway.app/new

### Opción C: Render (Gratis pero se duerme)
- Completamente gratis
- Se duerme después de 15 min
- Solo para demos/proyectos personales
- **Guía:** https://render.com/docs

### Opción D: Vercel + Railway ($5/mes)
- Vercel para frontend (gratis)
- Railway para backend ($5/mes)
- Mejor rendimiento frontend
- **Guía:** Vercel + Railway deployment

---

## 📚 Recursos Útiles

- **Fly.io Docs:** https://fly.io/docs/
- **Fly.io Pricing:** https://fly.io/pricing
- **Supabase Docs:** https://supabase.com/docs
- **Tu GitHub:** https://github.com/TU_USUARIO/neo-dmstk-tracker

---

## 🎉 ¡Todo listo!

Una vez completados todos los pasos, tu aplicación estará:
- ✅ En la nube (accesible desde cualquier lugar)
- ✅ Gratis ($0/mes)
- ✅ Con HTTPS automático
- ✅ Con WebSockets funcionando
- ✅ Con Cron jobs activos
- ✅ Conectada a Supabase

**URLs finales:**
- Frontend: https://neo-dmstk.fly.dev
- Backend: https://neo-dmstk-api.fly.dev
- Admin: https://fly.io/dashboard

**Próximos pasos sugeridos:**
1. Configurar dominio personalizado (opcional)
2. Configurar autenticación de usuarios real
3. Monitoreo y alertas
4. Backups automáticos de Supabase

---

**¿Preguntas?** Contacta a Claude cuando estés listo para deployar. 🚀
