import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found.`));

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) return res.status(error.statusCode).json({ success: false, error: { code: error.code, message: error.message, details: error.details } });
  if (error?.name === 'CastError') return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'A provided identifier is invalid.' } });
  if (error?.code === 11000) return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RECORD', message: 'This record already exists.' } });
  if (error?.name === 'ValidationError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'The request contains invalid data.' } });
  if (env.nodeEnv !== 'production') console.error(error);
  return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected server error occurred.' } });
};
