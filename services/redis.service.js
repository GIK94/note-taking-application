const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Set key-value with optional TTL (default 1 hour)
redis.setCache = async (key, value, ttl = 3600) => {
  const serializedValue = JSON.stringify(value);
  await redis.set(key, serializedValue, 'EX', ttl);
};

// Get key-value
redis.getCache = async (key) => {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error('Redis Parse Error:', err);
    return null;
  }
};

// Delete a key
redis.delCache = async (key) => {
  await redis.del(key);
};

module.exports = redis;
