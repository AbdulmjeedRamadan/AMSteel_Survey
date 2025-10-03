/**
 * Public routes
 * Public routes for survey access without authentication
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPublicSurvey,
  validateSurveyPassword,
  submitPublicResponse,
} from '../controllers/public.controller';
import { runValidation } from '../middleware/validation';
import { publicSurveyLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/public/surveys/:slug
 * @desc    Get public survey by slug
 * @access  Public
 */
router.get(
  '/surveys/:slug',
  publicSurveyLimiter,
  asyncHandler(getPublicSurvey)
);

/**
 * @route   POST /api/public/surveys/:slug/validate-password
 * @desc    Validate survey password
 * @access  Public
 */
router.post(
  '/surveys/:slug/validate-password',
  publicSurveyLimiter,
  runValidation([
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(validateSurveyPassword)
);

/**
 * @route   POST /api/public/responses
 * @desc    Submit public response
 * @access  Public
 */
router.post(
  '/responses',
  publicSurveyLimiter,
  runValidation([
    body('survey_id').notEmpty().withMessage('Survey ID is required'),
    body('answers').isArray().notEmpty().withMessage('Answers array is required'),
  ]),
  asyncHandler(submitPublicResponse)
);

export default router;
