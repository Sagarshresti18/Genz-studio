const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listTracks, listFavorites } = require('./music.controller');

const musicRouter = Router();
musicRouter.use(authenticate);
musicRouter.get('/', listTracks);
musicRouter.get('/favorites', listFavorites);

module.exports = { musicRouter };
