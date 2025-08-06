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

# Teste local da imagem (opcional - pode falhar se não tiver banco local)
echo "🧪 Testando imagem localmente..."
if docker run --rm -d --name test-backend -p 4000:4000 \
  -e DB_HOST=localhost \
  -e DB_USER=test \
  -e DB_PASSWORD=test \
  -e DB_NAME=test \
  ${FULL_IMAGE_NAME} 2>/dev/null; then
  
  # Aguardar um pouco para o container inicializar
  sleep 10
  
  # Verificar se o health check está funcionando
  if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
      echo "✅ Health check passou!"
  else
      echo "⚠️  Health check falhou (esperado sem banco local)"
  fi
  
  # Parar container de teste
  docker stop test-backend 2>/dev/null || true
else
  echo "⚠️  Teste local falhou (esperado sem banco local)"
fi

# Push para o registry
echo "📤 Fazendo push para o registry..."
docker push ${FULL_IMAGE_NAME}

echo "🎉 Imagem ${FULL_IMAGE_NAME} foi construída e enviada com sucesso!"
echo ""
echo "📋 Para usar no Kubernetes, use:"
echo "   image: ${FULL_IMAGE_NAME}" 