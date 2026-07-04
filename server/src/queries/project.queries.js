// ── Project SQL Queries ───────────────────────────────────────
const { getDatabasePool } = require('../config/database');

async function getProjectsByUser(userId) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    `SELECT id, name, status, thumbnail_url, created_at, updated_at
     FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

async function getProjectById(projectId, userId) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return rows[0] || null;
}

async function createProject(userId, name, status = 'draft') {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    `INSERT INTO projects (user_id, name, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
    [userId, name, status]
  );
  return rows[0];
}

async function updateProject(projectId, userId, fields) {
  const pool = getDatabasePool();
  const { rows } = await pool.query(
    `UPDATE projects SET name = COALESCE($1, name), status = COALESCE($2, status), updated_at = NOW()
     WHERE id = $3 AND user_id = $4 RETURNING *`,
    [fields.name, fields.status, projectId, userId]
  );
  return rows[0] || null;
}

async function deleteProject(projectId, userId) {
  const pool = getDatabasePool();
  const { rowCount } = await pool.query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return rowCount > 0;
}

module.exports = { getProjectsByUser, getProjectById, createProject, updateProject, deleteProject };
