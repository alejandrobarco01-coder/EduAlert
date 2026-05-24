# 🔐 Scripts de SSL para EduAlert

Scripts para gestionar certificados SSL/TLS con Let's Encrypt.

## 📁 Archivos

- **init-ssl.sh** - Genera nuevos certificados SSL
- **renew-ssl.sh** - Renueva certificados existentes
- **setup-ssl-dirs.sh** - Crea estructura de directorios

## 🚀 Uso Rápido

### 1. Preparar directorios

```bash
chmod +x deploy/scripts/setup-ssl-dirs.sh
./deploy/scripts/setup-ssl-dirs.sh
```

### 2. Generar certificados

```bash
chmod +x deploy/scripts/init-ssl.sh
./deploy/scripts/init-ssl.sh tu-dominio.com
```

### 3. Desplegar

```bash
docker-compose up -d
```

### 4. Configurar renovación automática

```bash
chmod +x deploy/scripts/renew-ssl.sh

# Opción A: Cron job
(crontab -l 2>/dev/null; echo "0 2 1 * * /var/www/EduAlert/deploy/scripts/renew-ssl.sh >> /var/log/edualert-ssl-renew.log 2>&1") | crontab -

# Opción B: systemd timer (ver DEPLOYMENT.md)
```

## 📋 Requisitos

- Docker instalado
- Acceso a internet (para Let's Encrypt)
- Dominio apuntando a la IP del servidor

## 🔗 Documentación Completa

Ver `deploy/DEPLOYMENT.md` para instrucciones detalladas.
