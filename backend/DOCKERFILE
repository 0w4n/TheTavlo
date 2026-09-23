# --- Etapa de construcción ---
FROM node:20-alpine AS builder

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Compilar TypeScript (asumiendo que tienes un script "build" en el package.json)
RUN pnpm run build

# --- Etapa de producción ---
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar solo las dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar el código compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto del backend (ej. 3000)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["pnpm", "run", "start"]