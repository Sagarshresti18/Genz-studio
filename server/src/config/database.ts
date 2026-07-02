import { Pool } from 'pg';

import { env } from './env';

let pool: Pool | undefined;

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function getDatabasePool(): Pool {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

export async function checkDatabaseConnection(): Promise<{ configured: boolean; connected: boolean; message: string }> {
  if (!isDatabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      message: 'DATABASE_URL is not set',
    };
  }

  try {
    await getDatabasePool().query('SELECT 1');

    return {
      configured: true,
      connected: true,
      message: 'Database connection is healthy',
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}