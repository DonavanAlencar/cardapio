#!/bin/bash

# Script para build e push da imagem Docker do frontend
# Uso: ./scripts/build-and-push-frontend.sh [registry-url] [tag]

set -e

# Configurações padrão - SUBSTITUA PELO SEU REGISTRY
DEFAULT_REGISTRY="donavanalencar"  # Ex: joaosilva ou registry.seudominio.com
DEFAULT_TAG="1.0"
IMAGE_NAME="cardapio-frontend"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

# Construir nome completo da imagem
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${TAG}"

echo "🚀 Iniciando build e push da imagem Docker do Frontend..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Nome da imagem: ${FULL_IMAGE_NAME}"
echo "🔧 API URL: http://cardapio-backend-service:80/api"

# Build da imagem com a variável de ambiente correta
echo "🔨 Construindo imagem Docker..."
cd frontend
docker build \
    --build-arg REACT_APP_API_BASE_URL=http://cardapio-backend-service:80/api \
    -t ${FULL_IMAGE_NAME} .

# Teste local da imagem (opcional)
echo "🧪 Testando imagem localmente..."
if docker run --rm -d --name test-frontend -p 3000:3000 ${FULL_IMAGE_NAME} 2>/dev/null; then
  
  # Aguardar um pouco para o container inicializar
  sleep 10
  
  # Verificar se o frontend está funcionando
  if curl -f http://localhost:3000 > /dev/null 2>&1; then
      echo "✅ Frontend está funcionando!"
  else
      echo "⚠️  Frontend não respondeu (pode ser esperado)"
  fi
  
  # Parar container de teste
  docker stop test-frontend 2>/dev/null || true
else
  echo "⚠️  Teste local falhou"
fi

# Push para o registry
echo "📤 Fazendo push para o registry..."
docker push ${FULL_IMAGE_NAME}

echo "🎉 Imagem ${FULL_IMAGE_NAME} foi construída e enviada com sucesso!"
echo ""
echo "📋 Para usar no Kubernetes, use:"
echo "   image: ${FULL_IMAGE_NAME}"
echo ""
echo "🔧 Variável de ambiente incluída: REACT_APP_API_BASE_URL=http://cardapio-backend-service:80/api" 