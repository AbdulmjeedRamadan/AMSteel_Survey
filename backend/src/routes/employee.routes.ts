/**
 * Employee routes
 * Routes for employees to access and respond to surveys
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAssignedSurveys,
  getSurveyForEmployee,
  submitResponse,
  updateResponse,
} from '../controllers/employee.controller';
import { requireAuth, requireEmployee } from '../middleware/auth';
import { runValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require employee authentication (any authenticated user)
router.use(requireAuth, requireEmployee);

/**
 * @route   GET /api/employee/surveys
 * @desc    Get assigned surveys for employee
 * @access  Private (Employee/Admin/Developer)
 */
router.get('/surveys', asyncHandler(getAssignedSurveys));

/**
 * @route   GET /api/employee/surveys/:id
 * @desc    Get survey details for employee
 * @access  Private (Employee/Admin/Developer)
 */
router.get('/surveys/:id', asyncHandler(getSurveyForEmployee));

/**
 * @route   POST /api/employee/responses
 * @desc    Submit survey response
 * @access  Private (Employee/Admin/Developer)
 */
router.post(
  '/responses',
  runValidation([
    body('survey_id').notEmpty().withMessage('Survey ID is required'),
    body('answers').isArray().notEmpty().withMessage('Answers array is required'),
  ]),
  asyncHandler(submitResponse)
);

/**
 * @route   PUT /api/employee/responses/:id
 * @desc    Update survey response (if allowed)
 * @access  Private (Employee/Admin/Developer)
 */
router.put(
  '/responses/:id',
  runValidation([
    body('answers').isArray().notEmpty().withMessage('Answers array is required'),
  ]),
  asyncHandler(updateResponse)
);

export default router;
