#!/bin/bash

# Script para corrigir o problema do Tailwind CSS
# Este script atualiza as dependências e garante a configuração correta

set -e

echo "🔧 Corrigindo problema do Tailwind CSS..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

cd frontend

# Remover node_modules e package-lock.json para uma instalação limpa
echo "🧹 Limpando instalação anterior..."
rm -rf node_modules package-lock.json

# Atualizar as dependências do Tailwind
echo "📦 Instalando dependências atualizadas..."
npm install

# Verificar se o Tailwind está instalado corretamente
echo "🔍 Verificando Tailwind CSS..."
if ! npm list tailwindcss > /dev/null 2>&1; then
    echo "❌ Tailwind CSS não está instalado"
    echo "Instalando Tailwind CSS..."
    npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
else
    echo "✅ Tailwind CSS está instalado"
fi

# Recriar a configuração do Tailwind
echo "⚙️  Recriando configuração do Tailwind..."
npx tailwindcss init -p

# Verificar se a configuração foi criada corretamente
if [ ! -f "tailwind.config.js" ]; then
    echo "❌ Erro: tailwind.config.js não foi criado"
    exit 1
fi

# Atualizar a configuração do Tailwind com as configurações personalizadas
echo "📝 Atualizando configuração do Tailwind..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF6347', // Tomato
        secondary: '#4682B4', // SteelBlue
        accent: '#3CB371', // MediumSeaGreen
        dark: '#2F4F4F', // DarkSlateGray
        light: '#F5F5DC', // Beige
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
EOF

# Verificar se o PostCSS está configurado
echo "🔍 Verificando PostCSS..."
if [ ! -f "postcss.config.js" ]; then
    echo "❌ PostCSS não está configurado"
    echo "Criando configuração do PostCSS..."
    cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
else
    echo "✅ PostCSS está configurado"
fi

# Verificar se o index.css está correto
echo "🔍 Verificando index.css..."
if ! grep -q "@tailwind base" src/index.css; then
    echo "❌ Diretivas do Tailwind não encontradas em index.css"
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
else
    echo "✅ index.css está correto"
fi

# Testar a build
echo "🔨 Testando build..."
npm run build

# Verificar se o CSS foi gerado
echo "🔍 Verificando se o CSS foi gerado..."
if [ -f "build/static/css/main.*.css" ]; then
    echo "✅ CSS foi gerado com sucesso"
    
    # Verificar se as classes do Tailwind estão presentes
    if grep -q "\.bg-gray-100" build/static/css/main.*.css; then
        echo "✅ Classes do Tailwind encontradas no build"
    else
        echo "❌ Classes do Tailwind não encontradas no build"
        echo "Verificando conteúdo do CSS gerado..."
        ls -la build/static/css/
    fi
else
    echo "❌ CSS não foi gerado"
fi

cd ..

echo ""
echo "🎉 Correção do Tailwind concluída!"
echo ""
echo "📋 Para testar localmente:"
echo "   cd frontend && npm start"
echo ""
echo "📋 Para fazer o deploy:"
echo "   ./fix-fonts.sh" 