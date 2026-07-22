const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, logout, logoutAll, refreshToken,
  forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { rateLimit } = require('../middleware/rateLimiter');

// PRD Redis F4: rate-limit the login/register endpoints
const authLimiter = rateLimit(20, 60);

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.post('/refresh', protect, refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
