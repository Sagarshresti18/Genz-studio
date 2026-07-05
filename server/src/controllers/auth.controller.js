const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { isDatabaseConfigured } = require('../config/database');

// ── Dev-mode demo user (no DB needed) ─────────────────────────
const DEV_USER = {
  id: 'dev-user-001',
  full_name: 'Demo Creator',
  email: 'demo@genzstudio.dev',
  password_hash: null, // set lazily
};

async function getDevPasswordHash() {
  if (!DEV_USER.password_hash) {
    DEV_USER.password_hash = await bcrypt.hash('demo123', 10);
  }
  return DEV_USER.password_hash;
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '24h' });
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

    // Dev mode — no DB
    if (!isDatabaseConfigured()) {
      const user = { id: `dev-${Date.now()}`, full_name: fullName, email };
      const accessToken = signAccessToken({ id: user.id, email });
      return res.status(201).json({
        success: true, accessToken,
        user: { id: user.id, fullName: user.full_name, email },
        _dev: true,
      });
    }

    const { findUserByEmail, createUser, updateRefreshToken } = require('../queries/auth.queries');
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(fullName, email, passwordHash);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await updateRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, accessToken, user: { id: user.id, fullName: user.full_name, email: user.email } });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Dev mode — accept demo credentials or any email/password
    if (!isDatabaseConfigured()) {
      const user = { id: `dev-${email.replace(/[^a-z0-9]/gi, '')}`, full_name: 'Demo Creator', email };
      const accessToken = signAccessToken({ id: user.id, email });
      return res.json({
        success: true, accessToken,
        user: { id: user.id, fullName: user.full_name, email },
        _dev: true,
      });
    }

    const { findUserByEmail, updateRefreshToken } = require('../queries/auth.queries');
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await updateRefreshToken(user.id, await bcrypt.hash(refreshToken, 10));

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, accessToken, user: { id: user.id, fullName: user.full_name, email: user.email } });
  } catch (err) { next(err); }
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

module.exports = { register, login, logout };
