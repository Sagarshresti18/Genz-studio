const { getDatabasePool } = require('../../config/database');

async function searchTracks({ genre, mood, bpm, limit = 20, offset = 0 }) {
  const { rows } = await getDatabasePool().query(
    `SELECT * FROM music_tracks
     WHERE ($1::text IS NULL OR genre = $1)
       AND ($2::text IS NULL OR mood = $2)
       AND ($3::int IS NULL OR bpm BETWEEN $3 - 10 AND $3 + 10)
     ORDER BY plays DESC LIMIT $4 OFFSET $5`,
    [genre || null, mood || null, bpm || null, limit, offset]
  );
  return rows;
}

async function getFavoritesByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT t.* FROM music_tracks t JOIN music_favorites f ON t.id = f.track_id WHERE f.user_id = $1',
    [userId]
  );
  return rows;
}

module.exports = { searchTracks, getFavoritesByUser };
