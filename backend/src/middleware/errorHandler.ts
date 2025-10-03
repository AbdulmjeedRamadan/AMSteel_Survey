/**
 * Global error handler middleware
 * Catches and formats all errors thrown in the application
 */

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import logger from '../utils/logger';
import config from '../config/env';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';

  // Use custom error properties if available
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.message) {
    message = error.message;
  }

  // Log error
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode,
  });

  // Send error response
  // In production, don't expose internal error details
  const errorMessage = config.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : message;

  sendError(res, errorMessage, statusCode);
}

/**
 * Handle 404 not found errors
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(`Route not found: ${req.method} ${req.url}`, 404);
  next(error);
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors automatically
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
