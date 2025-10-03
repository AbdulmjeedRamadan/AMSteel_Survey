/**
 * Developer routes
 * Routes for system administration and employee management
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEmployees,
  getEmployeeById,
  promoteEmployee,
  demoteEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeHistory,
  getStatistics,
  getActivityLogs,
} from '../controllers/developer.controller';
import { requireAuth, requireDeveloper } from '../middleware/auth';
import { runValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require developer authentication
router.use(requireAuth, requireDeveloper);

/**
 * @route   GET /api/developer/employees
 * @desc    Get all employees with filtering
 * @access  Private (Developer only)
 */
router.get('/employees', asyncHandler(getEmployees));

/**
 * @route   GET /api/developer/employees/:id
 * @desc    Get employee by ID
 * @access  Private (Developer only)
 */
router.get('/employees/:id', asyncHandler(getEmployeeById));

/**
 * @route   PATCH /api/developer/employees/:id/promote
 * @desc    Promote employee to admin
 * @access  Private (Developer only)
 */
router.patch(
  '/employees/:id/promote',
  runValidation([
    body('note').optional().isString(),
  ]),
  asyncHandler(promoteEmployee)
);

/**
 * @route   PATCH /api/developer/employees/:id/demote
 * @desc    Demote admin to employee
 * @access  Private (Developer only)
 */
router.patch(
  '/employees/:id/demote',
  runValidation([
    body('note').optional().isString(),
  ]),
  asyncHandler(demoteEmployee)
);

/**
 * @route   PUT /api/developer/employees/:id
 * @desc    Update employee information
 * @access  Private (Developer only)
 */
router.put(
  '/employees/:id',
  runValidation([
    body('full_name').optional().trim().notEmpty(),
    body('phone').optional().trim(),
    body('employee_id').optional().trim(),
    body('department').optional().trim().notEmpty(),
    body('position').optional().trim(),
  ]),
  asyncHandler(updateEmployee)
);

/**
 * @route   DELETE /api/developer/employees/:id
 * @desc    Delete (deactivate) employee
 * @access  Private (Developer only)
 */
router.delete('/employees/:id', asyncHandler(deleteEmployee));

/**
 * @route   GET /api/developer/employees/:id/history
 * @desc    Get employee history
 * @access  Private (Developer only)
 */
router.get('/employees/:id/history', asyncHandler(getEmployeeHistory));

/**
 * @route   GET /api/developer/statistics
 * @desc    Get system-wide statistics
 * @access  Private (Developer only)
 */
router.get('/statistics', asyncHandler(getStatistics));

/**
 * @route   GET /api/developer/activity-logs
 * @desc    Get activity logs
 * @access  Private (Developer only)
 */
router.get('/activity-logs', asyncHandler(getActivityLogs));

export default router;
