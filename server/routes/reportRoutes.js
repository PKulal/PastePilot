const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { rateLimit } = require('../middleware/rateLimiter');

// Guests and users can report; rate-limited to prevent abuse
router.post('/', rateLimit(10, 60), optionalAuth, createReport);

module.exports = router;
