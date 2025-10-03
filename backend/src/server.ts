/**
 * Main server file
 * Express application setup with middleware, routes, and error handling
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env';
import db from './config/database';
import logger from './utils/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimit';

/**
 * Create and configure Express application
 */
function createApp(): Application {
  const app = express();

  // ============================================================================
  // SECURITY MIDDLEWARE
  // ============================================================================

  // Helmet - Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS - Cross-Origin Resource Sharing
  app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ============================================================================
  // GENERAL MIDDLEWARE
  // ============================================================================

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logger
  if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Rate limiting
  app.use('/api', generalLimiter);

  // Trust proxy (for IP tracking behind reverse proxy)
  app.set('trust proxy', 1);

  // ============================================================================
  // ROUTES
  // ============================================================================

  // API routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'AMSteel Survey System API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    logger.info('Database connection successful');

    // Create Express app
    const app = createApp();

    // Start listening
    const PORT = config.PORT;

    app.listen(PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode`);
      logger.info(`Server listening on port ${PORT}`);
      logger.info(`API: http://localhost:${PORT}/api`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await db.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await db.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
export default createApp;
