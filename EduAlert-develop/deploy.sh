#!/usr/bin/env bash

# ─── Script de Despliegue Automatizado para EduAlert UCEVA ─────────────────────

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}🚀 Iniciando Despliegue Automatizado de EduAlert UCEVA${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verificar si git está inicializado
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: No estás dentro de un repositorio de Git.${NC}"
    exit 1
fi

# 2. Actualizar código desde el repositorio remoto
echo -e "\n${YELLOW}📥 1. Sincronizando con el repositorio remoto...${NC}"
git fetch origin

# Obtener rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "Rama actual detectada: ${GREEN}${CURRENT_BRANCH}${NC}"

# Hacer pull de los cambios
git pull origin "$CURRENT_BRANCH"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer git pull. Por favor resuelve conflictos manualmente.${NC}"
    exit 1
fi

# 3. Preguntar el método de despliegue preferido
echo -e "\n${YELLOW}⚙️ 2. Selecciona el método de despliegue:${NC}"
echo -e "1) Despliegue nativo con ${GREEN}PM2${NC}"
echo -e "2) Despliegue contenedorizado con ${GREEN}Docker Compose${NC}"
read -p "Introduce una opción (1 o 2): " DEPLOY_METHOD

if [ "$DEPLOY_METHOD" == "1" ]; then
    # --- DESPLIEGUE CON PM2 ---
    echo -e "\n${YELLOW}🏗️ Iniciando despliegue nativo con PM2...${NC}"
    
    # Instalar dependencias
    echo -e "${YELLOW}📦 Instalando dependencias de Node.js...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en npm install.${NC}"
        exit 1
    fi

    # Compilar frontend
    echo -e "${YELLOW}🧱 Compilando frontend (React + Vite)...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en npm run build.${NC}"
        exit 1
    fi

    # Validar si PM2 está instalado globalmente
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠️ PM2 no está instalado globalmente. Instalándolo ahora...${NC}"
        npm install -g pm2
    fi

    # Iniciar o recargar el servicio en PM2
    echo -e "${YELLOW}🔄 Reiniciando/Recargando el servidor en PM2...${NC}"
    if [ -f "./ecosystem.config.js" ]; then
        pm2 startOrReload ecosystem.config.js --env production
    else
        pm2 start server/server.js --name "edualert-api"
    fi
    
    pm2 save
    echo -e "\n${GREEN}✅ ¡Despliegue con PM2 completado con éxito!${NC}"
    echo -e "Puedes ver el estado con: ${BLUE}pm2 status${NC}"
    echo -e "Puedes ver los logs con: ${BLUE}pm2 logs edualert-api${NC}"
    echo -e "\n${YELLOW}🌐 Proxy inverso (Nginx):${NC} ejecuta ${BLUE}bash scripts/setup-nginx.sh${NC}"
    echo -e "   para servir / desde dist/ y enrutar /api → puerto 3001"

elif [ "$DEPLOY_METHOD" == "2" ]; then
    # --- DESPLIEGUE CON DOCKER ---
    echo -e "\n${YELLOW}🐳 Iniciando despliegue con Docker Compose...${NC}"

    # Validar si Docker está instalado
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Error: Docker o Docker Compose no están instalados en el servidor.${NC}"
        exit 1
    fi

    # Compilar frontend para que Nginx sirva los estáticos (volumen ./dist)
    echo -e "${YELLOW}🧱 Compilando frontend (React + Vite)...${NC}"
    npm install
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error en npm run build.${NC}"
        exit 1
    fi

    # Construir y levantar contenedores en segundo plano
    echo -e "${YELLOW}🏗️ Reconstruyendo imágenes y levantando servicios (API + Nginx)...${NC}"
    docker-compose up -d --build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al ejecutar docker-compose.${NC}"
        exit 1
    fi

    echo -e "\n${GREEN}✅ ¡Despliegue con Docker completado con éxito!${NC}"
    echo -e "Interfaz y API vía Nginx en puerto ${GREEN}80${NC} ( / → frontend, /api → backend )"
    echo -e "Puedes ver los contenedores corriendo con: ${BLUE}docker ps${NC}"
    echo -e "Puedes ver los logs con: ${BLUE}docker-compose logs -f${NC}"

else
    echo -e "${RED}❌ Opción no válida. Despliegue cancelado.${NC}"
    exit 1
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 ¡EduAlert UCEVA está en línea y operando!${NC}"
echo -e "${GREEN}======================================================${NC}"
