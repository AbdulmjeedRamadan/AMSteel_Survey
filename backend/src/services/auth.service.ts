/**
 * Authentication service
 * Handles password hashing, JWT generation, and token validation
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { TokenPayload, UserRole } from '../types';
import logger from '../utils/logger';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Access token verification failed', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Refresh token verification failed', error);
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(
  userId: string,
  email: string,
  role: UserRole
): { accessToken: string; refreshToken: string } {
  const payload: TokenPayload = { userId, email, role };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Validate password strength
 * Must be at least 8 characters with uppercase, lowercase, number, and special char
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate password reset token
 * This is a simple implementation - in production, consider using a dedicated token table
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    type: 'password_reset',
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '1h', // Reset token expires in 1 hour
  });
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): {
  userId: string;
  email: string;
} {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    logger.error('Password reset token verification failed', error);
    throw new Error('Invalid or expired reset token');
  }
}

export default {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  validatePasswordStrength,
  generatePasswordResetToken,
  verifyPasswordResetToken,
};
