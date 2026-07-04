// ── Auth SQL Queries ──────────────────────────────────────────
const { getDatabasePool } = require('../config/database');

async function findUserByEmail(email) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    'SELECT id, full_name, email, avatar_url, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createUser(fullName, email, passwordHash) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, full_name, email, created_at`,
    [fullName, email, passwordHash]
  );
  return rows[0];
}

async function updateRefreshToken(userId, tokenHash) {
  const pool = getDatabasePool();
  await pool.query(
    'UPDATE users SET refresh_token_hash = $1 WHERE id = $2',
    [tokenHash, userId]
  );
}

module.exports = { findUserByEmail, findUserById, createUser, updateRefreshToken };
