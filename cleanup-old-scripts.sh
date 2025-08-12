#!/bin/bash

echo "🧹 LIMPEZA DOS SCRIPTS ANTIGOS"
echo "================================"
echo ""
echo "Este script irá mover os scripts antigos para uma pasta de backup"
echo "já que suas funcionalidades foram centralizadas no deploy.sh principal"
echo ""

# Criar pasta de backup
BACKUP_DIR="scripts/old-scripts-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Criando pasta de backup: $BACKUP_DIR"
echo ""

# Lista de scripts para mover
SCRIPTS_TO_MOVE=(
    "fix-css-complete.sh"
    "quick-fix-tailwind.sh"
    "fix-tailwind.sh"
    "fix-fonts.sh"
    "fix-frontend.sh"
    "test-build.sh"
    "build-and-check.sh"
)

# Mover scripts antigos
for script in "${SCRIPTS_TO_MOVE[@]}"; do
    if [ -f "$script" ]; then
        echo "📦 Movendo $script para $BACKUP_DIR/"
        mv "$script" "$BACKUP_DIR/"
    else
        echo "⚠️  $script não encontrado"
    fi
done

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Scripts movidos para: $BACKUP_DIR"
echo "🔧 Use agora: ./deploy.sh [versao] [--fix-css] [--frontend-only] [--backend-only]"
echo ""
echo "📖 Exemplos de uso:"
echo "   ./deploy.sh 1.8                    # Deploy completo da versão 1.8"
echo "   ./deploy.sh 1.8 --fix-css          # Deploy com correção de CSS"
echo "   ./deploy.sh 1.8 --frontend-only    # Deploy apenas do frontend"
echo "   ./deploy.sh 1.8 --backend-only     # Deploy apenas do backend" 