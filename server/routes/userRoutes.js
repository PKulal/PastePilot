const express = require('express');
const router = express.Router();
const { updateProfile, updateSettings, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/password', protect, changePassword);

module.exports = router;
