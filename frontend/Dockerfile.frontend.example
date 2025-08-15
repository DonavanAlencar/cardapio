# Dockerfile
# etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# etapa 2: runtime
FROM node:18-alpine
WORKDIR /app
# instala o serve pra entregar estáticos
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
