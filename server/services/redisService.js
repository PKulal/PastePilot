const { redisClient } = require('../config/db');

/**
 * Centralised Redis helpers implementing the PRD Redis requirements:
 *  - Session storage (logout from all devices)
 *  - View counter (incr + periodic DB flush)
 *  - Popular pastes (sorted set / trending)
 *  - Caching (details, dashboard, search, recent)
 * All helpers fail soft: if Redis is unavailable the app keeps working.
 */

const SESSION_PREFIX = 'session:';           // session:<token> -> userId
const USER_SESSIONS_PREFIX = 'user_sessions:'; // set of tokens per user
const VIEW_COUNTER_PREFIX = 'paste_views:';  // pending views not yet flushed to DB
const TRENDING_KEY = 'trending:pastes';      // sorted set pasteId -> score(views)
const CACHE_PREFIX = 'cache:';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days, matches JWT

/* --------------------------- Sessions --------------------------- */
async function addSession(token, userId) {
  try {
    await redisClient.setEx(`${SESSION_PREFIX}${token}`, SESSION_TTL_SECONDS, userId);
    await redisClient.sAdd(`${USER_SESSIONS_PREFIX}${userId}`, token);
  } catch (e) { /* fail soft */ }
}

async function isSessionValid(token) {
  try {
    const v = await redisClient.get(`${SESSION_PREFIX}${token}`);
    return v !== null;
  } catch (e) {
    return true; // Redis down -> fail open so auth still works
  }
}

async function removeSession(token, userId) {
  try {
    await redisClient.del(`${SESSION_PREFIX}${token}`);
    if (userId) await redisClient.sRem(`${USER_SESSIONS_PREFIX}${userId}`, token);
  } catch (e) { /* fail soft */ }
}

async function removeAllSessions(userId) {
  try {
    const tokens = await redisClient.sMembers(`${USER_SESSIONS_PREFIX}${userId}`);
    const keys = tokens.map((t) => `${SESSION_PREFIX}${t}`);
    if (keys.length) await redisClient.del(keys);
    await redisClient.del(`${USER_SESSIONS_PREFIX}${userId}`);
  } catch (e) { /* fail soft */ }
}

/* ------------------------- View counter ------------------------- */
async function incrementView(pasteId) {
  try {
    await redisClient.incr(`${VIEW_COUNTER_PREFIX}${pasteId}`);
    await redisClient.zIncrBy(TRENDING_KEY, 1, pasteId);
  } catch (e) { /* fail soft */ }
}

async function getPendingViews(pasteId) {
  try {
    const v = await redisClient.get(`${VIEW_COUNTER_PREFIX}${pasteId}`);
    return v ? parseInt(v, 10) : 0;
  } catch (e) { return 0; }
}

/* ------------------------- Trending ----------------------------- */
async function getTrendingIds(limit = 10) {
  try {
    // highest score first
    return await redisClient.zRange(TRENDING_KEY, 0, limit - 1, { REV: true });
  } catch (e) { return []; }
}

async function bumpTrending(pasteId, score) {
  try {
    await redisClient.zAdd(TRENDING_KEY, [{ score, value: pasteId }]);
  } catch (e) { /* fail soft */ }
}

async function removeFromTrending(pasteId) {
  try {
    await redisClient.zRem(TRENDING_KEY, pasteId);
  } catch (e) { /* fail soft */ }
}

/* --------------------------- Cache ------------------------------ */
async function cacheGet(key) {
  try {
    const v = await redisClient.get(`${CACHE_PREFIX}${key}`);
    return v ? JSON.parse(v) : null;
  } catch (e) { return null; }
}

async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    await redisClient.setEx(`${CACHE_PREFIX}${key}`, ttlSeconds, JSON.stringify(value));
  } catch (e) { /* fail soft */ }
}

async function cacheDel(key) {
  try {
    await redisClient.del(`${CACHE_PREFIX}${key}`);
  } catch (e) { /* fail soft */ }
}

// Delete every cache entry matching a wildcard pattern (e.g. "dashboard:*")
async function cacheDelPattern(pattern) {
  try {
    const keys = await redisClient.keys(`${CACHE_PREFIX}${pattern}`);
    if (keys.length) await redisClient.del(keys);
  } catch (e) { /* fail soft */ }
}

module.exports = {
  addSession,
  isSessionValid,
  removeSession,
  removeAllSessions,
  incrementView,
  getPendingViews,
  getTrendingIds,
  bumpTrending,
  removeFromTrending,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  VIEW_COUNTER_PREFIX,
  TRENDING_KEY,
};
