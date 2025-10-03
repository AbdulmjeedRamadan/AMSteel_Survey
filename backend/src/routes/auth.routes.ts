/**
 * Authentication routes
 * Public routes for user authentication
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { runValidation } from '../middleware/validation';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Registration validation
const registerValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

// Login validation
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Change password validation
const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

// Reset password validation
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  runValidation(registerValidation),
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  runValidation(loginValidation),
  asyncHandler(login)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  requireAuth,
  asyncHandler(logout)
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  requireAuth,
  runValidation(changePasswordValidation),
  asyncHandler(changePassword)
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  runValidation(forgotPasswordValidation),
  asyncHandler(forgotPassword)
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  runValidation(resetPasswordValidation),
  asyncHandler(resetPassword)
);

export default router;
