import fs from 'fs';
import path from 'path';
import db from '../config/database';
import logger from '../utils/logger';

/**
 * Database migration script
 * Creates all tables and indexes from schema.sql
 */
async function migrate(): Promise<void> {
  try {
    logger.info('Starting database migration...');

    // Test database connection first
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    logger.info('Executing schema.sql...');

    // Execute schema SQL
    await db.query(schema);

    logger.info('Database migration completed successfully');
    logger.info('All tables, indexes, and constraints have been created');

    // Verify tables were created
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    logger.info('Created tables:', {
      count: result.rows.length,
      tables: result.rows.map((row: any) => row.table_name),
    });

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Rollback migration - drops all tables
 * WARNING: This will delete all data!
 */
async function rollback(): Promise<void> {
  try {
    logger.warn('Starting database rollback...');
    logger.warn('This will delete all tables and data!');

    await db.query(`
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS answers CASCADE;
      DROP TABLE IF EXISTS responses CASCADE;
      DROP TABLE IF EXISTS survey_target_employees CASCADE;
      DROP TABLE IF EXISTS questions CASCADE;
      DROP TABLE IF EXISTS surveys CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `);

    logger.info('Database rollback completed');
    logger.info('All tables have been dropped');

  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
}

/**
 * Check migration status
 */
async function status(): Promise<void> {
  try {
    const result = await db.query(`
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    if (result.rows.length === 0) {
      logger.info('No tables found. Database needs migration.');
    } else {
      logger.info('Database status:', {
        tables: result.rows.length,
        details: result.rows,
      });
    }

  } catch (error) {
    logger.error('Status check failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'up':
          await migrate();
          break;
        case 'down':
          await rollback();
          break;
        case 'status':
          await status();
          break;
        default:
          logger.info('Usage: npm run migrate [up|down|status]');
          logger.info('  up     - Run migrations');
          logger.info('  down   - Rollback migrations');
          logger.info('  status - Check migration status');
      }
      await db.close();
      process.exit(0);
    } catch (error) {
      logger.error('Command failed:', error);
      await db.close();
      process.exit(1);
    }
  };

  runCommand();
}

export { migrate, rollback, status };
