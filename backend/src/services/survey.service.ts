/**
 * Survey service
 * Business logic for survey operations
 */

import db from '../config/database';
import { Survey, SurveyStatus } from '../types';
import { generateUniqueSlug } from '../utils/slugGenerator';
import logger from '../utils/logger';

/**
 * Check if survey has expired based on end_date
 */
export function isSurveyExpired(survey: Survey): boolean {
  if (survey.duration_type === 'unlimited') {
    return false;
  }

  if (!survey.end_date) {
    return false;
  }

  return new Date() > new Date(survey.end_date);
}

/**
 * Get effective survey status (checks for expiration)
 */
export function getEffectiveStatus(survey: Survey): SurveyStatus {
  if (survey.status === 'active' && isSurveyExpired(survey)) {
    return 'expired';
  }
  return survey.status;
}

/**
 * Check if survey can accept responses
 */
export function canAcceptResponses(survey: Survey): boolean {
  const effectiveStatus = getEffectiveStatus(survey);

  if (effectiveStatus !== 'active') {
    return false;
  }

  // Check max responses limit
  if (survey.max_responses && survey.total_responses >= survey.max_responses) {
    return false;
  }

  return true;
}

/**
 * Check if user can respond to survey (for internal surveys)
 */
export async function canUserRespond(
  surveyId: string,
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Get survey details
  const surveyResult = await db.query(
    'SELECT * FROM surveys WHERE id = $1',
    [surveyId]
  );

  if (surveyResult.rows.length === 0) {
    return { allowed: false, reason: 'Survey not found' };
  }

  const survey: Survey = surveyResult.rows[0];

  // Check if survey can accept responses
  if (!canAcceptResponses(survey)) {
    return { allowed: false, reason: 'Survey is not accepting responses' };
  }

  // For external surveys, authentication is not required
  if (survey.survey_type === 'external') {
    return { allowed: true };
  }

  // For internal surveys, check if user is targeted
  const targetResult = await db.query(
    'SELECT * FROM survey_target_employees WHERE survey_id = $1 AND employee_id = $2',
    [surveyId, userId]
  );

  if (targetResult.rows.length === 0) {
    return { allowed: false, reason: 'You are not targeted for this survey' };
  }

  // Check if already responded (if allow_multiple is false)
  if (!survey.allow_multiple && targetResult.rows[0].has_responded) {
    return { allowed: false, reason: 'You have already responded to this survey' };
  }

  return { allowed: true };
}

/**
 * Update survey statistics
 */
export async function updateSurveyStats(surveyId: string): Promise<void> {
  try {
    await db.query(
      `UPDATE surveys
       SET total_responses = (
         SELECT COUNT(*) FROM responses WHERE survey_id = $1
       ),
       completed_responses = (
         SELECT COUNT(*) FROM responses WHERE survey_id = $1 AND status = 'completed'
       )
       WHERE id = $1`,
      [surveyId]
    );
  } catch (error) {
    logger.error('Failed to update survey statistics', error);
  }
}

/**
 * Increment survey view count
 */
export async function incrementViewCount(surveyId: string): Promise<void> {
  try {
    await db.query(
      'UPDATE surveys SET total_views = total_views + 1 WHERE id = $1',
      [surveyId]
    );
  } catch (error) {
    logger.error('Failed to increment view count', error);
  }
}

/**
 * Mark employee as responded
 */
export async function markEmployeeResponded(
  surveyId: string,
  employeeId: string
): Promise<void> {
  try {
    await db.query(
      `UPDATE survey_target_employees
       SET has_responded = true, responded_at = CURRENT_TIMESTAMP
       WHERE survey_id = $1 AND employee_id = $2`,
      [surveyId, employeeId]
    );
  } catch (error) {
    logger.error('Failed to mark employee as responded', error);
  }
}

/**
 * Auto-expire surveys that have passed their end date
 */
export async function autoExpireSurveys(): Promise<number> {
  try {
    const result = await db.query(
      `UPDATE surveys
       SET status = 'expired'
       WHERE status = 'active'
       AND duration_type = 'limited'
       AND end_date < CURRENT_TIMESTAMP
       RETURNING id`
    );

    const count = result.rows.length;
    if (count > 0) {
      logger.info(`Auto-expired ${count} surveys`);
    }

    return count;
  } catch (error) {
    logger.error('Failed to auto-expire surveys', error);
    return 0;
  }
}

/**
 * Duplicate a survey
 */
export async function duplicateSurvey(
  surveyId: string,
  adminId: string
): Promise<string> {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get original survey
    const surveyResult = await client.query(
      'SELECT * FROM surveys WHERE id = $1',
      [surveyId]
    );

    if (surveyResult.rows.length === 0) {
      throw new Error('Survey not found');
    }

    const originalSurvey = surveyResult.rows[0];

    // Generate new slug
    const newSlug = await generateUniqueSlug(originalSurvey.title + ' Copy');

    // Create new survey
    const newSurveyResult = await client.query(
      `INSERT INTO surveys (
        admin_id, title, description, welcome_message, thank_you_message,
        survey_type, client_name, client_company, target_department,
        duration_type, is_anonymous, allow_multiple, requires_auth,
        max_responses, track_ip, track_location, allow_editing,
        show_progress_bar, redirect_url, unique_slug, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'draft'
      ) RETURNING id`,
      [
        adminId,
        originalSurvey.title + ' (Copy)',
        originalSurvey.description,
        originalSurvey.welcome_message,
        originalSurvey.thank_you_message,
        originalSurvey.survey_type,
        originalSurvey.client_name,
        originalSurvey.client_company,
        originalSurvey.target_department,
        originalSurvey.duration_type,
        originalSurvey.is_anonymous,
        originalSurvey.allow_multiple,
        originalSurvey.requires_auth,
        originalSurvey.max_responses,
        originalSurvey.track_ip,
        originalSurvey.track_location,
        originalSurvey.allow_editing,
        originalSurvey.show_progress_bar,
        originalSurvey.redirect_url,
        newSlug,
      ]
    );

    const newSurveyId = newSurveyResult.rows[0].id;

    // Copy questions
    const questionsResult = await client.query(
      'SELECT * FROM questions WHERE survey_id = $1 ORDER BY order_index',
      [surveyId]
    );

    for (const question of questionsResult.rows) {
      await client.query(
        `INSERT INTO questions (
          survey_id, question_type, question_text, description,
          is_required, order_index, validation_rules, options, conditional_logic
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          newSurveyId,
          question.question_type,
          question.question_text,
          question.description,
          question.is_required,
          question.order_index,
          question.validation_rules,
          question.options,
          question.conditional_logic,
        ]
      );
    }

    await client.query('COMMIT');
    logger.info('Survey duplicated successfully', { originalId: surveyId, newId: newSurveyId });

    return newSurveyId;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Failed to duplicate survey', error);
    throw error;
  } finally {
    client.release();
  }
}

export default {
  isSurveyExpired,
  getEffectiveStatus,
  canAcceptResponses,
  canUserRespond,
  updateSurveyStats,
  incrementViewCount,
  markEmployeeResponded,
  autoExpireSurveys,
  duplicateSurvey,
};
