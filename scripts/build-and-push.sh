#!/bin/bash

# Script para build e push da imagem Docker do backend
# Uso: ./scripts/build-and-push.sh [registry-url] [tag]

set -e

# Configurações padrão - SUBSTITUA PELO SEU REGISTRY
DEFAULT_REGISTRY="donavanalencar"  # Ex: joaosilva ou registry.seudominio.com
DEFAULT_TAG="1.0"
IMAGE_NAME="cardapio-backend"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

# Construir nome completo da imagem
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "🚀 Iniciando build e push da imagem Docker..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Nome da imagem: ${FULL_IMAGE_NAME}"

# Build da imagem
echo "🔨 Construindo imagem Docker..."
docker build -t ${FULL_IMAGE_NAME} ./backend

# Teste local da imagem (opcional)
echo "🧪 Testando imagem localmente..."
docker run --rm -d --name test-backend -p 4000:4000 \
  -e DB_HOST=localhost \
  -e DB_USER=test \
  -e DB_PASSWORD=test \
  -e DB_NAME=test \
  ${FULL_IMAGE_NAME}

# Aguardar um pouco para o container inicializar
sleep 5

# Verificar se o health check está funcionando
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passou!"
else
    echo "❌ Health check falhou!"
    docker stop test-backend
    exit 1
fi

# Parar container de teste
docker stop test-backend

# Push para o registry
echo "📤 Fazendo push para o registry..."
docker push ${FULL_IMAGE_NAME}

echo "🎉 Imagem ${FULL_IMAGE_NAME} foi construída e enviada com sucesso!"
echo ""
echo "📋 Para usar no Kubernetes, use:"
echo "   image: ${FULL_IMAGE_NAME}" 