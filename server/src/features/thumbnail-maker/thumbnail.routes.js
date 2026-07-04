const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listThumbnails, generateThumbnail } = require('./thumbnail.controller');

const thumbnailRouter = Router();
thumbnailRouter.use(authenticate);
thumbnailRouter.get('/', listThumbnails);
thumbnailRouter.post('/generate', generateThumbnail);

module.exports = { thumbnailRouter };
