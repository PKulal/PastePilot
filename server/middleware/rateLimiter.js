const { redisClient } = require('../config/db');

const rateLimit = (limit = 100, windowInSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${ip}`;

      const currentCount = await redisClient.incr(key);

      if (currentCount === 1) {
        await redisClient.expire(key, windowInSeconds);
      }

      if (currentCount > limit) {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
      }

      next();
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      next(); // Fail open if Redis is down
    }
  };
};

module.exports = { rateLimit };
