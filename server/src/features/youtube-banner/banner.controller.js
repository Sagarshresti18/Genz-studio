const { getBannersByUser, createBanner } = require('./banner.queries');

async function listBanners(req, res, next) {
  try { res.json({ success: true, banners: await getBannersByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function generateBanner(req, res, next) {
  try {
    const { prompt, channelName } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    const banner = await createBanner(req.user.id, { prompt, channelName, outputUrl: null });
    res.status(201).json({ success: true, banner });
  } catch (err) { next(err); }
}

module.exports = { listBanners, generateBanner };
