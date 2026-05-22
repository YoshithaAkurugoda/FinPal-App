import Redis from 'ioredis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Convert Upstash REST credentials to rediss:// URL for ioredis
let redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

if (url && token) {
  // Parse the REST URL to get the host
  // https://flowing-bream-133272.upstash.io -> flowing-bream-133272.upstash.io
  const host = url.replace(/^https?:\/\//, '');
  redisUrl = `rediss://:${token}@${host}:6379`;
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});
