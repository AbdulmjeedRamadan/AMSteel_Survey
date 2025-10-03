/**
 * Developer controller
 * Handles employee management, role promotion/demotion, and system analytics
 * Only accessible by users with 'developer' role
 */

import { Response } from 'express';
import { AuthRequest, UpdateUserDto } from '../types';
import db from '../config/database';
import { sendPromotionEmail, sendDemotionEmail } from '../services/email.service';
import { sendSuccess, sendError, sendNotFound, sendBadRequest, sendPaginated } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get all employees with filtering and pagination
 * GET /api/developer/employees
 */
export async function getEmployees(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      department,
      search,
      is_active,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (department) {
      conditions.push(`department = $${paramIndex++}`);
      params.push(department);
    }

    if (search) {
      conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(is_active === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortFields = ['created_at', 'full_name', 'email', 'department', 'role'];
    const sortField = allowedSortFields.includes(String(sort_by)) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get employees
    const result = await db.query(
      `SELECT id, role, full_name, email, phone, employee_id, department, position,
              is_active, email_verified, created_at, last_login_at,
              promoted_to_admin_at, demoted_from_admin_at
       FROM users
       ${whereClause}
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    sendPaginated(res, result.rows, total, Number(page), Number(limit));

  } catch (error) {
    logger.error('Get employees failed', error);
    sendError(res, 'Failed to retrieve employees', 500);
  }
}

/**
 * Get employee by ID
 * GET /api/developer/employees/:id
 */
export async function getEmployeeById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, role, full_name, email, phone, employee_id, department, position,
              is_active, email_verified, created_at, updated_at, last_login_at,
              promoted_to_admin_at, promoted_by_id, promotion_note,
              demoted_from_admin_at, demoted_by_id, demotion_note
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'Employee not found');
      return;
    }

    const employee = result.rows[0];

    // Get promoter/demoter info if available
    if (employee.promoted_by_id) {
      const promoterResult = await db.query(
        'SELECT full_name, email FROM users WHERE id = $1',
        [employee.promoted_by_id]
      );
      if (promoterResult.rows.length > 0) {
        employee.promoted_by = promoterResult.rows[0];
      }
    }

    if (employee.demoted_by_id) {
      const demoterResult = await db.query(
        'SELECT full_name, email FROM users WHERE id = $1',
        [employee.demoted_by_id]
      );
      if (demoterResult.rows.length > 0) {
        employee.demoted_by = demoterResult.rows[0];
      }
    }

    sendSuccess(res, employee);

  } catch (error) {
    logger.error('Get employee by ID failed', error);
    sendError(res, 'Failed to retrieve employee', 500);
  }
}

/**
 * Promote employee to admin
 * PATCH /api/developer/employees/:id/promote
 */
export async function promoteEmployee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const developerId = req.user?.userId;

    // Check if employee exists and is not already admin
    const result = await db.query(
      'SELECT id, role, full_name, email FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'Employee not found');
      return;
    }

    const employee = result.rows[0];

    if (employee.role === 'admin') {
      sendBadRequest(res, 'User is already an admin');
      return;
    }

    if (employee.role === 'developer') {
      sendBadRequest(res, 'Cannot change developer role');
      return;
    }

    // Promote to admin
    await db.query(
      `UPDATE users
       SET role = 'admin',
           promoted_to_admin_at = CURRENT_TIMESTAMP,
           promoted_by_id = $1,
           promotion_note = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [developerId, note, id]
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'EMPLOYEE_PROMOTED', 'user', $2, $3)`,
      [developerId, id, JSON.stringify({ note, promoted_to: 'admin' })]
    );

    // Send promotion email
    sendPromotionEmail(employee.email, employee.full_name).catch(err =>
      logger.error('Failed to send promotion email', err)
    );

    logger.info('Employee promoted to admin', {
      employeeId: id,
      promotedBy: developerId,
    });

    sendSuccess(res, null, 'Employee promoted to admin successfully');

  } catch (error) {
    logger.error('Promote employee failed', error);
    sendError(res, 'Failed to promote employee', 500);
  }
}

/**
 * Demote admin to employee
 * PATCH /api/developer/employees/:id/demote
 */
export async function demoteEmployee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const developerId = req.user?.userId;

    // Check if user exists and is admin
    const result = await db.query(
      'SELECT id, role, full_name, email FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'User not found');
      return;
    }

    const user = result.rows[0];

    if (user.role !== 'admin') {
      sendBadRequest(res, 'User is not an admin');
      return;
    }

    // Demote to employee
    await db.query(
      `UPDATE users
       SET role = 'employee',
           demoted_from_admin_at = CURRENT_TIMESTAMP,
           demoted_by_id = $1,
           demotion_note = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [developerId, note, id]
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'ADMIN_DEMOTED', 'user', $2, $3)`,
      [developerId, id, JSON.stringify({ note, demoted_to: 'employee' })]
    );

    // Send demotion email
    sendDemotionEmail(user.email, user.full_name).catch(err =>
      logger.error('Failed to send demotion email', err)
    );

    logger.info('Admin demoted to employee', {
      userId: id,
      demotedBy: developerId,
    });

    sendSuccess(res, null, 'Admin demoted to employee successfully');

  } catch (error) {
    logger.error('Demote employee failed', error);
    sendError(res, 'Failed to demote admin', 500);
  }
}

/**
 * Update employee information
 * PUT /api/developer/employees/:id
 */
export async function updateEmployee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { full_name, phone, employee_id, department, position }: UpdateUserDto = req.body;

    // Check if employee exists
    const checkResult = await db.query('SELECT id FROM users WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      sendNotFound(res, 'Employee not found');
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(phone);
    }

    if (employee_id !== undefined) {
      updates.push(`employee_id = $${paramIndex++}`);
      params.push(employee_id);
    }

    if (department !== undefined) {
      updates.push(`department = $${paramIndex++}`);
      params.push(department);
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      params.push(position);
    }

    if (updates.length === 0) {
      sendBadRequest(res, 'No fields to update');
      return;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'EMPLOYEE_UPDATED', 'user', $2, $3)`,
      [req.user?.userId, id, JSON.stringify(req.body)]
    );

    logger.info('Employee updated', { employeeId: id });

    sendSuccess(res, result.rows[0], 'Employee updated successfully');

  } catch (error) {
    logger.error('Update employee failed', error);
    sendError(res, 'Failed to update employee', 500);
  }
}

