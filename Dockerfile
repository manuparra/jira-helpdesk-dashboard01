# Multi-stage Dockerfile for SKA Helpdesk Dashboard

# Stage 1: Build static assets using Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Keep build-time tools available even if the host/CI passes production npm settings.
ENV NODE_ENV=development \
    NPM_CONFIG_PRODUCTION=false

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm ci --include=dev \
    && test -x node_modules/.bin/vite

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration with CORS proxy support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
