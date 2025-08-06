#!/bin/bash

# Script principal para deploy do Cardápio Backend
# Uso: ./deploy.sh [versao]

set -e

VERSION=${1:-"1.0"}
REGISTRY="donavanalencar"
IMAGE_NAME="cardapio-backend"

echo "🚀 Deploy do Cardápio Backend - Versão ${VERSION}"
echo "📦 Registry: ${REGISTRY}"
echo "🖼️  Imagem: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo ""

# Verificar se o Docker está logado
echo "🔍 Verificando login do Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando ou não está logado"
    echo "Execute: docker login"
    exit 1
fi

# Verificar se o kubectl está configurado
echo "🔍 Verificando kubectl..."
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ kubectl não está configurado"
    exit 1
fi

# Verificar se o MySQL está rodando no namespace cardapio
echo "🔍 Verificando MySQL..."
if ! kubectl get pod mysql-0 -n cardapio > /dev/null 2>&1; then
    echo "❌ Pod mysql-0 não encontrado no namespace cardapio"
    echo "Verificando em todos os namespaces..."
    MYSQL_POD=$(kubectl get pods --all-namespaces | grep mysql | head -1)
    if [ -n "$MYSQL_POD" ]; then
        echo "✅ MySQL encontrado: ${MYSQL_POD}"
        echo "⚠️  Ajuste a configuração se necessário"
    else
        echo "❌ MySQL não encontrado em nenhum namespace"
        echo "Certifique-se que o MySQL está implantado"
        exit 1
    fi
fi

echo "✅ Pré-requisitos verificados!"
echo ""

# Build e push
echo "🔨 Build e Push da imagem..."
./scripts/build-and-push.sh ${REGISTRY} ${VERSION}

echo ""

# Deploy no Kubernetes
echo "🚀 Deploy no Kubernetes..."
./scripts/deploy-k8s.sh ${REGISTRY} ${VERSION}

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Comandos úteis:"
echo "   Verificar pods: kubectl get pods -n cardapio"
echo "   Ver logs: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Acessar API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio"
echo "   Health check: curl http://localhost:4000/api/health" 