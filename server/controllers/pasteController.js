const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const { prisma } = require('../config/db');
const {
  incrementView,
  getTrendingIds,
  bumpTrending,
  removeFromTrending,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
} = require('../services/redisService');
const { logActivity } = require('../utils/activity');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const AUTHOR_SELECT = { select: { id: true, name: true, avatar: true } };

/* ----------------------- expiration helpers ----------------------- */
const EXP_MS = {
  '10_MINUTES': 10 * 60000,
  '1_HOUR': 60 * 60000,
  '1_DAY': 24 * 60 * 60000,
  '7_DAYS': 7 * 24 * 60 * 60000,
  '30_DAYS': 30 * 24 * 60 * 60000,
};
const getExpirationDate = (opt) => (EXP_MS[opt] ? new Date(Date.now() + EXP_MS[opt]) : null);
const getTTLSeconds = (opt) => (EXP_MS[opt] ? EXP_MS[opt] / 1000 : 0);

// Strip sensitive/heavy fields before returning a paste to a client.
const sanitize = (p) => {
  if (!p) return p;
  const { passwordHash, ...rest } = p;
  return { ...rest, isProtected: !!passwordHash };
};

const isExpired = (p) => p.expiresAt && new Date() > new Date(p.expiresAt);

/* ------------------------------ create ---------------------------- */
const createPaste = async (req, res) => {
  const {
    title, description, content, language, visibility,
    expiration, burnAfterViews, tags, category, password, isDraft,
  } = req.body;
  const authorId = req.user ? req.user.id : null;

  try {
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const expiresAt = getExpirationDate(expiration);
    const ttlSeconds = getTTLSeconds(expiration);
    let passwordHash = null;
    if (password && String(password).trim()) {
      passwordHash = await bcrypt.hash(String(password), 10);
    }

    const paste = await prisma.paste.create({
      data: {
        title: title || 'Untitled Paste',
        description: description || null,
        content,
        language: language || 'plaintext',
        visibility: visibility || 'PUBLIC',
        expiresAt,
        burnAfterViews: burnAfterViews ? parseInt(burnAfterViews) : null,
        tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : []),
        category: category || null,
        passwordHash,
        authorId,
        status: isDraft ? 'DRAFT' : 'ACTIVE',
      },
    });

    // Cache the paste (Redis TTL doubles as anonymous/temporary expiration - PRD F1 & F7).
    const cachePayload = JSON.stringify(paste);
    const { redisClient } = require('../config/db');
    try {
      if (ttlSeconds > 0) await redisClient.setEx(`paste:${paste.id}`, ttlSeconds, cachePayload);
      else await redisClient.set(`paste:${paste.id}`, cachePayload);
    } catch (e) { /* fail soft */ }

    if (!isDraft && paste.visibility === 'PUBLIC') {
      await bumpTrending(paste.id, 0);
      await cacheDelPattern('recent:*');
    }
    if (authorId) {
      await cacheDelPattern(`dashboard:${authorId}`);
      logActivity(authorId, isDraft ? 'SAVE_DRAFT' : 'CREATE_PASTE', paste.title);
    }

    res.status(201).json(sanitize(paste));
  } catch (error) {
    res.status(500).json({ message: 'Error creating paste', error: error.message });
  }
};

