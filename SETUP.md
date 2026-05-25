# Guía de Levantamiento del Entorno - EduAlert

Sigue estos pasos para configurar y ejecutar el proyecto EduAlert en tu máquina local.

## 0. Requisitos del Sistema

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en las versiones especificadas para garantizar la compatibilidad del entorno:

| Herramienta | Versión Recomendada | Notas |
|---|---|---|
| **Node.js** | `v20.x` (LTS) | Versión estricta recomendada (usada en el Dockerfile). |
| **npm** | `v10.x` o superior | Viene incluido con Node 20. |
| **Git** | `v2.40` o superior | Necesario para la gestión del repositorio. |
| **Docker** | `v24.x` o superior | Necesario para levantar la base de datos local. |
| **Docker Compose** | `v2.x` o superior | Para gestionar los contenedores del proyecto. |
| **PostgreSQL** | `v16.x` | Versión específica de la imagen oficial del proyecto. |

> [!TIP]
> Se recomienda el uso de [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) para gestionar múltiples versiones de Node.js en tu equipo.

---

## 1. Clonar el Repositorio

Primero, clona el repositorio desde GitHub y accede a la carpeta del proyecto:

```bash
git clone https://github.com/alejandrobarco01-coder/EduAlert.git
cd EduAlert-develop
```

## 2. Instalación de Dependencias

El proyecto utiliza un único archivo `package.json` en la raíz para gestionar tanto el frontend como el backend. Instala todas las librerías necesarias ejecutando:

```bash
npm install
```

## 3. Configuración de Variables de Entorno (.env)

Es necesario configurar las variables de entorno para que el sistema funcione correctamente.

### Backend
Copia la plantilla de ejemplo y edita el archivo con tus credenciales:

```bash
cp server/.env.example server/.env
```

Luego, abre `server/.env` y completa los siguientes valores:
- `GEMINI_API_KEY`: Tu clave de API de Google Gemini para las funciones de IA.
- `JWT_SECRET`: Una cadena aleatoria para firmar los tokens de seguridad.
- `DB_PASSWORD`: Contraseña para la base de datos PostgreSQL (si se usa).

### Frontend
El frontend ya cuenta con el archivo `.env.development` configurado para apuntar a la API local (`/api`). No es necesario realizar cambios adicionales para desarrollo.

## 4. Base de Datos Local

Actualmente, EduAlert utiliza **archivos JSON** ubicados en `server/data/` para el almacenamiento de datos en desarrollo, por lo que **no es obligatorio** configurar una base de datos externa para empezar a trabajar.

Sin embargo, si deseas levantar la instancia de **PostgreSQL** incluida en el proyecto a través de Docker, ejecuta:

```bash
docker-compose up -d db
```

*Nota: Por el momento, el sistema inicializa los datos automáticamente desde los archivos JSON, por lo que no se requieren comandos de migración manuales.*

## 5. Ejecución del Proyecto

Para iniciar tanto el **Frontend** como el **Backend** simultáneamente en modo desarrollo, utiliza el siguiente comando:

```bash
npm run dev:full
```

Esto levantará:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

### Comandos Individuales
Si prefieres ejecutarlos por separado, puedes usar:
- `npm run server`: Inicia solo el backend.
- `npm run dev`: Inicia solo el frontend.

## 🔑 Credenciales de Acceso (Prueba)

| Rol | Usuario (Email) | Contraseña |
|---|---|---|
| **Administrador** | admin@uceva.edu.co | Admin@2024 |
| **Tutor** | tutor@uceva.edu.co | Tutor@2024 |
| **Coordinador** | coord@uceva.edu.co | Coord@2024 |

---

## 🛠️ Solución a Problemas Frecuentes

Aquí se listan los errores más comunes al intentar levantar el proyecto y cómo solucionarlos:

### 1. Error: `EADDRINUSE: address already in use :::3001` o `:::5173`
Este error ocurre cuando el puerto del Backend (3001) o del Frontend (5173) ya está siendo utilizado por otro proceso.

**Solución:**
- **Windows:** Abre la terminal y ejecuta `netstat -ano | findstr :3001` para encontrar el PID del proceso. Luego ejecuata `taskkill /PID <PID> /F` para finalizarlo.
- **Alternativa:** Puedes cambiar los puertos en `package.json` o simplemente cerrar otras terminales que puedan tener el proyecto corriendo.

### 2. Funciones de IA no responden o Error de API Key
Si al interactuar con las funciones de IA (Gemini) no recibes respuesta o ves errores en la consola del servidor.

**Solución:**
- Verifica que el archivo `server/.env` exista (no confundir con `.env.example`).
- Asegúrate de que la variable `GEMINI_API_KEY` tenga una clave válida de [Google AI Studio](https://aistudio.google.com/).
- Reinicia el servidor después de hacer cambios en el archivo `.env`.

### 3. Errores de Sintaxis o `Module not found` al iniciar
Generalmente ocurre por una discrepancia en la versión de Node.js o una instalación de dependencias incompleta.

**Solución:**
- Asegúrate de usar **Node.js v20.x**. Verifica con `node -v`.
- Borra la carpeta `node_modules` y el archivo `package-lock.json`, luego ejecuta `npm install` nuevamente.
- Si estás en Windows, intenta ejecutar la terminal como Administrador para la instalación inicial.
