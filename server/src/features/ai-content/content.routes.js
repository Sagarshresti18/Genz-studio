const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listContent, generateContent } = require('./content.controller');

const contentRouter = Router();
contentRouter.use(authenticate);
contentRouter.get('/', listContent);
contentRouter.post('/generate', generateContent);

module.exports = { contentRouter };
