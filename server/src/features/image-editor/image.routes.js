const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listEdits, processImage } = require('./image.controller');

const imageRouter = Router();
imageRouter.use(authenticate);
imageRouter.get('/', listEdits);
imageRouter.post('/process', processImage);

module.exports = { imageRouter };
