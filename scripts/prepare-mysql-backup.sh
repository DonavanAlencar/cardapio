#!/bin/bash

# Script para preparar o backup do MySQL e atualizar o ConfigMap
# Uso: ./scripts/prepare-mysql-backup.sh

set -e

echo "🔧 Preparando backup do MySQL para o ConfigMap..."

# Verificar se o arquivo de backup existe
if [ ! -f "backend/backup_db/dump.sql" ]; then
    echo "❌ Arquivo de backup não encontrado: backend/backup_db/dump.sql"
    exit 1
fi

# Verificar se o arquivo de ConfigMap existe
if [ ! -f "k8s/mysql-backup-configmap.yaml" ]; then
    echo "❌ Arquivo de ConfigMap não encontrado: k8s/mysql-backup-configmap.yaml"
    exit 1
fi

echo "📦 Convertendo backup para base64..."
# Converter o backup para base64
BACKUP_BASE64=$(base64 -w 0 backend/backup_db/dump.sql)

echo "📝 Atualizando ConfigMap..."
# Atualizar o ConfigMap com o backup em base64
sed -i "s|dump.sql: |dump.sql: |" k8s/mysql-backup-configmap.yaml
sed -i "/dump.sql: |/a\    $BACKUP_BASE64" k8s/mysql-backup-configmap.yaml

echo "✅ Backup preparado com sucesso!"
echo "📋 ConfigMap atualizado: k8s/mysql-backup-configmap.yaml"
echo "🔍 Tamanho do backup: $(du -h backend/backup_db/dump.sql | cut -f1)"
echo ""
echo "💡 Para aplicar no Kubernetes:"
echo "   kubectl apply -f k8s/mysql-backup-configmap.yaml"
