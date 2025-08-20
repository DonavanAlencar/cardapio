#!/bin/bash

# Script para build e push da imagem do front_new
# Uso: ./scripts/build-and-push-front-new.sh [registry-url] [tag]

set -e

# Configurações padrão
DEFAULT_REGISTRY="donavanalencar"
DEFAULT_TAG="1.0"
IMAGE_NAME="cardapio-front-new"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

# Construir nome completo da imagem
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "🔨 Iniciando build da imagem do front_new..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Imagem: ${FULL_IMAGE_NAME}"

# Verificar se o Dockerfile existe
if [ ! -f "front_new/Dockerfile" ]; then
    echo "❌ Dockerfile não encontrado em front_new/"
    echo "📝 Criando Dockerfile para Vite..."
    
    cat > front_new/Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve for static file serving
RUN npm install -g serve

# Copy built app
COPY --from=build /app/dist /app/dist

# Expose port
EXPOSE 5173

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "5173"]
EOF
fi

# Navegar para o diretório front_new
cd front_new

# Build da imagem Docker
echo "🔨 Construindo imagem Docker..."
docker build -t ${FULL_IMAGE_NAME} .

# Push para o registry
echo "📤 Fazendo push para o registry..."
docker push ${FULL_IMAGE_NAME}

echo "✅ Build e push concluídos com sucesso!"
echo "🖼️  Imagem: ${FULL_IMAGE_NAME}"
echo ""
echo "📋 Para fazer deploy:"
echo "   ./scripts/deploy-front-new-k8s.sh ${REGISTRY} ${TAG}"
