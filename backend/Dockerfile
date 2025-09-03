# Usar uma imagem base mais específica e segura
FROM node:18-alpine

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Comando para executar a aplicação
CMD ["node", "src/app.js"]
