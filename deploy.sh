#!/bin/bash

# Script principal para deploy do Cardápio (Backend + Frontend)
# Uso: ./deploy.sh [versao] [--fix-css] [--frontend-only] [--backend-only]

set -e

VERSION=${1:-"1.0"}
REGISTRY="donavanalencar"
BACKEND_IMAGE_NAME="cardapio-backend"
FRONTEND_IMAGE_NAME="cardapio-frontend"

# Flags para controle do deploy
FIX_CSS=false
FRONTEND_ONLY=false
BACKEND_ONLY=false

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
    esac
done

echo "🚀 Deploy do Cardápio - Versão ${VERSION}"
echo "📦 Registry: ${REGISTRY}"
echo "🖼️  Backend: ${REGISTRY}/${BACKEND_IMAGE_NAME}:${VERSION}"
echo "🖼️  Frontend: ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${VERSION}"
echo "🔧 Fix CSS: ${FIX_CSS}"
echo "🎯 Modo: $([ "$FRONTEND_ONLY" = true ] && echo "Frontend apenas" || [ "$BACKEND_ONLY" = true ] && echo "Backend apenas" || echo "Completo")"
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
    echo "Verificando em todos os namespaces..."
    MYSQL_POD=$(kubectl get pods --all-namespaces | grep mysql | head -1)
    if [ -n "$MYSQL_POD" ]; then
        echo "✅ MySQL encontrado: ${MYSQL_POD}"
        echo "⚠️  Ajuste a configuração se necessário"
    else
        echo "❌ MySQL não encontrado em nenhum namespace"
        echo "Certifique-se que o MySQL está implantado"
        exit 1
    fi
fi

echo "✅ Pré-requisitos verificados!"
echo ""

# Função para corrigir CSS do frontend
fix_frontend_css() {
    echo "🔧 Corrigindo CSS do Frontend..."
    cd frontend
    
    echo "📦 Limpando dependências antigas..."
    rm -rf node_modules package-lock.json
    
    echo "📦 Instalando dependências..."
    npm install
    
    echo "🎨 Verificando configuração do Tailwind..."
    if [ ! -f "tailwind.config.js" ]; then
        echo "❌ tailwind.config.js não encontrado - criando..."
        cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6347',
        secondary: '#4682B4',
        accent: '#3CB371',
        dark: '#2F4F4F',
        light: '#F5F5DC',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
EOF
        echo "✅ tailwind.config.js criado"
    else
        echo "✅ tailwind.config.js já existe"
    fi
    
    echo "🎨 Verificando configuração do PostCSS..."
    if [ ! -f "postcss.config.js" ]; then
        echo "❌ postcss.config.js não encontrado - criando..."
        cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
        echo "✅ postcss.config.js criado"
    else
        echo "✅ postcss.config.js já existe"
    fi
    
    echo "🎨 Verificando arquivo index.css..."
    if [ -f "src/index.css" ]; then
        echo "✅ index.css encontrado"
    else
        echo "❌ index.css não encontrado - criando..."
        cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

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
    
    echo "🔨 Testando build local..."
    if npm run build; then
        echo "✅ Build local funcionou!"
        cd ..
        return 0
    else
        echo "❌ Build local falhou"
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
    echo "🔨 Build e Push do Frontend..."
    
    # Corrigir CSS se solicitado
    if [ "$FIX_CSS" = true ]; then
        if ! fix_frontend_css; then
            echo "❌ Falha na correção do CSS"
            exit 1
        fi
    fi
    
    # Build e push do frontend
    ./scripts/build-and-push-frontend.sh ${REGISTRY} ${VERSION}
    echo ""
fi

# Deploy no Kubernetes
echo "🚀 Deploy no Kubernetes..."
./scripts/deploy-k8s.sh ${REGISTRY} ${VERSION}

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Comandos úteis:"
echo "   Verificar pods: kubectl get pods -n cardapio"
echo "   Ver logs backend: kubectl logs -f deployment/cardapio-backend -n cardapio"
echo "   Ver logs frontend: kubectl logs -f deployment/cardapio-frontend -n cardapio"
echo "   Acessar API: kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio"
echo "   Acessar Frontend: kubectl port-forward service/cardapio-frontend-service 3000:80 -n cardapio"
echo "   Health check API: curl http://localhost:4000/api/health"
echo ""
echo "🔧 Para corrigir problemas de CSS: ./deploy.sh ${VERSION} --fix-css"
echo "🎯 Para deploy apenas do frontend: ./deploy.sh ${VERSION} --frontend-only"
echo "🎯 Para deploy apenas do backend: ./deploy.sh ${VERSION} --backend-only" 