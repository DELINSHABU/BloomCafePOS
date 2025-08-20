// Cache management utilities for Firebase operations
// This helps reduce Firebase quota consumption

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class CacheManager {
  private static instance: CacheManager
  private caches: Map<string, CacheEntry> = new Map()

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  // Set cache with TTL (time to live)
  set(key: string, data: any, ttlMinutes: number = 5): void {
    const ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    }
    this.caches.set(key, entry)
    console.log(`🗄️ Cache set for key: ${key} (TTL: ${ttlMinutes}m)`)
  }

  // Get cache if not expired
  get(key: string): any | null {
    const entry = this.caches.get(key)
    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = (now - entry.timestamp) > entry.ttl

    if (isExpired) {
      this.caches.delete(key)
      console.log(`🗑️ Cache expired and removed for key: ${key}`)
      return null
    }

    console.log(`✅ Cache hit for key: ${key}`)
    return entry.data
  }

  // Invalidate specific cache
  invalidate(key: string): void {
    if (this.caches.has(key)) {
      this.caches.delete(key)
      console.log(`❌ Cache invalidated for key: ${key}`)
    }
  }

  // Invalidate all caches
  invalidateAll(): void {
    const count = this.caches.size
    this.caches.clear()
    console.log(`🧹 All ${count} caches cleared`)
  }

  // Get cache info
  getInfo(): any {
    const info: any = {}
    for (const [key, entry] of this.caches) {
      const now = Date.now()
      const age = Math.round((now - entry.timestamp) / 1000) // seconds
      const ttlRemaining = Math.max(0, Math.round((entry.ttl - (now - entry.timestamp)) / 1000))
      
      info[key] = {
        ageSeconds: age,
        ttlRemainingSeconds: ttlRemaining,
        isExpired: ttlRemaining === 0,
        sizeEstimate: JSON.stringify(entry.data).length + ' bytes'
      }
    }
    return info
  }

  // Check if cache exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

export default CacheManager

// Specific cache keys for different data types
export const CACHE_KEYS = {
  ORDERS_ALL: 'orders_all',
  ORDERS_RECENT: 'orders_recent',
  ORDERS_COUNT: 'orders_count',
  ANALYTICS: 'analytics_data'
} as const

// Cache TTL configurations (in minutes)
export const CACHE_TTL = {
  ORDERS: 5,      // 5 minutes for orders
  ANALYTICS: 10,  // 10 minutes for analytics
  COUNT: 15,      // 15 minutes for counts
  RECENT: 2       // 2 minutes for recent data
} as const

// Helper functions for common cache operations
export const cacheHelpers = {
  // Get cache manager instance
  getManager: () => CacheManager.getInstance(),

  // Cache orders data
  cacheOrders: (orders: any[], recent = false) => {
    const key = recent ? CACHE_KEYS.ORDERS_RECENT : CACHE_KEYS.ORDERS_ALL
    const ttl = recent ? CACHE_TTL.RECENT : CACHE_TTL.ORDERS
    CacheManager.getInstance().set(key, orders, ttl)
  },

  // Get cached orders
  getCachedOrders: (recent = false) => {
    const key = recent ? CACHE_KEYS.ORDERS_RECENT : CACHE_KEYS.ORDERS_ALL
    return CacheManager.getInstance().get(key)
  },

  // Cache analytics data
  cacheAnalytics: (analytics: any) => {
    CacheManager.getInstance().set(CACHE_KEYS.ANALYTICS, analytics, CACHE_TTL.ANALYTICS)
  },

  // Get cached analytics
  getCachedAnalytics: () => {
    return CacheManager.getInstance().get(CACHE_KEYS.ANALYTICS)
  },

  // Invalidate orders cache (call when new order is added)
  invalidateOrdersCache: () => {
    const manager = CacheManager.getInstance()
    manager.invalidate(CACHE_KEYS.ORDERS_ALL)
    manager.invalidate(CACHE_KEYS.ORDERS_RECENT)
    manager.invalidate(CACHE_KEYS.ANALYTICS)
  },

  // Get cache status for monitoring
  getCacheStatus: () => {
    return CacheManager.getInstance().getInfo()
  }
}
