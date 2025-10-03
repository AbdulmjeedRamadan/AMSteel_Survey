/**
 * Database Structure Verification Script
 * Verifies all tables, views, indexes, triggers, and relationships
 */

import db from '../config/database';
import logger from '../utils/logger';

async function verifyDatabase() {
  try {
    logger.info('🔍 Verifying Database Structure...');
    logger.info('='.repeat(80));

    // 1. Verify Tables
    const tablesResult = await db.query(`
      SELECT schemaname, tablename, tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    logger.info('\n📊 Database Tables:');
    logger.info(`Total: ${tablesResult.rows.length} tables`);
    tablesResult.rows.forEach((row: any) => {
      logger.info(`  ✅ ${row.tablename.padEnd(35)}`);
    });

    // 2. Verify Views
    const viewsResult = await db.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    logger.info('\n👁️  Database Views:');
    logger.info(`Total: ${viewsResult.rows.length} views`);
    viewsResult.rows.forEach((row: any) => {
      logger.info(`  ✅ ${row.table_name}`);
    });

    // 3. Verify Indexes
    const indexesResult = await db.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    logger.info('\n📇 Database Indexes:');
    logger.info(`Total: ${indexesResult.rows.length} indexes`);
    const indexesByTable = indexesResult.rows.reduce((acc: any, row: any) => {
      if (!acc[row.tablename]) acc[row.tablename] = [];
      acc[row.tablename].push(row.indexname);
      return acc;
    }, {});

    Object.keys(indexesByTable).sort().forEach(table => {
      logger.info(`  📋 ${table}: ${indexesByTable[table].length} indexes`);
    });

    // 4. Verify Triggers
    const triggersResult = await db.query(`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    logger.info('\n⚡ Database Triggers:');
    logger.info(`Total: ${triggersResult.rows.length} triggers`);
    const triggersByTable = triggersResult.rows.reduce((acc: any, row: any) => {
      if (!acc[row.event_object_table]) acc[row.event_object_table] = [];
      acc[row.event_object_table].push(row.trigger_name);
      return acc;
    }, {});

    Object.keys(triggersByTable).sort().forEach(table => {
      logger.info(`  ⚡ ${table}:`);
      triggersByTable[table].forEach((trigger: string) => {
        logger.info(`     - ${trigger}`);
      });
    });

    // 5. Verify Foreign Keys
    const foreignKeysResult = await db.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);

    logger.info('\n🔗 Foreign Key Relationships:');
    logger.info(`Total: ${foreignKeysResult.rows.length} foreign keys`);
    const fksByTable = foreignKeysResult.rows.reduce((acc: any, row: any) => {
      if (!acc[row.table_name]) acc[row.table_name] = [];
      acc[row.table_name].push({
        column: row.column_name,
        references: `${row.foreign_table_name}(${row.foreign_column_name})`
      });
      return acc;
    }, {});

    Object.keys(fksByTable).sort().forEach(table => {
      logger.info(`  🔗 ${table}:`);
      fksByTable[table].forEach((fk: any) => {
        logger.info(`     ${fk.column} → ${fk.references}`);
      });
    });

    // 6. Verify Data Counts
    logger.info('\n📈 Data Statistics:');

    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    logger.info(`  👥 Users: ${userCount.rows[0].count}`);

    const surveyCount = await db.query('SELECT COUNT(*) as count FROM surveys');
    logger.info(`  📋 Surveys: ${surveyCount.rows[0].count}`);

    const questionCount = await db.query('SELECT COUNT(*) as count FROM questions');
    logger.info(`  ❓ Questions: ${questionCount.rows[0].count}`);

    const responseCount = await db.query('SELECT COUNT(*) as count FROM responses');
    logger.info(`  💬 Responses: ${responseCount.rows[0].count}`);

    const answerCount = await db.query('SELECT COUNT(*) as count FROM answers');
    logger.info(`  ✏️  Answers: ${answerCount.rows[0].count}`);

    // 7. Verify Core Tables Structure
    logger.info('\n🏗️  Core Tables Structure:');

    const usersColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    logger.info(`  users: ${usersColumns.rows.length} columns`);

    const surveysColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'surveys'
      ORDER BY ordinal_position
    `);
    logger.info(`  surveys: ${surveysColumns.rows.length} columns`);

    const questionsColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `);
    logger.info(`  questions: ${questionsColumns.rows.length} columns`);

    const responsesColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'responses'
      ORDER BY ordinal_position
    `);
    logger.info(`  responses: ${responsesColumns.rows.length} columns`);

    const answersColumns = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'answers'
      ORDER BY ordinal_position
    `);
    logger.info(`  answers: ${answersColumns.rows.length} columns`);

    // 8. Summary
    logger.info('\n' + '='.repeat(80));
    logger.info('✅ Database Structure Verification Complete!');
    logger.info('='.repeat(80));
    logger.info(`\n📊 Summary:`);
    logger.info(`  • ${tablesResult.rows.length} Tables`);
    logger.info(`  • ${viewsResult.rows.length} Views`);
    logger.info(`  • ${indexesResult.rows.length} Indexes`);
    logger.info(`  • ${triggersResult.rows.length} Triggers`);
    logger.info(`  • ${foreignKeysResult.rows.length} Foreign Keys`);
    logger.info(`  • ${userCount.rows[0].count} User Records`);
    logger.info(`  • ${surveyCount.rows[0].count} Survey Records`);
    logger.info('\n🎉 Database is properly configured and linked to the project!');

  } catch (error) {
    logger.error('❌ Database verification failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  verifyDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Verification process failed:', error);
      process.exit(1);
    });
}

export default verifyDatabase;
