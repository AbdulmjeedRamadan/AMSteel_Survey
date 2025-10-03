/**
 * Authentication controller
 * Handles user registration, login, logout, and password management
 */

import { Response } from 'express';
import { AuthRequest, CreateUserDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, UserSafeInfo } from '../types';
import db from '../config/database';
import { hashPassword, comparePassword, generateTokens, validatePasswordStrength, generatePasswordResetToken, verifyPasswordResetToken } from '../services/auth.service';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSuccess, sendError, sendCreated, sendUnauthorized, sendNotFound, sendBadRequest } from '../utils/response';
import logger from '../utils/logger';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { full_name, email, password, phone, employee_id, department, position }: CreateUserDto = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      sendBadRequest(res, passwordValidation.errors.join(', '));
      return;
    }

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user (default role is employee)
    const result = await db.query(
      `INSERT INTO users (
        full_name, email, password_hash, phone, employee_id,
        department, position, role, is_active, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'employee', true, false)
      RETURNING id, full_name, email, phone, employee_id, department, position, role, is_active, created_at`,
      [full_name, email.toLowerCase(), password_hash, phone, employee_id, department, position]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
       VALUES ($1, 'USER_REGISTERED', 'user', $2, $3, $4)`,
      [user.id, user.id, req.ip, req.headers['user-agent']]
    );

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(user.email, user.full_name).catch(err =>
      logger.error('Failed to send welcome email', err)
    );

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    sendCreated(res, {
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        department: user.department,
        position: user.position,
        is_active: user.is_active,
        created_at: user.created_at,
      } as UserSafeInfo,
      token: accessToken,
      refreshToken,
    }, 'Registration successful');

  } catch (error) {
    logger.error('Registration failed', error);
    sendError(res, 'Registration failed', 500);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password }: LoginDto = req.body;

    // Find user by email
    const result = await db.query(
      `SELECT id, full_name, email, password_hash, phone, employee_id,
              department, position, role, is_active, email_verified, created_at, last_login_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      sendUnauthorized(res, 'Account is deactivated. Please contact administrator.');
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      sendUnauthorized(res, 'Invalid email or password');
      return;
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES ($1, 'USER_LOGIN', $2, $3)`,
      [user.id, req.ip, req.headers['user-agent']]
    );

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    sendSuccess(res, {
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        employee_id: user.employee_id,
        department: user.department,
        position: user.position,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        last_login_at: new Date(),
      } as UserSafeInfo,
      token: accessToken,
      refreshToken,
    }, 'Login successful');

  } catch (error) {
    logger.error('Login failed', error);
    sendError(res, 'Login failed', 500);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (userId) {
      // Log activity
      await db.query(
        `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
         VALUES ($1, 'USER_LOGOUT', $2, $3)`,
        [userId, req.ip, req.headers['user-agent']]
      );

      logger.info('User logged out', { userId });
    }

    // In a stateless JWT system, logout is handled on the client side
    // The client should delete the tokens
    // For enhanced security, implement token blacklisting if needed

    sendSuccess(res, null, 'Logout successful');

  } catch (error) {
    logger.error('Logout failed', error);
    sendError(res, 'Logout failed', 500);
  }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { current_password, new_password }: ChangePasswordDto = req.body;

    if (!userId) {
      sendUnauthorized(res);
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.valid) {
      sendBadRequest(res, passwordValidation.errors.join(', '));
      return;
    }

    // Get current password hash
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'User not found');
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      current_password,
      result.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      sendBadRequest(res, 'Current password is incorrect');
      return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES ($1, 'PASSWORD_CHANGED', $2, $3)`,
      [userId, req.ip, req.headers['user-agent']]
    );

    logger.info('Password changed successfully', { userId });

    sendSuccess(res, null, 'Password changed successfully');

  } catch (error) {
    logger.error('Change password failed', error);
    sendError(res, 'Failed to change password', 500);
  }
}

/**
 * Forgot password - send reset email
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email }: ForgotPasswordDto = req.body;

    // Find user
    const result = await db.query(
      'SELECT id, email, full_name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (result.rows.length === 0) {
      sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
      return;
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = generatePasswordResetToken(user.id, user.email);

    // Send reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      logger.error('Failed to send password reset email', { email: user.email });
    }

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES ($1, 'PASSWORD_RESET_REQUESTED', $2, $3)`,
      [user.id, req.ip, req.headers['user-agent']]
    );

    logger.info('Password reset requested', { userId: user.id, email: user.email });

    sendSuccess(res, null, 'If the email exists, a password reset link has been sent');

  } catch (error) {
    logger.error('Forgot password failed', error);
    sendError(res, 'Failed to process request', 500);
  }
}

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { token, new_password }: ResetPasswordDto = req.body;

    // Verify reset token
    let payload;
    try {
      payload = verifyPasswordResetToken(token);
    } catch (error) {
      sendBadRequest(res, 'Invalid or expired reset token');
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.valid) {
      sendBadRequest(res, passwordValidation.errors.join(', '));
      return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, payload.userId]
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
       VALUES ($1, 'PASSWORD_RESET_COMPLETED', $2, $3)`,
      [payload.userId, req.ip, req.headers['user-agent']]
    );

    logger.info('Password reset completed', { userId: payload.userId });

    sendSuccess(res, null, 'Password has been reset successfully. You can now login with your new password.');

  } catch (error) {
    logger.error('Reset password failed', error);
    sendError(res, 'Failed to reset password', 500);
  }
}

export default {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
