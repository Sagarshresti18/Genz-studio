const { getDatabasePool } = require('../../config/database');

async function getContentByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM ai_content WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createContent(userId, { prompt, type, outputText }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO ai_content (user_id, prompt, type, output_text, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, prompt, type, outputText]
  );
  return rows[0];
}

module.exports = { getContentByUser, createContent };
