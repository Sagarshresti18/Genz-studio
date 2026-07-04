const { getDatabasePool } = require('../../config/database');

async function getAiVideosByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM ai_videos WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createAiVideo(userId, { prompt, duration, style }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO ai_videos (user_id, prompt, duration, style, status, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
    [userId, prompt, duration || 15, style || 'cinematic', 'queued']
  );
  return rows[0];
}

module.exports = { getAiVideosByUser, createAiVideo };
