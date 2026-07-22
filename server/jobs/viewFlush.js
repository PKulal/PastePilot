const { prisma, redisClient } = require('../config/db');
const { VIEW_COUNTER_PREFIX } = require('../services/redisService');

/**
 * PRD Redis Feature 2: view counts are incremented in Redis on every visit and
 * flushed to the database periodically rather than on every request.
 * This job scans pending view counters and reconciles them into Postgres.
 */
async function flushViewCounts() {
  try {
    const keys = await redisClient.keys(`${VIEW_COUNTER_PREFIX}*`);
    for (const key of keys) {
      const pasteId = key.substring(VIEW_COUNTER_PREFIX.length);
      const pending = parseInt((await redisClient.get(key)) || '0', 10);
      if (pending > 0) {
        // reset the counter first so concurrent views aren't lost
        await redisClient.del(key);
        await prisma.paste
          .update({
            where: { id: pasteId },
            data: { totalViews: { increment: pending } },
          })
          .catch(() => { /* paste may have been deleted */ });
      }
    }
  } catch (e) {
    console.error('View flush job error:', e.message);
  }
}

let timer = null;
function startViewFlushJob(intervalMs = 30000) {
  if (timer) return;
  timer = setInterval(flushViewCounts, intervalMs);
  console.log('🕒 View-count flush job started (every ' + intervalMs / 1000 + 's)');
}

module.exports = { startViewFlushJob, flushViewCounts };
