import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ZodError } from 'zod';

export const globalErrorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request payload validation failed',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      },
      400
    );
  }

  const status = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  if (status >= 500) {
    console.error(err);
  }
  const message = status >= 500 ? 'Something went wrong on the server' : err.message;

  return c.json(
    {
      success: false,
      error: {
        code: status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR',
        message
      }
    },
    status as any
  );
};

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${c.req.method} ${c.req.path} does not exist`
      }
    },
    404
  );
};
