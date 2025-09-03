#!/bin/bash

# Script principal para deploy do Cardápio (Backend + Frontend)
# Uso: ./deploy.sh [versao] [--fix-css] [--frontend-only] [--backend-only]

set -e

VERSION=${1:-"1.0"}
REGISTRY="donavanalencar"
BACKEND_IMAGE_NAME="cardapio-backend"
FRONTEND_IMAGE_NAME="cardapio-front-new"

# Flags para controle do deploy
FIX_CSS=false
FRONTEND_ONLY=false
BACKEND_ONLY=false
MYSQL_ONLY=false
MYSQL_BACKUP=false
MYSQL_RESTORE=false

# Parse de argumentos
for arg in "$@"; do
    case $arg in
        --fix-css)
            FIX_CSS=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        --mysql-only)
            MYSQL_ONLY=true
            shift
            ;;
        --mysql-backup)
            MYSQL_BACKUP=true
            shift
            ;;
        --mysql-restore)
            MYSQL_RESTORE=true
            shift
            ;;
    esac
done

echo "🚀 Deploy do Cardápio - Versão ${VERSION}"
echo "📦 Registry: ${REGISTRY}"
echo "🖼️  Backend: ${REGISTRY}/${BACKEND_IMAGE_NAME}:${VERSION}"
echo "🖼️  Frontend: ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${VERSION}"
echo "🔧 Fix CSS: ${FIX_CSS}"
echo "🎯 Modo: $([ "$FRONTEND_ONLY" = true ] && echo "Frontend apenas" || [ "$BACKEND_ONLY" = true ] && echo "Backend apenas" || [ "$MYSQL_ONLY" = true ] && echo "MySQL apenas" || [ "$MYSQL_BACKUP" = true ] && echo "MySQL backup" || [ "$MYSQL_RESTORE" = true ] && echo "MySQL restore" || echo "Completo")"
echo ""

# Verificar se o Docker está logado
echo "🔍 Verificando login do Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando ou não está logado"
    echo "Execute: docker login"
    exit 1
fi

# Verificar se o kubectl está configurado
echo "🔍 Verificando kubectl..."
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo "❌ kubectl não está configurado"
    exit 1
fi

# Verificar se o MySQL está rodando no namespace cardapio
echo "🔍 Verificando MySQL..."
if ! kubectl get pod mysql-0 -n cardapio > /dev/null 2>&1; then
    echo "❌ Pod mysql-0 não encontrado no namespace cardapio"
    echo "🔧 Preparando MySQL StatefulSet..."
    
    # Preparar backup do MySQL
    if [ -f "scripts/prepare-mysql-backup.sh" ]; then
        echo "📦 Preparando backup do banco de dados..."
        ./scripts/prepare-mysql-backup.sh
    fi
    
    echo "🚀 Implantando MySQL StatefulSet..."
    kubectl apply -f k8s/mysql-secret.yaml
    kubectl apply -f k8s/mysql-backup-configmap.yaml
    kubectl apply -f k8s/mysql-init-configmap.yaml
    kubectl apply -f k8s/mysql-statefulset.yaml
    kubectl apply -f k8s/mysql-service.yaml
    
    echo "⏳ Aguardando MySQL estar pronto..."
    kubectl wait --for=condition=ready pod/mysql-0 -n cardapio --timeout=300s
    
    if [ $? -eq 0 ]; then
        echo "✅ MySQL implantado e pronto!"
    else
        echo "❌ Falha ao aguardar MySQL estar pronto"
        echo "Verificando logs..."
        kubectl logs mysql-0 -n cardapio
        exit 1
    fi
else
    echo "✅ MySQL já está rodando"
fi

echo "✅ Pré-requisitos verificados!"
echo ""

# Função para corrigir CSS do front_new
fix_front_new_css() {
    echo "🔧 Corrigindo CSS do Front New..."
    cd front_new
    
    echo "📦 Limpando dependências antigas..."
    rm -rf node_modules package-lock.json
    
    echo "📦 Instalando dependências..."
    npm install
    
        echo "🎨 Verificando configuração do Vite..."
    if [ ! -f "vite.config.js" ]; then
        echo "❌ vite.config.js não encontrado - criando..."
        cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
});
EOF
        echo "✅ vite.config.js criado"
    else
        echo "✅ vite.config.js já existe"
    fi
    
    echo "🎨 Verificando arquivo index.css..."
    if [ -f "src/index.css" ]; then
        echo "✅ index.css encontrado"
    else
        echo "❌ index.css não encontrado - criando..."
        cat > src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  font-family: 'Inter', sans-serif;
}
EOF
        echo "✅ index.css criado"
    fi
    
    echo "🔨 Testando build local com Vite..."
    if npm run build; then
        echo "✅ Build local com Vite funcionou!"
        cd ..
        return 0
    else
        echo "❌ Build local com Vite falhou"
        cd ..
        return 1
    fi
}

