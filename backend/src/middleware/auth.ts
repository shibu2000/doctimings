import jwt from 'jsonwebtoken';
import type { MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { JWTPayload, UserRole, ADMIN_ROLES, STAFF_ROLES, ACCOUNT_ROLES } from '../types/index.js';
import { fail } from '../lib/http.js';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

export const signToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn = process.env.JWT_EXPIRES_IN || '7d'): string =>
  jwt.sign(payload, getSecret(), { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as JWTPayload;
  } catch {
    return null;
  }
};

const readBearer = (header: string | undefined) =>
  header && header.startsWith('Bearer ') ? header.slice(7) : null;

const resolveSession = async (token: string): Promise<JWTPayload | null> => {
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const [user] = await getDb().select().from(schema.users).where(eq(schema.users.id, decoded.sub));
  if (!user || user.status !== 'Active') return null;
  if (decoded.iat && decoded.iat * 1000 + 2000 < user.updatedAt.getTime()) return null;
  return { ...decoded, email: user.email, name: user.name, role: user.role as UserRole };
};

export const authMiddleware = (): MiddlewareHandler => async (c, next) => {
  const token = readBearer(c.req.header('authorization'));
  if (!token) {
    return fail(c, 401, 'UNAUTHORIZED', 'Authorization token missing or malformed');
  }
  const session = await resolveSession(token);
  if (!session) {
    return fail(c, 401, 'INVALID_TOKEN', 'Session has expired or the account is no longer active');
  }
  c.set('user', session);
  await next();
};

export const optionalAuthMiddleware = (): MiddlewareHandler => async (c, next) => {
  const token = readBearer(c.req.header('authorization'));
  const session = token ? await resolveSession(token) : null;
  if (session) {
    c.set('user', session);
  }
  await next();
};

export const requireRoles = (roles: readonly UserRole[]): MiddlewareHandler => async (c, next) => {
  const user = c.get('user') as JWTPayload | undefined;
  if (!user) {
    return fail(c, 401, 'UNAUTHORIZED', 'Authentication required');
  }
  if (!roles.includes(user.role)) {
    return fail(c, 403, 'FORBIDDEN', 'You do not have permission for this action');
  }
  await next();
};

export const requireAdmin = requireRoles(ADMIN_ROLES);

export const requireStaffOrAdmin = requireRoles(STAFF_ROLES);

export const requireAccount = requireRoles(ACCOUNT_ROLES);

export const requireSuperAdmin = requireRoles(['Super Admin']);
