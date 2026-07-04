const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listAiVideos, generateAiVideo } = require('./ai-video.controller');

const aiVideoRouter = Router();
aiVideoRouter.use(authenticate);
aiVideoRouter.get('/', listAiVideos);
aiVideoRouter.post('/generate', generateAiVideo);

module.exports = { aiVideoRouter };
