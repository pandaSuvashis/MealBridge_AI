import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path.join('.') || 'request', issue.message]),
    );
    const firstIssue = result.error.issues[0];
    return next(new AppError(
      400,
      'VALIDATION_ERROR',
      firstIssue ? `${firstIssue.path.join('.') || 'Request'}: ${firstIssue.message}` : 'Request validation failed.',
      details,
    ));
  }
  req.body = result.data;
  next();
};
