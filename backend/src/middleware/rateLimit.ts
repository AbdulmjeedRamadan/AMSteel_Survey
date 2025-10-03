/**
 * Rate limiting middleware
 * Prevents abuse by limiting the number of requests from a single IP
 */

import rateLimit from 'express-rate-limit';
import config from '../config/env';

/**
 * General API rate limiter
 * Applied to all routes
 */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for registration endpoint
 * Prevents spam registrations
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    success: false,
    error: 'Too many accounts created from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for public survey endpoints
 * Prevents survey response spam
 */
export const publicSurveyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: 'Too many requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for export endpoints
 * Exports can be resource-intensive
 */
export const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 exports per minute
  message: {
    success: false,
    error: 'Too many export requests, please wait before trying again',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset requests
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    success: false,
    error: 'Too many password reset requests, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  generalLimiter,
  authLimiter,
  registerLimiter,
  publicSurveyLimiter,
  exportLimiter,
  passwordResetLimiter,
};
