const { getEditsByUser, createEdit } = require('./image.queries');

async function listEdits(req, res, next) {
  try { res.json({ success: true, edits: await getEditsByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function processImage(req, res, next) {
  try {
    const { originalUrl, operations } = req.body;
    if (!originalUrl) return res.status(400).json({ success: false, message: 'Image URL is required' });
    const edit = await createEdit(req.user.id, { originalUrl, operations: operations || [], outputUrl: null });
    res.status(201).json({ success: true, edit });
  } catch (err) { next(err); }
}

module.exports = { listEdits, processImage };
