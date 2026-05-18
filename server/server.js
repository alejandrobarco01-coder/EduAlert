import 'dotenv/config';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import factorsRouter from './routes/factors.js';
import interventionsRouter from './routes/interventions.js';
import studentsRouter from './routes/students.js';
import rulesRouter from './routes/rules.js';
import notificationsRouter from './routes/notifications.js';
import riesgoEstudianteRouter from './routes/riesgoEstudiante.js';
import aiRouter from './routes/ai.js';

import cors from 'cors';
import express from 'express';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { securityHeaders, sanitizeResponse } from './middleware/security.js';

const gzipAsync = promisify(gzip);
const app = express();
import { JWT_SECRET, PORT } from './config.js';

export { JWT_SECRET };

// ─── Global Error Handling ───────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('  ❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('  ❌ Uncaught Exception:', err);
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(securityHeaders);
app.use(sanitizeResponse);
app.use(cors());
app.use(express.json());

// ─── Performance timing middleware ───────────────────────────────────────────
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(2);
    console.log(`  ⚡ ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Cache-Control headers ───────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
  next();
});

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/factors', factorsRouter);
app.use('/api/interventions', interventionsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/riesgo-estudiante', riesgoEstudianteRouter);
app.use('/api/ai', aiRouter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use('/api/:path', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// ─── Servir frontend estático (producción) ───────────────────────────────────
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const distPath   = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  // Archivos estáticos con cache de largo plazo para assets hasheados
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
  }));

  // Catch-all: devolver index.html para rutas del SPA (React Router)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log(`  📦 Frontend estático servido desde: ${distPath}`);
}

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🚀 EduAlert API corriendo en http://127.0.0.1:${PORT}`);
  console.log(`  🔗 PORTAL DE ESTUDIANTES: http://localhost:5173/estudiantes/registro`);
  console.log(`  ⚡ Optimizaciones activas: Cache, GZIP, Search Index`);
  console.log(`  📚 Endpoints disponibles:`);
  console.log(`     GET /api/students          — Lista de estudiantes con índice de riesgo`);
  console.log(`     GET /api/students/stats    — Estadísticas agregadas`);
  console.log(`     GET /api/students/:id      — Detalle de estudiante`);
  console.log(`     GET /api/students/filter   — Filtros combinados dinámicos`);
  console.log(`     GET /api/students/filters/options — Opciones de filtros`);
  console.log(`     GET /api/students/:id/recommendations — Recomendaciones IA`);
  console.log(`     GET /api/health            — Health check\n`);
});

setInterval(() => console.log(`  💓 Heartbeat: ${new Date().toLocaleTimeString()} | OK`), 60000);

