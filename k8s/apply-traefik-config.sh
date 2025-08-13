#!/bin/bash

echo "🔧 Aplicando configuração personalizada do Traefik..."

# Criar ConfigMap com a configuração dinâmica
kubectl create configmap traefik-dynamic-config \
  --from-file=traefik-dynamic.yaml \
  -n kube-system \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ ConfigMap criado/atualizado"

# Verificar se o pod do Traefik está rodando
POD_NAME=$(kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD_NAME" ]; then
    echo "❌ Pod do Traefik não encontrado"
    exit 1
fi

echo "📋 Pod do Traefik: $POD_NAME"

# Aplicar a configuração dinâmica
echo "🔄 Aplicando configuração dinâmica..."
kubectl apply -f k8s/traefik-dynamic.yaml

echo ""
echo "🎉 Configuração aplicada com sucesso!"
echo ""
echo "📋 Para verificar se está funcionando:"
echo "1. Verifique os logs: kubectl logs -f -n kube-system $POD_NAME"
echo "2. Teste o domínio: curl -I https://food.546digitalservices.com"
echo "3. Verifique certificados: kubectl logs -n kube-system $POD_NAME | grep -i acme"
