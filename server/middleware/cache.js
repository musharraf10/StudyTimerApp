// Cache middleware for Redis
export const cacheMiddleware = (keyPrefix, ttl = 3600) => {
  return async (req, res, next) => {
    if (!req.redisClient) {
      return next()
    }

    try {
      const cacheKey = `${keyPrefix}:${req.userId || req.params.id}`
      const cachedData = await req.redisClient.get(cacheKey)
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData))
      }
      
      // Store cache key for later use
      req.cacheKey = cacheKey
      req.cacheTTL = ttl
      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

// Helper function to set cache data
export const setCacheData = async (redisClient, key, data, ttl = 3600) => {
  if (!redisClient) return
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Set cache error:', error)
  }
}

// Helper function to delete cache data
export const deleteCacheData = async (redisClient, key) => {
  if (!redisClient) return
  
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error('Delete cache error:', error)
  }
}

// Helper function to clear user-related cache
export const clearUserCache = async (redisClient, userId) => {
  if (!redisClient) return
  
  try {
    const keys = await redisClient.keys(`*:${userId}`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch (error) {
    console.error('Clear user cache error:', error)
  }
}