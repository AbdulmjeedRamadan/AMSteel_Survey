/**
 * Question controller
 * Handles question CRUD operations and reordering
 */

import { Response } from 'express';
import { AuthRequest, CreateQuestionDto, UpdateQuestionDto, ReorderQuestionsDto } from '../types';
import db from '../config/database';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } from '../utils/response';
import logger from '../utils/logger';

/**
 * Create question
 * POST /api/admin/surveys/:id/questions
 */
export async function createQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id: surveyId } = req.params;
    const questionData: CreateQuestionDto = req.body;

    // Check if survey exists and user has permission
    const surveyResult = await db.query(
      'SELECT admin_id, status FROM surveys WHERE id = $1',
      [surveyId]
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    const survey = surveyResult.rows[0];

    // Cannot edit published surveys
    if (survey.status === 'active') {
      sendBadRequest(res, 'Cannot modify questions in active survey');
      return;
    }

    // Create question
    const result = await db.query(
      `INSERT INTO questions (
        survey_id, question_type, question_text, description,
        is_required, order_index, validation_rules, options, conditional_logic
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        surveyId,
        questionData.question_type,
        questionData.question_text,
        questionData.description,
        questionData.is_required || false,
        questionData.order_index,
        questionData.validation_rules ? JSON.stringify(questionData.validation_rules) : null,
        questionData.options ? JSON.stringify(questionData.options) : null,
        questionData.conditional_logic ? JSON.stringify(questionData.conditional_logic) : null,
      ]
    );

    logger.info('Question created', { surveyId, questionId: result.rows[0].id });

    sendCreated(res, result.rows[0], 'Question created successfully');

  } catch (error) {
    logger.error('Create question failed', error);
    sendError(res, 'Failed to create question', 500);
  }
}

/**
 * Update question
 * PUT /api/admin/questions/:id
 */
export async function updateQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates: UpdateQuestionDto = req.body;

    // Check if question exists
    const checkResult = await db.query(
      `SELECT q.*, s.status as survey_status
       FROM questions q
       JOIN surveys s ON q.survey_id = s.id
       WHERE q.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      sendNotFound(res, 'Question not found');
      return;
    }

    // Cannot edit questions in active surveys
    if (checkResult.rows[0].survey_status === 'active') {
      sendBadRequest(res, 'Cannot modify questions in active survey');
      return;
    }

    // Build update query
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.question_type !== undefined) {
      fields.push(`question_type = $${paramIndex++}`);
      params.push(updates.question_type);
    }

    if (updates.question_text !== undefined) {
      fields.push(`question_text = $${paramIndex++}`);
      params.push(updates.question_text);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(updates.description);
    }

    if (updates.is_required !== undefined) {
      fields.push(`is_required = $${paramIndex++}`);
      params.push(updates.is_required);
    }

    if (updates.validation_rules !== undefined) {
      fields.push(`validation_rules = $${paramIndex++}`);
      params.push(JSON.stringify(updates.validation_rules));
    }

    if (updates.options !== undefined) {
      fields.push(`options = $${paramIndex++}`);
      params.push(JSON.stringify(updates.options));
    }

    if (updates.conditional_logic !== undefined) {
      fields.push(`conditional_logic = $${paramIndex++}`);
      params.push(JSON.stringify(updates.conditional_logic));
    }

    if (fields.length === 0) {
      sendBadRequest(res, 'No fields to update');
      return;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    logger.info('Question updated', { questionId: id });

    sendSuccess(res, result.rows[0], 'Question updated successfully');

  } catch (error) {
    logger.error('Update question failed', error);
    sendError(res, 'Failed to update question', 500);
  }
}

/**
 * Delete question
 * DELETE /api/admin/questions/:id
 */
export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if question exists and survey status
    const checkResult = await db.query(
      `SELECT q.*, s.status as survey_status
       FROM questions q
       JOIN surveys s ON q.survey_id = s.id
       WHERE q.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      sendNotFound(res, 'Question not found');
      return;
    }

    // Cannot delete questions from active surveys
    if (checkResult.rows[0].survey_status === 'active') {
      sendBadRequest(res, 'Cannot delete questions from active survey');
      return;
    }

    await db.query('DELETE FROM questions WHERE id = $1', [id]);

    logger.info('Question deleted', { questionId: id });

    sendSuccess(res, null, 'Question deleted successfully');

  } catch (error) {
    logger.error('Delete question failed', error);
    sendError(res, 'Failed to delete question', 500);
  }
}

/**
 * Reorder questions
 * PATCH /api/admin/surveys/:id/questions/reorder
 */
export async function reorderQuestions(req: AuthRequest, res: Response): Promise<void> {
  const client = await db.getClient();

  try {
    const { id: surveyId } = req.params;
    const { question_orders }: ReorderQuestionsDto = req.body;

    // Check survey status
    const surveyResult = await client.query(
      'SELECT status FROM surveys WHERE id = $1',
      [surveyId]
    );

    if (surveyResult.rows.length === 0) {
      sendNotFound(res, 'Survey not found');
      return;
    }

    if (surveyResult.rows[0].status === 'active') {
      sendBadRequest(res, 'Cannot reorder questions in active survey');
      return;
    }

    await client.query('BEGIN');

    // Update each question's order_index
    for (const { question_id, order_index } of question_orders) {
      await client.query(
        'UPDATE questions SET order_index = $1 WHERE id = $2 AND survey_id = $3',
        [order_index, question_id, surveyId]
      );
    }

    await client.query('COMMIT');

    logger.info('Questions reordered', { surveyId });

    sendSuccess(res, null, 'Questions reordered successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Reorder questions failed', error);
    sendError(res, 'Failed to reorder questions', 500);
  } finally {
    client.release();
  }
}

export default {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
};
