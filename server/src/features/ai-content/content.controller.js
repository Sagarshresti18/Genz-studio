const { getContentByUser, createContent } = require('./content.queries');

async function listContent(req, res, next) {
  try { res.json({ success: true, content: await getContentByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function generateContent(req, res, next) {
  try {
    const { prompt, type } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    // TODO: call LLM API
    const content = await createContent(req.user.id, { prompt, type: type || 'script', outputText: null });
    res.status(201).json({ success: true, content });
  } catch (err) { next(err); }
}

module.exports = { listContent, generateContent };
