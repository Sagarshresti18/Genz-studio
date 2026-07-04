const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listAudio, generateAudio } = require('./audio.controller');

const audioRouter = Router();
audioRouter.use(authenticate);
audioRouter.get('/', listAudio);
audioRouter.post('/generate', generateAudio);

module.exports = { audioRouter };
