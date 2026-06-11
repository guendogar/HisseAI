import { CACHE_TTL_PRICES, CACHE_TTL_NEWS, CACHE_TTL_HISTORY } from '../../constants';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttl: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttl * 1000 });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const cache = new MemoryCache();

export const CacheKeys = {
  stockPrice: (symbol: string) => `price:${symbol}`,
  stockHistory: (symbol: string, period: string) => `history:${symbol}:${period}`,
  stockList: (market: string) => `stocks:${market}`,
  news: (symbol?: string) => `news:${symbol ?? 'all'}`,
  technicals: (symbol: string) => `technicals:${symbol}`,
};

export const CacheTTL = {
  prices: CACHE_TTL_PRICES,
  news: CACHE_TTL_NEWS,
  history: CACHE_TTL_HISTORY,
  technicals: 300,
};
