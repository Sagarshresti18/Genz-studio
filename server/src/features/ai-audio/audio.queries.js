const { getDatabasePool } = require('../../config/database');

async function getAudioByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM ai_audio WHERE user_id = $1 ORDER BY created_at DESC', [userId]
  );
  return rows;
}

async function createAudio(userId, { text, voice, type }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO ai_audio (user_id, text, voice, type, output_url, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *',
    [userId, text, voice || 'neutral', type || 'voiceover', null]
  );
  return rows[0];
}

module.exports = { getAudioByUser, createAudio };
