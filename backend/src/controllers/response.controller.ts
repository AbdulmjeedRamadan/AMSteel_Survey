/**
 * Response controller
 * Handles survey response management and export
 */

import { Response } from 'express';
import { AuthRequest, ExportRequestDto } from '../types';
import db from '../config/database';
import { exportToCSV, exportToExcel, exportToPDF } from '../services/export.service';
import { sendSuccess, sendError, sendNotFound, sendPaginated } from '../utils/response';
import logger from '../utils/logger';

/**
 * Get responses for a survey
 * GET /api/admin/surveys/:id/responses
 */
export async function getSurveyResponses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id: surveyId } = req.params;
    const {
      page = 1,
      limit = 20,
      status,
      date_from,
      date_to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = ['survey_id = $1'];
    const params: any[] = [surveyId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (date_from) {
      conditions.push(`completed_at >= $${paramIndex++}`);
      params.push(date_from);
    }

    if (date_to) {
      conditions.push(`completed_at <= $${paramIndex++}`);
      params.push(date_to);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM responses ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get responses
    const result = await db.query(
      `SELECT r.*, u.full_name as employee_name, u.email as employee_email
       FROM responses r
       LEFT JOIN users u ON r.employee_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    sendPaginated(res, result.rows, total, Number(page), Number(limit));

  } catch (error) {
    logger.error('Get survey responses failed', error);
    sendError(res, 'Failed to retrieve responses', 500);
  }
}

/**
 * Get response by ID with answers
 * GET /api/admin/responses/:id
 */
export async function getResponseById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Get response
    const responseResult = await db.query(
      `SELECT r.*, u.full_name as employee_name, u.email as employee_email,
              s.title as survey_title
       FROM responses r
       LEFT JOIN users u ON r.employee_id = u.id
       JOIN surveys s ON r.survey_id = s.id
       WHERE r.id = $1`,
      [id]
    );

    if (responseResult.rows.length === 0) {
      sendNotFound(res, 'Response not found');
      return;
    }

    const response = responseResult.rows[0];

    // Get answers
    const answersResult = await db.query(
      `SELECT a.*, q.question_text, q.question_type
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.response_id = $1
       ORDER BY q.order_index`,
      [id]
    );

    response.answers = answersResult.rows;

    sendSuccess(res, response);

  } catch (error) {
    logger.error('Get response by ID failed', error);
    sendError(res, 'Failed to retrieve response', 500);
  }
}

/**
 * Delete response
 * DELETE /api/admin/responses/:id
 */
export async function deleteResponse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if response exists
    const checkResult = await db.query(
      'SELECT survey_id FROM responses WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      sendNotFound(res, 'Response not found');
      return;
    }

    const surveyId = checkResult.rows[0].survey_id;

    // Delete response (CASCADE will delete answers)
    await db.query('DELETE FROM responses WHERE id = $1', [id]);

    // Update survey stats
    await db.query(
      `UPDATE surveys
       SET total_responses = (SELECT COUNT(*) FROM responses WHERE survey_id = $1),
           completed_responses = (SELECT COUNT(*) FROM responses WHERE survey_id = $1 AND status = 'completed')
       WHERE id = $1`,
      [surveyId]
    );

    logger.info('Response deleted', { responseId: id, surveyId });

    sendSuccess(res, null, 'Response deleted successfully');

  } catch (error) {
    logger.error('Delete response failed', error);
    sendError(res, 'Failed to delete response', 500);
  }
}

/**
 * Bulk delete responses
 * DELETE /api/admin/responses/bulk
 */
export async function bulkDeleteResponses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { response_ids } = req.body;

    if (!response_ids || !Array.isArray(response_ids) || response_ids.length === 0) {
      sendError(res, 'response_ids array is required', 400);
      return;
    }

    // Get unique survey IDs
    const surveyIdsResult = await db.query(
      'SELECT DISTINCT survey_id FROM responses WHERE id = ANY($1)',
      [response_ids]
    );

    // Delete responses
    const result = await db.query(
      'DELETE FROM responses WHERE id = ANY($1) RETURNING id',
      [response_ids]
    );

    // Update stats for affected surveys
    for (const row of surveyIdsResult.rows) {
      await db.query(
        `UPDATE surveys
         SET total_responses = (SELECT COUNT(*) FROM responses WHERE survey_id = $1),
             completed_responses = (SELECT COUNT(*) FROM responses WHERE survey_id = $1 AND status = 'completed')
         WHERE id = $1`,
        [row.survey_id]
      );
    }

    logger.info('Bulk delete responses', { count: result.rows.length });

    sendSuccess(res, {
      deleted_count: result.rows.length
    }, `${result.rows.length} responses deleted successfully`);

  } catch (error) {
    logger.error('Bulk delete responses failed', error);
    sendError(res, 'Failed to delete responses', 500);
  }
}

/**
 * Export to CSV
 * POST /api/admin/export/csv
 */
export async function exportCSV(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { survey_ids }: ExportRequestDto = req.body;

    if (!survey_ids || survey_ids.length === 0) {
      sendError(res, 'survey_ids array is required', 400);
      return;
    }

    const csv = await exportToCSV(survey_ids);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=survey-export.csv');
    res.send(csv);

    logger.info('CSV export completed', { surveyCount: survey_ids.length });

  } catch (error) {
    logger.error('CSV export failed', error);
    sendError(res, 'Failed to export to CSV', 500);
  }
}

/**
 * Export to Excel
 * POST /api/admin/export/excel
 */
export async function exportExcel(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { survey_ids }: ExportRequestDto = req.body;

    if (!survey_ids || survey_ids.length === 0) {
      sendError(res, 'survey_ids array is required', 400);
      return;
    }

    const buffer = await exportToExcel(survey_ids);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename=survey-export.csv');
    res.send(buffer);

    logger.info('Excel export completed', { surveyCount: survey_ids.length });

  } catch (error) {
    logger.error('Excel export failed', error);
    sendError(res, 'Failed to export to Excel', 500);
  }
}

/**
 * Export to PDF
 * POST /api/admin/export/pdf
 */
export async function exportPDF(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { survey_ids }: ExportRequestDto = req.body;

    if (!survey_ids || survey_ids.length === 0) {
      sendError(res, 'survey_ids array is required', 400);
      return;
    }

    const html = await exportToPDF(survey_ids);

    // Return HTML that can be converted to PDF on frontend
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

    logger.info('PDF export completed', { surveyCount: survey_ids.length });

  } catch (error) {
    logger.error('PDF export failed', error);
    sendError(res, 'Failed to export to PDF', 500);
  }
}

export default {
  getSurveyResponses,
  getResponseById,
  deleteResponse,
  bulkDeleteResponses,
  exportCSV,
  exportExcel,
  exportPDF,
};
