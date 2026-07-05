const { getDatabasePool } = require('../../config/database');

async function getContentByUser(userId, type) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM ai_content WHERE user_id = $1 ${type ? 'AND type = $2' : ''} ORDER BY created_at DESC LIMIT 50`,
    type ? [userId, type] : [userId]
  );
  return rows;
}

async function searchContent(userId, query, type) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM ai_content WHERE user_id = $1
     AND (prompt ILIKE $2 OR output_text ILIKE $2)
     ${type ? 'AND type = $3' : ''}
     ORDER BY created_at DESC LIMIT 50`,
    type ? [userId, `%${query}%`, type] : [userId, `%${query}%`]
  );
  return rows;
}

async function createContent(userId, { prompt, type, tone, outputText }) {
  const { rows } = await getDatabasePool().query(
    `INSERT INTO ai_content (user_id, prompt, type, tone, output_text, created_at)
     VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
    [userId, prompt, type, tone || null, outputText]
  );
  return rows[0];
}

async function deleteContent(userId, id) {
  await getDatabasePool().query(
    'DELETE FROM ai_content WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
}

module.exports = { getContentByUser, searchContent, createContent, deleteContent };
