#!/bin/bash

# Script para deploy no Kubernetes
# Uso: ./scripts/deploy-k8s.sh [registry-url] [tag]

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

echo "🚀 Iniciando deploy no Kubernetes..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo "🖼️  Nome da imagem: ${FULL_IMAGE_NAME}"

# Atualizar a imagem no deployment
echo "📝 Atualizando imagem no deployment..."
sed -i "s|image: .*|image: ${FULL_IMAGE_NAME}|g" k8s/deployment.yaml

# Aplicar os manifestos Kubernetes
echo "🔧 Aplicando manifestos Kubernetes..."

# Criar namespace
kubectl apply -f k8s/namespace.yaml

# Aplicar ConfigMap e Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Aplicar Deployment
kubectl apply -f k8s/deployment.yaml

# Aplicar Service
kubectl apply -f k8s/service.yaml

# Aplicar Ingress (opcional)
kubectl apply -f k8s/ingress.yaml

# Aguardar o deployment estar pronto
echo "⏳ Aguardando deployment estar pronto..."
kubectl rollout status deployment/cardapio-backend -n cardapio

# Verificar status dos pods
echo "📊 Status dos pods:"
kubectl get pods -n cardapio -l app=cardapio-backend

# Verificar serviços
echo "🌐 Status dos serviços:"
kubectl get services -n cardapio

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Para verificar os logs:"
echo "   kubectl logs -f deployment/cardapio-backend -n cardapio"
echo ""
echo "📋 Para acessar o serviço:"
echo "   kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio" 