/* ------------------------------- read ----------------------------- */
const getPaste = async (req, res) => {
  const { id } = req.params;
  try {
    const paste = await prisma.paste.findUnique({ where: { id }, include: { author: AUTHOR_SELECT } });
    if (!paste) return res.status(404).json({ message: 'Paste not found' });

    if (paste.status === 'BURNED') return res.status(410).json({ message: 'This paste has been burned after reading' });
    if (paste.status === 'EXPIRED' || isExpired(paste)) {
      if (paste.status !== 'EXPIRED') await prisma.paste.update({ where: { id }, data: { status: 'EXPIRED' } });
      return res.status(410).json({ message: 'Paste has expired' });
    }
    if (paste.status === 'DRAFT') {
      const isOwner = req.user && req.user.id === paste.authorId;
      if (!isOwner) return res.status(404).json({ message: 'Paste not found' });
    }
    if (paste.visibility === 'PRIVATE') {
      const isOwner = req.user && req.user.id === paste.authorId;
      if (!isOwner) return res.status(403).json({ message: 'This paste is private' });
    }

    // Password-protected: return metadata only until unlocked.
    if (paste.passwordHash) {
      const isOwner = req.user && req.user.id === paste.authorId;
      if (!isOwner) {
        return res.json({
          id: paste.id, title: paste.title, language: paste.language,
          author: paste.author, createdAt: paste.createdAt, isProtected: true, locked: true,
        });
      }
    }

    await registerView(paste);
    res.json(sanitize({ ...paste, currentViews: paste.currentViews + 1, totalViews: paste.totalViews + 1 }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unlock a password-protected paste
const unlockPaste = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const paste = await prisma.paste.findUnique({ where: { id }, include: { author: AUTHOR_SELECT } });
    if (!paste) return res.status(404).json({ message: 'Paste not found' });
    if (!paste.passwordHash) return res.json(sanitize(paste));
    if (paste.status === 'BURNED') return res.status(410).json({ message: 'This paste has been burned' });
    if (isExpired(paste)) return res.status(410).json({ message: 'Paste has expired' });

    const ok = await bcrypt.compare(password || '', paste.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Incorrect password' });

    await registerView(paste);
    res.json(sanitize({ ...paste, currentViews: paste.currentViews + 1, totalViews: paste.totalViews + 1 }));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Shared view registration: increments counters (Redis + DB) and applies burn-after-reading.
async function registerView(paste) {
  const newCurrent = paste.currentViews + 1;
  const data = { currentViews: { increment: 1 } };
  if (paste.burnAfterViews && newCurrent >= paste.burnAfterViews) {
    data.status = 'BURNED';
    await removeFromTrending(paste.id);
    try { const { redisClient } = require('../config/db'); await redisClient.del(`paste:${paste.id}`); } catch (e) {}
  }
  await prisma.paste.update({ where: { id: paste.id }, data });
  await incrementView(paste.id); // Redis pending totalViews + trending sorted set
  if (paste.authorId) await cacheDelPattern(`dashboard:${paste.authorId}`);
}

/* --------------------------- recent/public ------------------------ */
const getRecentPublicPastes = async (req, res) => {
  try {
    const cached = await cacheGet('recent:public');
    if (cached) return res.json(cached);

    const pastes = await prisma.paste.findMany({
      where: { visibility: 'PUBLIC', status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: { id: true, title: true, description: true, language: true, tags: true, createdAt: true, currentViews: true, author: AUTHOR_SELECT },
    });
    await cacheSet('recent:public', pastes, 30);
    res.json(pastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ----------------------------- trending --------------------------- */
const getTrending = async (req, res) => {
  try {
    const cached = await cacheGet('trending');
    if (cached) return res.json(cached);

    const ids = await getTrendingIds(10);
    let pastes = [];
    if (ids.length) {
      const found = await prisma.paste.findMany({
        where: { id: { in: ids }, visibility: 'PUBLIC', status: 'ACTIVE' },
        select: { id: true, title: true, language: true, currentViews: true, tags: true, createdAt: true, author: AUTHOR_SELECT },
      });
      // preserve the score order from Redis
      pastes = ids.map((id) => found.find((p) => p.id === id)).filter(Boolean);
    }
    // Fallback to most-viewed from DB if trending set is empty
    if (!pastes.length) {
      pastes = await prisma.paste.findMany({
        where: { visibility: 'PUBLIC', status: 'ACTIVE' },
        orderBy: { currentViews: 'desc' }, take: 10,
        select: { id: true, title: true, language: true, currentViews: true, tags: true, createdAt: true, author: AUTHOR_SELECT },
      });
    }
    await cacheSet('trending', pastes, 30);
    res.json(pastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ------------------------------ search ---------------------------- */
const searchPastes = async (req, res) => {
  const { query, language, tags, category, author, sort } = req.query;
  try {
    const filters = { visibility: 'PUBLIC', status: 'ACTIVE' };
    if (query) {
      filters.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (language) filters.language = language;
    if (category) filters.category = { equals: category, mode: 'insensitive' };
    if (tags) filters.tags = { hasSome: String(tags).split(',').map((t) => t.trim()).filter(Boolean) };
    if (author) filters.author = { name: { contains: author, mode: 'insensitive' } };

    const orderBy = sortToOrderBy(sort);
    const pastes = await prisma.paste.findMany({
      where: filters, orderBy, take: 30,
      select: { id: true, title: true, description: true, language: true, tags: true, category: true, createdAt: true, currentViews: true, author: AUTHOR_SELECT },
    });
    res.json(pastes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

function sortToOrderBy(sort) {
  switch (sort) {
    case 'oldest': return { createdAt: 'asc' };
    case 'most_viewed': return { currentViews: 'desc' };
    case 'alphabetical': return { title: 'asc' };
    case 'newest':
    default: return { createdAt: 'desc' };
  }
}

/* --------------------------- my pastes ---------------------------- */
const getMyPastes = async (req, res) => {
  const { tab = 'all', language, tags, search, sort } = req.query;
  const userId = req.user.id;
  try {
    if (tab === 'favorites') {
      const favs = await prisma.favorite.findMany({
        where: { userId }, orderBy: { createdAt: 'desc' },
        include: { paste: { include: { author: AUTHOR_SELECT } } },
      });
      return res.json(favs.map((f) => sanitize(f.paste)).filter(Boolean));
    }

    const where = { authorId: userId };
    switch (tab) {
      case 'public': where.visibility = 'PUBLIC'; where.status = 'ACTIVE'; break;
      case 'private': where.visibility = 'PRIVATE'; break;
      case 'draft': where.status = 'DRAFT'; break;
      case 'archived': where.isArchived = true; break;
      case 'expired': where.status = 'EXPIRED'; break;
      case 'burned': where.status = 'BURNED'; break;
      case 'all':
      default: break;
    }
    if (tab !== 'archived') where.isArchived = false;
    if (language) where.language = language;
    if (tags) where.tags = { hasSome: String(tags).split(',').map((t) => t.trim()).filter(Boolean) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pastes = await prisma.paste.findMany({
      where, orderBy: sortToOrderBy(sort),
      select: { id: true, title: true, description: true, language: true, tags: true, visibility: true, status: true, isArchived: true, currentViews: true, createdAt: true, expiresAt: true, burnAfterViews: true, passwordHash: true },
    });
    res.json(pastes.map(sanitize));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ----------------------------- update ----------------------------- */
async function ownerGuard(id, userId) {
  const paste = await prisma.paste.findUnique({ where: { id } });
  if (!paste) return { error: 404, message: 'Paste not found' };
  if (paste.authorId !== userId) return { error: 403, message: 'Not authorized' };
  return { paste };
}

const updatePaste = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, language, visibility, tags, category, expiration, burnAfterViews, password, isDraft } = req.body;
  try {
    const guard = await ownerGuard(id, req.user.id);
    if (guard.error) return res.status(guard.error).json({ message: guard.message });

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (content !== undefined) data.content = content;
    if (language !== undefined) data.language = language;
    if (visibility !== undefined) data.visibility = visibility;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    if (expiration !== undefined) data.expiresAt = getExpirationDate(expiration);
    if (burnAfterViews !== undefined) data.burnAfterViews = burnAfterViews ? parseInt(burnAfterViews) : null;
    if (isDraft !== undefined) data.status = isDraft ? 'DRAFT' : 'ACTIVE';
    if (password !== undefined) data.passwordHash = password ? await bcrypt.hash(String(password), 10) : null;

    const updated = await prisma.paste.update({ where: { id }, data, include: { author: AUTHOR_SELECT } });
    await cacheDel(`recent:public`);
    try { const { redisClient } = require('../config/db'); await redisClient.del(`paste:${id}`); } catch (e) {}
    await cacheDelPattern(`dashboard:${req.user.id}`);
    logActivity(req.user.id, 'UPDATE_PASTE', updated.title);
    res.json(sanitize(updated));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deletePaste = async (req, res) => {
  const { id } = req.params;
  try {
    const guard = await ownerGuard(id, req.user.id);
    if (guard.error) return res.status(guard.error).json({ message: guard.message });

    await prisma.favorite.deleteMany({ where: { pasteId: id } });
    await prisma.report.deleteMany({ where: { pasteId: id } });
    await prisma.paste.delete({ where: { id } });
    await removeFromTrending(id);
    try { const { redisClient } = require('../config/db'); await redisClient.del(`paste:${id}`); } catch (e) {}
    await cacheDelPattern(`dashboard:${req.user.id}`);
    logActivity(req.user.id, 'DELETE_PASTE', id);
    res.json({ message: 'Paste deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const archivePaste = async (req, res) => {
  const { id } = req.params;
  try {
    const guard = await ownerGuard(id, req.user.id);
    if (guard.error) return res.status(guard.error).json({ message: guard.message });
    await prisma.paste.update({ where: { id }, data: { isArchived: true } });
    await removeFromTrending(id);
    await cacheDelPattern(`dashboard:${req.user.id}`);
    logActivity(req.user.id, 'ARCHIVE_PASTE', id);
    res.json({ message: 'Paste archived' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const restorePaste = async (req, res) => {
  const { id } = req.params;
  try {
    const guard = await ownerGuard(id, req.user.id);
    if (guard.error) return res.status(guard.error).json({ message: guard.message });
    await prisma.paste.update({ where: { id }, data: { isArchived: false } });
    await cacheDelPattern(`dashboard:${req.user.id}`);
    logActivity(req.user.id, 'RESTORE_PASTE', id);
    res.json({ message: 'Paste restored' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const duplicatePaste = async (req, res) => {
  const { id } = req.params;
  try {
    const src = await prisma.paste.findUnique({ where: { id } });
    if (!src) return res.status(404).json({ message: 'Paste not found' });
    // Only owner can duplicate private pastes
    if (src.visibility === 'PRIVATE' && src.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const copy = await prisma.paste.create({
      data: {
        title: `${src.title} (copy)`, description: src.description, content: src.content,
        language: src.language, visibility: src.visibility, tags: src.tags, category: src.category,
        authorId: req.user.id, status: 'ACTIVE',
      },
    });
    await cacheDelPattern(`dashboard:${req.user.id}`);
    logActivity(req.user.id, 'DUPLICATE_PASTE', copy.title);
    res.status(201).json(sanitize(copy));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* --------------------------- downloads ---------------------------- */
const downloadPaste = async (req, res) => {
  const { id } = req.params;
  const format = (req.query.format || 'txt').toLowerCase();
  try {
    const paste = await prisma.paste.findUnique({ where: { id }, include: { author: AUTHOR_SELECT } });
    if (!paste) return res.status(404).json({ message: 'Paste not found' });
    if (paste.passwordHash && !(req.user && req.user.id === paste.authorId)) {
      return res.status(403).json({ message: 'Password-protected paste cannot be downloaded directly' });
    }

    const base = (paste.title || 'paste').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${base}.json"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(
        { title: paste.title, description: paste.description, language: paste.language, tags: paste.tags, content: paste.content, createdAt: paste.createdAt }, null, 2));
    }
    if (format === 'md' || format === 'markdown') {
      res.setHeader('Content-Disposition', `attachment; filename="${base}.md"`);
      res.setHeader('Content-Type', 'text/markdown');
      const md = `# ${paste.title}\n\n${paste.description || ''}\n\n\`\`\`${paste.language}\n${paste.content}\n\`\`\`\n`;
      return res.send(md);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${base}.txt"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(paste.content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* ----------------------------- QR code ---------------------------- */
const getQrCode = async (req, res) => {
  const { id } = req.params;
  try {
    const url = `${FRONTEND_URL}/paste/${id}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1 });
    res.json({ url, qr: dataUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* --------------------------- dashboard ---------------------------- */
const getDashboard = async (req, res) => {
  const userId = req.user.id;
  try {
    const cached = await cacheGet(`dashboard:${userId}`);
    if (cached) return res.json(cached);

    const [total, publicCount, privateCount, unlisted, drafts, archived, expired, burned, agg, mostViewed, recent] = await Promise.all([
      prisma.paste.count({ where: { authorId: userId } }),
      prisma.paste.count({ where: { authorId: userId, visibility: 'PUBLIC' } }),
      prisma.paste.count({ where: { authorId: userId, visibility: 'PRIVATE' } }),
      prisma.paste.count({ where: { authorId: userId, visibility: 'UNLISTED' } }),
      prisma.paste.count({ where: { authorId: userId, status: 'DRAFT' } }),
      prisma.paste.count({ where: { authorId: userId, isArchived: true } }),
      prisma.paste.count({ where: { authorId: userId, status: 'EXPIRED' } }),
      prisma.paste.count({ where: { authorId: userId, status: 'BURNED' } }),
      prisma.paste.aggregate({ where: { authorId: userId }, _sum: { currentViews: true } }),
      prisma.paste.findFirst({ where: { authorId: userId }, orderBy: { currentViews: 'desc' }, select: { id: true, title: true, currentViews: true } }),
      prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const stats = {
      total, public: publicCount, private: privateCount, unlisted, drafts, archived, expired, burned,
      totalViews: agg._sum.currentViews || 0,
      mostViewed,
      recentActivity: recent,
    };
    await cacheSet(`dashboard:${userId}`, stats, 20);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPaste, getPaste, unlockPaste, getRecentPublicPastes, getTrending, searchPastes,
  getMyPastes, updatePaste, deletePaste, archivePaste, restorePaste, duplicatePaste,
  downloadPaste, getQrCode, getDashboard,
};
