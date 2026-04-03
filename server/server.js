import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import factorsRouter from './routes/factors.js';
import interventionsRouter from './routes/interventions.js';

import cors from 'cors';
import express from 'express';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import studentsRouter from './routes/students.js';

const gzipAsync = promisify(gzip);
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'edualert-secret-key-2024';

export { JWT_SECRET };

// ─── Middleware ──────────────────────────────────────────────────────────────
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

// ─── GZIP compression middleware for JSON responses ──────────────────────────
const originalJson = express.response.json;
express.response.json = function (body) {
  const acceptEncoding = this.req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('gzip')) {
    const jsonStr = JSON.stringify(body);
    return gzipAsync(Buffer.from(jsonStr)).then(compressed => {
      this.set('Content-Type', 'application/json');
      this.set('Content-Encoding', 'gzip');
      this.set('X-Response-Time', `${(performance.now()).toFixed(0)}ms`);
      this.send(compressed);
    }).catch(() => {
      // Fallback to uncompressed
      return originalJson.call(this, body);
    });
  }
  return originalJson.call(this, body);
};

// ─── Cache-Control headers ───────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  // Allow client-side caching for 10 seconds
  res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
  next();
});

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/factors', factorsRouter);
app.use('/api/interventions', interventionsRouter);


// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use('/api/:path', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  🚀 EduAlert API corriendo en http://127.0.0.1:${PORT}`);
  console.log(`  ⚡ Optimizaciones activas: Cache, GZIP, Search Index`);
  console.log(`  📚 Endpoints disponibles:`);
  console.log(`     GET /api/students          — Lista de estudiantes con índice de riesgo`);
  console.log(`     GET /api/students/stats     — Estadísticas agregadas`);
  console.log(`     GET /api/students/:id       — Detalle de estudiante`);
  console.log(`     GET /api/students/filter    — Filtros combinados dinámicos`);
  console.log(`     GET /api/students/filters/options — Opciones de filtros`);
  console.log(`     GET /api/students/:id/recommendations — Recomendaciones IA`);
  console.log(`     GET /api/health             — Health check\n`);
});
