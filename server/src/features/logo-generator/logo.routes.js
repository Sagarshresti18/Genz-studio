const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listLogos, generateLogo } = require('./logo.controller');

const logoRouter = Router();
logoRouter.use(authenticate);

// GET  /api/logos
logoRouter.get('/', listLogos);

// POST /api/logos/generate
logoRouter.post('/generate', generateLogo);

module.exports = { logoRouter };
