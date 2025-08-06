#!/bin/bash

# Script para deploy no Kubernetes
# Uso: ./scripts/deploy-k8s.sh [registry-url] [tag]

set -e

# Configurações padrão - SUBSTITUA PELO SEU REGISTRY
DEFAULT_REGISTRY="donavanalencar"  # Ex: joaosilva ou registry.seudominio.com
DEFAULT_TAG="1.0"
BACKEND_IMAGE_NAME="cardapio-backend"
FRONTEND_IMAGE_NAME="cardapio-frontend"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

# Construir nomes completos das imagens
BACKEND_FULL_IMAGE_NAME="${REGISTRY}/${BACKEND_IMAGE_NAME}:${TAG}"
FRONTEND_FULL_IMAGE_NAME="${REGISTRY}/${FRONTEND_IMAGE_NAME}:${TAG}"

echo "🚀 Iniciando deploy no Kubernetes..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Backend: ${BACKEND_FULL_IMAGE_NAME}"
echo "🖼️  Frontend: ${FRONTEND_FULL_IMAGE_NAME}"

# Atualizar as imagens nos deployments
echo "📝 Atualizando imagens nos deployments..."
sed -i "s|image: .*cardapio-backend.*|image: ${BACKEND_FULL_IMAGE_NAME}|g" k8s/deployment.yaml
sed -i "s|image: .*cardapio-frontend.*|image: ${FRONTEND_FULL_IMAGE_NAME}|g" k8s/frontend-deployment.yaml

# Aplicar os manifestos Kubernetes
echo "🔧 Aplicando manifestos Kubernetes..."

# Criar namespace
kubectl apply -f k8s/namespace.yaml

# Aplicar ConfigMap e Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Aplicar Deployments
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Aplicar Services
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/frontend-service.yaml

# Aplicar Ingress
kubectl apply -f k8s/ingress.yaml

# Aguardar os deployments estarem prontos
echo "⏳ Aguardando deployments estarem prontos..."
kubectl rollout status deployment/cardapio-backend -n cardapio
kubectl rollout status deployment/cardapio-frontend -n cardapio

# Verificar status dos pods
echo "📊 Status dos pods:"
kubectl get pods -n cardapio

# Verificar serviços
echo "🌐 Status dos serviços:"
kubectl get services -n cardapio

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Para verificar os logs:"
echo "   Backend: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Frontend: kubectl logs -f deployment/cardapio-frontend -n cardapio"
echo ""
echo "📋 Para acessar os serviços:"
echo "   API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio"
echo "   Frontend: kubectl port-forward service/cardapio-frontend-service 3000:80 -n cardapio" 