/**
 * Admin controller
 * Handles survey management, analytics, and client progress tracking
 * Accessible by users with 'admin' or 'developer' role
 */

import { Response } from 'express';
import { AuthRequest, CreateSurveyDto, UpdateSurveyDto } from '../types';
import db from '../config/database';
import { generateUniqueSlug } from '../utils/slugGenerator';
import { hashPassword } from '../services/auth.service';
import { duplicateSurvey } from '../services/survey.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest, sendPaginated } from '../utils/response';
import logger from '../utils/logger';
import config from '../config/env';

/**
 * Get all surveys for admin
 * GET /api/admin/surveys
 */
export async function getSurveys(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const {
      page = 1,
      limit = 20,
      survey_type,
      status,
      client_name,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Admins can only see their own surveys, developers can see all
    if (userRole !== 'developer') {
      conditions.push(`admin_id = $${paramIndex++}`);
      params.push(userId);
    }

    // Filters
    if (survey_type) {
      conditions.push(`survey_type = $${paramIndex++}`);
      params.push(survey_type);
    }

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (client_name) {
      conditions.push(`client_name ILIKE $${paramIndex++}`);
      params.push(`%${client_name}%`);
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Exclude deleted surveys
    conditions.push(`status != 'deleted'`);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM surveys ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get surveys
    const allowedSortFields = ['created_at', 'title', 'updated_at', 'total_responses'];
    const sortField = allowedSortFields.includes(String(sort_by)) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

    const result = await db.query(
      `SELECT s.*, u.full_name as admin_name
       FROM surveys s
       JOIN users u ON s.admin_id = u.id
       ${whereClause}
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    sendPaginated(res, result.rows, total, Number(page), Number(limit));

  } catch (error) {
    logger.error('Get surveys failed', error);
    sendError(res, 'Failed to retrieve surveys', 500);
  }
}

/**
 * Create new survey
 * POST /api/admin/surveys
 */
export async function createSurvey(req: AuthRequest, res: Response): Promise<void> {
  const client = await db.getClient();

  try {
    const adminId = req.user?.userId;
    const surveyData: CreateSurveyDto = req.body;

    // Generate unique slug
    const slug = await generateUniqueSlug(surveyData.title);

    // Hash password if provided
    let passwordHash = null;
    if (surveyData.has_password && surveyData.password) {
      passwordHash = await hashPassword(surveyData.password);
    }

    await client.query('BEGIN');

    // Create survey
    const result = await client.query(
      `INSERT INTO surveys (
        admin_id, title, description, welcome_message, thank_you_message,
        survey_type, client_name, client_company, target_department,
        duration_type, start_date, end_date, duration_hours,
        unique_slug, is_anonymous, allow_multiple, requires_auth,
        has_password, password_hash, max_responses, track_ip, track_location,
        allow_editing, show_progress_bar, redirect_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *`,
      [
        adminId, surveyData.title, surveyData.description,
        surveyData.welcome_message, surveyData.thank_you_message,
        surveyData.survey_type, surveyData.client_name, surveyData.client_company,
        surveyData.target_department, surveyData.duration_type,
        surveyData.start_date, surveyData.end_date, surveyData.duration_hours,
        slug, surveyData.is_anonymous || false, surveyData.allow_multiple || false,
        surveyData.requires_auth || false, surveyData.has_password || false,
        passwordHash, surveyData.max_responses, surveyData.track_ip || false,
        surveyData.track_location || false, surveyData.allow_editing || false,
        surveyData.show_progress_bar !== false, surveyData.redirect_url
      ]
    );

    const survey = result.rows[0];

    // Add target employees if internal survey
    if (surveyData.survey_type === 'internal' && surveyData.target_employee_ids && surveyData.target_employee_ids.length > 0) {
      for (const employeeId of surveyData.target_employee_ids) {
        await client.query(
          'INSERT INTO survey_target_employees (survey_id, employee_id) VALUES ($1, $2)',
          [survey.id, employeeId]
        );
      }
    }

    await client.query('COMMIT');

    // Log activity
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id)
       VALUES ($1, 'SURVEY_CREATED', 'survey', $2)`,
      [adminId, survey.id]
    );

    logger.info('Survey created', { surveyId: survey.id, adminId });

    sendCreated(res, survey, 'Survey created successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create survey failed', error);
    sendError(res, 'Failed to create survey', 500);
  } finally {
    client.release();
  }
}

/**
 * Get survey by ID
 * GET /api/admin/surveys/:id
 */
export async function getSurveyById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const result = await db.query(
      'SELECT * FROM surveys WHERE id = $1 AND status != $2',
      [id, 'deleted']
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = result.rows[0];

    // Check ownership (admins can only see their own surveys)
    if (userRole !== 'developer' && survey.admin_id !== userId) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    // Get questions
    const questionsResult = await db.query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index',
      [id]
    );

    survey.questions = questionsResult.rows;

    // Get target employees if internal survey
    if (survey.survey_type === 'internal') {
      const targetsResult = await db.query(
        `SELECT ste.*, u.full_name, u.email, u.department
         FROM survey_target_employees ste
         JOIN users u ON ste.employee_id = u.id
         WHERE ste.survey_id = $1`,
        [id]
      );
      survey.target_employees = targetsResult.rows;
    }

    sendSuccess(res, survey);

  } catch (error) {
    logger.error('Get survey by ID failed', error);
    sendError(res, 'Failed to retrieve survey', 500);
  }
}

