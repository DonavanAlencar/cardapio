#!/bin/bash

echo "🔧 CORREÇÃO COMPLETA DO CSS - Baseado no projeto loveble-ai-chat-bot"
echo "=================================================================="

cd frontend

echo ""
echo "📦 1. Limpando dependências antigas..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 2. Instalando dependências..."
npm install

echo ""
echo "🎨 3. Verificando configuração do Tailwind..."
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

echo ""
echo "🎨 4. Verificando configuração do PostCSS..."
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

echo ""
echo "🎨 5. Verificando arquivo index.css..."
if [ -f "src/index.css" ]; then
    echo "✅ index.css encontrado"
    echo "📝 Conteúdo atual:"
    cat src/index.css
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

/* Estilos customizados */
@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
EOF
    echo "✅ index.css criado"
fi

echo ""
echo "🔨 6. Testando build local..."
if npm run build; then
    echo "✅ Build local funcionou!"
    
    echo ""
    echo "🔧 7. Corrigindo package-lock.json para Docker..."
    rm -f package-lock.json
    npm install
    
    echo ""
    echo "🐳 8. Construindo imagem Docker..."
    docker build --build-arg REACT_APP_API_BASE_URL=http://cardapio-backend-service:80/api -t donavanalencar/cardapio-frontend:1.8 .
    
    if [ $? -eq 0 ]; then
        echo "✅ Imagem Docker construída com sucesso!"
        
        echo ""
        echo "📤 9. Fazendo push da imagem..."
        docker push donavanalencar/cardapio-frontend:1.8
        
        if [ $? -eq 0 ]; then
            echo "✅ Imagem enviada para o registry!"
            
            echo ""
            echo "🚀 10. Deploy no Kubernetes..."
            cd ..
            kubectl set image deployment/cardapio-frontend -n cardapio cardapio-frontend=donavanalencar/cardapio-frontend:1.8
            
            echo ""
            echo "📊 11. Verificando status..."
            kubectl rollout status deployment/cardapio-frontend -n cardapio
            
            echo ""
            echo "🎉 CORREÇÃO COMPLETA FINALIZADA!"
            echo "📋 Próximos passos:"
            echo "   - Verificar pods: kubectl get pods -n cardapio"
            echo "   - Ver logs: kubectl logs -n cardapio -l app=cardapio-frontend --tail=20"
            echo "   - Testar acesso: kubectl port-forward service/cardapio-frontend-service 3000:80 -n cardapio"
        else
            echo "❌ Erro ao fazer push da imagem"
            exit 1
        fi
    else
        echo "❌ Erro ao construir imagem Docker"
        exit 1
    fi
else
    echo "❌ Build local falhou - verifique os erros acima"
    exit 1
fi
