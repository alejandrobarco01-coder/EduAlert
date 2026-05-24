#!/bin/bash
# Script para renovar certificados SSL
# Se debe ejecutar periódicamente (cron job recomendado)

set -e

CERT_DIR="$(dirname "$0")/../../certificates"
CERTBOT_DIR="$(dirname "$0")/../../certbot"

echo "🔄 Renovando certificados SSL..."

docker run --rm \
  -v "$CERT_DIR:/etc/letsencrypt" \
  -v "$CERTBOT_DIR/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot renew \
    --webroot \
    --webroot-path /var/www/certbot \
    --quiet

echo "✅ Certificados renovados correctamente"

# Recargar nginx sin downtime
echo "📡 Recargando Nginx..."
docker exec edualert-nginx nginx -s reload

echo "✅ Nginx recargado exitosamente"
