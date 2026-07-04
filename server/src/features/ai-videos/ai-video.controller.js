const { getAiVideosByUser, createAiVideo } = require('./ai-video.queries');

async function listAiVideos(req, res, next) {
  try { res.json({ success: true, videos: await getAiVideosByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function generateAiVideo(req, res, next) {
  try {
    const { prompt, duration, style } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    const video = await createAiVideo(req.user.id, { prompt, duration, style });
    res.status(201).json({ success: true, video });
  } catch (err) { next(err); }
}

module.exports = { listAiVideos, generateAiVideo };
