import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request payload validation failed',
            details: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        },
        400
      );
    }
  });

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter validation failed',
            details: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        },
        400
      );
    }
  });
