import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { JWTPayload } from '../types/index.js';

export const fail = (c: Context, status: ContentfulStatusCode, code: string, message: string) =>
  c.json({ success: false, error: { code, message } }, status);

export const notFound = (c: Context, message: string) => fail(c, 404, 'NOT_FOUND', message);

export const badRequest = (c: Context, message: string) => fail(c, 400, 'VALIDATION_ERROR', message);

export const validBody = <T>(c: Context): T => c.get('validatedBody') as T;

export const validQuery = <T>(c: Context): T => c.get('validatedQuery') as T;

export const currentUser = (c: Context) => c.get('user') as JWTPayload | undefined;

export const newId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;

export const paginate = <T>(items: T[], page: number, limit: number) => ({
  data: items.slice((page - 1) * limit, page * limit),
  pagination: {
    page,
    limit,
    total: items.length,
    totalPages: Math.ceil(items.length / limit)
  }
});
