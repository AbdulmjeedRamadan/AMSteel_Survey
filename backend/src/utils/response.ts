/**
 * Standardized API response helpers
 * Ensures consistent response format across all endpoints
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ValidationError } from '../types';

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  error: string | Error,
  statusCode: number = 500,
  errors?: ValidationError[]
): Response {
  const response: ApiResponse = {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    errors,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  errors: ValidationError[]
): Response {
  return sendError(res, 'Validation failed', 400, errors);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): Response {
  const totalPages = Math.ceil(total / limit);

  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    message,
    data: {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
      },
    },
  };

  return res.status(200).json(response);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Send unauthorized response (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(res, message, 401);
}

/**
 * Send forbidden response (403)
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): Response {
  return sendError(res, message, 403);
}

/**
 * Send not found response (404)
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(res, message, 404);
}

/**
 * Send conflict response (409)
 */
export function sendConflict(
  res: Response,
  message: string = 'Resource already exists'
): Response {
  return sendError(res, message, 409);
}

/**
 * Send bad request response (400)
 */
export function sendBadRequest(
  res: Response,
  message: string = 'Bad request'
): Response {
  return sendError(res, message, 400);
}