/**
 * Update survey
 * PUT /api/admin/surveys/:id
 */
export async function updateSurvey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const updates: UpdateSurveyDto = req.body;

    // Check if survey exists and user has permission
    const checkResult = await db.query(
      'SELECT admin_id, status FROM surveys WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = checkResult.rows[0];

    if (userRole !== 'developer' && survey.admin_id !== userId) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    // Cannot edit published surveys (except status changes)
    if (survey.status === 'active') {
      sendBadRequest(res, 'Cannot edit active survey. Pause it first.');
      return;
    }

    // Build update query
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'title', 'description', 'welcome_message', 'thank_you_message',
      'client_company', 'target_department', 'duration_type',
      'start_date', 'end_date', 'duration_hours', 'is_anonymous',
      'allow_multiple', 'max_responses', 'allow_editing',
      'show_progress_bar', 'redirect_url'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (fields.length === 0) {
      sendBadRequest(res, 'No valid fields to update');
      return;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE surveys SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    logger.info('Survey updated', { surveyId: id, userId });

    sendSuccess(res, result.rows[0], 'Survey updated successfully');

  } catch (error) {
    logger.error('Update survey failed', error);
    sendError(res, 'Failed to update survey', 500);
  }
}

/**
 * Delete survey (soft delete)
 * DELETE /api/admin/surveys/:id
 */
