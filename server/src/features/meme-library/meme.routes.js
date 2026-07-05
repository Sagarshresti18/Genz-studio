const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listTemplates, listMyMemes, remixMeme, generateAiCaption, generateAiBackground, removeMeme, proxyImage, generateTemplateImage } = require('./meme.controller');

const memeRouter = Router();

// Templates are public — no auth needed for browsing
memeRouter.get('/templates', listTemplates);
// Proxy for remote images
memeRouter.get('/proxy', proxyImage);
// Generate a template image on demand (requires GEMINI_API_KEY in server .env)
memeRouter.get('/generated', generateTemplateImage);

// These require auth
memeRouter.use(authenticate);
memeRouter.get('/mine', listMyMemes);
memeRouter.post('/remix', remixMeme);
memeRouter.post('/ai-caption', generateAiCaption);
memeRouter.post('/ai-background', generateAiBackground);
memeRouter.delete('/:id', removeMeme);

module.exports = { memeRouter };
