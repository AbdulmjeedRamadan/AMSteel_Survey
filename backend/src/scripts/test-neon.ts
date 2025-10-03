/**
 * Neon Database Connection Test Script
 *
 * This script tests the Neon Serverless database connection
 * and verifies basic functionality
 *
 * Usage: npx ts-node src/scripts/test-neon.ts
 */

import neonDb from '../config/neon-database';
import config from '../config/env';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testNeonConnection() {
  console.log('\n' + '='.repeat(60));
  log('🧪 Neon Serverless Database Connection Test', colors.blue);
  console.log('='.repeat(60) + '\n');

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Environment Configuration
    log('Test 1: Checking environment configuration...', colors.yellow);
    if (!config.database.url) {
      throw new Error('DATABASE_URL not set in environment');
    }

    if (!config.database.url.includes('neon.tech')) {
      log('⚠️  Warning: DATABASE_URL does not contain neon.tech', colors.yellow);
      log('   Are you sure you are using Neon Serverless?', colors.yellow);
    }

    log('✅ Environment configuration OK', colors.green);
    testsPassed++;
    console.log('');

    // Test 2: Basic Connection
    log('Test 2: Testing basic database connection...', colors.yellow);
    const isConnected = await neonDb.checkConnection();

    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    log('✅ Database connection successful', colors.green);
    testsPassed++;
    console.log('');

    // Test 3: PostgreSQL Version
    log('Test 3: Checking PostgreSQL version...', colors.yellow);
    const versionResult = await neonDb.query('SELECT version()');
    const version = versionResult.rows[0].version;

    log(`   PostgreSQL Version: ${version}`, colors.blue);
    log('✅ Version query successful', colors.green);
    testsPassed++;
    console.log('');

    // Test 4: Current Time
    log('Test 4: Testing NOW() function...', colors.yellow);
    const timeResult = await neonDb.query('SELECT NOW() as current_time');
    const currentTime = timeResult.rows[0].current_time;

    log(`   Server Time: ${currentTime}`, colors.blue);
    log('✅ NOW() function works', colors.green);
    testsPassed++;
    console.log('');

    // Test 5: Pool Statistics
    log('Test 5: Checking connection pool stats...', colors.yellow);
    const poolStats = neonDb.getPoolStats();

    log(`   Total Connections: ${poolStats.totalCount}`, colors.blue);
    log(`   Idle Connections: ${poolStats.idleCount}`, colors.blue);
    log(`   Waiting Requests: ${poolStats.waitingCount}`, colors.blue);
    log('✅ Pool statistics retrieved', colors.green);
    testsPassed++;
    console.log('');

    // Test 6: Database Existence
    log('Test 6: Checking if database exists...', colors.yellow);
    const dbResult = await neonDb.query(
      'SELECT current_database() as database_name'
    );
    const dbName = dbResult.rows[0].database_name;

    log(`   Current Database: ${dbName}`, colors.blue);
    log('✅ Database exists and accessible', colors.green);
    testsPassed++;
    console.log('');

    // Test 7: Table Check
    log('Test 7: Checking for AMSteel Survey tables...', colors.yellow);
    const tablesResult = await neonDb.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);

    if (tables.length === 0) {
      log('⚠️  No tables found - database might be empty', colors.yellow);
      log('   Run migrations: npm run migrate:up', colors.yellow);
    } else {
      log(`   Found ${tables.length} tables:`, colors.blue);
      tables.forEach((table: string) => {
        log(`   - ${table}`, colors.blue);
      });

      // Check for required tables
      const requiredTables = [
        'users',
        'surveys',
        'questions',
        'responses',
        'answers',
        'survey_target_employees',
        'activity_logs',
      ];

      const missingTables = requiredTables.filter(
        (table) => !tables.includes(table)
      );

      if (missingTables.length > 0) {
        log(`   ⚠️  Missing tables: ${missingTables.join(', ')}`, colors.yellow);
        log('   Run migrations: npm run migrate:up', colors.yellow);
      } else {
        log('   ✅ All required tables found', colors.green);
      }
    }

    log('✅ Table check complete', colors.green);
    testsPassed++;
    console.log('');

    // Test 8: Transaction Test
    log('Test 8: Testing transaction support...', colors.yellow);
    await neonDb.transaction(async (client) => {
      await client.query('SELECT 1 as test');
      // Transaction will be committed automatically
    });

    log('✅ Transaction test passed', colors.green);
    testsPassed++;
    console.log('');

    // Test 9: Parameterized Query
    log('Test 9: Testing parameterized queries...', colors.yellow);
    const paramResult = await neonDb.query('SELECT $1::text as test_param', [
      'Hello from Neon!',
    ]);
    const testParam = paramResult.rows[0].test_param;

    log(`   Result: ${testParam}`, colors.blue);
    log('✅ Parameterized query works', colors.green);
    testsPassed++;
    console.log('');

    // Test 10: Performance Test
    log('Test 10: Testing query performance...', colors.yellow);
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await neonDb.query('SELECT 1');
    }

    const duration = Date.now() - startTime;
    const avgTime = duration / 10;

    log(`   10 queries executed in ${duration}ms`, colors.blue);
    log(`   Average query time: ${avgTime.toFixed(2)}ms`, colors.blue);

    if (avgTime < 50) {
      log('   ⚡ Excellent performance!', colors.green);
    } else if (avgTime < 100) {
      log('   ✅ Good performance', colors.green);
    } else {
      log('   ⚠️  Slower than expected', colors.yellow);
    }

    log('✅ Performance test complete', colors.green);
    testsPassed++;
    console.log('');

  } catch (error: any) {
    testsFailed++;
    log(`\n❌ Test failed: ${error.message}`, colors.red);
    console.error('\nError details:', error);
  } finally {
    // Close connection pool
    try {
      await neonDb.closePool();
      log('\n✅ Connection pool closed', colors.green);
    } catch (error) {
      log('\n⚠️  Error closing connection pool', colors.yellow);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('📊 Test Summary', colors.blue);
  console.log('='.repeat(60));
  log(`✅ Tests Passed: ${testsPassed}`, colors.green);
  log(`❌ Tests Failed: ${testsFailed}`, testsFailed > 0 ? colors.red : colors.green);
  console.log('='.repeat(60) + '\n');

  if (testsFailed === 0) {
    log('🎉 All tests passed! Neon database is ready to use!', colors.green);
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please check the configuration.', colors.red);
    process.exit(1);
  }
}

// Run the test
testNeonConnection().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
