/**
 * Runtime In-Memory & Session Cache for Locality Reports
 * Provides instant re-queries, TTL expiration, and in-flight promise deduplication.
 */

import { LocalityReport } from "@/types/locality";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export class MemoryCache<T = LocalityReport> {
  private cache = new Map<string, CacheEntry<T>>();
  private inFlight = new Map<string, Promise<T>>();
  private defaultTTL: number;

  constructor(defaultTTLMinutes: number = 60 * 24) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000;
  }

  /**
   * Normalizes keys to ensure consistent lookup regardless of casing or extra punctuation
   */
  normalizeKey(key: string): string {
    return key
      .toLowerCase()
      .replace(/[,.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  get(key: string): T | null {
    const normalized = this.normalizeKey(key);
    const entry = this.cache.get(normalized);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(normalized);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T, ttlMs?: number): void {
    const normalized = this.normalizeKey(key);
    this.cache.set(normalized, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlMs ?? this.defaultTTL,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(this.normalizeKey(key));
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * In-flight promise deduplication:
   * Prevents multiple identical requests from triggering simultaneous AI/search calls.
   */
  async getOrFetch(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<{ data: T; cached: boolean }> {
    const cached = this.get(key);
    if (cached) {
      return { data: cached, cached: true };
    }

    const normalized = this.normalizeKey(key);
    const existingPromise = this.inFlight.get(normalized);
    if (existingPromise) {
      const data = await existingPromise;
      return { data, cached: true };
    }

    const fetchPromise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, ttlMs);
        return result;
      } finally {
        this.inFlight.delete(normalized);
      }
    })();

    this.inFlight.set(normalized, fetchPromise);
    const data = await fetchPromise;
    return { data, cached: false };
  }
}

// Global server-side locality cache
export const localityCache = new MemoryCache<LocalityReport>();
export const comparisonCache = new MemoryCache<any>();
export default localityCache;
