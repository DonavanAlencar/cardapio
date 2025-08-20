#!/bin/bash

# Script completo para build e deploy do front_new + backend
# Uso: ./scripts/deploy-front-new-complete.sh [registry-url] [tag]

set -e

# Configurações padrão
DEFAULT_REGISTRY="donavanalencar"
DEFAULT_TAG="1.0"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

echo "🚀 Iniciando deploy completo do front_new + backend..."
echo "📦 Registry: ${REGISTRY}"
echo "🏷️  Tag: ${TAG}"
echo ""

# 1. Build e push do front_new
echo "🔨 Etapa 1: Build e push do front_new..."
./scripts/build-and-push-front-new.sh ${REGISTRY} ${TAG}

echo ""

# 2. Deploy no Kubernetes
echo "🔧 Etapa 2: Deploy no Kubernetes..."
./scripts/deploy-front-new-k8s.sh ${REGISTRY} ${TAG}

echo ""
echo "🎉 Deploy completo concluído com sucesso!"
echo ""
echo "📋 Resumo do que foi feito:"
echo "   ✅ Build da imagem Docker do front_new"
echo "   ✅ Push da imagem para o registry"
echo "   ✅ Deploy no Kubernetes (front_new + backend)"
echo ""
echo "🌐 URLs de acesso:"
echo "   Front-new: https://food.546digitalservices.com/new"
echo "   API: https://food.546digitalservices.com/api"
echo ""
echo "📋 Para verificar o status:"
echo "   kubectl get pods -n cardapio"
echo "   kubectl get services -n cardapio"
echo "   kubectl get ingress -n cardapio"
