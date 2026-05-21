#!/usr/bin/env bash
# Instala y configura Nginx como proxy inverso para EduAlert UCEVA.
# Requisitos previos: npm run build, backend en PM2 (puerto 3001).

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE="${PROJECT_DIR}/deploy/nginx/edualert.conf.template"
SITE_NAME="edualert"
AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"

if [[ ! -f "${TEMPLATE}" ]]; then
  echo -e "${RED}❌ No se encontró la plantilla: ${TEMPLATE}${NC}"
  exit 1
fi

if [[ ! -d "${PROJECT_DIR}/dist" ]]; then
  echo -e "${RED}❌ Falta la carpeta dist/. Ejecuta primero: npm run build${NC}"
  exit 1
fi

if ! command -v nginx &>/dev/null; then
  echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
  sudo apt update
  sudo apt install -y nginx
fi

echo -e "${YELLOW}📝 Generando configuración de Nginx...${NC}"
TMP_CONF="$(mktemp)"
sed "s|__EDUALERT_ROOT__|${PROJECT_DIR}|g" "${TEMPLATE}" > "${TMP_CONF}"

echo -e "${YELLOW}📋 Instalando sitio en ${AVAILABLE}...${NC}"
sudo cp "${TMP_CONF}" "${AVAILABLE}"
rm -f "${TMP_CONF}"

if [[ -L /etc/nginx/sites-enabled/default ]]; then
  echo -e "${YELLOW}🔗 Deshabilitando sitio default de Nginx...${NC}"
  sudo rm -f /etc/nginx/sites-enabled/default
fi

sudo ln -sf "${AVAILABLE}" "${ENABLED}"

echo -e "${YELLOW}✅ Validando configuración...${NC}"
sudo nginx -t

echo -e "${YELLOW}🔄 Recargando Nginx...${NC}"
sudo systemctl enable nginx
sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx configurado correctamente.${NC}"
echo -e "   Raíz estática: ${PROJECT_DIR}/dist"
echo -e "   API proxy:     /api → http://127.0.0.1:3001"
echo -e ""
echo -e "${YELLOW}Recomendación UFW:${NC} cierra el puerto 3001 al público si solo usas Nginx:"
echo -e "   sudo ufw delete allow 3001/tcp"
