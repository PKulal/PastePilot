const express = require('express');
const router = express.Router();
const {
  createPaste, getPaste, unlockPaste, getRecentPublicPastes, getTrending, searchPastes,
  getMyPastes, updatePaste, deletePaste, archivePaste, restorePaste, duplicatePaste,
  downloadPaste, getQrCode, getDashboard,
} = require('../controllers/pasteController');
const { toggleFavorite, getFavorites, isFavorited } = require('../controllers/favoriteController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { rateLimit } = require('../middleware/rateLimiter');

// PRD Redis F4: rate-limit create + search
const createLimiter = rateLimit(30, 60);
const searchLimiter = rateLimit(60, 60);

// Collections & meta (order matters: static paths before :id)
router.get('/recent', getRecentPublicPastes);
router.get('/trending', getTrending);
router.get('/search', searchLimiter, searchPastes);
router.get('/dashboard', protect, getDashboard);

// Favorites
router.get('/favorites', protect, getFavorites);
router.get('/mine', protect, getMyPastes);

// Create
router.post('/', createLimiter, optionalAuth, createPaste);

// Per-paste actions
router.get('/:id/qr', getQrCode);
router.get('/:id/download', optionalAuth, downloadPaste);
router.get('/:id/favorite', protect, isFavorited);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/duplicate', protect, duplicatePaste);
router.post('/:id/unlock', optionalAuth, unlockPaste);
router.post('/:id/archive', protect, archivePaste);
router.post('/:id/restore', protect, restorePaste);
router.put('/:id', protect, updatePaste);
router.delete('/:id', protect, deletePaste);
router.get('/:id', optionalAuth, getPaste);

module.exports = router;
