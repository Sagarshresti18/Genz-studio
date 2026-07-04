const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listBanners, generateBanner } = require('./banner.controller');

const bannerRouter = Router();
bannerRouter.use(authenticate);
bannerRouter.get('/', listBanners);
bannerRouter.post('/generate', generateBanner);

module.exports = { bannerRouter };
