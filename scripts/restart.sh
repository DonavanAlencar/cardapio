#!/bin/bash

# Script para forçar restart do deployment
# Uso: ./scripts/restart.sh

set -e

echo "🔄 Forçando restart do deployment..."
echo ""

# Verificar se o deployment existe
if ! kubectl get deployment cardapio-backend -n cardapio > /dev/null 2>&1; then
    echo "❌ Deployment cardapio-backend não encontrado"
    exit 1
fi

# Forçar restart usando kubectl rollout restart
echo "🔄 Iniciando restart..."
kubectl rollout restart deployment/cardapio-backend -n cardapio

# Aguardar restart completar
echo "⏳ Aguardando restart completar..."
kubectl rollout status deployment/cardapio-backend -n cardapio

# Verificar status
echo "📊 Status após restart:"
kubectl get pods -n cardapio -l app=cardapio-backend

echo ""
echo "✅ Restart concluído!"
echo ""
echo "📋 Para verificar logs:"
echo "   kubectl logs -f deployment/cardapio-backend -n cardapio" 