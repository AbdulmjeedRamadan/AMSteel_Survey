/**
 * Authentication middleware
 * Validates JWT tokens and enforces role-based access control
 */

import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyAccessToken } from '../services/auth.service';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import logger from '../utils/logger';

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware to require authentication
 * Validates JWT token and attaches user info to request
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      sendUnauthorized(res, 'No authentication token provided');
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication failed', error);
    sendUnauthorized(res, 'Invalid or expired token');
  }
}

/**
 * Middleware to require developer role
 */
export function requireDeveloper(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'developer') {
    sendForbidden(res, 'Developer access required');
    return;
  }

  next();
}

/**
 * Middleware to require admin or developer role
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'developer') {
    sendForbidden(res, 'Admin access required');
    return;
  }

  next();
}

/**
 * Middleware to require employee role (any authenticated user)
 */
export function requireEmployee(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  // All authenticated users are at least employees
  next();
}

/**
 * Middleware to check if user has specific role(s)
 */
export function requireRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, `Required role: ${roles.join(' or ')}`);
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
  } catch (error) {
    // Ignore auth errors for optional auth
    logger.debug('Optional auth failed (ignored)', error);
  }

  next();
}

export default {
  requireAuth,
  requireDeveloper,
  requireAdmin,
  requireEmployee,
  requireRoles,
  optionalAuth,
};
