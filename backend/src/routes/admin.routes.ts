/**
 * Admin routes
 * Routes for survey management, analytics, and exports
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getSurveys,
  createSurvey,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  duplicateSurveyHandler,
  publishSurvey,
  pauseSurvey,
  closeSurvey,
  getSurveyShareInfo,
  getSurveyAnalytics,
  getClientProgress,
  getDashboardStats,
  getClients,
} from '../controllers/admin.controller';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from '../controllers/question.controller';
import {
  getSurveyResponses,
  getResponseById,
  deleteResponse,
  bulkDeleteResponses,
  exportCSV,
  exportExcel,
  exportPDF,
} from '../controllers/response.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { runValidation } from '../middleware/validation';
import { exportLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require admin or developer authentication
router.use(requireAuth, requireAdmin);

// ============================================================================
// SURVEY ROUTES
// ============================================================================

const createSurveyValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('survey_type').isIn(['internal', 'external']).withMessage('Invalid survey type'),
  body('duration_type').isIn(['limited', 'unlimited']).withMessage('Invalid duration type'),
  body('client_name').if(body('survey_type').equals('external')).notEmpty().withMessage('Client name required for external surveys'),
];

/**
 * @route   GET /api/admin/surveys
 * @desc    Get all surveys for admin
 * @access  Private (Admin/Developer)
 */
router.get('/surveys', asyncHandler(getSurveys));

/**
 * @route   POST /api/admin/surveys
 * @desc    Create new survey
 * @access  Private (Admin/Developer)
 */
router.post(
  '/surveys',
  runValidation(createSurveyValidation),
  asyncHandler(createSurvey)
);

/**
 * @route   GET /api/admin/surveys/:id
 * @desc    Get survey by ID
 * @access  Private (Admin/Developer)
 */
router.get('/surveys/:id', asyncHandler(getSurveyById));

/**
 * @route   PUT /api/admin/surveys/:id
 * @desc    Update survey
 * @access  Private (Admin/Developer)
 */
router.put('/surveys/:id', asyncHandler(updateSurvey));

/**
 * @route   DELETE /api/admin/surveys/:id
 * @desc    Delete survey
 * @access  Private (Admin/Developer)
 */
router.delete('/surveys/:id', asyncHandler(deleteSurvey));

/**
 * @route   POST /api/admin/surveys/:id/duplicate
 * @desc    Duplicate survey
 * @access  Private (Admin/Developer)
 */
router.post('/surveys/:id/duplicate', asyncHandler(duplicateSurveyHandler));

/**
 * @route   PATCH /api/admin/surveys/:id/publish
 * @desc    Publish survey
 * @access  Private (Admin/Developer)
 */
router.patch('/surveys/:id/publish', asyncHandler(publishSurvey));

/**
 * @route   PATCH /api/admin/surveys/:id/pause
 * @desc    Pause survey
 * @access  Private (Admin/Developer)
 */
router.patch('/surveys/:id/pause', asyncHandler(pauseSurvey));

/**
 * @route   PATCH /api/admin/surveys/:id/close
 * @desc    Close survey
 * @access  Private (Admin/Developer)
 */
router.patch('/surveys/:id/close', asyncHandler(closeSurvey));

/**
 * @route   GET /api/admin/surveys/:id/share
 * @desc    Get survey share information
 * @access  Private (Admin/Developer)
 */
router.get('/surveys/:id/share', asyncHandler(getSurveyShareInfo));

/**
 * @route   GET /api/admin/surveys/:id/analytics
 * @desc    Get survey analytics
 * @access  Private (Admin/Developer)
 */
router.get('/surveys/:id/analytics', asyncHandler(getSurveyAnalytics));

// ============================================================================
// QUESTION ROUTES
// ============================================================================

const createQuestionValidation = [
  body('question_type').trim().notEmpty().withMessage('Question type is required'),
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
  body('order_index').isInt({ min: 0 }).withMessage('Order index must be a positive integer'),
];

/**
 * @route   POST /api/admin/surveys/:id/questions
 * @desc    Create question
 * @access  Private (Admin/Developer)
 */
router.post(
  '/surveys/:id/questions',
  runValidation(createQuestionValidation),
  asyncHandler(createQuestion)
);

/**
 * @route   PUT /api/admin/questions/:id
 * @desc    Update question
 * @access  Private (Admin/Developer)
 */
router.put('/questions/:id', asyncHandler(updateQuestion));

/**
 * @route   DELETE /api/admin/questions/:id
 * @desc    Delete question
 * @access  Private (Admin/Developer)
 */
router.delete('/questions/:id', asyncHandler(deleteQuestion));

/**
 * @route   PATCH /api/admin/surveys/:id/questions/reorder
 * @desc    Reorder questions
 * @access  Private (Admin/Developer)
 */
router.patch(
  '/surveys/:id/questions/reorder',
  runValidation([
    body('question_orders').isArray().withMessage('question_orders must be an array'),
  ]),
  asyncHandler(reorderQuestions)
);

// ============================================================================
// RESPONSE ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/surveys/:id/responses
 * @desc    Get responses for a survey
 * @access  Private (Admin/Developer)
 */
router.get('/surveys/:id/responses', asyncHandler(getSurveyResponses));

/**
 * @route   GET /api/admin/responses/:id
 * @desc    Get response by ID
 * @access  Private (Admin/Developer)
 */
router.get('/responses/:id', asyncHandler(getResponseById));

/**
 * @route   DELETE /api/admin/responses/:id
 * @desc    Delete response
 * @access  Private (Admin/Developer)
 */
router.delete('/responses/:id', asyncHandler(deleteResponse));

/**
 * @route   DELETE /api/admin/responses/bulk
 * @desc    Bulk delete responses
 * @access  Private (Admin/Developer)
 */
router.delete(
  '/responses/bulk',
  runValidation([
    body('response_ids').isArray().withMessage('response_ids must be an array'),
  ]),
  asyncHandler(bulkDeleteResponses)
);

// ============================================================================
// EXPORT ROUTES
// ============================================================================

const exportValidation = [
  body('survey_ids').isArray().notEmpty().withMessage('survey_ids array is required'),
];

/**
 * @route   POST /api/admin/export/csv
 * @desc    Export to CSV
 * @access  Private (Admin/Developer)
 */
router.post(
  '/export/csv',
  exportLimiter,
  runValidation(exportValidation),
  asyncHandler(exportCSV)
);

/**
 * @route   POST /api/admin/export/excel
 * @desc    Export to Excel
 * @access  Private (Admin/Developer)
 */
router.post(
  '/export/excel',
  exportLimiter,
  runValidation(exportValidation),
  asyncHandler(exportExcel)
);

/**
 * @route   POST /api/admin/export/pdf
 * @desc    Export to PDF
 * @access  Private (Admin/Developer)
 */
router.post(
  '/export/pdf',
  exportLimiter,
  runValidation(exportValidation),
  asyncHandler(exportPDF)
);

// ============================================================================
// CLIENT & DASHBOARD ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/clients/:clientName/progress
 * @desc    Get client progress
 * @access  Private (Admin/Developer)
 */
router.get('/clients/:clientName/progress', asyncHandler(getClientProgress));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin/Developer)
 */
router.get('/dashboard/stats', asyncHandler(getDashboardStats));

/**
 * @route   GET /api/admin/clients
 * @desc    Get all clients
 * @access  Private (Admin/Developer)
 */
router.get('/clients', asyncHandler(getClients));

export default router;
