const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const { removeAllSessions, cacheDelPattern } = require('../services/redisService');
const { passwordError } = require('../utils/validators');
const { logActivity } = require('../utils/activity');

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
  bio: u.bio,
  theme: u.theme,
  defaultVisibility: u.defaultVisibility,
  defaultExpiration: u.defaultExpiration,
  createdAt: u.createdAt,
});

// Update profile fields (name, avatar, bio)
const updateProfile = async (req, res) => {
  const { name, avatar, bio } = req.body;
  try {
    const data = {};
    if (name !== undefined) data.name = name;
    if (avatar !== undefined) data.avatar = avatar;
    if (bio !== undefined) data.bio = bio;

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    logActivity(req.user.id, 'UPDATE_PROFILE', 'Profile updated');
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update preferences: theme, default visibility, default expiration
const updateSettings = async (req, res) => {
  const { theme, defaultVisibility, defaultExpiration } = req.body;
  try {
    const data = {};
    if (theme !== undefined) data.theme = theme;
    if (defaultVisibility !== undefined) data.defaultVisibility = defaultVisibility;
    if (defaultExpiration !== undefined) data.defaultExpiration = defaultExpiration;

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(currentPassword || '', user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    const pwErr = passwordError(newPassword);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    logActivity(user.id, 'CHANGE_PASSWORD', 'Password changed');
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateProfile, updateSettings, changePassword };
