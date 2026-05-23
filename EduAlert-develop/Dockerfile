# ─── ETAPA 1: Construcción del Frontend (Builder) ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos e instalar dependencias completas
COPY package*.json ./
RUN npm ci

# Copiar el código fuente del proyecto
COPY . .

# Compilar la aplicación React frontend (genera carpeta /app/dist)
RUN npm run build

# ─── ETAPA 2: Entorno de Ejecución (Runner) ───────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Establecer variable de entorno para optimizaciones en librerías
ENV NODE_ENV=production
ENV PORT=3001

# Copiar manifiestos e instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el servidor API
COPY server/ ./server/

# Copiar el frontend compilado desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Crear carpeta de logs interna
RUN mkdir -p logs

# Exponer el puerto del servidor backend
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "server/server.js"]
