#!/bin/bash

# Script de rollback seguro - não afeta banco de dados ou namespace
# Uso: ./scripts/rollback.sh [versao-anterior] [revision]

set -e

PREVIOUS_VERSION=${1:-"1.0"}
REVISION=${2:-""}

echo "🔄 Iniciando rollback seguro..."
echo "📦 Versão anterior: ${PREVIOUS_VERSION}"
echo "🔢 Revision: ${REVISION:-'última estável'}"
echo ""

# Verificar se o deployment existe
if ! kubectl get deployment cardapio-backend -n cardapio > /dev/null 2>&1; then
    echo "❌ Deployment cardapio-backend não encontrado no namespace cardapio"
    exit 1
fi

# Verificar histórico de rollouts
echo "📋 Histórico de versões:"
kubectl rollout history deployment/cardapio-backend -n cardapio

echo ""

# Fazer rollback
if [ -n "$REVISION" ]; then
    echo "🔄 Fazendo rollback para revision ${REVISION}..."
    kubectl rollout undo deployment/cardapio-backend --to-revision=${REVISION} -n cardapio
else
    echo "🔄 Fazendo rollback para versão anterior..."
    kubectl rollout undo deployment/cardapio-backend -n cardapio
fi

# Aguardar rollback completar
echo "⏳ Aguardando rollback completar..."
kubectl rollout status deployment/cardapio-backend -n cardapio

# Verificar status
echo "📊 Status após rollback:"
kubectl get pods -n cardapio -l app=cardapio-backend

echo ""
echo "✅ Rollback concluído com sucesso!"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Ver status: kubectl rollout status deployment/cardapio-backend -n cardapio"
echo "   Testar API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio" 