import { Hono } from 'hono';
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
import { JWTPayload } from './types/index.js';

export const app = new Hono<{ Variables: { user?: JWTPayload; validatedBody?: any } }>();

app.use('*', corsMiddleware());
app.use('*', securityHeadersMiddleware());
app.use('*', rateLimiter({ windowMs: 60 * 1000, max: 500 }));

app.onError(globalErrorHandler);
app.notFound(notFoundHandler);

app.get('/', (c) => {
  return c.json({
    name: 'DocTimings API',
    version: '1.0.0',
    status: 'active',
    documentation: 'https://github.com/shibudhara11/docnear',
    endpoints: {
      auth: '/api/v1/auth',
      doctors: '/api/v1/doctors',
      establishments: '/api/v1/establishments',
      schedules: '/api/v1/schedules',
      search: '/api/v1/search',
      reports: '/api/v1/reports',
      audit: '/api/v1/audit',
      health: '/api/v1/health'
    }
  });
});

const api = new Hono<{ Variables: { user?: JWTPayload; validatedBody?: any } }>();

api.route('/auth', authRoutes);
api.route('/doctors', doctorRoutes);
api.route('/establishments', establishmentRoutes);
api.route('/schedules', scheduleRoutes);
api.route('/search', searchRoutes);
api.route('/reports', reportRoutes);
api.route('/audit', auditRoutes);
api.route('/health', healthRoutes);

app.route('/api/v1', api);

export type AppType = typeof app;
export default app;
