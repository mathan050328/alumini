# ==============================================================================
# AlumniConnect Frontend Dockerfile
# Multi-Stage Build: Node.js Vite Build -> Nginx Alpine Web Server
# ==============================================================================

# Stage 1: Build static distribution files
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code and build Vite bundle
COPY . .
RUN npm run build

# Stage 2: Serve via high-performance Nginx Alpine
FROM nginx:1.25-alpine

# Copy custom Nginx SPA reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
