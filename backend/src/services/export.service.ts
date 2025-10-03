/**
 * Export service
 * Handles exporting survey data to CSV, Excel, and PDF formats
 */

import db from '../config/database';
import logger from '../utils/logger';

/**
 * Get survey data for export
 */
async function getSurveyDataForExport(surveyIds: string[]) {
  const client = await db.getClient();

  try {
    const data = [];

    for (const surveyId of surveyIds) {
      // Get survey details
      const surveyResult = await client.query(
        `SELECT s.*, u.full_name as admin_name, u.email as admin_email
         FROM surveys s
         JOIN users u ON s.admin_id = u.id
         WHERE s.id = $1`,
        [surveyId]
      );

      if (surveyResult.rows.length === 0) {
        continue;
      }

      const survey = surveyResult.rows[0];

      // Get questions
      const questionsResult = await client.query(
        `SELECT * FROM questions
         WHERE survey_id = $1
         ORDER BY order_index`,
        [surveyId]
      );

      // Get responses with answers
      const responsesResult = await client.query(
        `SELECT r.*, u.full_name as employee_name, u.email as employee_email
         FROM responses r
         LEFT JOIN users u ON r.employee_id = u.id
         WHERE r.survey_id = $1 AND r.status = 'completed'
         ORDER BY r.completed_at DESC`,
        [surveyId]
      );

      const responses = [];

      for (const response of responsesResult.rows) {
        // Get answers for this response
        const answersResult = await client.query(
          `SELECT a.*, q.question_text, q.question_type
           FROM answers a
           JOIN questions q ON a.question_id = q.id
           WHERE a.response_id = $1`,
          [response.id]
        );

        responses.push({
          ...response,
          answers: answersResult.rows,
        });
      }

      data.push({
        survey,
        questions: questionsResult.rows,
        responses,
      });
    }

    return data;
  } finally {
    client.release();
  }
}

/**
 * Format answer value based on question type
 */
function formatAnswerValue(answer: any): string {
  if (answer.answer_text !== null) return answer.answer_text;
  if (answer.answer_number !== null) return answer.answer_number.toString();
  if (answer.answer_boolean !== null) return answer.answer_boolean ? 'Yes' : 'No';
  if (answer.answer_date !== null) return new Date(answer.answer_date).toLocaleDateString();
  if (answer.answer_time !== null) return answer.answer_time;
  if (answer.answer_json !== null) return JSON.stringify(answer.answer_json);
  return '';
}

/**
 * Export to CSV format
 */
export async function exportToCSV(surveyIds: string[]): Promise<string> {
  try {
    const data = await getSurveyDataForExport(surveyIds);
    let csv = '';

    for (const surveyData of data) {
      const { survey, questions, responses } = surveyData;

      // Add survey header
      csv += `\n"Survey: ${survey.title}"\n`;
      csv += `"Type: ${survey.survey_type}"\n`;
      csv += `"Status: ${survey.status}"\n`;
      csv += `"Created: ${new Date(survey.created_at).toLocaleString()}"\n`;
      csv += `"Total Responses: ${responses.length}"\n\n`;

      // Create CSV header row
      const headers = ['Response ID', 'Submitted At', 'Duration (seconds)'];

      if (survey.survey_type === 'internal') {
        headers.push('Employee Name', 'Employee Email');
      } else {
        headers.push('Respondent Name', 'Respondent Email', 'Respondent Phone');
      }

      // Add question headers
      questions.forEach((q: any) => {
        headers.push(q.question_text);
      });

      csv += headers.map(h => `"${h}"`).join(',') + '\n';

      // Add response rows
      for (const response of responses) {
        const row = [
          response.id,
          new Date(response.completed_at).toLocaleString(),
          response.duration_seconds || '',
        ];

        if (survey.survey_type === 'internal') {
          row.push(response.employee_name || '', response.employee_email || '');
        } else {
          row.push(
            response.respondent_name || '',
            response.respondent_email || '',
            response.respondent_phone || ''
          );
        }

        // Add answers in question order
        questions.forEach((q: any) => {
          const answer = response.answers.find((a: any) => a.question_id === q.id);
          row.push(answer ? formatAnswerValue(answer) : '');
        });

        csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
      }

      csv += '\n\n';
    }

    return csv;
  } catch (error) {
    logger.error('CSV export failed', error);
    throw new Error('Failed to export to CSV');
  }
}

/**
 * Export to Excel format
 * Returns CSV format that can be opened in Excel with UTF-8 BOM for Arabic support
 */
