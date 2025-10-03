/**
 * Logger utility for consistent logging throughout the application
 * Uses different log levels and formats for development vs production
 */

import config from '../config/env';

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.NODE_ENV === 'development';
  }

  /**
   * Format log message with timestamp and level
   */
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  /**
   * Log error messages
   */
  error(message: string, error?: any): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message);
    console.error(formatted);

    if (error) {
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else {
        console.error('Error details:', error);
      }
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, meta?: any): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, meta);
    console.warn(formatted);
  }

  /**
   * Log info messages
   */
  info(message: string, meta?: any): void {
    const formatted = this.formatMessage(LogLevel.INFO, message, meta);
    console.log(formatted);
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, meta);
      console.log(formatted);
    }
  }

  /**
   * Log HTTP request
   */
  http(method: string, url: string, statusCode: number, duration: number): void {
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    this.info(message);
  }
}

// Export singleton instance
export default new Logger();
