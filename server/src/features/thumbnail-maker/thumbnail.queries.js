const { getDatabasePool } = require('../../config/database');

async function getThumbnailsByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM thumbnails WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createThumbnail(userId, { prompt, title, outputUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO thumbnails (user_id, prompt, title, output_url, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, prompt, title, outputUrl]
  );
  return rows[0];
}

module.exports = { getThumbnailsByUser, createThumbnail };
