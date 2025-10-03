/**
 * Email service
 * Handles sending emails for notifications
 * This is a stub implementation - integrate with actual email provider in production
 */

import config from '../config/env';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured SMTP service
 * TODO: Integrate with actual email service (NodeMailer, SendGrid, AWS SES, etc.)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In production, implement actual email sending
    // For now, just log the email
    logger.info('Email would be sent:', {
      to: options.to,
      subject: options.subject,
      from: config.EMAIL_FROM || 'noreply@amsteel.com',
    });

    // Simulate email sending
    if (config.NODE_ENV === 'development') {
      logger.debug('Email content:', {
        html: options.html,
        text: options.text,
      });
    }

    return true;
  } catch (error) {
    logger.error('Failed to send email', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Password Reset Request</h2>
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Reset Password
      </a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">
        AMSteel Survey System<br>
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  const text = `
    Password Reset Request

    You have requested to reset your password. Click the link below to proceed:
    ${resetUrl}

    If you didn't request this, please ignore this email.
    This link will expire in 1 hour.
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - AMSteel Survey',
    html,
    text,
  });
}

/**
 * Send promotion notification email
 */
export async function sendPromotionEmail(
  email: string,
  fullName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Congratulations!</h2>
      <p>Dear ${fullName},</p>
      <p>You have been promoted to <strong>Admin</strong> role in the AMSteel Survey System.</p>
      <p>You now have the ability to:</p>
      <ul>
        <li>Create and manage surveys</li>
        <li>View and analyze responses</li>
        <li>Export survey data</li>
        <li>Access analytics and reports</li>
      </ul>
      <a href="${config.FRONTEND_URL}/login" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Login to Dashboard
      </a>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">
        AMSteel Survey System<br>
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  const text = `
    Congratulations!

    Dear ${fullName},

    You have been promoted to Admin role in the AMSteel Survey System.

    You now have the ability to:
    - Create and manage surveys
    - View and analyze responses
    - Export survey data
    - Access analytics and reports

    Login at: ${config.FRONTEND_URL}/login
  `;

  return await sendEmail({
    to: email,
    subject: 'You have been promoted to Admin - AMSteel Survey',
    html,
    text,
  });
}

/**
 * Send demotion notification email
 */
export async function sendDemotionEmail(
  email: string,
  fullName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Role Change Notification</h2>
      <p>Dear ${fullName},</p>
      <p>Your role in the AMSteel Survey System has been changed to <strong>Employee</strong>.</p>
      <p>You will no longer have admin privileges, but you can still:</p>
      <ul>
        <li>Access your account</li>
        <li>Respond to assigned surveys</li>
        <li>View your response history</li>
      </ul>
      <p>If you have any questions, please contact your system administrator.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">
        AMSteel Survey System<br>
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  const text = `
    Role Change Notification

    Dear ${fullName},

    Your role in the AMSteel Survey System has been changed to Employee.

    You will no longer have admin privileges, but you can still:
    - Access your account
    - Respond to assigned surveys
    - View your response history

    If you have any questions, please contact your system administrator.
  `;

  return await sendEmail({
    to: email,
    subject: 'Role Change Notification - AMSteel Survey',
    html,
    text,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Welcome to AMSteel Survey System!</h2>
      <p>Dear ${fullName},</p>
      <p>Your account has been successfully created.</p>
      <p>You can now login and start participating in surveys.</p>
      <a href="${config.FRONTEND_URL}/login" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Login Now
      </a>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 12px;">
        AMSteel Survey System<br>
        This is an automated email, please do not reply.
      </p>
    </div>
  `;

  const text = `
    Welcome to AMSteel Survey System!

    Dear ${fullName},

    Your account has been successfully created.
    You can now login and start participating in surveys.

    Login at: ${config.FRONTEND_URL}/login
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to AMSteel Survey System',
    html,
    text,
  });
}

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPromotionEmail,
  sendDemotionEmail,
  sendWelcomeEmail,
};
