#!/bin/bash
# Script para inicializar certificados SSL con Let's Encrypt + Certbot
# Uso: ./deploy/scripts/init-ssl.sh tu-dominio.com

set -e

if [ $# -eq 0 ]; then
    echo "Error: Debes proporcionar un dominio"
    echo "Uso: $0 ejemplo.com"
    exit 1
fi

DOMAIN="$1"
EMAIL="admin@${DOMAIN}"
CERT_DIR="$(dirname "$0")/../../certificates"
CERTBOT_DIR="$(dirname "$0")/../../certbot"

echo "🔐 Inicializando certificados SSL para: $DOMAIN"
echo "📧 Email de contacto: $EMAIL"

# Crear directorios si no existen
mkdir -p "$CERT_DIR"
mkdir -p "$CERTBOT_DIR/www"

# Generar certificado con Certbot (standalone mode)
echo "⏳ Generando certificado con Certbot..."
docker run --rm \
  -v "$CERT_DIR:/etc/letsencrypt" \
  -v "$CERTBOT_DIR/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --agree-tos \
    --no-eff-email \
    -m "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

echo "✅ Certificado generado correctamente en: $CERT_DIR"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura tu DNS para que apunte a la IP del servidor"
echo "2. Construye y despliega con docker-compose: docker-compose up -d"
echo "3. Verifica HTTPS: https://$DOMAIN"
echo ""
echo "🔄 Para renovar certificados automáticamente, usa: $0/renew-ssl.sh"
