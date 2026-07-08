const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listTracks, listFavorites } = require('./music.controller');
const { searchYouTube } = require('./youtube.controller');

const musicRouter = Router();
musicRouter.get('/youtube/search', searchYouTube);

musicRouter.use(authenticate);
musicRouter.get('/', listTracks);
musicRouter.get('/favorites', listFavorites);

module.exports = { musicRouter };
