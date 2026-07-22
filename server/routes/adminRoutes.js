const express = require('express');
const router = express.Router();
const {
  getStats, listUsers, updateUserRole, deleteUser,
  listPastes, deletePaste, listReports, resolveReport,
  listAnnouncements, createAnnouncement, deleteAnnouncement,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Every admin route requires an authenticated ADMIN
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/pastes', listPastes);
router.delete('/pastes/:id', deletePaste);
router.get('/reports', listReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
