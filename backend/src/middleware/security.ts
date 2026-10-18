import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { MiddlewareHandler } from 'hono';

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:3001'];

export const securityHeadersMiddleware = (): MiddlewareHandler =>
  secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin'
  });

const isAllowed = (origin: string) => {
  const configured = process.env.CORS_ORIGINS;
  if (configured) {
    const list = configured.split(',').map(s => s.trim());
    return list.includes('*') || list.includes(origin);
  }
  return DEV_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
};

export const corsMiddleware = (): MiddlewareHandler =>
  cors({
    origin: origin => {
      if (!origin) return '*';
      return isAllowed(origin) ? origin : null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400
  });
