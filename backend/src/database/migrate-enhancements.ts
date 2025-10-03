/**
 * Database Enhancement Migration Script
 * Applies additional tables, indexes, views, and triggers to enhance the survey system
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import db from '../config/database';
import logger from '../utils/logger';

async function runEnhancementMigration() {
  try {
    logger.info('Starting database enhancement migration...');

    // Read the enhancement SQL file
    const enhancementSQLPath = join(__dirname, 'enhancements.sql');
    const enhancementSQL = readFileSync(enhancementSQLPath, 'utf8');

    // Execute the enhancement SQL
    logger.info('Executing enhancement SQL...');
    await db.query(enhancementSQL);

    logger.info('✅ Database enhancements applied successfully!');
    logger.info('');
    logger.info('Enhanced features include:');
    logger.info('  - Survey Templates');
    logger.info('  - Survey Notifications & Reminders');
    logger.info('  - Pre-calculated Analytics');
    logger.info('  - Survey Comments & Collaboration');
    logger.info('  - Question Statistics');
    logger.info('  - Survey Sharing & Access Control');
    logger.info('  - Response Attachments');
    logger.info('  - Survey Tags & Organization');
    logger.info('  - Response Quality Scoring');
    logger.info('  - Survey Version History');
    logger.info('  - Scheduled Reports');
    logger.info('  - Automated Triggers & Functions');
    logger.info('  - Performance Views');

    // Verify all tables were created
    const tablesResult = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    logger.info('');
    logger.info(`Total tables in database: ${tablesResult.rows.length}`);
    logger.info('Tables:');
    tablesResult.rows.forEach((row: any) => {
      logger.info(`  - ${row.table_name}`);
    });

    // Verify views were created
    const viewsResult = await db.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    logger.info('');
    logger.info(`Total views in database: ${viewsResult.rows.length}`);
    logger.info('Views:');
    viewsResult.rows.forEach((row: any) => {
      logger.info(`  - ${row.table_name}`);
    });

    // Verify triggers were created
    const triggersResult = await db.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY trigger_name
    `);

    logger.info('');
    logger.info(`Total triggers in database: ${triggersResult.rows.length}`);
    logger.info('Triggers:');
    triggersResult.rows.forEach((row: any) => {
      logger.info(`  - ${row.trigger_name} on ${row.event_object_table}`);
    });

  } catch (error) {
    logger.error('❌ Enhancement migration failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  runEnhancementMigration()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runEnhancementMigration;
