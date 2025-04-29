FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY src ./src
COPY .env.example .env
EXPOSE 4000
CMD ["node", "src/app.js"]
