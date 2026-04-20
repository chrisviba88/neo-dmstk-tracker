#!/bin/bash

# Script de configuración rápida para NEO DMSTK
# Ejecutar: bash setup.sh

echo "🚀 NEO DMSTK - Configuración Rápida"
echo "===================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "   Instálalo desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# Función para crear archivo .env
create_env_file() {
    local dir=$1
    local example_file="$dir/.env.example"
    local env_file="$dir/.env"

    if [ -f "$env_file" ]; then
        echo "⚠️  $env_file ya existe. ¿Sobrescribir? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "   Saltando $env_file"
            return
        fi
    fi

    cp "$example_file" "$env_file"
    echo "✅ Creado $env_file"
}

# Instalar backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Backend instalado"
else
    echo "❌ Error instalando backend"
    exit 1
fi

create_env_file "."
cd ..

# Instalar frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install --silent
if [ $? -eq 0 ]; then
    echo "✅ Frontend instalado"
else
    echo "❌ Error instalando frontend"
    exit 1
fi

create_env_file "."
cd ..

echo ""
echo "===================================="
echo "✅ ¡Instalación completa!"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configura Supabase:"
echo "   - Ve a https://supabase.com"
echo "   - Crea un proyecto"
echo "   - Ejecuta backend/supabase-schema.sql"
echo ""
echo "2. Configura las variables de entorno:"
echo "   - Edita backend/.env"
echo "   - Edita frontend/.env"
echo "   - Añade tus credenciales de Supabase"
echo ""
echo "3. Ejecuta la aplicación:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Abre http://localhost:5173"
echo ""
echo "📚 Consulta QUICK_START.md para más detalles"
echo "===================================="
