# frontend/Dockerfile

# Stage 1: build da aplicação React
FROM node:18-alpine AS builder
WORKDIR /app

# Copia configs e instala dependências
COPY package.json package-lock.json ./
COPY tailwind.config.js postcss.config.js ./
RUN npm ci

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Copia fontes e gera build
COPY public ./public
COPY src    ./src
RUN npm run build

# Stage 2: runtime com 'serve'
FROM node:18-alpine AS runtime
WORKDIR /app

# Instala o servidor estático
RUN npm install --global serve

# Copia o build final
COPY --from=builder /app/build ./build

# Expõe porta que o serve usa
EXPOSE 3000

# Comando para servir o conteúdo
CMD ["serve", "-s", "build", "-l", "3000"]
