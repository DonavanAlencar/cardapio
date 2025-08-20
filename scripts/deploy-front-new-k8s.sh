#!/bin/bash

# Script para deploy do front_new + backend no Kubernetes
# Uso: ./scripts/deploy-front-new-k8s.sh [registry-url] [tag]

set -e

# Configurações padrão - SUBSTITUA PELO SEU REGISTRY
DEFAULT_REGISTRY="donavanalencar"  # Ex: joaosilva ou registry.seudominio.com
DEFAULT_TAG="1.0"
BACKEND_IMAGE_NAME="cardapio-backend"
FRONT_NEW_IMAGE_NAME="cardapio-front-new"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

# Construir nomes completos das imagens
BACKEND_FULL_IMAGE_NAME="${REGISTRY}/${BACKEND_IMAGE_NAME}:${TAG}"
FRONT_NEW_FULL_IMAGE_NAME="${REGISTRY}/${FRONT_NEW_IMAGE_NAME}:${TAG}"

echo "🚀 Iniciando deploy do front_new + backend no Kubernetes..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Backend: ${BACKEND_FULL_IMAGE_NAME}"
echo "🖼️  Front-new: ${FRONT_NEW_FULL_IMAGE_NAME}"

# Atualizar as imagens nos deployments
echo "📝 Atualizando imagens nos deployments..."
sed -i "s|image: .*cardapio-backend.*|image: ${BACKEND_FULL_IMAGE_NAME}|g" k8s/deployment.yaml
sed -i "s|image: .*cardapio-front-new.*|image: ${FRONT_NEW_FULL_IMAGE_NAME}|g" k8s/front-new-deployment.yaml

# Aplicar os manifestos Kubernetes
echo "🔧 Aplicando manifestos Kubernetes..."

# Criar namespace
kubectl apply -f k8s/namespace.yaml

# Aplicar ConfigMap e Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/front-new-configmap.yaml

# Aplicar Deployments
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/front-new-deployment.yaml

# Aplicar Services
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/front-new-service.yaml

# Aplicar Ingress (inclui front_new)
kubectl apply -f k8s/ingress.yaml

# Aguardar os deployments estarem prontos
echo "⏳ Aguardando deployments estarem prontos..."
kubectl rollout status deployment/cardapio-backend -n cardapio
kubectl rollout status deployment/cardapio-front-new -n cardapio

# Verificar status dos pods
echo "📊 Status dos pods:"
kubectl get pods -n cardapio

# Verificar serviços
echo "🌐 Status dos serviços:"
kubectl get services -n cardapio

# Verificar ingress
echo "🌍 Status dos ingress:"
kubectl get ingress -n cardapio

echo "🎉 Deploy do front_new + backend concluído com sucesso!"
echo ""
echo "📋 Para verificar os logs:"
echo "   Backend: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Front-new: kubectl logs -f deployment/cardapio-front-new -n cardapio"
echo ""
echo "📋 Para acessar os serviços:"
echo "   API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio"
echo "   Front-new: kubectl port-forward service/cardapio-front-new-service 5173:80 -n cardapio"
echo ""
echo "🌐 URLs de acesso:"
echo "   Front-new: https://food.546digitalservices.com/new"
echo "   API: https://food.546digitalservices.com/api"
