const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../config/db');
const { addSession, removeSession, removeAllSessions } = require('../services/redisService');
const { isValidEmail, passwordError, required } = require('../utils/validators');
const { logActivity } = require('../utils/activity');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (id, remember = false) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: remember ? '30d' : '7d' });

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

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!required(name)) return res.status(400).json({ message: 'Name is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'A valid email is required' });
    const pwErr = passwordError(password);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({ data: { name, email, passwordHash } });

    const token = generateToken(user.id, true);
    await addSession(token, user.id);
    logActivity(user.id, 'REGISTER', 'Account created');

    res.status(201).json({ ...publicUser(user), token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password, remember } = req.body;
  try {
    if (!isValidEmail(email)) return res.status(400).json({ message: 'A valid email is required' });
    if (!required(password)) return res.status(400).json({ message: 'Password is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const token = generateToken(user.id, !!remember);
      await addSession(token, user.id);
      logActivity(user.id, 'LOGIN', 'Signed in');
      return res.json({ ...publicUser(user), token });
    }
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout current device
const logout = async (req, res) => {
  try {
    await removeSession(req.token, req.user.id);
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    await removeAllSessions(req.user.id);
    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Issue a fresh token from an existing valid session
const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user.id, true);
    await addSession(token, req.user.id);
    await removeSession(req.token, req.user.id); // rotate
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password — generates a reset token. In production this would be emailed;
// for this build the token is returned so the reset flow can be completed.
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid leaking which emails exist.
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: hashed, passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) },
    });

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      resetToken: rawToken, // dev convenience (no email service configured)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!required(token)) return res.status(400).json({ message: 'Reset token is required' });
    const pwErr = passwordError(password);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashed, passwordResetExpires: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpires: null },
    });
    await removeAllSessions(user.id); // force re-login everywhere
    logActivity(user.id, 'RESET_PASSWORD', 'Password reset');

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  logoutAll,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
};
