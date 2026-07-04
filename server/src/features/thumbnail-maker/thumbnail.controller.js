const { getThumbnailsByUser, createThumbnail } = require('./thumbnail.queries');

async function listThumbnails(req, res, next) {
  try { res.json({ success: true, thumbnails: await getThumbnailsByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function generateThumbnail(req, res, next) {
  try {
    const { prompt, title } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    const thumbnail = await createThumbnail(req.user.id, { prompt, title, outputUrl: null });
    res.status(201).json({ success: true, thumbnail });
  } catch (err) { next(err); }
}

module.exports = { listThumbnails, generateThumbnail };
