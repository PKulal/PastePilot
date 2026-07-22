const { prisma } = require('../config/db');

const VALID_REASONS = ['SPAM', 'ABUSE', 'MALWARE', 'COPYRIGHT', 'OTHER'];

// Guests and users can report inappropriate content
const createReport = async (req, res) => {
  const { pasteId, reason, details } = req.body;
  try {
    const paste = await prisma.paste.findUnique({ where: { id: pasteId } });
    if (!paste) return res.status(404).json({ message: 'Paste not found' });

    const normalized = VALID_REASONS.includes((reason || '').toUpperCase()) ? reason.toUpperCase() : 'OTHER';
    await prisma.report.create({
      data: {
        pasteId,
        reporterId: req.user ? req.user.id : null,
        reason: normalized,
        details: details || null,
      },
    });
    res.status(201).json({ message: 'Report submitted. Thank you for keeping the community safe.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createReport };
