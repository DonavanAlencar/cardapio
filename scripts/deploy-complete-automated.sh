#!/bin/bash

# Script completo para deploy automatizado do sistema completo
# Uso: ./scripts/deploy-complete-automated.sh [registry-url] [tag] [opções]
# Opções: --fix-css, --frontend-only, --backend-only, --mysql-only, --mysql-backup, --mysql-restore

set -e

# Configurações padrão
DEFAULT_REGISTRY="donavanalencar"
DEFAULT_TAG="3.0"
BACKEND_IMAGE_NAME="cardapio-backend"
FRONT_NEW_IMAGE_NAME="cardapio-front-new"

# Parâmetros
REGISTRY=${1:-$DEFAULT_REGISTRY}
TAG=${2:-$DEFAULT_TAG}

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

# Construir nomes completos das imagens
BACKEND_FULL_IMAGE_NAME="${REGISTRY}/${BACKEND_IMAGE_NAME}:${TAG}"
FRONT_NEW_FULL_IMAGE_NAME="${REGISTRY}/${FRONT_NEW_IMAGE_NAME}:${TAG}"

echo "🚀 Deploy do Cardápio - Versão ${TAG}"
echo "📦 Registry: ${REGISTRY}"
echo "🖼️  Backend: ${BACKEND_FULL_IMAGE_NAME}"
echo "🖼️  Frontend: ${FRONT_NEW_FULL_IMAGE_NAME}"
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

# 1. Criar namespace
echo "📁 Criando namespace..."
kubectl apply -f k8s/namespace.yaml

