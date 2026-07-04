const { getDatabasePool } = require('../../config/database');

async function getEditsByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM image_edits WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createEdit(userId, { originalUrl, operations, outputUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO image_edits (user_id, original_url, operations, output_url, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, originalUrl, JSON.stringify(operations), outputUrl]
  );
  return rows[0];
}

module.exports = { getEditsByUser, createEdit };
