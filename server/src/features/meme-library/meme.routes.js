const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listTemplates, listMyMemes, remixMeme } = require('./meme.controller');

const memeRouter = Router();
memeRouter.use(authenticate);

// GET  /api/memes/templates
memeRouter.get('/templates', listTemplates);

// GET  /api/memes/mine
memeRouter.get('/mine', listMyMemes);

// POST /api/memes/remix
memeRouter.post('/remix', remixMeme);

module.exports = { memeRouter };
