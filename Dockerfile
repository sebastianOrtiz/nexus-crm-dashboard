# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy Angular build output
COPY --from=builder /app/dist/nexus-crm-dashboard/browser /usr/share/nginx/html

# Nginx config for Angular SPA with hash routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Security headers\n\
    add_header X-Frame-Options "SAMEORIGIN";\n\
    add_header X-Content-Type-Options "nosniff";\n\
    add_header X-XSS-Protection "1; mode=block";\n\
\n\
    # Gzip compression\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
\n\
    # Serve static files with long cache for hashed assets\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # All routes go to index.html (Angular handles routing)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
