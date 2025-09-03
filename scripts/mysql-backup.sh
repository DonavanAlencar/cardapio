#!/bin/bash

# Script para fazer backup automático do MySQL
# Uso: ./scripts/mysql-backup.sh [--force]

set -e

FORCE=false
if [ "$1" = "--force" ]; then
    FORCE=true
fi

echo "🗄️  Iniciando backup do MySQL..."

# Verificar se o MySQL está rodando
if ! kubectl get pod mysql-0 -n cardapio > /dev/null 2>&1; then
    echo "❌ MySQL não está rodando no namespace cardapio"
    exit 1
fi

# Verificar se o MySQL está pronto
if ! kubectl wait --for=condition=ready pod/mysql-0 -n cardapio --timeout=30s > /dev/null 2>&1; then
    echo "❌ MySQL não está pronto"
    exit 1
fi

# Criar diretório de backup se não existir
mkdir -p backend/backup_db

# Nome do arquivo de backup com timestamp
BACKUP_FILE="backend/backup_db/dump_$(date +%Y%m%d_%H%M%S).sql"
LATEST_BACKUP="backend/backup_db/dump.sql"

echo "📦 Fazendo backup do banco de dados..."

# Fazer backup usando kubectl exec
if kubectl exec mysql-0 -n cardapio -- mysqldump \
    -u root -p$(kubectl get secret mysql-pass -n cardapio -o jsonpath='{.data.mysql-root-password}' | base64 -d) \
    --single-transaction \
    --routines \
    --triggers \
    --all-databases > "$BACKUP_FILE"; then
    
    echo "✅ Backup criado: $BACKUP_FILE"
    
    # Verificar tamanho do backup
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Tamanho do backup: $BACKUP_SIZE"
    
    # Atualizar o backup mais recente
    cp "$BACKUP_FILE" "$LATEST_BACKUP"
    echo "✅ Backup mais recente atualizado: $LATEST_BACKUP"
    
    # Preparar ConfigMap se solicitado
    if [ "$FORCE" = true ]; then
        echo "🔄 Atualizando ConfigMap com novo backup..."
        ./scripts/prepare-mysql-backup.sh
        
        echo "📤 Aplicando ConfigMap atualizado no Kubernetes..."
        kubectl apply -f k8s/mysql-backup-configmap.yaml
        
        echo "🔄 Reiniciando MySQL para aplicar novo backup..."
        kubectl rollout restart statefulset/mysql -n cardapio
        
        echo "⏳ Aguardando MySQL estar pronto..."
        kubectl wait --for=condition=ready pod/mysql-0 -n cardapio --timeout=300s
        
        if [ $? -eq 0 ]; then
            echo "✅ MySQL reiniciado e pronto!"
        else
            echo "❌ Falha ao aguardar MySQL estar pronto"
            exit 1
        fi
    fi
    
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver backup: ls -la backend/backup_db/"
    echo "   Ver logs MySQL: kubectl logs -f mysql-0 -n cardapio"
    echo "   Conectar MySQL: kubectl port-forward service/mysql 3306:3306 -n cardapio"
    
else
    echo "❌ Falha ao criar backup"
    exit 1
fi
