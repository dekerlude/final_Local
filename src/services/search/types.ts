/**
 * Modular Search Layer Interface and Types
 */

import {
  LocalitySearchContext,
  SearchContextItem,
  LocalityAirQuality,
  LocalityPOICensus,
  LocalityGeoPoint,
} from "@/types/locality";

export interface SearchProviderResult {
  providerName: string;
  success: boolean;
  items: SearchContextItem[];
  metadata?: {
    latitude?: number;
    longitude?: number;
    displayName?: string;
    city?: string;
    state?: string;
    country?: string;
    extractedFacts?: Record<string, string>;
    airQuality?: LocalityAirQuality;
    poiCensus?: LocalityPOICensus;
    geoPoints?: LocalityGeoPoint[];
  };
  rawText?: string;
  error?: string;
}


export interface SearchProvider {
  name: string;
  isEnabled(): boolean;
  search(_query: string): Promise<SearchProviderResult>;
}

export type { LocalitySearchContext, SearchContextItem };
