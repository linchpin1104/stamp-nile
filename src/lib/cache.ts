/**
 * Enhanced caching system with memory and localStorage options
 * Includes size limits, eviction policies, and strong type safety
 */

export enum CacheStrategy {
  MEMORY_ONLY = 'memory_only',
  MEMORY_AND_PERSIST = 'memory_and_persist',
  PERSIST_ONLY = 'persist_only'
}

export interface CacheOptions {
  /** Time to live in milliseconds. Default: 5 minutes */
  ttl?: number;
  /** Caching strategy. Default: MEMORY_ONLY */
  strategy?: CacheStrategy;
  /** Tags for cache invalidation by category */
  tags?: string[];
  /** Priority for cache eviction (lower gets evicted first). Default: 0 */
  priority?: number;
}

interface CacheItem<T> {
  data: T;
  expires: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
  tags: string[];
  size: number; // Approximate byte size
}

// Constants
const MAX_CACHE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB memory cache limit
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: DEFAULT_TTL,
  strategy: CacheStrategy.MEMORY_ONLY,
  tags: [],
  priority: 0
};

// In-memory cache storage
class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private totalSize: number = 0;
  private maxSize: number;

  constructor(maxSize = MAX_CACHE_SIZE_BYTES) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (item.expires < Date.now()) {
      this.delete(key);
      return null;
    }
    
    // Update access stats
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.data;
  }

  set<T>(key: string, data: T, options: Required<CacheOptions>): void {
    // Approximate size calculation - can be improved for specific data types
    const dataSize = this.approximateSize(data);
    
    // Create cache item
    const cacheItem: CacheItem<T> = {
      data,
      expires: Date.now() + options.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      priority: options.priority,
      tags: options.tags,
      size: dataSize
    };
    
    // If entry already exists, update total size
    if (this.cache.has(key)) {
      this.totalSize -= (this.cache.get(key)?.size || 0);
    }
    
    // Check if we need to evict items
    if (this.totalSize + dataSize > this.maxSize) {
      this.evictItems(dataSize);
    }
    
    // Add to cache
    this.cache.set(key, cacheItem);
    this.totalSize += dataSize;
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item) {
      this.totalSize -= item.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  clearByTag(tag: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (item.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
  }

  private evictItems(sizeNeeded: number): void {
    // Get items sorted by priority, then by last accessed time (older first)
    const sortedItems = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority; // Lower priority evicted first
        }
        return a.lastAccessed - b.lastAccessed; // Older items evicted first
      });

    let freedSpace = 0;
    const keysToRemove: string[] = [];

    // Remove items until we've freed enough space
    for (const [key, item] of sortedItems) {
      keysToRemove.push(key);
      freedSpace += item.size;
      
      if (freedSpace >= sizeNeeded) break;
    }
    
    keysToRemove.forEach(key => this.delete(key));
  }

  private approximateSize(data: any): number {
    if (data === null || data === undefined) return 8;
    
    try {
      const json = JSON.stringify(data);
      return json.length * 2; // Unicode characters can be up to 2 bytes
    } catch (e) {
      // Fallback if unstringifiable
      return 1024; // Arbitrary size for complex objects
    }
  }
}

// Local storage cache adapter
class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'cache:') {
    this.prefix = prefix;
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedItem = localStorage.getItem(this.prefix + key);
      if (!storedItem) return null;
      
      const parsedItem = JSON.parse(storedItem) as CacheItem<T>;
      
      // Check if expired
      if (parsedItem.expires < Date.now()) {
        this.delete(key);
        return null;
      }
      
