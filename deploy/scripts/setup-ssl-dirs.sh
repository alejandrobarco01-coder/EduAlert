#!/bin/bash
# Crear directorio de certificados (placeholder)
# Este script prepara la estructura de directorios para SSL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Preparando estructura de directorios para SSL..."

# Crear directorios necesarios
mkdir -p "$PROJECT_ROOT/certificates"
mkdir -p "$PROJECT_ROOT/certbot/www"

# Crear archivos placeholder
cat > "$PROJECT_ROOT/certificates/.gitkeep" << 'EOF'
# Los certificados SSL se generan aquí con Certbot
# Esta carpeta debe contener:
# - fullchain.pem (certificado + cadena)
# - privkey.pem (clave privada)
EOF

cat > "$PROJECT_ROOT/certbot/www/.gitkeep" << 'EOF'
# Directorio para validación ACME de Let's Encrypt
EOF

echo "✅ Directorios creados:"
echo "  - certificates/ (para certificados SSL)"
echo "  - certbot/www/ (para validación ACME)"
echo ""
echo "📝 Próximo paso: ejecuta:"
echo "  ./deploy/scripts/init-ssl.sh tu-dominio.com"
