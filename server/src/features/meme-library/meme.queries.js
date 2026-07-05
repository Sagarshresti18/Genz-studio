const { getDatabasePool } = require('../../config/database');

async function getMemeTemplates({ category, limit = 24, offset = 0 }) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM meme_templates
     WHERE ($1::text IS NULL OR category = $1)
     ORDER BY uses DESC, trending DESC LIMIT $2 OFFSET $3`,
    [category || null, limit, offset]
  );
  return rows;
}

async function searchTemplates(query) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM meme_templates WHERE name ILIKE $1 ORDER BY uses DESC LIMIT 24`,
    [`%${query}%`]
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
    `INSERT INTO user_memes (user_id, template_id, top_text, bottom_text, output_url, created_at)
     VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
    [userId, templateId, topText, bottomText, outputUrl]
  );
  return rows[0];
}

async function deleteMeme(userId, id) {
  await getDatabasePool().query(
    'DELETE FROM user_memes WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
}

async function incrementTemplateUses(templateId) {
  try {
    await getDatabasePool().query(
      `UPDATE meme_templates SET uses = uses + 1 WHERE id = $1`,
      [templateId]
    );
  } catch { /* template may not exist in DB if from Imgflip API */ }
}

module.exports = { getMemeTemplates, searchTemplates, getMemesByUser, createMeme, deleteMeme, incrementTemplateUses };
