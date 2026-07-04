const { getAudioByUser, createAudio } = require('./audio.queries');

async function listAudio(req, res, next) {
  try { res.json({ success: true, audio: await getAudioByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function generateAudio(req, res, next) {
  try {
    const { text, voice, type } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });
    const audio = await createAudio(req.user.id, { text, voice, type });
    res.status(201).json({ success: true, audio });
  } catch (err) { next(err); }
}

module.exports = { listAudio, generateAudio };
