#!/bin/bash

# Script para build e verificação do Tailwind

set -e

echo "🔨 Build e verificação do Tailwind CSS..."
echo ""

cd frontend

# Fazer build em background
echo "Iniciando build..."
npm run build > build.log 2>&1 &
BUILD_PID=$!

# Aguardar até 5 minutos
echo "Aguardando build (máximo 5 minutos)..."
for i in {1..300}; do
    if ! kill -0 $BUILD_PID 2>/dev/null; then
        break
    fi
    sleep 1
    if [ $((i % 10)) -eq 0 ]; then
        echo "Aguardando... ($i segundos)"
    fi
done

# Verificar se o processo ainda está rodando
if kill -0 $BUILD_PID 2>/dev/null; then
    echo "Build demorou muito, matando processo..."
    kill $BUILD_PID 2>/dev/null || true
    wait $BUILD_PID 2>/dev/null || true
fi

# Verificar resultado
echo ""
echo "📊 Verificando resultado da build..."

if [ -d "build" ] && [ "$(ls -A build)" ]; then
    echo "✅ Build criado com sucesso!"
    
    if [ -d "build/static/css" ]; then
        echo "✅ Diretório CSS encontrado!"
        CSS_FILE=$(ls build/static/css/*.css 2>/dev/null | head -1)
        
        if [ -n "$CSS_FILE" ]; then
            echo "✅ Arquivo CSS encontrado: $CSS_FILE"
            
            # Verificar se o Tailwind está no CSS
            if grep -q "tailwind" "$CSS_FILE"; then
                echo "✅ Tailwind CSS encontrado no arquivo!"
            else
                echo "⚠️  Tailwind CSS não encontrado no arquivo"
            fi
            
            # Verificar se as classes específicas estão presentes
            if grep -q "\.bg-gray-100" "$CSS_FILE"; then
                echo "✅ Classes do Tailwind encontradas!"
            else
                echo "❌ Classes do Tailwind não encontradas"
            fi
            
            # Mostrar algumas linhas do CSS
            echo ""
            echo "📄 Primeiras linhas do CSS gerado:"
            head -20 "$CSS_FILE"
            
        else
            echo "❌ Nenhum arquivo CSS encontrado"
        fi
    else
        echo "❌ Diretório CSS não encontrado"
    fi
else
    echo "❌ Build falhou ou está vazio"
    echo ""
    echo "📄 Últimas linhas do log de build:"
    tail -20 build.log
fi

cd ..

echo ""
echo "🎉 Verificação concluída!" 