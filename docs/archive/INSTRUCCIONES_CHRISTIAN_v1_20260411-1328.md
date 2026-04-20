# 🚀 Instrucciones para Christian - Setup NEO DMSTK

## Tu proyecto Supabase está aquí:
**URL**: https://sfpdqurpmysbnwcofvcf.supabase.co

---

## ✅ Paso 1: Configurar la base de datos (5 min)

### 1.1 Ir a Supabase SQL Editor
1. Abre: https://sfpdqurpmysbnwcofvcf.supabase.co
2. En el menú lateral → **SQL Editor**
3. Click en **New Query**

### 1.2 Ejecutar el schema
1. Abre el archivo: `backend/supabase-schema.sql`
2. Copia TODO el contenido (Cmd+A, Cmd+C)
3. Pega en el SQL Editor de Supabase
4. Click en **RUN** (o presiona Ctrl+Enter)
5. Deberías ver: ✅ **Success. No rows returned**

---

## ✅ Paso 2: Obtener las API Keys (2 min)

### 2.1 Ir a Settings
1. En Supabase → menú lateral → **Settings** ⚙️
2. Click en **API**

### 2.2 Copiar las keys
Verás dos secciones importantes:

**Project URL** (arriba):
```
https://sfpdqurpmysbnwcofvcf.supabase.co
```
✅ Esta ya está configurada en tus archivos .env

**Project API keys**:
- **anon public**: Copia esta key (larga, empieza con `eyJ...`)
- **service_role**: Copia esta key (⚠️ NO la compartas públicamente)

---

## ✅ Paso 3: Configurar las variables de entorno (3 min)

### 3.1 Backend
Abre el archivo: `backend/.env`

Reemplaza estas líneas con tus keys de Supabase:
```env
SUPABASE_ANON_KEY=pega_aqui_tu_anon_public_key
SUPABASE_SERVICE_KEY=pega_aqui_tu_service_role_key
```

**Ejemplo** (tus keys serán diferentes):
```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcGRx...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcGRx...
```

Guarda el archivo (Cmd+S).

### 3.2 Frontend
Abre el archivo: `frontend/.env`

Reemplaza esta línea:
```env
VITE_SUPABASE_ANON_KEY=pega_aqui_tu_anon_public_key
```

⚠️ **Importante**: En el frontend solo usa la `anon public` key, NUNCA la `service_role`.

Guarda el archivo (Cmd+S).

---

## ✅ Paso 4: Instalar dependencias (3 min)

Abre una terminal en la carpeta del proyecto:

```bash
cd "/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app"
bash setup.sh
```

Esto instalará todas las dependencias automáticamente.

**O manualmente**:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## ✅ Paso 5: Migrar los datos (2 min)

Esto cargará todas las tareas del tracker original a Supabase:

```bash
cd backend
node migrate-data.js
```

Deberías ver:
```
🔄 Iniciando migración de datos...
📝 Insertando 147 tareas...
✅ Migración completada exitosamente!
📊 147 tareas insertadas
✓ Total de tareas en la base de datos: 147
```

---

## ✅ Paso 6: ¡Ejecutar la aplicación! (1 min)

Necesitas **DOS terminales**:

### Terminal 1 - Backend
```bash
cd "/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app/backend"
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 3001
📊 Dashboard: http://localhost:3001
🤖 Agente de monitoreo activo
```

### Terminal 2 - Frontend
```bash
cd "/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app/frontend"
npm run dev
```

Deberías ver:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ Paso 7: Probar la aplicación (2 min)

1. **Abre tu navegador**: http://localhost:5173
2. Deberías ver tu tracker con todas las tareas
3. Arriba a la derecha verás: 🟢 **En línea** (1 usuario)
4. **Prueba el chatbot**:
   - Click en el ícono de chat (esquina inferior derecha)
   - Pregunta: "¿Cuántas tareas están vencidas?"
   - El agente debería responder

5. **Prueba el tiempo real**:
   - Abre otra pestaña en http://localhost:5173
   - En la primera pestaña, cambia el estado de una tarea
   - La segunda pestaña debería actualizarse automáticamente ✨

---

## 🎯 Checklist completo

- [ ] Base de datos creada en Supabase ✓ (ya lo tienes)
- [ ] Schema SQL ejecutado
- [ ] API keys copiadas y pegadas en .env
- [ ] Dependencias instaladas (npm install)
- [ ] Datos migrados (147 tareas)
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] App abre en http://localhost:5173
- [ ] Indicador "En línea" aparece
- [ ] Chatbot responde
- [ ] Cambios se sincronizan en tiempo real

---

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Verifica que las API keys están correctamente copiadas
- No debe haber espacios al inicio/final de las keys
- Asegúrate de usar `anon public` en frontend y `service_role` en backend

### "Port 3001 already in use"
```bash
# Ver qué está usando el puerto
lsof -i :3001

# Cambiar el puerto en backend/.env
PORT=3002
```

### "Tasks no aparecen"
1. Ve a Supabase → **Table Editor** → **tasks**
2. ¿Ves las 147 tareas? Si no:
   ```bash
   cd backend
   node migrate-data.js
   ```

### "Chatbot no responde"
- Normal por ahora (sin OpenAI key)
- Debería dar respuestas básicas
- Para respuestas inteligentes, necesitas API key de OpenAI

### "Frontend no conecta con backend"
- Verifica que el backend esté corriendo (Terminal 1)
- Deberías ver: `🚀 Servidor corriendo en puerto 3001`
- Revisa `frontend/.env` → `VITE_BACKEND_URL=http://localhost:3001`

---

## 🔥 Siguiente nivel: OpenAI (opcional)

Para que el agente IA sea super inteligente:

1. Ve a https://platform.openai.com
2. Sign Up / Login
3. **API Keys** → **Create new secret key**
4. Copia la key (empieza con `sk-...`)
5. Pega en `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-tu-key-aqui
   ```
6. Reinicia el backend (Ctrl+C en Terminal 1, luego `npm run dev`)

Ahora el chatbot tendrá conversaciones mucho más inteligentes.

---

## 🌐 Compartir con el equipo (mismo WiFi)

1. Obtén tu IP local:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Busca algo como: `inet 192.168.1.100`

3. Comparte con tu equipo: `http://192.168.1.100:5173`

4. Todos deben estar en la misma red WiFi

---

## 🚀 Próximo paso: Deploy a producción

Cuando esté todo probado y funcionando localmente, el siguiente paso es desplegarlo a internet para que todo el equipo pueda acceder desde cualquier lugar.

**Guía**: Lee `README.md` sección "Desplegar en producción"

**Opciones**:
- Vercel (frontend) + Railway (backend) ← Recomendado
- Todo en Vercel
- Render.com

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en las terminales
2. Abre la consola del navegador (F12)
3. Busca errores en rojo
4. Lee el README.md

---

## ✅ Resumen ultra-rápido

```bash
# 1. SQL Editor en Supabase → Ejecutar supabase-schema.sql
# 2. Settings → API → Copiar keys
# 3. Pegar keys en backend/.env y frontend/.env
# 4. Instalar
cd "/Users/chrisviba/Documents/Neo DMSTK v2/neo-dmstk-app"
bash setup.sh

# 5. Migrar datos
cd backend
node migrate-data.js

# 6. Ejecutar (dos terminales)
cd backend && npm run dev      # Terminal 1
cd frontend && npm run dev     # Terminal 2

# 7. Abrir http://localhost:5173
```

---

**¡Todo listo! En 15 minutos tendrás tu app funcionando** 🎉

Tu Supabase: https://sfpdqurpmysbnwcofvcf.supabase.co