      return parsedItem.data;
    } catch (error) {
      console.warn(`Error reading cache for key ${key}:`, error);
      return null;
    }
  }

  set<T>(key: string, data: T, options: Required<CacheOptions>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        expires: Date.now() + options.ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        priority: options.priority,
        tags: options.tags,
        size: 0 // Not used for localStorage
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
    } catch (error) {
      // Handle quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.evictOldestItems();
        try {
          // Try again after eviction
          this.set(key, data, options);
        } catch (e) {
          console.warn(`Failed to write to localStorage cache after eviction: ${e}`);
        }
      } else {
        console.warn(`Error writing to localStorage cache for key ${key}:`, error);
      }
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  clearByTag(tag: string): void {
    if (typeof window === 'undefined') return;
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}') as CacheItem<unknown>;
          if (item.tags && item.tags.includes(tag)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private evictOldestItems(): void {
    if (typeof window === 'undefined') return;
    
    // Get all cache items
    const items: Array<[string, CacheItem<unknown>]> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}') as CacheItem<unknown>;
          items.push([key, item]);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // Sort by expiration date and remove oldest 20%
    items.sort(([, a], [, b]) => a.expires - b.expires);
    const itemsToRemove = Math.max(1, Math.floor(items.length * 0.2));
    
    items.slice(0, itemsToRemove).forEach(([key]) => localStorage.removeItem(key));
  }
}

// Singletons
const memoryCache = new MemoryCache();
const localStorageCache = new LocalStorageCache();

/**
 * Get an item from cache
 * @param key Cache key
 * @returns The cached data or null if not found/expired
 */
export function getCached<T>(key: string): T | null {
  // First try memory cache
  const memoryItem = memoryCache.get<T>(key);
  if (memoryItem !== null) {
    return memoryItem;
  }
  
  // Then try localStorage
  return localStorageCache.get<T>(key);
}

/**
 * Set an item in cache
 * @param key Cache key
 * @param data Data to cache
 * @param options Caching options
 */
export function setCached<T>(key: string, data: T, options: CacheOptions = {}): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fullOptions = opts as Required<CacheOptions>;
  
  switch (fullOptions.strategy) {
    case CacheStrategy.MEMORY_ONLY:
      memoryCache.set<T>(key, data, fullOptions);
      break;
    case CacheStrategy.PERSIST_ONLY:
      localStorageCache.set<T>(key, data, fullOptions);
      break;
    case CacheStrategy.MEMORY_AND_PERSIST:
      memoryCache.set<T>(key, data, fullOptions);
      localStorageCache.set<T>(key, data, fullOptions);
      break;
  }
}

/**
 * Remove an item from cache
 * @param key Cache key
 */
export function removeCached(key: string): void {
  memoryCache.delete(key);
  localStorageCache.delete(key);
}

/**
 * Clear all cached items
 * @param persistentOnly Whether to only clear persistent (localStorage) items
 */
export function clearCache(persistentOnly: boolean = false): void {
  if (!persistentOnly) {
    memoryCache.clear();
  }
  
  localStorageCache.clear();
}

/**
 * Invalidate cache items by tag
 * @param tag Tag to invalidate
 */
export function invalidateCacheByTag(tag: string): void {
  memoryCache.clearByTag(tag);
  localStorageCache.clearByTag(tag);
}

/**
 * Creates a cached version of an async function
 * @param fn The function to wrap with caching
 * @param keyFn Function to generate a cache key from arguments
 * @param options Cache options
 * @returns Cached version of the function
 */
export function createCachedFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  options: CacheOptions = {}
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const cacheKey = keyFn(...args);
    const cached = getCached<T>(cacheKey);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    setCached(cacheKey, result, options);
    return result;
  };
}

/**
 * Creates a typed wrapper for accessing cached data
 * @param namespace Namespace for the cache keys
 * @returns Object with typed get/set methods
 */
export function createTypedCache<T>(namespace: string) {
  return {
    get: (key: string): T | null => getCached<T>(`${namespace}:${key}`),
    set: (key: string, data: T, options?: CacheOptions): void => 
      setCached<T>(`${namespace}:${key}`, data, options),
    remove: (key: string): void => removeCached(`${namespace}:${key}`),
    clear: (): void => invalidateCacheByTag(namespace),
  };
} 