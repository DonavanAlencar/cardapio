#!/bin/bash

# Script para corrigir o problema do "Frontend temporário"
# Este script constrói a imagem Docker correta do frontend e faz o deploy

set -e

echo "🔧 Corrigindo problema do Frontend temporário..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "frontend/Dockerfile" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Configurações
REGISTRY="donavanalencar"
VERSION="1.0"
FRONTEND_IMAGE_NAME="cardapio-frontend"
FULL_IMAGE_NAME="${REGISTRY}/${FRONTEND_IMAGE_NAME}:${VERSION}"

echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Versão: ${VERSION}"
echo "🖼️  Imagem: ${FULL_IMAGE_NAME}"
echo ""

# Build da imagem do frontend
echo "🔨 Construindo imagem Docker do frontend..."
cd frontend
docker build --build-arg REACT_APP_API_BASE_URL=http://cardapio-backend-service:80/api -t ${FULL_IMAGE_NAME} .
cd ..

# Push da imagem
echo "📤 Fazendo push da imagem..."
docker push ${FULL_IMAGE_NAME}

# Atualizar o deployment do Kubernetes
echo "📝 Atualizando deployment do Kubernetes..."
sed -i "s|image: .*cardapio-frontend.*|image: ${FULL_IMAGE_NAME}|g" k8s/frontend-deployment.yaml

# Aplicar o deployment atualizado
echo "🚀 Aplicando deployment atualizado..."
kubectl apply -f k8s/frontend-deployment.yaml

# Aguardar o rollout
echo "⏳ Aguardando rollout do frontend..."
kubectl rollout status deployment/cardapio-frontend -n cardapio

# Verificar status
echo "📊 Status dos pods:"
kubectl get pods -n cardapio -l app=cardapio-frontend

echo ""
echo "🎉 Correção concluída!"
echo ""
echo "📋 Para acessar o frontend:"
echo "   kubectl port-forward service/cardapio-frontend-service 3000:80 -n cardapio"
echo ""
echo "📋 Para verificar os logs:"
echo "   kubectl logs -f deployment/cardapio-frontend -n cardapio" 