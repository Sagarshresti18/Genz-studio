const { getDatabasePool } = require('../../config/database');

async function getMemeTemplates({ category, limit = 20, offset = 0 }) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM meme_templates
     WHERE ($1::text IS NULL OR category = $1)
     ORDER BY uses DESC LIMIT $2 OFFSET $3`,
    [category || null, limit, offset]
  );
  return rows;
}

async function getMemesByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM user_memes WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function createMeme(userId, { templateId, topText, bottomText, outputUrl }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO user_memes (user_id, template_id, top_text, bottom_text, output_url, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
    [userId, templateId, topText, bottomText, outputUrl]
  );
  return rows[0];
}

module.exports = { getMemeTemplates, getMemesByUser, createMeme };
