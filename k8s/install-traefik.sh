#!/bin/bash

# Script para instalar Traefik com Let's Encrypt
# Baseado na configuração do ingress existente

set -e

echo "🚀 Instalando Traefik com suporte a Let's Encrypt..."

# Verificar se Helm está instalado
if ! command -v helm &> /dev/null; then
    echo "❌ Helm não está instalado. Instale o Helm primeiro."
    exit 1
fi

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado. Instale o kubectl primeiro."
    exit 1
fi

# Atualizar repositório Helm do Traefik
echo "📦 Atualizando repositório Helm do Traefik..."
helm repo update traefik

# Verificar se Traefik já está instalado
if helm list -n kube-system | grep -q "traefik"; then
    echo "🔄 Traefik já está instalado. Fazendo upgrade..."
    helm upgrade traefik traefik/traefik \
        --namespace kube-system \
        --values k8s/traefik-values.yaml \
        --wait \
        --timeout 10m
else
    echo "🔧 Instalando Traefik com configurações para Let's Encrypt..."
    helm install traefik traefik/traefik \
        --namespace kube-system \
        --values k8s/traefik-values.yaml \
        --wait \
        --timeout 10m
fi

# Aguardar pods ficarem prontos
echo "⏳ Aguardando pods do Traefik ficarem prontos..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=traefik -n kube-system --timeout=300s

# Verificar status da instalação
echo "✅ Verificando status da instalação..."
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik
kubectl get svc -n kube-system -l app.kubernetes.io/name=traefik

echo ""
echo "🎉 Traefik instalado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure seu DNS para apontar para o LoadBalancer IP do Traefik"
echo "2. Verifique se o ingress está funcionando: kubectl get ingress -n cardapio"
echo "3. Monitore os logs: kubectl logs -f -l app.kubernetes.io/name=traefik -n traefik-system"
echo ""
echo "🔍 Para verificar certificados Let's Encrypt:"
echo "kubectl logs -f -l app.kubernetes.io/name=traefik -n kube-system | grep -i acme"
echo ""
echo "🌐 Dashboard do Traefik (se habilitado):"
echo "kubectl port-forward -n kube-system svc/traefik 9000:9000"
echo "Acesse: http://localhost:9000"
