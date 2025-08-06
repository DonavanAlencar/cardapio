#!/bin/bash

# Script para testar o backend localmente conectando ao MySQL do Kubernetes
# Uso: ./scripts/test-local.sh

set -e

echo "🧪 Testando backend localmente..."

# Verificar se kubectl está configurado
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ kubectl não está configurado ou não consegue conectar ao cluster"
    exit 1
fi

# Verificar se o MySQL está rodando
echo "🔍 Verificando se o MySQL está rodando..."
if ! kubectl get pod mysql-0 > /dev/null 2>&1; then
    echo "❌ Pod mysql-0 não encontrado"
    exit 1
fi

# Port-forward do MySQL
echo "🔌 Configurando port-forward do MySQL..."
kubectl port-forward mysql-0 3306:3306 &
MYSQL_PF_PID=$!

# Aguardar MySQL estar pronto
echo "⏳ Aguardando MySQL estar pronto..."
sleep 10

# Obter senha do MySQL
echo "🔑 Obtendo senha do MySQL..."
MYSQL_PASSWORD=$(kubectl get secret mysql-root-password -o jsonpath='{.data.mysql-root-password}' | base64 -d)

# Build da imagem local
echo "🔨 Construindo imagem Docker..."
docker build -t cardapio-backend:local ./backend

# Executar container com variáveis de ambiente
echo "🚀 Executando container local..."
docker run --rm -d \
  --name cardapio-backend-test \
  -p 4000:4000 \
  -e NODE_ENV=development \
  -e PORT=4000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD="$MYSQL_PASSWORD" \
  -e DB_NAME=cardapio \
  cardapio-backend:local

# Aguardar aplicação inicializar
echo "⏳ Aguardando aplicação inicializar..."
sleep 15

# Testar health check
echo "🏥 Testando health check..."
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passou!"
    echo "📊 Resposta do health check:"
    curl -s http://localhost:4000/api/health | jq .
else
    echo "❌ Health check falhou!"
    echo "📋 Logs do container:"
    docker logs cardapio-backend-test
fi

# Limpeza
echo "🧹 Limpando..."
docker stop cardapio-backend-test
kill $MYSQL_PF_PID

echo "🎉 Teste concluído!" 