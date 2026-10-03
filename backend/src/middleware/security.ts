import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { MiddlewareHandler } from 'hono';

export const securityHeadersMiddleware = (): MiddlewareHandler => {
  return secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xXssProtection: '1; mode=block'
  });
};

export const corsMiddleware = (): MiddlewareHandler => {
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:8081', 'http://localhost:3000', 'http://localhost:3001'];

  return cors({
    origin: (origin) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
        return origin || '*';
      }
      return allowedOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    credentials: true
  });
};
