# Guía de Levantamiento del Entorno - EduAlert

Sigue estos pasos para configurar y ejecutar el proyecto EduAlert en tu máquina local.

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
