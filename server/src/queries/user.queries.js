// ── User SQL Queries ──────────────────────────────────────────
const { getDatabasePool } = require('../config/database');

async function getUserProfile(userId) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    'SELECT id, full_name, email, avatar_url, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0] || null;
}

async function updateUserProfile(userId, { fullName, avatarUrl }) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    `UPDATE users SET full_name = COALESCE($1, full_name), avatar_url = COALESCE($2, avatar_url)
     WHERE id = $3 RETURNING id, full_name, email, avatar_url`,
    [fullName, avatarUrl, userId]
  );
  return rows[0] || null;
}

module.exports = { getUserProfile, updateUserProfile };
