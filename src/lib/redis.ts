import { Redis } from '@upstash/redis'

const getRedisConfig = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis credentials not found, using dummy client')
    return null
  }
  
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export const redis = getRedisConfig()

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis) return null
  
  try {
    const cached = await redis.get<string>(key)
    if (!cached) return null
    
    // Handle both string and object cases
    if (typeof cached === 'string') {
      try {
        return JSON.parse(cached) as T
      } catch {
        return cached as unknown as T
      }
    }
    return cached as T
  } catch (error) {
    console.error('Redis error:', error)
    return null
  }
}

export async function setCache(key: string, value: unknown, expireSeconds = 3600): Promise<void> {
  if (!redis) return
  
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    await redis.setex(key, expireSeconds, serialized)
  } catch (error) {
    console.error('Redis set error:', error)
  }
} 