# Deploy do Backend (se não for apenas frontend)
if [ "$FRONTEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "🔨 Build e Push do Backend..."
    if [ -f "scripts/build-and-push.sh" ]; then
        ./scripts/build-and-push.sh ${REGISTRY} ${TAG}
    else
        echo "   ⚠️  Script build-and-push.sh não encontrado"
    fi
    echo ""
fi

# Deploy do Frontend (se não for apenas backend)
if [ "$BACKEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "🔨 Build e Push do Front New..."
    
    # Corrigir CSS se solicitado
    if [ "$FIX_CSS" = true ]; then
        if ! fix_front_new_css; then
            echo "❌ Falha na correção do CSS"
            exit 1
        fi
    fi
    
    # Build e push do front_new
    if [ -f "scripts/build-and-push-front-new.sh" ]; then
        ./scripts/build-and-push-front-new.sh ${REGISTRY} ${TAG}
    else
        echo "   ⚠️  Script build-and-push-front-new.sh não encontrado"
    fi
    echo ""
fi

# Operações específicas do MySQL
if [ "$MYSQL_BACKUP" = true ]; then
    echo "🗄️  Fazendo backup do MySQL..."
    if [ -f "scripts/mysql-backup.sh" ]; then
        ./scripts/mysql-backup.sh --force
    else
        echo "   ⚠️  Script mysql-backup.sh não encontrado"
    fi
    exit 0
fi

if [ "$MYSQL_RESTORE" = true ]; then
    echo "🗄️  Restaurando MySQL..."
    if [ -f "scripts/mysql-restore.sh" ]; then
        ./scripts/mysql-restore.sh --force
    else
        echo "   ⚠️  Script mysql-restore.sh não encontrado"
    fi
    exit 0
fi

# 2. Aplicar secrets do MySQL
echo "🔐 Aplicando secrets do MySQL..."
if kubectl get secret mysql-pass-fixed -n cardapio &>/dev/null; then
    echo "   Secret mysql-pass-fixed já existe"
else
    # Criar secret com senhas
    kubectl create secret generic mysql-pass-fixed -n cardapio \
        --from-literal=mysql-root-password=newrootpassword \
        --from-literal=mysql-user=cardapio \
        --from-literal=mysql-password=cardapiopass
fi

# 3. Aplicar configmaps do MySQL
echo "🗂️  Aplicando configmaps do MySQL..."
if kubectl get configmap mysql-backup-current -n cardapio &>/dev/null; then
    echo "   ConfigMap mysql-backup-current já existe"
else
    echo "   ⚠️  ConfigMap mysql-backup-current não encontrado"
    echo "   Execute primeiro: kubectl apply -f k8s/mysql-backup-configmap.yaml"
fi

if kubectl get configmap mysql-auto-init -n cardapio &>/dev/null; then
    echo "   ConfigMap mysql-auto-init já existe"
else
    echo "   ⚠️  ConfigMap mysql-auto-init não encontrado"
    echo "   Execute primeiro: kubectl apply -f k8s/mysql-auto-init-configmap.yaml"
fi

# 4. Verificar se StatefulSet mysql-with-backup existe
echo "🗄️  Verificando MySQL StatefulSet..."
if kubectl get statefulset mysql-with-backup -n cardapio &>/dev/null; then
    echo "   StatefulSet mysql-with-backup já existe"
    kubectl rollout status statefulset/mysql-with-backup -n cardapio --timeout=300s
else
    echo "   ⚠️  StatefulSet mysql-with-backup não encontrado"
    echo "   Execute primeiro: kubectl apply -f k8s/mysql-statefulset-with-backup.yaml"
    if [ "$MYSQL_ONLY" = true ]; then
        echo "   🗄️  Modo MySQL-only: saindo após configuração do MySQL"
        exit 1
    else
        exit 1
    fi
fi

# 5. Verificar se Service do MySQL existe
echo "🌐 Verificando MySQL Service..."
if kubectl get service mysql-with-backup -n cardapio &>/dev/null; then
    echo "   Service mysql-with-backup já existe"
else
    echo "   ⚠️  Service mysql-with-backup não encontrado"
    echo "   Execute primeiro: kubectl apply -f k8s/mysql-service-with-backup.yaml"
    exit 1
fi

# 6. Aguardar MySQL estar pronto
echo "⏳ Aguardando MySQL estar pronto..."
kubectl wait --for=condition=ready pod/mysql-with-backup-0 -n cardapio --timeout=300s

# 7. Verificar se o banco tem dados
echo "🔍 Verificando banco de dados..."
TABLE_COUNT=$(kubectl exec -n cardapio mysql-with-backup-0 -- mysql -u root -pnewrootpassword -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='cardapio';" 2>/dev/null || echo "0")
echo "   Tabelas encontradas no banco: $TABLE_COUNT"

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo "   ⚠️  Banco vazio! Verificar se o backup foi importado."
fi

# Se for apenas MySQL, sair aqui
if [ "$MYSQL_ONLY" = true ]; then
    echo ""
    echo "🎉 Deploy do MySQL concluído!"
    echo "📋 Para verificar logs: kubectl logs -f statefulset/mysql-with-backup -n cardapio"
    echo "🔧 Para acessar MySQL: kubectl port-forward service/mysql-with-backup 3306:3306 -n cardapio"
    exit 0
fi

# 8. Atualizar imagens nos deployments
echo "📝 Atualizando imagens nos deployments..."

# Verificar se os arquivos de deployment existem
if [ -f "k8s/deployment-fixed.yaml" ]; then
    sed -i "s|image: .*cardapio-backend.*|image: ${BACKEND_FULL_IMAGE_NAME}|g" k8s/deployment-fixed.yaml
else
    echo "   ⚠️  Arquivo k8s/deployment-fixed.yaml não encontrado"
fi

if [ -f "k8s/front-new-deployment.yaml" ]; then
    sed -i "s|image: .*cardapio-front-new.*|image: ${FRONT_NEW_FULL_IMAGE_NAME}|g" k8s/front-new-deployment.yaml
else
    echo "   ⚠️  Arquivo k8s/front-new-deployment.yaml não encontrado"
fi

# Deploy no Kubernetes (se não for apenas MySQL)
if [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "🚀 Deploy no Kubernetes..."
    
    # 9. Aplicar configuração do backend (se não for apenas frontend)
    if [ "$FRONTEND_ONLY" != true ]; then
        echo "🔧 Aplicando configuração do backend..."
        if [ -f "k8s/cardapio-backend-config-fixed.yaml" ]; then
            kubectl apply -f k8s/cardapio-backend-config-fixed.yaml
        fi
    fi

    # 10. Aplicar deployments
    echo "🚢 Aplicando deployments..."
    if [ "$BACKEND_ONLY" != true ] && [ -f "k8s/front-new-deployment.yaml" ]; then
        kubectl apply -f k8s/front-new-deployment.yaml
    fi
    
    if [ "$FRONTEND_ONLY" != true ] && [ -f "k8s/deployment-fixed.yaml" ]; then
        kubectl apply -f k8s/deployment-fixed.yaml
    fi

    # 11. Aplicar services
    echo "🌐 Aplicando services..."
    if [ "$BACKEND_ONLY" != true ] && [ -f "k8s/front-new-service.yaml" ]; then
        kubectl apply -f k8s/front-new-service.yaml
    fi
    
    if [ "$FRONTEND_ONLY" != true ] && [ -f "k8s/backend-service-fixed.yaml" ]; then
        kubectl apply -f k8s/backend-service-fixed.yaml
    fi

    # 12. Aplicar ingress
    echo "🌍 Aplicando ingress..."
    if [ -f "k8s/ingress-fixed.yaml" ]; then
        kubectl apply -f k8s/ingress-fixed.yaml
    fi
fi

# 13. Aguardar deployments estarem prontos (se não for apenas MySQL)
if [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "⏳ Aguardando deployments estarem prontos..."
    if [ "$FRONTEND_ONLY" != true ] && kubectl get deployment cardapio-backend-fixed -n cardapio &>/dev/null; then
        kubectl rollout status deployment/cardapio-backend-fixed -n cardapio --timeout=300s
    fi

    if [ "$BACKEND_ONLY" != true ] && kubectl get deployment cardapio-front-new -n cardapio &>/dev/null; then
        kubectl rollout status deployment/cardapio-front-new -n cardapio --timeout=300s
    fi

    # 14. Verificar status
    echo ""
    echo "📊 Status dos pods:"
    kubectl get pods -n cardapio

    echo ""
    echo "🌐 Status dos serviços:"
    kubectl get services -n cardapio

    echo ""
    echo "🌍 Status dos ingress:"
    kubectl get ingress -n cardapio

    # 15. Testar sistema (se não for apenas frontend)
    if [ "$FRONTEND_ONLY" != true ]; then
        echo ""
        echo "🧪 Testando sistema..."
        sleep 10

        echo "   Testando API..."
        API_RESPONSE=$(curl -k -s https://food.546digitalservices.com/api/auth/test-db 2>/dev/null || echo "ERRO")
        if [[ "$API_RESPONSE" == *"success"* ]]; then
            echo "   ✅ API funcionando"
        else
            echo "   ❌ API com problemas: $API_RESPONSE"
        fi

        echo "   Testando login..."
        LOGIN_RESPONSE=$(curl -k -s -X POST https://food.546digitalservices.com/api/auth/login \
          -H "Content-Type: application/json" \
          -d '{"email":"admin@empresa.com","password":"password"}' 2>/dev/null || echo "ERRO")
        if [[ "$LOGIN_RESPONSE" == *"token"* ]]; then
            echo "   ✅ Login funcionando"
        else
            echo "   ❌ Login com problemas: $LOGIN_RESPONSE"
        fi
    fi
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""

# Mostrar URLs apenas se não for apenas MySQL
if [ "$MYSQL_ONLY" != true ] && [ "$MYSQL_BACKUP" != true ] && [ "$MYSQL_RESTORE" != true ]; then
    echo "📋 URLs de acesso:"
    echo "   Sistema Principal: https://food.546digitalservices.com"
    echo "   Front-new: https://food.546digitalservices.com/new"
    echo "   API: https://food.546digitalservices.com/api"
    echo ""
    echo "🔑 Credenciais de login:"
    echo "   Admin: admin@empresa.com / password"
    echo "   Garçom: garcom@empresa.com / password"
    echo ""
fi

echo "📋 Comandos úteis:"
echo "   Verificar pods: kubectl get pods -n cardapio"
echo "   Ver logs MySQL: kubectl logs -f statefulset/mysql-with-backup -n cardapio"

if [ "$FRONTEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ]; then
    echo "   Ver logs backend: kubectl logs -f deployment/cardapio-backend-fixed -n cardapio"
fi

if [ "$BACKEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ]; then
    echo "   Ver logs front_new: kubectl logs -f deployment/cardapio-front-new -n cardapio"
fi

echo "   Acessar MySQL: kubectl port-forward service/mysql-with-backup 3306:3306 -n cardapio"

if [ "$FRONTEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ]; then
    echo "   Acessar API: kubectl port-forward service/cardapio-backend-service-fixed 4000:80 -n cardapio"
fi

if [ "$BACKEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ]; then
    echo "   Acessar Front New: kubectl port-forward service/cardapio-front-new-service 5173:80 -n cardapio"
fi

if [ "$FRONTEND_ONLY" != true ] && [ "$MYSQL_ONLY" != true ]; then
    echo "   Health check API: curl http://localhost:4000/api/health"
fi

echo ""
echo "🔧 Para corrigir problemas de CSS: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --fix-css"
echo "🎯 Para deploy apenas do frontend: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --frontend-only"
echo "🎯 Para deploy apenas do backend: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --backend-only"
echo "🗄️  Para deploy apenas do MySQL: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --mysql-only"
echo "📦 Para fazer backup do MySQL: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --mysql-backup"
echo "🔄 Para restaurar MySQL: ./scripts/deploy-complete-automated.sh ${REGISTRY} ${TAG} --mysql-restore"
