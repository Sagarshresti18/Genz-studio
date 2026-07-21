const { getAudioByUser, createAudio } = require('./audio.queries');

async function listAudio(req, res, next) {
  try { res.json({ success: true, audio: [] }); }
  catch (err) { next(err); }
}

async function generateAudio(req, res, next) {
  try {
    res.status(501).json({ success: false, message: 'Not implemented' });
  } catch (err) { next(err); }
}

module.exports = { listAudio, generateAudio };
