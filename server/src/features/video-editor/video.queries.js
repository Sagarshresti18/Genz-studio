const { getDatabasePool } = require('../../config/database');

async function getVideosByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM video_projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createVideoProject(userId, { name, sourceUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO video_projects (user_id, name, source_url, status, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, name, sourceUrl, 'draft']
  );
  return rows[0];
}

module.exports = { getVideosByUser, createVideoProject };