# Deploy do Backend (se não for apenas frontend)
if [ "$FRONTEND_ONLY" != true ]; then
    echo "🔨 Build e Push do Backend..."
    ./scripts/build-and-push.sh ${REGISTRY} ${VERSION}
    echo ""
fi

# Deploy do Frontend (se não for apenas backend)
if [ "$BACKEND_ONLY" != true ]; then
    echo "🔨 Build e Push do Front New..."
    
    # Corrigir CSS se solicitado
    if [ "$FIX_CSS" = true ]; then
        if ! fix_front_new_css; then
            echo "❌ Falha na correção do CSS"
            exit 1
        fi
    fi
    
    # Build e push do front_new
    ./scripts/build-and-push-front-new.sh ${REGISTRY} ${VERSION}
    echo ""
fi

# Deploy no Kubernetes (se não for apenas MySQL)
if [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "🚀 Deploy no Kubernetes..."
    ./scripts/deploy-k8s.sh ${REGISTRY} ${VERSION}
fi

# Operações específicas do MySQL
if [ "$MYSQL_ONLY" = true ]; then
    echo "🗄️  Deploy apenas do MySQL..."
    
    # Preparar backup do MySQL
    if [ -f "scripts/prepare-mysql-backup.sh" ]; then
        echo "📦 Preparando backup do banco de dados..."
        ./scripts/prepare-mysql-backup.sh
    fi
    
    echo "🚀 Implantando MySQL StatefulSet..."
    kubectl apply -f k8s/mysql-secret.yaml
    kubectl apply -f k8s/mysql-backup-configmap.yaml
    kubectl apply -f k8s/mysql-init-configmap.yaml
    kubectl apply -f k8s/mysql-statefulset.yaml
    kubectl apply -f k8s/mysql-service.yaml
    
    echo "⏳ Aguardando MySQL estar pronto..."
    kubectl wait --for=condition=ready pod/mysql-0 -n cardapio --timeout=300s
    
    if [ $? -eq 0 ]; then
        echo "✅ MySQL implantado e pronto!"
    else
        echo "❌ Falha ao aguardar MySQL estar pronto"
        exit 1
    fi
fi

if [ "$MYSQL_BACKUP" = true ]; then
    echo "🗄️  Fazendo backup do MySQL..."
    ./scripts/mysql-backup.sh --force
fi

if [ "$MYSQL_RESTORE" = true ]; then
    echo "🗄️  Restaurando MySQL..."
    ./scripts/mysql-restore.sh --force
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Comandos úteis:"
echo "   Verificar pods: kubectl get pods -n cardapio"
echo "   Ver logs MySQL: kubectl logs -f mysql-0 -n cardapio"
echo "   Ver logs backend: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Ver logs front_new: kubectl logs -f deployment/cardapio-front-new -n cardapio"
echo "   Acessar MySQL: kubectl port-forward service/mysql 3306:3306 -n cardapio"
echo "   Acessar API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio"
echo "   Acessar Front New: kubectl port-forward service/cardapio-front-new-service 5173:80 -n cardapio"
echo "   Health check API: curl http://localhost:4000/api/health"
echo ""
echo "🔧 Para corrigir problemas de CSS: ./deploy.sh ${VERSION} --fix-css"
echo "🎯 Para deploy apenas do frontend: ./deploy.sh ${VERSION} --frontend-only"
echo "🎯 Para deploy apenas do backend: ./deploy.sh ${VERSION} --backend-only"
echo "🗄️  Para deploy apenas do MySQL: ./deploy.sh ${VERSION} --mysql-only"
echo "📦 Para fazer backup do MySQL: ./deploy.sh ${VERSION} --mysql-backup"
echo "🔄 Para restaurar MySQL: ./deploy.sh ${VERSION} --mysql-restore" 