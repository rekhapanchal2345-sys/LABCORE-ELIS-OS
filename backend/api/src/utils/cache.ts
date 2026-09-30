/**
 * High-Performance In-Memory Cache for LabCore ELIS Backend
 * Provides microsecond response times for frequently accessed datasets
 * (e.g., Dashboard stats, test catalogs, doctor rosters, metric counters).
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run periodic cleanup every 60 seconds to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 30): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  public del(key: string): void {
    this.store.delete(key);
  }

  public delPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  public clear(): void {
    this.store.clear();
  }

  public async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();
export default cache;
