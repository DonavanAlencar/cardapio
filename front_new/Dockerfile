# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve for static file serving
RUN npm install -g serve

# Copy built app
COPY --from=build /app/dist /app/dist

# Expose port
EXPOSE 5173

# Start the app
CMD ["serve", "-s", "/app/dist", "-l", "5173"]
