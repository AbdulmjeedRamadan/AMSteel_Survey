/**
 * Neon Serverless Database Configuration
 * Optimized for serverless environments with connection pooling
 *
 * @neondatabase/serverless provides:
 * - WebSocket-based connections for serverless
 * - Automatic connection pooling
 * - Sub-100ms cold start times
 * - Full PostgreSQL compatibility
 */

import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import config from './env';
import logger from '../utils/logger';

// Import ws for WebSocket support (required for Neon)
let ws: any;
try {
  ws = require('ws');
  neonConfig.webSocketConstructor = ws;
} catch (error) {
  logger.warn('WebSocket library not found. Install ws package for better performance.');
}

// Get connection string from environment
const connectionString = config.database.url;

/**
 * Neon SQL function for one-off queries
 * Best for simple queries that don't need transactions
 *
 * Usage:
 * const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
 */
export const sql = neon(connectionString);

/**
 * Connection pool for complex queries and transactions
 * Manages connections efficiently for serverless environments
 */
export const pool = new Pool({
  connectionString,
  max: 20,                        // Maximum number of connections
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
  connectionTimeoutMillis: 60000, // Connection timeout 60s
});

/**
 * Execute a parameterized query
 * Automatically manages connection from pool
 *
 * @param text - SQL query string with $1, $2, etc. placeholders
 * @param params - Array of parameter values
 * @returns Query result
 *
 * @example
 * const result = await query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
 */
export async function query(
  text: string,
  params?: any[]
): Promise<any> {
  const startTime = Date.now();
  const client = await pool.connect();

  try {
    const result = await client.query(text, params);
    const duration = Date.now() - startTime;

    // Log slow queries (>1 second)
    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
    }

    // Log queries in development
    if (config.NODE_ENV === 'development' && duration > 100) {
      logger.info(`Query executed in ${duration}ms: ${text.substring(0, 80)}...`);
    }

    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    logger.error('Query:', text);
    logger.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute multiple queries in a transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 *
 * @param callback - Async function that receives a database client
 * @returns Result from callback function
 *
 * @example
 * const result = await transaction(async (client) => {
 *   await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [100, userId]);
 *   await client.query('INSERT INTO transactions (user_id, amount) VALUES ($1, $2)', [userId, 100]);
 *   return { success: true };
 * });
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    logger.info('Transaction started');

    const result = await callback(client);

    await client.query('COMMIT');
    logger.info('Transaction committed');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connection health
 * Useful for health check endpoints
 *
 * @returns true if connection is healthy, false otherwise
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    logger.info('Database connection check: OK');
    return !!result;
  } catch (error) {
    logger.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get current database statistics
 * Useful for monitoring
 *
 * @returns Object with connection pool stats
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close all database connections
 * Call this on application shutdown
 */
export async function closePool(): Promise<void> {
  try {
    logger.info('Closing database connection pool...');
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
}

/**
 * Execute a raw SQL query using Neon's optimized sql function
 * Best for read-only queries
 *
 * @param sqlQuery - SQL template literal
 * @returns Query result
 *
 * @example
 * const users = await executeSql`SELECT * FROM users WHERE role = ${'admin'}`;
 */
export async function executeSql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<any> {
  try {
    return await sql(strings, ...values);
  } catch (error) {
    logger.error('SQL execution error:', error);
    throw error;
  }
}

// Export all functions
export default {
  sql,
  pool,
  query,
  transaction,
  checkConnection,
  getPoolStats,
  closePool,
  executeSql,
};
