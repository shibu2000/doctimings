import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { securityHeadersMiddleware, corsMiddleware } from './middleware/security.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { doctorRoutes } from './routes/doctorRoutes.js';
import { establishmentRoutes } from './routes/establishmentRoutes.js';
import { scheduleRoutes } from './routes/scheduleRoutes.js';
import { searchRoutes } from './routes/searchRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';
import { auditRoutes } from './routes/auditRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { locationRoutes } from './routes/locationRoutes.js';
import { useNeon } from './db/index.js';

const WORKER_ENV_KEYS = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'CORS_ORIGINS'] as const;

export const app = new Hono();

app.use('*', async (c, next) => {
  const env = c.env as Record<string, string | undefined> | undefined;
  if (env?.DATABASE_URL) {
    useNeon(env.DATABASE_URL);
  }
  for (const key of WORKER_ENV_KEYS) {
    if (env?.[key]) process.env[key] = env[key];
  }
  await next();
});

app.use('*', corsMiddleware());
app.use('*', securityHeadersMiddleware());
app.use('*', rateLimiter({ windowMs: 60 * 1000, max: 500 }));
app.use(
  '*',
  bodyLimit({
    maxSize: 100 * 1024,
    onError: c => c.json({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request is too large' } }, 413)
  })
);

app.onError(globalErrorHandler);
app.notFound(notFoundHandler);

app.get('/', c =>
  c.json({
    name: 'DocTimings API',
    version: '1.1.0',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      doctors: '/api/v1/doctors',
      establishments: '/api/v1/establishments',
      schedules: '/api/v1/schedules',
      search: '/api/v1/search',
      reports: '/api/v1/reports',
      audit: '/api/v1/audit',
      health: '/api/v1/health',
      admin: '/api/v1/admin',
      locations: '/api/v1/locations/towns'
    }
  })
);

const api = new Hono();

api.route('/auth', authRoutes);
api.route('/doctors', doctorRoutes);
api.route('/establishments', establishmentRoutes);
api.route('/schedules', scheduleRoutes);
api.route('/search', searchRoutes);
api.route('/reports', reportRoutes);
api.route('/audit', auditRoutes);
api.route('/health', healthRoutes);
api.route('/admin', adminRoutes);
api.route('/locations', locationRoutes);

app.route('/api/v1', api);

export type AppType = typeof app;
export default app;
