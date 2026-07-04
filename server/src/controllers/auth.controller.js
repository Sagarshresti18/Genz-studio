const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { findUserByEmail, createUser, updateRefreshToken } = require('../queries/auth.queries');

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(fullName, email, passwordHash);

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await updateRefreshToken(user.id, refreshHash);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, accessToken, user: { id: user.id, fullName: user.full_name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await updateRefreshToken(user.id, refreshHash);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, accessToken, user: { id: user.id, fullName: user.full_name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

module.exports = { register, login, logout };
