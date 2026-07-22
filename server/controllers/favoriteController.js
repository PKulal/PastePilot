const { prisma } = require('../config/db');
const { logActivity } = require('../utils/activity');

const AUTHOR_SELECT = { select: { id: true, name: true, avatar: true } };

// Toggle favorite on/off
const toggleFavorite = async (req, res) => {
  const pasteId = req.params.id;
  const userId = req.user.id;
  try {
    const paste = await prisma.paste.findUnique({ where: { id: pasteId } });
    if (!paste) return res.status(404).json({ message: 'Paste not found' });

    const existing = await prisma.favorite.findUnique({ where: { userId_pasteId: { userId, pasteId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId, pasteId } });
    logActivity(userId, 'FAVORITE', paste.title);
    res.json({ favorited: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { paste: { include: { author: AUTHOR_SELECT } } },
    });
    const pastes = favs
      .map((f) => f.paste)
      .filter(Boolean)
      .map(({ passwordHash, ...p }) => ({ ...p, isProtected: !!passwordHash }));
    res.json(pastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Returns whether the current user has favorited a given paste
const isFavorited = async (req, res) => {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_pasteId: { userId: req.user.id, pasteId: req.params.id } },
    });
    res.json({ favorited: !!existing });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { toggleFavorite, getFavorites, isFavorited };