/**
 * Delete (deactivate) employee
 * DELETE /api/developer/employees/:id
 */
export async function deleteEmployee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const developerId = req.user?.userId;

    // Check if user exists
    const result = await db.query('SELECT id, role FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      sendNotFound(res, 'Employee not found');
      return;
    }

    // Don't allow deleting developers
    if (result.rows[0].role === 'developer') {
      sendBadRequest(res, 'Cannot delete developer account');
      return;
    }

    // Soft delete: deactivate instead of hard delete
    await db.query(
      `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'EMPLOYEE_DEACTIVATED', 'user', $2)`,
      [developerId, id]
    );

    logger.info('Employee deactivated', { employeeId: id, deactivatedBy: developerId });

    sendSuccess(res, null, 'Employee deactivated successfully');

  } catch (error) {
    logger.error('Delete employee failed', error);
    sendError(res, 'Failed to delete employee', 500);
  }
}

/**
 * Get employee history (promotion/demotion)
 * GET /api/developer/employees/:id/history
 */
export async function getEmployeeHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Get activity logs for this employee
    const result = await db.query(
      `SELECT al.*, u.full_name as performed_by_name, u.email as performed_by_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_id = $1 AND al.entity_type = 'user'
       ORDER BY al.created_at DESC
       LIMIT 100`,
      [id]
    );

    sendSuccess(res, result.rows);

  } catch (error) {
    logger.error('Get employee history failed', error);
    sendError(res, 'Failed to retrieve employee history', 500);
  }
}

/**
 * Get system-wide statistics
 * GET /api/developer/statistics
 */
export async function getStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Get user counts by role
    const userStats = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'employee') as total_employees,
        COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
        COUNT(*) FILTER (WHERE role = 'developer') as total_developers,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_month
      FROM users
    `);

    // Get survey counts
    const surveyStats = await db.query(`
      SELECT
        COUNT(*) as total_surveys,
        COUNT(*) FILTER (WHERE status = 'active') as active_surveys,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_surveys,
        COUNT(*) FILTER (WHERE survey_type = 'internal') as internal_surveys,
        COUNT(*) FILTER (WHERE survey_type = 'external') as external_surveys
      FROM surveys
    `);

    // Get response counts
    const responseStats = await db.query(`
      SELECT
        COUNT(*) as total_responses,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_responses,
        COUNT(*) FILTER (WHERE completed_at > NOW() - INTERVAL '7 days') as responses_week,
        COUNT(*) FILTER (WHERE completed_at > NOW() - INTERVAL '30 days') as responses_month
      FROM responses
    `);

    sendSuccess(res, {
      users: userStats.rows[0],
      surveys: surveyStats.rows[0],
      responses: responseStats.rows[0],
    });

  } catch (error) {
    logger.error('Get statistics failed', error);
    sendError(res, 'Failed to retrieve statistics', 500);
  }
}

/**
 * Get activity logs
 * GET /api/developer/activity-logs
 */
export async function getActivityLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      user_id,
      entity_type,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (action) {
      conditions.push(`action = $${paramIndex++}`);
      params.push(action);
    }

    if (user_id) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      params.push(user_id);
    }

    if (entity_type) {
      conditions.push(`entity_type = $${paramIndex++}`);
      params.push(entity_type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM activity_logs al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get logs
    const result = await db.query(
      `SELECT al.*, u.full_name as user_name, u.email as user_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    sendPaginated(res, result.rows, total, Number(page), Number(limit));

  } catch (error) {
    logger.error('Get activity logs failed', error);
    sendError(res, 'Failed to retrieve activity logs', 500);
  }
}

export default {
  getEmployees,
  getEmployeeById,
  promoteEmployee,
  demoteEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeHistory,
  getStatistics,
  getActivityLogs,
};
