const { Pool } = require('pg');

const { env } = require('./env');

let pool;

function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

function getDatabasePool() {
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

async function checkDatabaseConnection() {
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

async function closeDatabasePool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}

module.exports = {
  isDatabaseConfigured,
  getDatabasePool,
  checkDatabaseConnection,
  closeDatabasePool,
};