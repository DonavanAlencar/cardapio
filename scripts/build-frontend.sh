#!/bin/bash

# Script para construir o frontend
set -e

echo "🔨 Construindo o frontend..."

# Vai para o diretório do frontend
cd frontend

# Instala dependências
echo "📦 Instalando dependências..."
npm ci

# Define a URL da API
export REACT_APP_API_BASE_URL="http://cardapio-backend-service:80/api"

# Faz o build
echo "🏗️ Fazendo build..."
npm run build

# Constrói a imagem Docker
echo "🐳 Construindo imagem Docker..."
docker build -t donavanalencar/cardapio-frontend:1.0 .

echo "✅ Frontend construído com sucesso!" 