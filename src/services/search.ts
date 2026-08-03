/**
 * Search Service for LocalLens
 * Provides client-side real-time locality autocomplete across India,
 * debouncing utilities, and delegates deep context gathering to the search pipeline.
 */

import { searchService as baseSearchService, LocalitySearchContext } from "./search/index";

export interface LocalitySuggestion {
  id: string;
  name: string;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
  importance: number;
}

export class SearchClientService {
  private suggestionsCache = new Map<string, LocalitySuggestion[]>();

  /**
   * Real-time debounced locality suggestions across India
   */
  async searchSuggestions(query: string, limit = 8): Promise<LocalitySuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const cacheKey = trimmed.toLowerCase();
    if (this.suggestionsCache.has(cacheKey)) {
      return this.suggestionsCache.get(cacheKey)!.slice(0, limit);
    }

    try {
      const encoded = encodeURIComponent(trimmed);
      const res = await fetch(`/api/search/suggestions?q=${encoded}&limit=${limit}`);

      if (!res.ok) {
        return [];
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.suggestions)) {
        const results: LocalitySuggestion[] = json.suggestions;
        this.suggestionsCache.set(cacheKey, results);
        return results.slice(0, limit);
      }

      return [];
    } catch (err) {
      console.error("[SearchClientService.searchSuggestions] Error:", err);
      return [];
    }
  }

  /**
   * Gather full spatial context for AI intelligence report generation
   */
  async gatherContext(
    query: string,
    onProgress?: (_progress: number, _msg: string, _partialData?: Partial<any>) => void
  ): Promise<LocalitySearchContext> {
    return baseSearchService.gatherContext(query, onProgress);
  }
}

export const searchService = new SearchClientService();
export const searchLocalitySuggestions = (query: string, limit = 8) =>
  searchService.searchSuggestions(query, limit);

export default searchService;
export * from "./search/types";
