#!/bin/bash

# Script de debug para investigar problemas de deploy
# Uso: ./scripts/debug.sh

set -e

echo "🔍 Iniciando diagnóstico do deploy..."
echo ""

# Verificar status do deployment
echo "📊 Status do Deployment:"
kubectl get deployment cardapio-backend -n cardapio -o wide

echo ""

# Verificar pods
echo "📦 Status dos Pods:"
kubectl get pods -n cardapio -l app=cardapio-backend -o wide

echo ""

# Verificar eventos do namespace
echo "📋 Eventos do Namespace:"
kubectl get events -n cardapio --sort-by='.lastTimestamp' | tail -20

echo ""

# Verificar eventos dos pods
echo "📋 Eventos dos Pods:"
kubectl get events -n cardapio --field-selector involvedObject.kind=Pod --sort-by='.lastTimestamp' | tail -10

echo ""

# Verificar logs do deployment
echo "📝 Logs do Deployment:"
kubectl logs deployment/cardapio-backend -n cardapio --tail=50 || echo "Nenhum log disponível"

echo ""

# Verificar descrição do deployment
echo "📋 Descrição do Deployment:"
kubectl describe deployment cardapio-backend -n cardapio

echo ""

# Verificar descrição dos pods
echo "📋 Descrição dos Pods:"
PODS=$(kubectl get pods -n cardapio -l app=cardapio-backend -o name)
for pod in $PODS; do
    echo "--- $pod ---"
    kubectl describe $pod -n cardapio
    echo ""
done

echo ""

# Verificar conectividade com MySQL
echo "🔍 Verificando conectividade com MySQL:"
echo "MySQL pod status:"
kubectl get pod mysql-0 -n cardapio

echo ""
echo "MySQL service:"
kubectl get service -n cardapio | grep mysql || echo "Nenhum serviço MySQL encontrado"

echo ""
echo "Teste de conectividade MySQL:"
kubectl run mysql-test --rm -it --image=mysql:8.0 --restart=Never -- mysql -h mysql-0.mysql -u root -p -e "SELECT 1;" 2>/dev/null || echo "❌ Não foi possível conectar ao MySQL"

echo ""
echo "✅ Diagnóstico concluído!" 