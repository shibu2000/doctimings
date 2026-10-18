import type { MiddlewareHandler } from 'hono';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export const rateLimiter = (options?: {
  windowMs?: number;
  max?: number;
  message?: string;
}): MiddlewareHandler => {
  const windowMs = options?.windowMs || Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
  const max = options?.max || Number(process.env.RATE_LIMIT_MAX) || 100;
  const message = options?.message || 'Too many requests, please try again later.';
  const clientLimits = new Map<string, RateLimitRecord>();

  return async (c, next) => {
    const now = Date.now();
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      'local';
    const key = `${ip}:${c.req.routePath}`;

    if (clientLimits.size > 5000) {
      for (const [k, v] of clientLimits.entries()) {
        if (now > v.resetTime) clientLimits.delete(k);
      }
      while (clientLimits.size > 5000) {
        clientLimits.delete(clientLimits.keys().next().value!);
      }
    }

    let record = clientLimits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      clientLimits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(resetSeconds));

    if (record.count > max) {
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message
          }
        },
        429
      );
    }

    await next();
  };
};
