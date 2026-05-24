# 🔐 Deployment de EduAlert con SSL y Dominio

Este documento describe cómo desplegar EduAlert en producción con SSL/TLS y un dominio personalizado.

## 📋 Requisitos Previos

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Docker y Docker Compose instalados
- Acceso root o sudo en el servidor
- Dominio registrado (ej. edualert.miescuela.edu.co)
- IP pública del servidor

## 🚀 Pasos de Deployment

### 1. **Configurar el DNS**

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

1. Accede al panel de control de DNS
2. Crea o edita el registro **A**:
   - Nombre: `@` (o deja vacío para el dominio raíz)
   - Tipo: `A`
   - Valor: `Tu-IP-Pública`
3. (Opcional) Crea otro registro A para `www`:
   - Nombre: `www`
   - Tipo: `A`
   - Valor: `Tu-IP-Pública`

**Espera 15-30 minutos** para que se propague el DNS.

Verifica con:
```bash
nslookup tu-dominio.com
# o
dig tu-dominio.com
```

### 2. **Clonar y preparar el repositorio**

```bash
cd /var/www
git clone https://github.com/tu-repo/EduAlert.git
cd EduAlert
```

### 3. **Construir la aplicación**

```bash
npm install
npm run build
```

Esto genera los archivos estáticos en `./dist` que Nginx servirá.

### 4. **Configurar variables de entorno**

```bash
cp server/.env.example server/.env
# Edita server/.env con valores reales:
# - GEMINI_API_KEY
# - JWT_SECRET
# - BD credenciales
nano server/.env
```

### 5. **Generar certificados SSL**

El script `init-ssl.sh` utiliza Certbot con Let's Encrypt (GRATIS).

```bash
chmod +x deploy/scripts/init-ssl.sh
./deploy/scripts/init-ssl.sh tu-dominio.com
```

**¿Qué hace?**
- Crea certificados en `./certificates/`
- Verifica que el dominio sea válido
- Descarga certificados válidos por 90 días

### 6. **Desplegar con Docker Compose**

```bash
docker-compose up -d
```

Verifica los contenedores:
```bash
docker-compose ps
```

### 7. **Verificar HTTPS**

```bash
# Desde cualquier navegador o CLI:
curl -I https://tu-dominio.com

# Deberías ver:
# HTTP/2 200
# SSL certificate: válido
```

## 🔄 Renovación Automática de Certificados

Let's Encrypt emite certificados válidos por **90 días**. Crea un cron job para renovar automáticamente:

```bash
sudo crontab -e

# Añade esta línea (ejecuta renovación el 1º de cada mes a las 2 AM):
0 2 1 * * /var/www/EduAlert/deploy/scripts/renew-ssl.sh >> /var/log/edualert-ssl-renew.log 2>&1
```

O crea un systemd timer (más moderno):

```bash
# Crea: /etc/systemd/system/edualert-ssl-renew.service
[Unit]
Description=Renew EduAlert SSL certificates
After=network.target

[Service]
Type=oneshot
User=root
WorkingDirectory=/var/www/EduAlert
ExecStart=/var/www/EduAlert/deploy/scripts/renew-ssl.sh

---

# Crea: /etc/systemd/system/edualert-ssl-renew.timer
[Unit]
Description=Run EduAlert SSL renewal monthly

[Timer]
OnCalendar=monthly
Persistent=true

[Install]
WantedBy=timers.target

---

# Habilitar:
sudo systemctl daemon-reload
sudo systemctl enable edualert-ssl-renew.timer
sudo systemctl start edualert-ssl-renew.timer
```

## 🛡️ Características de Seguridad Implementadas

✅ **HTTPS/TLS 1.2+** - Encriptación de tráfico  
✅ **HTTP → HTTPS Redirect** - Fuerza HTTPS automáticamente  
✅ **HSTS** - Previene downgrade attacks  
✅ **X-Frame-Options** - Protege contra clickjacking  
✅ **X-Content-Type-Options** - Previene MIME sniffing  
✅ **Certificados renovación automática** - No expira manualmente  

## 🐛 Troubleshooting

### ❌ DNS no resuelve

```bash
# Verifica que el DNS está propagado:
dig tu-dominio.com

# Si no funciona, espera más tiempo o verifica el proveedor DNS
```

### ❌ Certificado inválido

```bash
# Verifica los certificados en el contenedor nginx:
docker exec edualert-nginx ls -la /etc/nginx/certificates/

# Si faltan, regenera:
./deploy/scripts/init-ssl.sh tu-dominio.com
docker-compose restart nginx
```

### ❌ Error "Certificate_verify_failed"

Probablemente los certificados no se copiaron correctamente. Verifica:

```bash
docker inspect edualert-nginx | grep -A 10 Mounts

# Debe mostrar:
# "./certificates:/etc/nginx/certificates:ro"
```

### ❌ Nginx no inicia

```bash
# Revisa los logs:
docker logs edualert-nginx

# Verifica la sintaxis del archivo nginx.conf:
docker run --rm -v ./deploy/nginx:/etc/nginx:ro nginx:1.27-alpine nginx -t
```

## 📊 Monitoreo

```bash
# Ver logs en tiempo real:
docker-compose logs -f nginx
docker-compose logs -f edualert-app
docker-compose logs -f db

# Verificar uso de recursos:
docker stats
```

## 🔒 Checklist Pre-Producción

- [ ] DNS configurado y propagado
- [ ] Variables de entorno configuradas (JWT_SECRET, GEMINI_API_KEY, etc.)
- [ ] Build de frontend completado (`npm run build`)
- [ ] Certificados SSL generados
- [ ] docker-compose up funciona sin errores
- [ ] HTTPS accesible desde navegador
- [ ] Dashboard carga correctamente
- [ ] API endpoints responden
- [ ] Cron job de renovación configurado
- [ ] Backups de BD configurados

## 🆘 Soporte

Revisa los logs de los servicios:

```bash
docker-compose logs --tail=100 [servicio]
```

Servicios disponibles:
- `nginx` - Reverse proxy HTTP/HTTPS
- `edualert-app` - Backend Node.js/Express
- `db` - Base de datos PostgreSQL

---

**Creado:** 2026-05-24  
**Documentación para:** EduAlert UCEVA  
**Soporte:** Tu equipo de infraestructura/DevOps
