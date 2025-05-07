/**
 * Calendly API Cache
 * Version: 1.0.0
 * 
 * In-memory caching for Calendly API responses
 */

import { logger } from '@/lib/logger'

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  data: T
  expires: number
}

/**
 * In-memory cache for Calendly API responses
 */
class CalendlyCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxEntries: number
  private cleanupInterval?: NodeJS.Timeout
  
  /**
   * Create a new Calendly cache
   * 
   * @param maxEntries Maximum number of entries in the cache (default: 1000)
   * @param cleanupIntervalMs Interval for cleaning up expired entries (default: 60000 ms)
   */
  constructor(maxEntries = 1000, cleanupIntervalMs = 60000) {
    this.maxEntries = maxEntries
    
    // Set up cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
    
    // Ensure interval doesn't prevent Node from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }
  
  /**
   * Set a cache entry
   * 
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds Time to live in seconds (default: 300 seconds)
   */
  set<T>(key: string, data: T, ttlSeconds = 300): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.getOldestKey()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    // Add new entry
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000
    })
    
    logger.debug('Added entry to Calendly cache', {
      key,
      ttlSeconds,
      expires: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
      cacheSize: this.cache.size
    })
  }
  
  /**
   * Get a cache entry
   * 
   * @param key Cache key
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    // If entry doesn't exist or is expired, return undefined
    if (!entry || entry.expires <= Date.now()) {
      if (entry) {
        // Remove expired entry
        this.cache.delete(key)
        logger.debug('Removed expired entry from Calendly cache', { key })
      }
      return undefined
    }
    
    logger.debug('Cache hit for Calendly API', { key })
    return entry.data as T
  }
  
  /**
   * Remove a cache entry
   * 
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key)
    logger.debug('Manually removed entry from Calendly cache', { key })
  }
  
  /**
   * Remove all entries matching a pattern
   * 
   * @param pattern Regex pattern to match keys
   */
  removePattern(pattern: RegExp): void {
    let count = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    
    if (count > 0) {
      logger.debug('Bulk removed entries from Calendly cache', {
        pattern: pattern.toString(),
        count
      })
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear()
    logger.debug('Cleared Calendly cache')
  }
  
  /**
   * Get cache stats
   * 
   * @returns Cache statistics
   */
  getStats(): {
    size: number
    maxEntries: number
    oldestEntry: string | null
    newestEntry: string | null
  } {
    const oldestKey = this.getOldestKey()
    const newestKey = this.getNewestKey()
    
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      oldestEntry: oldestKey,
      newestEntry: newestKey
    }
  }
  
  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let removedCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires <= now) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    if (removedCount > 0) {
      logger.debug('Cleaned up expired entries from Calendly cache', {
        removedCount,
        remainingEntries: this.cache.size
      })
    }
  }
  
  /**
   * Get the oldest cache key
   * 
   * @returns Oldest cache key or null if cache is empty
   */
  private getOldestKey(): string | null {
    if (this.cache.size === 0) {
      return null
    }
    
    let oldestKey: string | null = null
    let oldestExpires = Infinity
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < oldestExpires) {
        oldestKey = key
        oldestExpires = entry.expires
      }
    }
    
    return oldestKey
  }
  
  /**
   * Get the newest cache key
   * 
   * @returns Newest cache key or null if cache is empty
   */
  private getNewestKey(): string | null {
    if (this.cache.size === 0) {
      return null
    }
    
    let newestKey: string | null = null
    let newestExpires = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires > newestExpires) {
        newestKey = key
        newestExpires = entry.expires
      }
    }
    
    return newestKey
  }
  
  /**
   * Stop cache cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
  }
}

// Singleton instance
let cacheInstance: CalendlyCache | null = null

/**
 * Get the Calendly cache instance
 * 
 * @returns Calendly cache
 */
export function getCalendlyCache(): CalendlyCache {
  if (!cacheInstance) {
    cacheInstance = new CalendlyCache()
  }
  
  return cacheInstance
}

/**
 * Cached function wrapper
 * 
 * @param fn Function to cache
 * @param keyFn Function to generate cache key from arguments
 * @param ttlSeconds Time to live in seconds (default: 300 seconds)
 * @returns Cached function
 */
export function cached<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  ttlSeconds = 300
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const cache = getCalendlyCache()
    const key = keyFn(...args)
    
    // Check cache
    const cachedResult = cache.get<T>(key)
    if (cachedResult !== undefined) {
      return cachedResult
    }
    
    // Call original function
    const result = await fn(...args)
    
    // Cache result
    cache.set(key, result, ttlSeconds)
    
    return result
  }
}

/**
 * Invalidate cache entries matching a pattern
 * 
 * @param pattern Regex pattern to match keys
 */
export function invalidateCache(pattern: RegExp): void {
  const cache = getCalendlyCache()
  cache.removePattern(pattern)
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  const cache = getCalendlyCache()
  cache.clear()
}

/**
 * Get cache statistics
 * 
 * @returns Cache statistics
 */
export function getCacheStats(): {
  size: number
  maxEntries: number
  oldestEntry: string | null
  newestEntry: string | null
} {
  const cache = getCalendlyCache()
  return cache.getStats()
}