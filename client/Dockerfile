# --- Etapa de construcción ---
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

# Compilar la aplicación de Vite (genera la carpeta "dist")
RUN pnpm run build

# --- Etapa de producción con Nginx ---
FROM nginx:alpine AS runner

# Copiar los archivos compilados de Vite al directorio público de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# (Opcional) Si necesitas una configuración personalizada de Nginx para manejar rutas de SPA (React Router / Vue Router), puedes copiarla aquí:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]