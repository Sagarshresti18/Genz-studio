const { Router } = require('express');
const { register, login, logout } = require('../controllers/auth.controller');

const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', register);

// POST /api/auth/login
authRouter.post('/login', login);

// POST /api/auth/logout
authRouter.post('/logout', logout);

module.exports = { authRouter };