export async function exportToExcel(surveyIds: string[]): Promise<Buffer> {
  try {
    const csv = await exportToCSV(surveyIds);

    // Add UTF-8 BOM for proper Arabic text rendering in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csv;

    return Buffer.from(csvWithBOM, 'utf8');
  } catch (error) {
    logger.error('Excel export failed', error);
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Export to PDF format
 * Returns HTML that can be converted to PDF by frontend or PDF library
 */
export async function exportToPDF(surveyIds: string[]): Promise<string> {
  try {
    const data = await getSurveyDataForExport(surveyIds);
    let html = `
      <!DOCTYPE html>
      <html dir="ltr">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #3B82F6;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 10px;
          }
          h2 {
            color: #1E40AF;
            margin-top: 30px;
          }
          .survey-info {
            background: #F3F4F6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .survey-info p {
            margin: 5px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          th {
            background: #3B82F6;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #E5E7EB;
          }
          tr:nth-child(even) {
            background: #F9FAFB;
          }
          .page-break {
            page-break-after: always;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6B7280;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <h1>AMSteel Survey System - Export Report</h1>
        <p style="color: #6B7280;">Generated on: ${new Date().toLocaleString()}</p>
    `;

    for (let i = 0; i < data.length; i++) {
      const { survey, questions, responses } = data[i];

      html += `
        ${i > 0 ? '<div class="page-break"></div>' : ''}
        <h2>Survey: ${survey.title}</h2>
        <div class="survey-info">
          <p><strong>Type:</strong> ${survey.survey_type === 'internal' ? 'Internal' : 'External'}</p>
          <p><strong>Status:</strong> ${survey.status}</p>
          ${survey.client_name ? `<p><strong>Client:</strong> ${survey.client_name}</p>` : ''}
          <p><strong>Created:</strong> ${new Date(survey.created_at).toLocaleString()}</p>
          <p><strong>Total Responses:</strong> ${responses.length}</p>
          <p><strong>Completion Rate:</strong> ${survey.total_responses > 0 ? Math.round((survey.completed_responses / survey.total_responses) * 100) : 0}%</p>
        </div>
      `;

      if (responses.length > 0) {
        html += '<table><thead><tr>';
        html += '<th>Submitted</th>';

        if (survey.survey_type === 'internal') {
          html += '<th>Employee</th>';
        } else {
          html += '<th>Respondent</th>';
        }

        questions.forEach((q: any) => {
          html += `<th>${q.question_text}</th>`;
        });

        html += '</tr></thead><tbody>';

        responses.forEach((response: any) => {
          html += '<tr>';
          html += `<td>${new Date(response.completed_at).toLocaleString()}</td>`;

          if (survey.survey_type === 'internal') {
            html += `<td>${response.employee_name || 'Unknown'}</td>`;
          } else {
            html += `<td>${response.respondent_name || 'Anonymous'}</td>`;
          }

          questions.forEach((q: any) => {
            const answer = response.answers.find((a: any) => a.question_id === q.id);
            html += `<td>${answer ? formatAnswerValue(answer) : '-'}</td>`;
          });

          html += '</tr>';
        });

        html += '</tbody></table>';
      } else {
        html += '<p style="color: #6B7280;">No responses yet.</p>';
      }
    }

    html += `
        <div class="footer">
          <p>AMSteel Survey System - Confidential</p>
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    logger.error('PDF export failed', error);
    throw new Error('Failed to export to PDF');
  }
}

/**
 * Get export statistics
 */
export async function getExportStats(surveyIds: string[]): Promise<any> {
  try {
    const stats = {
      total_surveys: surveyIds.length,
      total_responses: 0,
      total_questions: 0,
      surveys: [] as any[],
    };

    for (const surveyId of surveyIds) {
      const surveyResult = await db.query(
        'SELECT id, title, total_responses, completed_responses FROM surveys WHERE id = $1',
        [surveyId]
      );

      if (surveyResult.rows.length > 0) {
        const survey = surveyResult.rows[0];

        const questionCount = await db.query(
          'SELECT COUNT(*) FROM questions WHERE survey_id = $1',
          [surveyId]
        );

        stats.total_responses += survey.completed_responses;
        stats.total_questions += parseInt(questionCount.rows[0].count);

        stats.surveys.push({
          id: survey.id,
          title: survey.title,
          responses: survey.completed_responses,
          questions: parseInt(questionCount.rows[0].count),
        });
      }
    }

    return stats;
  } catch (error) {
    logger.error('Failed to get export stats', error);
    throw error;
  }
}

export default {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  getExportStats,
};
