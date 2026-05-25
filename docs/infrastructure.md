# 🖥️ Guía de Aprovisionamiento y Despliegue de Infraestructura — EduAlert UCEVA

Esta guía detalla los pasos para realizar el aprovisionamiento inicial de un servidor Linux (Ubuntu/Debian) para alojar los servicios backend y la base de datos de producción del sistema **EduAlert UCEVA**, asegurando accesibilidad, rendimiento y seguridad.

---

## 🔑 1. Conexión SSH y Seguridad del Servidor

El primer paso es configurar el acceso seguro al servidor remoto. Se recomienda deshabilitar el acceso directo de contraseña y utilizar únicamente autenticación por llaves criptográficas SSH.

### Generar llave SSH (Local)
Si no tienes una llave SSH creada, ejecútala en tu terminal local:
```bash
ssh-keygen -t ed25519 -C "admin-edualert@uceva.edu.co"
```
*Guarda la llave en la ubicación por defecto y define una contraseña segura (passphrase).*

### Copiar la Llave Pública al Servidor
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@ip_del_servidor
```

### Configuración de Seguridad en SSH (`/etc/ssh/sshd_config`)
Para blindar el servidor, edita el archivo de configuración SSH del servidor remoto:
```bash
sudo nano /etc/ssh/sshd_config
```
Aplica o edita las siguientes líneas:
```ini
PermitRootLogin no          # Deshabilitar login del usuario root directo
PasswordAuthentication no   # Deshabilitar autenticación por contraseñas (solo llaves)
X11Forwarding no            # Deshabilitar forwarding gráfico
MaxAuthTries 3              # Máximo número de reintentos
```
Reinicia el servicio para aplicar los cambios:
```bash
sudo systemctl restart ssh
```

---

## 🛠️ 2. Actualización del Servidor e Instalación de Utilidades

Antes de proceder a instalar los servicios, actualiza el índice de paquetes y el sistema operativo:
```bash
sudo apt update && sudo apt upgrade -y
```

Instala herramientas esenciales del sistema:
```bash
sudo apt install -y curl git build-essential ufw software-properties-common
```

---

## 📦 3. Instalación de Node.js (Versión LTS) mediante NVM

Utilizaremos el script `nvm_install.sh` incluido en el proyecto para garantizar la consistencia en el gestor de versiones **NVM (Node Version Manager)**. Esto nos permite cambiar o actualizar versiones de Node de forma limpia.

### Instalar NVM
Ejecuta el script proporcionado en la raíz del proyecto para instalar NVM v0.39.7:
```bash
bash ./nvm_install.sh
```

### Cargar las Variables de Entorno de NVM
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### Instalar la Versión LTS de Node.js
Para **EduAlert UCEVA**, usaremos la versión estable **Node.js v20.x (LTS)**:
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

Verifica que las versiones sean correctas:
```bash
node -v  # Debería mostrar v20.x.x
npm -v   # Debería mostrar v10.x.x o superior
```

---

## 🚀 4. Gestor de Procesos en Producción: PM2

Para que el servidor API de Express corra continuamente en segundo plano y se reinicie automáticamente si ocurre un error o si el servidor se reinicia físicamente, utilizaremos **PM2**.

### Instalar PM2 Globalmente
```bash
npm install -g pm2
```

### Configurar el Inicio Automático del Sistema (Startup)
Genera el script necesario para que PM2 se inicie al arrancar el sistema operativo:
```bash
pm2 startup
```
*Copia y ejecuta en la terminal el comando largo que te arrojará como resultado (requerirá permisos de `sudo`).*

### Comandos Clave de PM2
*   **Iniciar aplicación:** `pm2 start server/server.js --name "edualert-api"`
*   **Monitorear en tiempo real:** `pm2 monit`
*   **Listar procesos:** `pm2 list`
*   **Ver Logs:** `pm2 logs edualert-api`
*   **Guardar estado actual de procesos:** `pm2 save` *(¡Crucial para persistir procesos en reinicios!)*

---

## 🛡️ 5. Configuración del Firewall (UFW)

Protege tu servidor limitando las conexiones entrantes y permitiendo solo los puertos necesarios:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh             # Permite puerto 22
sudo ufw allow http            # Permite puerto 80
sudo ufw allow https           # Permite puerto 443
sudo ufw enable                # Habilita el firewall
```
Para ver el estado actual:
```bash
sudo ufw status verbose
```

> **Nota:** No expongas el puerto `3001` al público una vez configurado Nginx (sección 6). El backend escucha solo en `127.0.0.1` y Nginx actúa como única entrada en los puertos 80/443.

---

## 🌐 6. Proxy inverso y enrutamiento (Nginx)

Nginx sirve el frontend compilado y reenvía las peticiones de la API al proceso Node.js en el puerto interno `3001`.

