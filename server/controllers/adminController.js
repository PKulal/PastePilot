const { prisma } = require('../config/db');
const { removeAllSessions, removeFromTrending } = require('../services/redisService');

const AUTHOR_SELECT = { select: { id: true, name: true, email: true } };

/* ------------------------- admin dashboard ------------------------ */
const getStats = async (req, res) => {
  try {
    const [users, pastes, publicPastes, privatePastes, reports, openReports, agg] = await Promise.all([
      prisma.user.count(),
      prisma.paste.count(),
      prisma.paste.count({ where: { visibility: 'PUBLIC' } }),
      prisma.paste.count({ where: { visibility: 'PRIVATE' } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'OPEN' } }),
      prisma.paste.aggregate({ _sum: { currentViews: true } }),
    ]);
    res.json({
      users, pastes, publicPastes, privatePastes,
      reports, openReports, totalViews: agg._sum.currentViews || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------- users ------------------------------- */
const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { pastes: true } } },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    if (!['USER', 'ADMIN'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, role: true } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === req.user.id) return res.status(400).json({ message: 'You cannot delete your own account' });
    // remove dependent records first
    const pastes = await prisma.paste.findMany({ where: { authorId: id }, select: { id: true } });
    const pasteIds = pastes.map((p) => p.id);
    await prisma.favorite.deleteMany({ where: { OR: [{ userId: id }, { pasteId: { in: pasteIds } }] } });
    await prisma.report.deleteMany({ where: { OR: [{ reporterId: id }, { pasteId: { in: pasteIds } }] } });
    await prisma.activityLog.deleteMany({ where: { userId: id } });
    await prisma.paste.deleteMany({ where: { authorId: id } });
    await prisma.user.delete({ where: { id } });
    await removeAllSessions(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------- pastes ------------------------------ */
const listPastes = async (req, res) => {
  try {
    const pastes = await prisma.paste.findMany({
      orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, title: true, visibility: true, status: true, currentViews: true, createdAt: true, author: AUTHOR_SELECT },
    });
    res.json(pastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePaste = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.favorite.deleteMany({ where: { pasteId: id } });
    await prisma.report.deleteMany({ where: { pasteId: id } });
    await prisma.paste.delete({ where: { id } });
    await removeFromTrending(id);
    res.json({ message: 'Paste removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ---------------------------- reports ----------------------------- */
const listReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        paste: { select: { id: true, title: true } },
        reporter: { select: { id: true, name: true } },
      },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resolveReport = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await prisma.report.update({ where: { id }, data: { status: 'RESOLVED' } });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ------------------------- announcements -------------------------- */
const listAnnouncements = async (req, res) => {
  try {
    const items = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  const { title, message } = req.body;
  try {
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
    const item = await prisma.announcement.create({ data: { title, message } });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public: active announcements shown to all users
const getActiveAnnouncements = async (req, res) => {
  try {
    const items = await prisma.announcement.findMany({
      where: { active: true }, orderBy: { createdAt: 'desc' }, take: 5,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStats, listUsers, updateUserRole, deleteUser,
  listPastes, deletePaste, listReports, resolveReport,
  listAnnouncements, createAnnouncement, deleteAnnouncement, getActiveAnnouncements,
};
