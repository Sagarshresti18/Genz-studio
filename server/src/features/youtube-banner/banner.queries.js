const { getDatabasePool } = require('../../config/database');

async function getBannersByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM youtube_banners WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createBanner(userId, { prompt, channelName, outputUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO youtube_banners (user_id, prompt, channel_name, output_url, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, prompt, channelName, outputUrl]
  );
  return rows[0];
}

module.exports = { getBannersByUser, createBanner };
