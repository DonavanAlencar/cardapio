#!/bin/bash

# Script para testar a build do frontend e verificar se o Tailwind está funcionando

set -e

echo "🧪 Testando build do frontend..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

cd frontend

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas"
fi

# Verificar se o Tailwind está instalado
echo "🔍 Verificando Tailwind CSS..."
if ! npm list tailwindcss > /dev/null 2>&1; then
    echo "❌ Tailwind CSS não está instalado"
    echo "Instalando Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
else
    echo "✅ Tailwind CSS está instalado"
fi

# Verificar se o PostCSS está configurado
echo "🔍 Verificando PostCSS..."
if [ ! -f "postcss.config.js" ]; then
    echo "❌ PostCSS não está configurado"
    echo "Criando configuração do PostCSS..."
    echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}" > postcss.config.js
else
    echo "✅ PostCSS está configurado"
fi

# Testar a build
echo "🔨 Testando build..."
npm run build

# Verificar se o CSS foi gerado
echo "🔍 Verificando se o CSS foi gerado..."
if [ -f "build/static/css/main.*.css" ]; then
    echo "✅ CSS foi gerado com sucesso"
    
    # Verificar se o Tailwind está no CSS gerado
    if grep -q "tailwind" build/static/css/main.*.css; then
        echo "✅ Tailwind CSS encontrado no build"
    else
        echo "⚠️  Tailwind CSS não encontrado no build"
    fi
    
    # Verificar se as classes do Tailwind estão presentes
    if grep -q "\.bg-gray-100" build/static/css/main.*.css; then
        echo "✅ Classes do Tailwind encontradas no build"
    else
        echo "❌ Classes do Tailwind não encontradas no build"
    fi
else
    echo "❌ CSS não foi gerado"
fi

cd ..

echo ""
echo "🎉 Teste de build concluído!"
echo ""
echo "📋 Para verificar o resultado:"
echo "   cd frontend && npm start" 