| Ruta | Destino |
|------|---------|
| `/` | Archivos estáticos de `dist/` (SPA React) |
| `/api` | Proxy reverso → `http://127.0.0.1:3001` |

### Requisitos previos

```bash
npm install
npm run build                    # Genera dist/
pm2 startOrReload ecosystem.config.js --env production
```

### Instalación automática

Desde la raíz del proyecto:

```bash
bash scripts/setup-nginx.sh
```

El script instala Nginx (si falta), genera el sitio desde `deploy/nginx/edualert.conf.template` y recarga el servicio.

### Instalación manual

```bash
sudo apt install -y nginx
sed "s|__EDUALERT_ROOT__|$(pwd)|g" deploy/nginx/edualert.conf.template | sudo tee /etc/nginx/sites-available/edualert
sudo ln -sf /etc/nginx/sites-available/edualert /etc/nginx/sites-enabled/edualert
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Verificación (criterios de aceptación)

```bash
# Interfaz de usuario en la raíz
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/

# API enrutada por el proxy
curl -s http://localhost/api/health
```

Respuestas esperadas: `200` en `/` y JSON con `"status":"ok"` en `/api/health`.

### Docker Compose

Con `docker-compose up -d --build`, el servicio `nginx` publica el puerto **80** y monta `./dist` para los estáticos. El backend (`edualert-app`) solo es accesible en la red interna de Docker.

Configuración: `deploy/nginx/edualert.docker.conf`.

---

## 🗄️ 7. Base de Datos (PostgreSQL)

Para gestionar los datos de forma persistente, segura y escalable, EduAlert UCEVA utiliza PostgreSQL orquestado a través de Docker Compose.

### Configuración Segura de Credenciales

Las credenciales no se encuentran expuestas en el código. Para configurar la base de datos de producción:
1. Asegúrate de tener el archivo `server/.env` correctamente configurado a partir de `.env.example`:
   ```env
   DB_USER=usuario_fuerte
   DB_PASSWORD=contraseña_super_segura
   DB_NAME=edualert_prod
   ```
2. Estas variables son inyectadas en tiempo de ejecución en el contenedor `edualert-postgres`.

### Verificación y Conexión por Consola

Puedes verificar la conexión y administrar la base de datos localmente desde la consola del servidor.

**1. Entrar a la consola de PostgreSQL (psql):**
```bash
docker exec -it edualert-postgres psql -U usuario_fuerte -d edualert_prod
```
Dentro de psql, puedes usar comandos como `\dt` (para listar tablas) o `\q` (para salir).

**2. Verificar que el servicio está activo:**
```bash
docker ps | grep edualert-postgres
# o viendo los logs:
docker logs edualert-postgres
```

### Respaldos (Backups)

Para realizar un respaldo manual de la base de datos de producción, ejecuta:
```bash
docker exec -t edualert-postgres pg_dumpall -c -U usuario_fuerte > dump_edualert_$(date +%Y-%m-%d).sql
```

### HTTPS (opcional)

Para TLS en producción, instala Certbot y extiende el bloque `server` con certificados Let's Encrypt, o coloca un balanceador TLS delante de Nginx.

---

## 📊 8. Validación de Conectividad y Monitoreo de Logs

Para garantizar la estabilidad y salud del sistema, se debe monitorear activamente que el backend esté conectado a la base de datos y que no existan ciclos de reinicio por errores no controlados (*crash loops*).

### Verificación de Logs en Docker
Si desplegaste utilizando `docker-compose`:
```bash
# Ver los últimos 100 logs del backend (API) y seguirlos en tiempo real:
docker-compose logs -f --tail=100 edualert-app
```
**Resultado Esperado:** Al final del log inicial, deberías observar explícitamente el mensaje: `🗄️  Conexión exitosa a la base de datos de producción` sin ningún stacktrace de error a continuación.

### Verificación de Logs en PM2
Si desplegaste nativamente utilizando `PM2`:
```bash
# Ver métricas, salud y consumo en un dashboard en tiempo real:
pm2 monit

# Ver el registro de logs unificados (salidas y errores):
pm2 logs edualert-api
```
**Resultado Esperado:** El estado de la aplicación en la tabla de `pm2 list` debe ser `online` constante (sin incrementar los `restarts` continuamente, lo que indicaría un crash loop).

### ¿Qué hacer en caso de Crash Loops?
Si el sistema registra que no puede conectarse a la base de datos (mostrando el log `❌ Error fatal: No se pudo conectar a la base de datos`), valida de inmediato que el archivo `.env` exista en producción y que los parámetros (`DB_USER`, `DB_PASSWORD`, `DB_NAME`) sean correctos utilizando el script de asistencia:
```bash
bash scripts/setup-env.sh
```
