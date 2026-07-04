const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listVideos, createProject } = require('./video.controller');

const videoRouter = Router();
videoRouter.use(authenticate);
videoRouter.get('/', listVideos);
videoRouter.post('/', createProject);

module.exports = { videoRouter };
