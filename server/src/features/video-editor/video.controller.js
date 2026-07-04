const { getVideosByUser, createVideoProject } = require('./video.queries');

async function listVideos(req, res, next) {
  try { res.json({ success: true, videos: await getVideosByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function createProject(req, res, next) {
  try {
    const { name, sourceUrl } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });
    const video = await createVideoProject(req.user.id, { name, sourceUrl });
    res.status(201).json({ success: true, video });
  } catch (err) { next(err); }
}

module.exports = { listVideos, createProject };
