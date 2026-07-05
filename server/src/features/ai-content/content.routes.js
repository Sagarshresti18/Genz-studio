const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listContent, generateContent, removeContent, getMetadata } = require('./content.controller');

const contentRouter = Router();

// Metadata is public
contentRouter.get('/metadata', getMetadata);

// These require auth
contentRouter.use(authenticate);
contentRouter.get('/', listContent);
contentRouter.post('/generate', generateContent);
contentRouter.delete('/:id', removeContent);

module.exports = { contentRouter };
