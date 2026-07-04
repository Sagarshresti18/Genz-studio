const { getMemeTemplates, getMemesByUser, createMeme } = require('./meme.queries');

async function listTemplates(req, res, next) {
  try {
    const { category } = req.query;
    const templates = await getMemeTemplates({ category });
    res.json({ success: true, templates });
  } catch (err) { next(err); }
}

async function listMyMemes(req, res, next) {
  try {
    res.json({ success: true, memes: await getMemesByUser(req.user.id) });
  } catch (err) { next(err); }
}

async function remixMeme(req, res, next) {
  try {
    const { templateId, topText, bottomText } = req.body;
    if (!templateId) return res.status(400).json({ success: false, message: 'templateId is required' });
    const meme = await createMeme(req.user.id, { templateId, topText, bottomText, outputUrl: null });
    res.status(201).json({ success: true, meme });
  } catch (err) { next(err); }
}

module.exports = { listTemplates, listMyMemes, remixMeme };
