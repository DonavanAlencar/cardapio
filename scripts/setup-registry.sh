#!/bin/bash

# Script para configurar o registry em todos os arquivos
# Uso: ./scripts/setup-registry.sh [seu-registry]

set -e

if [ -z "$1" ]; then
    echo "❌ Erro: Você deve fornecer o nome do registry"
    echo "Uso: ./scripts/setup-registry.sh [seu-registry]"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/setup-registry.sh joaosilva"
    echo "  ./scripts/setup-registry.sh registry.seudominio.com"
    echo "  ./scripts/setup-registry.sh gcr.io/meu-projeto"
    exit 1
fi

REGISTRY=$1

echo "🔧 Configurando registry: ${REGISTRY}"
echo ""

# Atualizar scripts
echo "📝 Atualizando scripts..."
sed -i "s/DEFAULT_REGISTRY=.*/DEFAULT_REGISTRY=\"${REGISTRY}\"/g" scripts/build-and-push.sh
sed -i "s/DEFAULT_REGISTRY=.*/DEFAULT_REGISTRY=\"${REGISTRY}\"/g" scripts/deploy-k8s.sh

# Atualizar deployment
echo "📝 Atualizando deployment..."
sed -i "s|image: .*/cardapio-backend:latest|image: ${REGISTRY}/cardapio-backend:latest|g" k8s/deployment.yaml

# Atualizar kustomization
echo "📝 Atualizando kustomization..."
sed -i "s|name: .*/cardapio-backend|name: ${REGISTRY}/cardapio-backend|g" k8s/kustomization.yaml

echo "✅ Registry configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça login no Docker: docker login"
echo "2. Build e push: ./scripts/build-and-push.sh ${REGISTRY} v1.0.0"
echo "3. Deploy: ./scripts/deploy-k8s.sh ${REGISTRY} v1.0.0" 