import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const formatIssues = (error: z.ZodError) =>
  error.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message
  }));

export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0]?.message || 'Request payload validation failed',
            details: formatIssues(result.error)
          }
        },
        400
      );
    }
    c.set('validatedBody', result.data);
  });

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: result.error.errors[0]?.message || 'Query parameter validation failed',
            details: formatIssues(result.error)
          }
        },
        400
      );
    }
    c.set('validatedQuery', result.data);
  });
