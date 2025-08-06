#!/bin/bash

# Script de limpeza segura - remove apenas recursos do backend
# Uso: ./scripts/cleanup.sh

set -e

echo "🧹 Iniciando limpeza segura..."
echo "⚠️  Isso removerá apenas os recursos do backend"
echo "✅ Banco de dados e namespace serão preservados"
echo ""

# Confirmar ação
read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Limpeza cancelada"
    exit 1
fi

echo ""

# Remover deployment
echo "🗑️  Removendo deployment..."
kubectl delete deployment cardapio-backend -n cardapio --ignore-not-found=true

# Remover service
echo "🗑️  Removendo service..."
kubectl delete service cardapio-backend-service -n cardapio --ignore-not-found=true

# Remover ingress
echo "🗑️  Removendo ingress..."
kubectl delete ingress cardapio-backend-ingress -n cardapio --ignore-not-found=true

# Remover configmap
echo "🗑️  Removendo configmap..."
kubectl delete configmap cardapio-backend-config -n cardapio --ignore-not-found=true

# Remover secret (apenas a do backend, não a do MySQL)
echo "🗑️  Removendo secret do backend..."
kubectl delete secret cardapio-db-secret -n cardapio --ignore-not-found=true

# Verificar o que foi removido
echo ""
echo "📊 Status após limpeza:"
echo "Pods do backend:"
kubectl get pods -n cardapio | grep -v mysql || echo "Nenhum pod do backend encontrado"

echo ""
echo "Serviços:"
kubectl get services -n cardapio | grep -v mysql || echo "Nenhum serviço do backend encontrado"

echo ""
echo "✅ Limpeza concluída!"
echo "✅ MySQL e namespace cardapio foram preservados"
echo ""
echo "📋 Para verificar MySQL:"
echo "   kubectl get pods -n cardapio | grep mysql"
echo "   kubectl get secret mysql-root-password -n cardapio" 