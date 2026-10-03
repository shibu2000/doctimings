import jwt from 'jsonwebtoken';
import type { MiddlewareHandler } from 'hono';
import { JWTPayload, UserRole } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'wimd_super_secret_jwt_key_2026_dev';

export const signToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization token missing or malformed'
          }
        },
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Session has expired or token is invalid'
          }
        },
        401
      );
    }

    c.set('user', decoded);
    await next();
  };
};

export const optionalAuthMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        c.set('user', decoded);
      }
    }
    await next();
  };
};

export const requireRoles = (roles: UserRole[]): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('user') as JWTPayload | undefined;
    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        401
      );
    }

    if (!roles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient administrative privileges'
          }
        },
        403
      );
    }

    await next();
  };
};

export const requireAdmin = requireRoles([
  'Super Admin',
  'Operations Admin',
  'District Lead',
  'Verifier'
]);

export const requireStaffOrAdmin = requireRoles([
  'Super Admin',
  'Operations Admin',
  'District Lead',
  'Verifier',
  'Staff'
]);

