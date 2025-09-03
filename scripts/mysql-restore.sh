#!/bin/bash

# Script para restaurar o banco de dados MySQL
# Uso: ./scripts/mysql-restore.sh [arquivo_backup] [--force]

set -e

if [ $# -eq 0 ]; then
    echo "❌ Uso: $0 [arquivo_backup] [--force]"
    echo "   arquivo_backup: Caminho para o arquivo .sql (opcional, usa dump.sql por padrão)"
    echo "   --force: Força a restauração mesmo se o banco já existir"
    exit 1
fi

BACKUP_FILE="backend/backup_db/dump.sql"
FORCE=false

# Parse de argumentos
for arg in "$@"; do
    case $arg in
        --force)
            FORCE=true
            shift
            ;;
        *)
            if [ -f "$arg" ]; then
                BACKUP_FILE="$arg"
            else
                echo "⚠️  Arquivo $arg não encontrado, usando $BACKUP_FILE"
            fi
            shift
            ;;
    esac
done

echo "🗄️  Iniciando restauração do MySQL..."

# Verificar se o arquivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

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

echo "📦 Restaurando banco de dados de: $BACKUP_FILE"

# Verificar se o banco já existe
DB_EXISTS=$(kubectl exec mysql-0 -n cardapio -- mysql -u root -p$(kubectl get secret mysql-pass -n cardapio -o jsonpath='{.data.mysql-root-password}' | base64 -d) -e "SHOW DATABASES LIKE 'cardapio';" 2>/dev/null | grep cardapio || echo "")

if [ -n "$DB_EXISTS" ] && [ "$FORCE" != true ]; then
    echo "⚠️  Banco de dados 'cardapio' já existe"
    echo "💡 Use --force para forçar a restauração"
    echo "   $0 $BACKUP_FILE --force"
    exit 1
fi

# Fazer backup do estado atual se o banco existir
if [ -n "$DB_EXISTS" ]; then
    echo "📦 Fazendo backup do estado atual antes da restauração..."
    ./scripts/mysql-backup.sh
fi

# Restaurar o banco de dados
echo "🔄 Restaurando banco de dados..."

# Copiar arquivo de backup para o container
kubectl cp "$BACKUP_FILE" mysql-0:/tmp/restore.sql -n cardapio

# Executar restauração
if kubectl exec mysql-0 -n cardapio -- mysql -u root -p$(kubectl get secret mysql-pass -n cardapio -o jsonpath='{.data.mysql-root-password}' | base64 -d) < "$BACKUP_FILE"; then
    
    echo "✅ Banco de dados restaurado com sucesso!"
    
    # Verificar se as tabelas foram criadas
    TABLE_COUNT=$(kubectl exec mysql-0 -n cardapio -- mysql -u root -p$(kubectl get secret mysql-pass -n cardapio -o jsonpath='{.data.mysql-root-password}' | base64 -d) -e "USE cardapio; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in_cardapio" | wc -l)
    
    echo "📊 Tabelas criadas: $TABLE_COUNT"
    
    # Listar algumas tabelas
    echo "📋 Tabelas disponíveis:"
    kubectl exec mysql-0 -n cardapio -- mysql -u root -p$(kubectl get secret mysql-pass -n cardapio -o jsonpath='{.data.mysql-root-password}' | base64 -d) -e "USE cardapio; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in_cardapio" | head -10
    
    # Limpar arquivo temporário
    kubectl exec mysql-0 -n cardapio -- rm -f /tmp/restore.sql
    
    echo ""
    echo "📋 Comandos úteis:"
    echo "   Ver logs MySQL: kubectl logs -f mysql-0 -n cardapio"
    echo "   Conectar MySQL: kubectl port-forward service/mysql 3306:3306 -n cardapio"
    echo "   Verificar tabelas: kubectl exec mysql-0 -n cardapio -- mysql -u root -p[senha] -e 'USE cardapio; SHOW TABLES;'"
    
else
    echo "❌ Falha ao restaurar banco de dados"
    exit 1
fi