export async function deleteSurvey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const result = await db.query(
      'SELECT admin_id FROM surveys WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    // Check ownership
    if (userRole !== 'developer' && result.rows[0].admin_id !== userId) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    await db.query(
      `UPDATE surveys SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    logger.info('Survey deleted', { surveyId: id, userId });

    sendSuccess(res, null, 'Survey deleted successfully');

  } catch (error) {
    logger.error('Delete survey failed', error);
    sendError(res, 'Failed to delete survey', 500);
  }
}

/**
 * Duplicate survey
 * POST /api/admin/surveys/:id/duplicate
 */
export async function duplicateSurveyHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId!;

    const newSurveyId = await duplicateSurvey(id, userId);

    sendCreated(res, { id: newSurveyId }, 'Survey duplicated successfully');

  } catch (error) {
    logger.error('Duplicate survey failed', error);
    sendError(res, error instanceof Error ? error.message : 'Failed to duplicate survey', 500);
  }
}

/**
 * Publish survey
 * PATCH /api/admin/surveys/:id/publish
 */
export async function publishSurvey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE surveys
       SET status = 'active', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    logger.info('Survey published', { surveyId: id });

    sendSuccess(res, null, 'Survey published successfully');

  } catch (error) {
    logger.error('Publish survey failed', error);
    sendError(res, 'Failed to publish survey', 500);
  }
}

/**
 * Pause survey
 * PATCH /api/admin/surveys/:id/pause
 */
export async function pauseSurvey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE surveys SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    logger.info('Survey paused', { surveyId: id });

    sendSuccess(res, null, 'Survey paused successfully');

  } catch (error) {
    logger.error('Pause survey failed', error);
    sendError(res, 'Failed to pause survey', 500);
  }
}

/**
 * Close survey
 * PATCH /api/admin/surveys/:id/close
 */
export async function closeSurvey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE surveys
       SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    logger.info('Survey closed', { surveyId: id });

    sendSuccess(res, null, 'Survey closed successfully');

  } catch (error) {
    logger.error('Close survey failed', error);
    sendError(res, 'Failed to close survey', 500);
  }
}

/**
 * Get survey share information
 * GET /api/admin/surveys/:id/share
 */
export async function getSurveyShareInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT unique_slug, has_password FROM surveys WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = result.rows[0];
    const baseUrl = config.FRONTEND_URL;

    sendSuccess(res, {
      public_url: `${baseUrl}/survey/${survey.unique_slug}`,
      qr_code_url: `${baseUrl}/api/public/qr/${survey.unique_slug}`,
      embed_code: `<iframe src="${baseUrl}/survey/${survey.unique_slug}" width="100%" height="600" frameborder="0"></iframe>`,
      has_password: survey.has_password,
    });

  } catch (error) {
    logger.error('Get share info failed', error);
    sendError(res, 'Failed to get share information', 500);
  }
}

/**
 * Get survey analytics
 * GET /api/admin/surveys/:id/analytics
 */
export async function getSurveyAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Get survey with stats
    const surveyResult = await db.query(
      'SELECT * FROM surveys WHERE id = $1',
      [id]
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    // Get response timeline
    const timelineResult = await db.query(
      `SELECT DATE(completed_at) as date, COUNT(*) as count
       FROM responses
       WHERE survey_id = $1 AND status = 'completed'
       GROUP BY DATE(completed_at)
       ORDER BY date DESC
       LIMIT 30`,
      [id]
    );

    // Get average duration
    const durationResult = await db.query(
      `SELECT AVG(duration_seconds) as avg_duration
       FROM responses
       WHERE survey_id = $1 AND status = 'completed' AND duration_seconds IS NOT NULL`,
      [id]
    );

    // Get questions with answer statistics
    const questionsResult = await db.query(
      `SELECT q.id, q.question_text, q.question_type, q.is_required, q.order_index,
              q.options
       FROM questions q
       WHERE q.survey_id = $1
       ORDER BY q.order_index`,
      [id]
    );

    // Get detailed statistics for each question
    const questionAnalytics = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const answerStats = await db.query(
          `SELECT
            COUNT(*) as total_answers,
            COUNT(DISTINCT response_id) as unique_respondents
           FROM answers
           WHERE question_id = $1`,
          [question.id]
        );

        // Get answer distribution based on question type
        let distribution = null;
        let averageRating = null;
        let textResponses = null;

        if (['rating', 'nps', 'slider', 'number'].includes(question.question_type)) {
          // Numeric question types
          const numericStats = await db.query(
            `SELECT
              AVG(answer_number) as average,
              MIN(answer_number) as min,
              MAX(answer_number) as max,
              answer_number as value,
              COUNT(*) as count
             FROM answers
             WHERE question_id = $1 AND answer_number IS NOT NULL
             GROUP BY answer_number
             ORDER BY answer_number`,
            [question.id]
          );

          if (numericStats.rows.length > 0) {
            averageRating = numericStats.rows[0].average;
            distribution = numericStats.rows.map(row => ({
              value: row.value,
              count: parseInt(row.count)
            }));
          }
        } else if (['single_choice', 'multiple_choice', 'dropdown', 'yes_no'].includes(question.question_type)) {
          // Choice-based questions
          const choiceStats = await db.query(
            `SELECT answer_text, COUNT(*) as count
             FROM answers
             WHERE question_id = $1 AND answer_text IS NOT NULL
             GROUP BY answer_text
             ORDER BY count DESC`,
            [question.id]
          );

          distribution = choiceStats.rows.map(row => ({
            value: row.answer_text,
            count: parseInt(row.count)
          }));
        } else if (['text', 'textarea', 'email', 'phone', 'url'].includes(question.question_type)) {
          // Text-based questions - get sample responses
          const textStats = await db.query(
            `SELECT answer_text
             FROM answers
             WHERE question_id = $1 AND answer_text IS NOT NULL
             ORDER BY created_at DESC
             LIMIT 10`,
            [question.id]
          );

          textResponses = textStats.rows.map(row => row.answer_text);
        }

        return {
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          total_answers: parseInt(answerStats.rows[0].total_answers),
          unique_respondents: parseInt(answerStats.rows[0].unique_respondents),
          response_rate: survey.completed_responses > 0
            ? Math.round((parseInt(answerStats.rows[0].unique_respondents) / survey.completed_responses) * 100)
            : 0,
          distribution,
          average_rating: averageRating ? parseFloat(averageRating).toFixed(2) : null,
          sample_text_responses: textResponses,
        };
      })
    );

    // Get device/browser statistics
    const deviceStats = await db.query(
      `SELECT
        device_type,
        COUNT(*) as count
       FROM responses
       WHERE survey_id = $1 AND device_type IS NOT NULL
       GROUP BY device_type
       ORDER BY count DESC`,
      [id]
    );

    const browserStats = await db.query(
      `SELECT
        browser,
        COUNT(*) as count
       FROM responses
       WHERE survey_id = $1 AND browser IS NOT NULL
       GROUP BY browser
       ORDER BY count DESC`,
      [id]
    );

    sendSuccess(res, {
      overview: {
        total_responses: survey.total_responses,
        completed_responses: survey.completed_responses,
        in_progress_responses: survey.total_responses - survey.completed_responses,
        completion_rate: survey.total_responses > 0
          ? Math.round((survey.completed_responses / survey.total_responses) * 100)
          : 0,
        total_views: survey.total_views,
        average_duration_seconds: durationResult.rows[0].avg_duration
          ? parseFloat(durationResult.rows[0].avg_duration).toFixed(0)
          : null,
      },
      timeline: timelineResult.rows,
      question_analytics: questionAnalytics,
      demographics: {
        devices: deviceStats.rows,
        browsers: browserStats.rows,
      },
    });

  } catch (error) {
    logger.error('Get analytics failed', error);
    sendError(res, 'Failed to retrieve analytics', 500);
  }
}

/**
 * Get client progress with satisfaction trends
 * GET /api/admin/clients/:clientName/progress
 */
export async function getClientProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { clientName } = req.params;

    // Get all surveys for this client
    const surveysResult = await db.query(
      `SELECT id, title, created_at, closed_at, total_responses, completed_responses, status
       FROM surveys
       WHERE client_name = $1 AND status != 'deleted'
       ORDER BY created_at DESC`,
      [clientName]
    );

    // Calculate average satisfaction for each survey (from rating questions)
    const surveysWithScores = await Promise.all(
      surveysResult.rows.map(async (survey) => {
        const ratingResult = await db.query(
          `SELECT AVG(a.answer_number) as avg_rating
           FROM answers a
           JOIN questions q ON a.question_id = q.id
           WHERE q.survey_id = $1
           AND q.question_type IN ('rating', 'nps')
           AND a.answer_number IS NOT NULL`,
          [survey.id]
        );

        return {
          ...survey,
          average_satisfaction: ratingResult.rows[0].avg_rating
            ? parseFloat(ratingResult.rows[0].avg_rating).toFixed(2)
            : null,
        };
      })
    );

    // Calculate trend (comparing latest to previous)
    let trend = null;
    if (surveysWithScores.length >= 2) {
      const latest = surveysWithScores[0];
      const previous = surveysWithScores[1];

      if (latest.average_satisfaction && previous.average_satisfaction) {
        const latestScore = parseFloat(latest.average_satisfaction);
        const previousScore = parseFloat(previous.average_satisfaction);
        const change = latestScore - previousScore;
        const changePercentage = ((change / previousScore) * 100).toFixed(1);

        trend = {
          direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
          change: change.toFixed(2),
          change_percentage: changePercentage,
          latest_score: latestScore.toFixed(2),
          previous_score: previousScore.toFixed(2),
        };
      }
    }

    // Overall statistics
    const overall = {
      total_surveys: surveysWithScores.length,
      completed_surveys: surveysWithScores.filter(s => s.status === 'closed').length,
      total_responses: surveysWithScores.reduce((sum, s) => sum + (s.total_responses || 0), 0),
      average_responses_per_survey: surveysWithScores.length > 0
        ? Math.round(surveysWithScores.reduce((sum, s) => sum + (s.completed_responses || 0), 0) / surveysWithScores.length)
        : 0,
      overall_satisfaction: surveysWithScores.length > 0
        ? (surveysWithScores.reduce((sum, s) => sum + (parseFloat(s.average_satisfaction) || 0), 0) / surveysWithScores.filter(s => s.average_satisfaction).length).toFixed(2)
        : null,
    };

    sendSuccess(res, {
      client_name: clientName,
      surveys: surveysWithScores,
      trend,
      overall,
    });

  } catch (error) {
    logger.error('Get client progress failed', error);
    sendError(res, 'Failed to retrieve client progress', 500);
  }
}

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const whereClause = userRole === 'developer' ? '' : `WHERE admin_id = '${userId}'`;

    const stats = await db.query(`
      SELECT
        COUNT(*) as total_surveys,
        COUNT(*) FILTER (WHERE status = 'active') as active_surveys,
        COUNT(*) FILTER (WHERE survey_type = 'internal') as internal_surveys,
        COUNT(*) FILTER (WHERE survey_type = 'external') as external_surveys,
        SUM(total_responses) as total_responses,
        SUM(completed_responses) as completed_responses
      FROM surveys
      ${whereClause}
    `);

    sendSuccess(res, stats.rows[0]);

  } catch (error) {
    logger.error('Get dashboard stats failed', error);
    sendError(res, 'Failed to retrieve statistics', 500);
  }
}

/**
 * Get all clients
 * GET /api/admin/clients
 */
export async function getClients(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query(
      `SELECT DISTINCT client_name, client_company, COUNT(*) as survey_count
       FROM surveys
       WHERE survey_type = 'external' AND client_name IS NOT NULL AND status != 'deleted'
       GROUP BY client_name, client_company
       ORDER BY client_name`
    );

    sendSuccess(res, result.rows);

  } catch (error) {
    logger.error('Get clients failed', error);
    sendError(res, 'Failed to retrieve clients', 500);
  }
}

export default {
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
};
