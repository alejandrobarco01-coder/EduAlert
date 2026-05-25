#!/usr/bin/env bash

# ─── Script interactivo para configurar el entorno de producción (.env) ───────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ENV_FILE="server/.env"
EXAMPLE_FILE="server/.env.example"

echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}🔐 Asistente de Configuración de Entorno (Producción) ${NC}"
echo -e "${GREEN}=================================================${NC}"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  El archivo $ENV_FILE ya existe.${NC}"
    read -p "¿Deseas sobrescribirlo? (s/N): " overwrite
    if [[ ! "$overwrite" =~ ^[sS]$ ]]; then
        echo -e "Operación cancelada. El entorno actual se mantiene intacto."
        exit 0
    fi
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
    echo -e "${RED}❌ Error: No se encontró la plantilla $EXAMPLE_FILE.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Por favor, introduce los valores para producción (presiona Enter para usar el valor por defecto si existe):${NC}\n"

# Variables base
read -p "PORT [3001]: " port
port=${port:-3001}

read -p "JWT_SECRET (Obligatorio): " jwt_secret
while [ -z "$jwt_secret" ]; do
    echo -e "${RED}El JWT_SECRET no puede estar vacío.${NC}"
    read -p "JWT_SECRET (Obligatorio): " jwt_secret
done

read -p "GEMINI_API_KEY (Obligatorio para IA): " gemini_key

echo -e "\n${YELLOW}--- Credenciales de Base de Datos ---${NC}"
read -p "DB_USER [postgres]: " db_user
db_user=${db_user:-postgres}

read -p "DB_PASSWORD (Obligatorio): " db_password
while [ -z "$db_password" ]; do
    echo -e "${RED}La contraseña de la DB no puede estar vacía.${NC}"
    read -p "DB_PASSWORD (Obligatorio): " db_password
done

read -p "DB_NAME [edualert_prod]: " db_name
db_name=${db_name:-edualert_prod}

# Generar archivo
echo -e "\n${YELLOW}Generando $ENV_FILE...${NC}"

cat > "$ENV_FILE" << EOF
# ─── EduAlert - Variables de Entorno (PRODUCCIÓN) ────────────────────────────
# Generado automáticamente por setup-env.sh el $(date)

# ─── API Keys (IA) ───────────────────────────────────────────────────────────
GEMINI_API_KEY=$gemini_key

# ─── Servidor ────────────────────────────────────────────────────────────────
PORT=$port
HOST=0.0.0.0
JWT_SECRET=$jwt_secret

# ─── Base de Datos (PostgreSQL) ──────────────────────────────────────────────
DB_USER=$db_user
DB_PASSWORD=$db_password
DB_NAME=$db_name
EOF

# Asegurar permisos (Solo el dueño puede leer/escribir)
chmod 600 "$ENV_FILE"

echo -e "${GREEN}✅ ¡Archivo .env configurado y asegurado con éxito!${NC}"
echo -e "Permisos establecidos a 600 para proteger tus credenciales."
