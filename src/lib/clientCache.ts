"use client";

import { LocalityReport } from "@/types/locality";

export interface CacheEntry {
  version: string;
  cachedAt: number;
  expiresAt: number;
  locality: string;
  data: LocalityReport;
}

const CACHE_VERSION = "1.0.1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms
const LOCAL_STORAGE_KEY_PREFIX = "locallens_cache_";

class ClientCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, Promise<LocalityReport>> = new Map();

  // Normalize search query to a stable lowercased alphanumeric string
  public normalizeKey(query: string): string {
    if (!query) return "";
    return query
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Get a cached item, checking both memory and localStorage
  public get(query: string): LocalityReport | null {
    const key = this.normalizeKey(query);
    if (!key) return null;

    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)!;
      if (this.isExpired(entry)) {
        console.log(`[Cache Debug] Cache Expired for key: "${key}"`);
        this.delete(key);
        return null;
      }
      console.log(`[Cache Debug] Cache Hit (Memory) for key: "${key}"`);
      return entry.data;
    }

    // Check localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (entry.version !== CACHE_VERSION) {
            console.log(`[Cache Debug] Cache Invalidated (Version Mismatch) for key: "${key}"`);
            this.delete(key);
            return null;
          }
          if (this.isExpired(entry)) {
            console.log(`[Cache Debug] Cache Expired for key: "${key}"`);
            this.delete(key);
            return null;
          }
          // Load into memory cache for faster subsequent access
          this.memoryCache.set(key, entry);
          console.log(`[Cache Debug] Cache Hit (localStorage) for key: "${key}"`);
          return entry.data;
        }
      } catch (e) {
        console.warn(`[Cache Debug] Failed to read from localStorage for key: "${key}"`, e);
      }
    }

    console.log(`[Cache Debug] Cache Miss for key: "${key}"`);
    return null;
  }

  // Set an entry in memory and localStorage
  public set(query: string, data: LocalityReport): void {
    const key = this.normalizeKey(query);
    if (!key || !data) return;

    const now = Date.now();
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      cachedAt: now,
      expiresAt: now + CACHE_TTL,
      locality: data.localityName || query,
      data,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(entry));
        console.log(`[Cache Debug] Cache Refreshed for key: "${key}"`);
      } catch (e) {
        console.warn(`[Cache Debug] Failed to write to localStorage for key: "${key}"`, e);
      }
    }

    // Also cache under the resolved localityName if it differs
    const resolvedName = data.localityName;
    if (resolvedName) {
      const resolvedKey = this.normalizeKey(resolvedName);
      if (resolvedKey !== key) {
        this.memoryCache.set(resolvedKey, entry);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${resolvedKey}`, JSON.stringify(entry));
          } catch (e) {
            console.warn("Failed to set localStorage resolved key", e);
          }
        }
      }
    }
  }

  // Delete an entry from memory and localStorage
  public delete(query: string): void {
    const key = this.normalizeKey(query);
    if (!key) return;

    this.memoryCache.delete(key);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
      } catch (e) {
        console.warn(`[Cache Debug] Failed to remove from localStorage for key: "${key}"`, e);
      }
    }
  }

  // Clean all expired entries from localStorage
  public cleanExpired(): void {
    if (typeof window === "undefined") return;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith(LOCAL_STORAGE_KEY_PREFIX)) {
          const stored = localStorage.getItem(k);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (this.isExpired(entry) || entry.version !== CACHE_VERSION) {
              localStorage.removeItem(k);
            }
          }
        }
      });
    } catch (e) {
      console.warn("[Cache Debug] Failed to clean expired localStorage items", e);
    }
  }

  // Check if a cache entry is expired
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  // Fetch with in-flight deduplication
  public async fetchLocality(query: string): Promise<LocalityReport> {
    const key = this.normalizeKey(query);
    
    // 1. Check cache
    const cached = this.get(query);
    if (cached) {
      console.log(`[Cache Debug] Claude Request Avoided for key: "${key}"`);
      return cached;
    }

    // 2. Check if there's an in-flight request for this normalized key
    if (this.inFlightRequests.has(key)) {
      console.log(`[Cache Debug] Deduplicating request for key: "${key}" (waiting for in-flight promise)`);
      return this.inFlightRequests.get(key)!;
    }

    // 3. Otherwise start fetch
    console.log(`[Cache Debug] Claude Request Started for key: "${key}"`);
    const fetchPromise = (async () => {
      try {
        const response = await fetch("/api/locality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch locality details from server: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success || !data.data) {
          throw new Error(data.error || "Server returned unsuccessful status or empty data");
        }

        const report: LocalityReport = data.data;
        
        // Save to cache
        this.set(query, report);
        
        return report;
      } finally {
        // Remove from in-flight requests map when done
        this.inFlightRequests.delete(key);
      }
    })();

    // Store the promise in the map
    this.inFlightRequests.set(key, fetchPromise);
    return fetchPromise;
  }
}

export const clientCache = new ClientCache();
