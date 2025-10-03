import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import config from './env';
import logger from '../utils/logger';

/**
 * PostgreSQL connection pool
 * Automatically uses Neon Serverless if DATABASE_URL contains neon.tech
 * Otherwise uses local PostgreSQL configuration
 */
class Database {
  private pool: Pool;
  private isNeon: boolean;

  constructor() {
    this.isNeon = config.database.url.includes('neon.tech');

    if (this.isNeon) {
      // Use Neon Serverless configuration
      logger.info('🚀 Using Neon Serverless Database');
      this.pool = new Pool({
        connectionString: config.database.url,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
      });
    } else {
      // Use local PostgreSQL configuration
      logger.info('Using Local PostgreSQL Database');
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle database client', err);
    });

    // Log successful connection
    this.pool.on('connect', () => {
      logger.debug('New database client connected to pool');
    });
  }

  /**
   * Execute a query with parameters
   * Uses parameterized queries to prevent SQL injection
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected (${duration}ms): ${text.substring(0, 100)}...`);
      }

      if (config.NODE_ENV === 'development' && duration > 100) {
        logger.debug(`Query executed in ${duration}ms`, {
          text: text.substring(0, 80),
          rows: result.rowCount,
        });
      }

      return result as QueryResult<T>;
    } catch (error) {
      logger.error('Database query error', { text, error });
      throw error;
    }
  }

  /**
   * Get a client from the pool for transaction handling
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute queries within a transaction
   * Automatically commits on success or rolls back on error
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      logger.info('Database connection successful', {
        time: result.rows[0].now,
      });
      return true;
    } catch (error) {
      logger.error('Database connection failed', error);
      return false;
    }
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }
}

// Export singleton instance
export const db = new Database();

export default db;
