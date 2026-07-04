const { searchTracks, getFavoritesByUser } = require('./music.queries');

async function listTracks(req, res, next) {
  try {
    const { genre, mood, bpm } = req.query;
    const tracks = await searchTracks({ genre, mood, bpm: bpm ? parseInt(bpm) : null });
    res.json({ success: true, tracks });
  } catch (err) { next(err); }
}

async function listFavorites(req, res, next) {
  try { res.json({ success: true, favorites: await getFavoritesByUser(req.user.id) }); }
  catch (err) { next(err); }
}

module.exports = { listTracks, listFavorites };
