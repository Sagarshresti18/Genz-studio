const { getLogosByUser, createLogo } = require('./logo.queries');

async function listLogos(req, res, next) {
  try {
    const logos = await getLogosByUser(req.user.id);
    res.json({ success: true, logos });
  } catch (err) { next(err); }
}

async function generateLogo(req, res, next) {
  try {
    const { prompt, style } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    // TODO: call AI service, store result
    const logo = await createLogo(req.user.id, { prompt, style: style || 'modern', outputUrl: null });
    res.status(201).json({ success: true, logo });
  } catch (err) { next(err); }
}

module.exports = { listLogos, generateLogo };
