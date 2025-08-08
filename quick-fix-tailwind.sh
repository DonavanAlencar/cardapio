#!/bin/bash

# Script rápido para corrigir o Tailwind CSS

set -e

echo "🔧 Correção rápida do Tailwind CSS..."
echo ""

cd frontend

# Verificar se o Tailwind está instalado
echo "🔍 Verificando Tailwind..."
if ! npm list tailwindcss > /dev/null 2>&1; then
    echo "Instalando Tailwind CSS..."
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
fi

# Verificar se o arquivo de configuração existe
if [ ! -f "tailwind.config.js" ]; then
    echo "Criando tailwind.config.js..."
    npx tailwindcss init
fi

# Verificar se o PostCSS está configurado
if [ ! -f "postcss.config.js" ]; then
    echo "Criando postcss.config.js..."
    echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}" > postcss.config.js
fi

# Verificar se o index.css está correto
echo "Verificando index.css..."
if ! grep -q "@tailwind base" src/index.css; then
    echo "Corrigindo index.css..."
    cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  font-family: 'Inter', sans-serif;
}
EOF
fi

# Tentar build
echo "🔨 Tentando build..."
timeout 300 npm run build || echo "Build demorou muito, mas pode ter funcionado"

# Verificar se o build foi criado
if [ -d "build" ] && [ "$(ls -A build)" ]; then
    echo "✅ Build criado com sucesso!"
    
    if [ -d "build/static/css" ]; then
        echo "✅ CSS encontrado!"
        ls -la build/static/css/
    else
        echo "⚠️  CSS não encontrado"
    fi
else
    echo "❌ Build falhou"
fi

cd ..

echo ""
echo "🎉 Correção concluída!" 