# 🚀 Guía de Deploy en Render.com

EduAlert es compatible con Render. Aquí están los ajustes necesarios.

## ✅ Lo que Ya Funciona

- ✓ Dockerfile multi-etapa
- ✓ Node.js 20 (soportado)
- ✓ Express API
- ✓ PostgreSQL
- ✓ Variables de entorno con dotenv

## ⚠️ Cambios Necesarios

### 1. **Actualizar HOST para Render**

En `server/config.js`, Render necesita que el servidor escuche en `0.0.0.0`:

```javascript
// ❌ ACTUAL (solo funciona en localhost)
export const HOST = process.env.HOST || '127.0.0.1';

// ✅ CAMBIAR A:
export const HOST = process.env.HOST || '0.0.0.0';
```

**Por qué:** Render asigna dinámicamente puertos y usa 0.0.0.0 para que la app sea accesible.

### 2. **Render usa Express, no Nginx**

- ❌ NO necesitas Docker Compose en Render
- ❌ NO necesitas la carpeta `deploy/nginx/`
- ✅ Render usa el `Dockerfile` que ya tienes

### 3. **Variables de Entorno en Render Dashboard**

Cuando crees el servicio en Render, configura:

```
PORT=3001
HOST=0.0.0.0
JWT_SECRET=tu-secreto-aqui-aleatorio
GEMINI_API_KEY=tu-api-key-gemini
NODE_ENV=production
```

### 4. **Database en Render**

Render ofrece PostgreSQL managed:
1. Crea un servicio PostgreSQL en Render
2. Obtén la URL de conexión
3. En el Dockerfile: la URL la recibirá automáticamente como `DATABASE_URL`

---

## 🎯 Pasos para Desplegar en Render

### Paso 1: Push a GitHub

```bash
git add .
git commit -m "Ajuste HOST para Render"
git push
```

### Paso 2: Crear Cuenta en Render

- Ve a https://render.com
- Crea cuenta con GitHub

### Paso 3: Conectar Repositorio

1. Dashboard → New +
2. Selecciona **Web Service**
3. Conecta tu repo de EduAlert
4. Autoriza acceso a GitHub

### Paso 4: Configurar Servicio

**Build & Deploy:**
- Runtime: `Docker`
- Build Command: `npm ci && npm run build` (ya está en Dockerfile)
- Start Command: `node server/server.js` (ya está)

**Environment Variables:**
```
PORT=3001
HOST=0.0.0.0
JWT_SECRET=generaAlgoCriptográficoBueno
GEMINI_API_KEY=tu-api-key
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:port/db
```

### Paso 5: Crear Base de Datos

1. En Render Dashboard → PostgreSQL
2. Crea nueva BD PostgreSQL
3. Copia la URL de conexión
4. Pégala en `DATABASE_URL` del servicio web

### Paso 6: Deploy

Render despliega automáticamente cuando empujas a main.

---

## 🔗 URL en Producción

Render te dará un dominio gratuito:
```
https://edualert-xxxxx.onrender.com
```

**Con dominio personalizado:**
1. Dashboard → Custom Domain
2. Apunta tu dominio (DNS CNAME)
3. Render gestiona SSL automáticamente ✅

---

## 📋 Checklist Previo

- [ ] HOST cambiado a `0.0.0.0` en `server/config.js`
- [ ] Repositorio en GitHub público
- [ ] `package.json` tiene scripts build y start
- [ ] `.env` en `.gitignore` ✅ (ya está)
- [ ] Variables de entorno listas (JWT_SECRET, GEMINI_API_KEY)
- [ ] Dockerfile actualizado (sin docker-compose)

---

## ⏱️ Tiempo de Deploy

- **Primer deploy:** 5-10 minutos (primera build)
- **Siguientes:** 2-3 minutos
- **SSL:** Automático (gratis con Let's Encrypt)

---

## 💰 Costo Estimado

- Web Service (Node.js): $7/mes (mínimo)
- PostgreSQL: $7/mes (mínimo)
- **Total:** $14/mes aprox.

---

## 🆘 Problemas Comunes

### ❌ "Cannot find module" en Render

→ Falta `npm ci` antes de `npm run build`

### ❌ "Port bind error"

→ HOST debe ser `0.0.0.0`, no `127.0.0.1`

### ❌ "Database connection refused"

→ Verifica `DATABASE_URL` en variables de entorno

### ❌ "Free instance spinning down"

→ Render pone en hibernación servicios gratis sin tráfico
→ Solución: pasar a plan de pago ($7/mes)

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL Guide](https://render.com/docs/databases)

