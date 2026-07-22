const { prisma } = require('../config/db');

/**
 * Records a user activity log entry (used by the dashboard "Recent Activity").
 * Fire-and-forget: never blocks or throws into the request path.
 */
function logActivity(userId, action, meta) {
  if (!userId) return;
  prisma.activityLog
    .create({ data: { userId, action, meta: meta ? String(meta) : null } })
    .catch(() => { /* ignore logging failures */ });
}

module.exports = { logActivity };
