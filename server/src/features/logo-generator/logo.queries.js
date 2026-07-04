const { getDatabasePool } = require('../../config/database');

async function getLogosByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM logos WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createLogo(userId, { prompt, style, outputUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO logos (user_id, prompt, style, output_url, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *',
    [userId, prompt, style, outputUrl]
  );
  return rows[0];
}

module.exports = { getLogosByUser, createLogo };
