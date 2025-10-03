/**
 * Employee controller
 * Handles employee survey access and response submission
 */

import { Response } from 'express';
import { AuthRequest, CreateResponseDto } from '../types';
import db from '../config/database';
import { canUserRespond, updateSurveyStats, markEmployeeResponded } from '../services/survey.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get assigned surveys for employee
 * GET /api/employee/surveys
 */
export async function getAssignedSurveys(req: AuthRequest, res: Response): Promise<void> {
  try {
    const employeeId = req.user?.userId;

    // Get surveys where employee is targeted
    const result = await db.query(
      `SELECT s.*, ste.has_responded, ste.responded_at
       FROM surveys s
       JOIN survey_target_employees ste ON s.id = ste.survey_id
       WHERE ste.employee_id = $1
         AND s.status = 'active'
         AND (s.end_date IS NULL OR s.end_date > CURRENT_TIMESTAMP)
       ORDER BY s.created_at DESC`,
      [employeeId]
    );

    sendSuccess(res, result.rows);

  } catch (error) {
    logger.error('Get assigned surveys failed', error);
    sendError(res, 'Failed to retrieve surveys', 500);
  }
}

/**
 * Get survey details for employee
 * GET /api/employee/surveys/:id
 */
export async function getSurveyForEmployee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const employeeId = req.user?.userId!;

    // Check if employee can access this survey
    const canAccess = await canUserRespond(id, employeeId);

    if (!canAccess.allowed) {
      sendBadRequest(res, canAccess.reason || 'Access denied');
      return;
    }

    // Get survey with questions
    const surveyResult = await db.query(
      'SELECT * FROM surveys WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    // Get questions
    const questionsResult = await db.query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index',
      [id]
    );

    survey.questions = questionsResult.rows;

    // Check if already responded
    const responseResult = await db.query(
      'SELECT id, status FROM responses WHERE survey_id = $1 AND employee_id = $2 ORDER BY created_at DESC LIMIT 1',
      [id, employeeId]
    );

    survey.user_response = responseResult.rows[0] || null;

    sendSuccess(res, survey);

  } catch (error) {
    logger.error('Get survey for employee failed', error);
    sendError(res, 'Failed to retrieve survey', 500);
  }
}

/**
 * Submit survey response
 * POST /api/employee/responses
 */
export async function submitResponse(req: AuthRequest, res: Response): Promise<void> {
  const client = await db.getClient();

  try {
    const employeeId = req.user?.userId!;
    const { survey_id, answers }: CreateResponseDto = req.body;

    // Check if employee can respond
    const canRespond = await canUserRespond(survey_id, employeeId);

    if (!canRespond.allowed) {
      sendBadRequest(res, canRespond.reason || 'Cannot submit response');
      return;
    }

    await client.query('BEGIN');

    // Create response
    const responseResult = await client.query(
      `INSERT INTO responses (
        survey_id, employee_id, status, completed_at, duration_seconds,
        ip_address, user_agent
      ) VALUES ($1, $2, 'completed', CURRENT_TIMESTAMP, $3, $4, $5)
      RETURNING *`,
      [
        survey_id,
        employeeId,
        null, // Duration can be tracked on frontend
        req.ip,
        req.headers['user-agent']
      ]
    );

    const response = responseResult.rows[0];

    // Save answers
    for (const answer of answers) {
      await client.query(
        `INSERT INTO answers (
          response_id, question_id, answer_text, answer_number,
          answer_boolean, answer_date, answer_time, answer_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          response.id,
          answer.question_id,
          answer.answer_text,
          answer.answer_number,
          answer.answer_boolean,
          answer.answer_date,
          answer.answer_time,
          answer.answer_json ? JSON.stringify(answer.answer_json) : null
        ]
      );
    }

    // Mark employee as responded
    await markEmployeeResponded(survey_id, employeeId);

    // Update survey stats
    await updateSurveyStats(survey_id);

    await client.query('COMMIT');

    logger.info('Response submitted', { responseId: response.id, surveyId: survey_id, employeeId });

    sendCreated(res, response, 'Response submitted successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Submit response failed', error);
    sendError(res, 'Failed to submit response', 500);
  } finally {
    client.release();
  }
}

/**
 * Update response (if allowed)
 * PUT /api/employee/responses/:id
 */
export async function updateResponse(req: AuthRequest, res: Response): Promise<void> {
  const client = await db.getClient();

  try {
    const { id } = req.params;
    const employeeId = req.user?.userId;
    const { answers } = req.body;

    // Check if response exists and belongs to employee
    const responseResult = await client.query(
      `SELECT r.*, s.allow_editing
       FROM responses r
       JOIN surveys s ON r.survey_id = s.id
       WHERE r.id = $1 AND r.employee_id = $2`,
      [id, employeeId]
    );

    if (responseResult.rows.length === 0) {
      sendNotFound(res, 'Response not found');
      return;
    }

    const response = responseResult.rows[0];

    if (!response.allow_editing) {
      sendBadRequest(res, 'Response editing is not allowed for this survey');
      return;
    }

    await client.query('BEGIN');

    // Delete existing answers
    await client.query('DELETE FROM answers WHERE response_id = $1', [id]);

    // Save new answers
    for (const answer of answers) {
      await client.query(
        `INSERT INTO answers (
          response_id, question_id, answer_text, answer_number,
          answer_boolean, answer_date, answer_time, answer_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          answer.question_id,
          answer.answer_text,
          answer.answer_number,
          answer.answer_boolean,
          answer.answer_date,
          answer.answer_time,
          answer.answer_json ? JSON.stringify(answer.answer_json) : null
        ]
      );
    }

    // Update response timestamp
    await client.query(
      'UPDATE responses SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    logger.info('Response updated', { responseId: id, employeeId });

    sendSuccess(res, null, 'Response updated successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update response failed', error);
    sendError(res, 'Failed to update response', 500);
  } finally {
    client.release();
  }
}

export default {
  getAssignedSurveys,
  getSurveyForEmployee,
  submitResponse,
  updateResponse,
};
