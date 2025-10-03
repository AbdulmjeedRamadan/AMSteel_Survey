/**
 * Public controller
 * Handles public survey access and anonymous response submission
 */

import { Response, Request } from 'express';
import { CreateResponseDto } from '../types';
import db from '../config/database';
import { comparePassword } from '../services/auth.service';
import { canAcceptResponses, incrementViewCount, updateSurveyStats } from '../services/survey.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest, sendUnauthorized } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get public survey by slug
 * GET /api/public/surveys/:slug
 */
export async function getPublicSurvey(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    // Get survey by slug
    const surveyResult = await db.query(
      `SELECT id, title, description, welcome_message, thank_you_message,
              survey_type, duration_type, start_date, end_date, status,
              has_password, is_anonymous, allow_multiple, show_progress_bar,
              redirect_url, total_responses, max_responses
       FROM surveys
       WHERE unique_slug = $1 AND status != 'deleted'`,
      [slug]
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    // Check if survey can accept responses
    if (!canAcceptResponses(survey)) {
      sendBadRequest(res, 'This survey is not currently accepting responses');
      return;
    }

    // Increment view count
    await incrementViewCount(survey.id);

    // If password protected, don't return questions yet
    if (survey.has_password) {
      sendSuccess(res, {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        welcome_message: survey.welcome_message,
        has_password: true,
        show_progress_bar: survey.show_progress_bar,
      });
      return;
    }

    // Get questions
    const questionsResult = await db.query(
      'SELECT id, question_type, question_text, description, is_required, order_index, validation_rules, options FROM questions WHERE survey_id = $1 ORDER BY order_index',
      [survey.id]
    );

    survey.questions = questionsResult.rows;

    // Remove password hash from response
    delete survey.password_hash;

    sendSuccess(res, survey);

  } catch (error) {
    logger.error('Get public survey failed', error);
    sendError(res, 'Failed to retrieve survey', 500);
  }
}

/**
 * Validate survey password
 * POST /api/public/surveys/:slug/validate-password
 */
export async function validateSurveyPassword(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const { password } = req.body;

    if (!password) {
      sendBadRequest(res, 'Password is required');
      return;
    }

    // Get survey
    const surveyResult = await db.query(
      `SELECT id, title, description, welcome_message, thank_you_message,
              has_password, password_hash, show_progress_bar, is_anonymous,
              allow_multiple, redirect_url, status
       FROM surveys
       WHERE unique_slug = $1 AND status != 'deleted'`,
      [slug]
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    if (!survey.has_password || !survey.password_hash) {
      sendBadRequest(res, 'Survey is not password protected');
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, survey.password_hash);

    if (!isValid) {
      sendUnauthorized(res, 'Incorrect password');
      return;
    }

    // Get questions
    const questionsResult = await db.query(
      'SELECT id, question_type, question_text, description, is_required, order_index, validation_rules, options FROM questions WHERE survey_id = $1 ORDER BY order_index',
      [survey.id]
    );

    survey.questions = questionsResult.rows;

    // Remove password hash from response
    delete survey.password_hash;

    sendSuccess(res, survey, 'Password validated successfully');

  } catch (error) {
    logger.error('Validate survey password failed', error);
    sendError(res, 'Failed to validate password', 500);
  }
}

/**
 * Submit public response
 * POST /api/public/responses
 */
export async function submitPublicResponse(req: Request, res: Response): Promise<void> {
  const client = await db.getClient();

  try {
    const {
      survey_id,
      respondent_name,
      respondent_email,
      respondent_phone,
      answers,
    }: CreateResponseDto = req.body;

    // Get survey details
    const surveyResult = await client.query(
      'SELECT * FROM surveys WHERE id = $1 AND status != $2',
      [survey_id, 'deleted']
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    // Check if survey can accept responses
    if (!canAcceptResponses(survey)) {
      sendBadRequest(res, 'This survey is not currently accepting responses');
      return;
    }

    // Check if multiple responses are allowed
    if (!survey.allow_multiple && respondent_email) {
      const existingResponse = await client.query(
        'SELECT id FROM responses WHERE survey_id = $1 AND respondent_email = $2 AND status = $3',
        [survey_id, respondent_email, 'completed']
      );

      if (existingResponse.rows.length > 0) {
        sendBadRequest(res, 'You have already submitted a response to this survey');
        return;
      }
    }

    await client.query('BEGIN');

    // Create response
    const responseResult = await client.query(
      `INSERT INTO responses (
        survey_id, respondent_name, respondent_email, respondent_phone,
        status, completed_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP, $5, $6)
      RETURNING *`,
      [
        survey_id,
        respondent_name,
        respondent_email,
        respondent_phone,
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

    // Update survey stats
    await updateSurveyStats(survey_id);

    await client.query('COMMIT');

    logger.info('Public response submitted', {
      responseId: response.id,
      surveyId: survey_id,
      isAnonymous: !respondent_email,
    });

    sendCreated(res, {
      id: response.id,
      thank_you_message: survey.thank_you_message,
      redirect_url: survey.redirect_url,
    }, 'Response submitted successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Submit public response failed', error);
    sendError(res, 'Failed to submit response', 500);
  } finally {
    client.release();
  }
}

export default {
  getPublicSurvey,
  validateSurveyPassword,
  submitPublicResponse,
};
