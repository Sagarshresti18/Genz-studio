const { getUserProfile, updateUserProfile } = require('../queries/user.queries');

async function getMe(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { fullName, avatarUrl } = req.body;
    const user = await updateUserProfile(req.user.id, { fullName, avatarUrl });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
