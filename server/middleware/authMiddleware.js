const jwt = require('jsonwebtoken');
const { isSessionValid } = require('../services/redisService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer')) {
    return header.split(' ')[1];
  }
  return null;
}

// Requires a valid JWT AND an active Redis session (supports logout / logout-all).
const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const active = await isSessionValid(token);
    if (!active) {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    req.user = decoded; // { id, iat, exp }
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Populates req.user when a valid token is present, but never blocks guests.
const optionalAuth = (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      req.token = token;
    } catch (err) {
      // treat as guest
    }
  }
  next();
};

// Must run after `protect`. Requires the ADMIN role.
const admin = async (req, res, next) => {
  const { prisma } = require('../config/db');
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user && user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  } catch (e) {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { protect, optionalAuth, admin };
