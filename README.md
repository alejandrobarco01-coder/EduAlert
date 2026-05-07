# EduAlert UCEVA

**EduAlert** es un sistema inteligente diseñado para la **Unidad Central del Valle del Cauca (UCEVA)**, enfocado en la detección temprana y prevención de la deserción estudiantil. Utiliza analítica predictiva para identificar estudiantes en riesgo académico, financiero o personal.

![Captura del Dashboard](https://raw.githubusercontent.com/username/repo-name/main/screenshot.png) *(Reemplaza con tu screenshot real)*

## 🚀 Características Principales

- **Dashboard de Monitoreo**: Visualización clara del índice de riesgo de cada estudiante (Bajo, Medio, Alto).
- **Analíticas Avanzadas**: Gráficas de distribución de riesgo y promedios por carrera.
- **Gestión de Usuarios (Admin)**: Creación y administración de cuentas para Tutores y Coordinadores.
- **Filtros Inteligentes**: Búsqueda por programa académico, semestre y nivel crítico.
- **Identidad Institucional**: Diseño elegante basado en los colores oficiales de la UCEVA.

## 🛠️ Tecnologías Utilizadas

- **React 19** (Vite)
- **Tailwind CSS** (Styling)
- **Lucide-react** (Iconografía)
- **React Router 7** (Navegación)
- **Context API** (Gestión de Autenticación)
- **Node.js + Express 5** (Backend API)
- **dotenv** (Manejo seguro de variables de entorno)

## 📦 Instalación y Uso 

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/edualert-uceva.git
   cd EduAlert
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **⚙️ Configurar variables de entorno:**
   ```bash
   # Copiar la plantilla de variables de entorno
   cp server/.env.example server/.env
   ```
   Luego edita `server/.env` con tus valores reales:
   ```env
   # API Key de Gemini (o OpenAI)
   GEMINI_API_KEY=tu-api-key-aqui

   # Secreto para JWT (cambia esto en producción)
   JWT_SECRET=un-secreto-seguro-aqui

   # Puerto del servidor (opcional, default: 3001)
   PORT=3001
   ```

   > ⚠️ **IMPORTANTE**: El archivo `server/.env` está en `.gitignore` y **nunca** debe subirse al repositorio. Contiene secretos como API keys y tokens de autenticación.

4. **Correr en modo desarrollo:**
   ```bash
   # Frontend + Backend simultáneamente
   npm run dev:full

   # O por separado:
   npm run server   # Backend en puerto 3001
   npm run dev      # Frontend en puerto 5173
   ```

5. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🔐 Seguridad

- **Variables de entorno**: Todas las API keys y secretos se almacenan exclusivamente en `server/.env`.
- **`.gitignore`**: El archivo `.env` está excluido del control de versiones.
- **Middleware de seguridad**: El servidor incluye middleware que:
  - Elimina el header `X-Powered-By` para no exponer la tecnología.
  - Agrega headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, etc.).
  - Sanitiza automáticamente las respuestas JSON para prevenir filtraciones accidentales de API keys.
- **Sin hardcoding**: Las API keys no tienen valores por defecto en el código fuente.

## 🔑 Credenciales de Prueba

| Rol | Email | Password |
|---|---|---|
| **Administrador** | admin@uceva.edu.co | Admin@2024 |
| **Tutor** | tutor@uceva.edu.co | Tutor@2024 |
| **Coordinador** | coord@uceva.edu.co | Coord@2024 |

---

© 2026 - Desarrollado para la **Unidad Central del Valle del Cauca (UCEVA)**.
