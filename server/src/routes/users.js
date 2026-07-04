const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/user.controller');

const userRouter = Router();

// GET  /api/users/me
userRouter.get('/me', authenticate, getMe);

// PATCH /api/users/me
userRouter.patch('/me', authenticate, updateMe);

module.exports = { userRouter };
