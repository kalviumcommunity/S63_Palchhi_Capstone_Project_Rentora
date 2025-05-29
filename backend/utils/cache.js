const NodeCache = require('node-cache');

// Create a cache instance with a TTL of 1 hour
const listingCache = new NodeCache({
  stdTTL: 3600, // 1 hour in seconds
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Don't clone objects for better performance
});

// Error handling for cache operations
listingCache.on('error', (err) => {
  console.error('Cache error:', err);
});

module.exports = {
  listingCache
};
