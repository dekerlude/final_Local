/**
 * Backend API Route: /api/search/suggestions
 * Provides real-time, debounced locality suggestions strictly for India.
 * Implements server-side caching, deduplication, and address formatting.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export interface LocalitySuggestionItem {
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

interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  residential?: string;
  city_district?: string;
  district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimItem {
  place_id: number;
  osm_id: number;
  osm_type: string;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance?: number;
  address?: NominatimAddress;
  name?: string;
}

// In-memory cache for search suggestions
interface CacheEntry {
  data: LocalitySuggestionItem[];
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const suggestionsCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<LocalitySuggestionItem[]>>();

/**
 * Format a clean address string: "Area, City, State"
 */
function formatLocationDisplay(item: NominatimItem): {
  name: string;
  city: string;
  state: string;
  formattedAddress: string;
} {
  const addr = item.address || {};

  const area =
    item.name ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.residential ||
    addr.city_district ||
    item.display_name.split(",")[0]?.trim() ||
    "Locality";

  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.village ||
    addr.state_district ||
    addr.district ||
    "";

  const state = addr.state || "";

  // Build clean "Area, City, State" string without duplicates
  const parts: string[] = [];
  if (area) parts.push(area);
  if (city && city.toLowerCase() !== area.toLowerCase()) parts.push(city);
  if (state && state.toLowerCase() !== city.toLowerCase() && state.toLowerCase() !== area.toLowerCase()) {
    parts.push(state);
  }

  const formattedAddress = parts.length > 0 ? parts.join(", ") : item.display_name;

  return {
    name: area,
    city: city || (state ? state : "India"),
    state: state || "India",
    formattedAddress,
  };
}

/**
 * Fetch suggestions from Nominatim API with India restriction
 */
async function fetchNominatimSuggestions(query: string, limit = 8): Promise<LocalitySuggestionItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const encoded = encodeURIComponent(trimmed);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&countrycodes=in&limit=${Math.min(limit, 15)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
        "Accept-Language": "en",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Nominatim] Responded with status ${res.status}`);
      return [];
    }

    const rawList: NominatimItem[] = await res.json();
    if (!Array.isArray(rawList)) return [];

    const seenNames = new Set<string>();
    const formattedList: LocalitySuggestionItem[] = [];

    for (const item of rawList) {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      if (isNaN(lat) || isNaN(lon)) continue;

      const { name, city, state, formattedAddress } = formatLocationDisplay(item);
      const key = `${formattedAddress.toLowerCase()}`;

      if (seenNames.has(key)) continue;
      seenNames.add(key);

      formattedList.push({
        id: `osm_${item.osm_type ? item.osm_type[0].toLowerCase() : "n"}${item.osm_id || item.place_id}`,
        name,
        formattedAddress,
        city,
        state,
        country: "India",
        latitude: lat,
        longitude: lon,
        type: item.type || "locality",
        importance: item.importance || 0.5,
      });

      if (formattedList.length >= limit) break;
    }

    // Sort by importance descending
    formattedList.sort((a, b) => b.importance - a.importance);
    return formattedList;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.error("[Nominatim Suggestions Error]:", err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const queryKey = q.toLowerCase().trim();

    if (!queryKey || queryKey.length < 2) {
      return NextResponse.json({
        success: true,
        query: q,
        suggestions: [],
        count: 0,
      });
    }

    // Check in-memory cache
    const cached = suggestionsCache.get(queryKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        query: q,
        suggestions: cached.data.slice(0, limit),
        count: cached.data.length,
        cached: true,
      });
    }

    // In-flight deduplication
    let fetchPromise = inFlightRequests.get(queryKey);
    if (!fetchPromise) {
      fetchPromise = fetchNominatimSuggestions(queryKey, Math.max(limit, 10)).finally(() => {
        inFlightRequests.delete(queryKey);
      });
      inFlightRequests.set(queryKey, fetchPromise);
    }

    const suggestions = await fetchPromise;

    // Cache results
    if (suggestions.length > 0) {
      suggestionsCache.set(queryKey, {
        data: suggestions,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      query: q,
      suggestions: suggestions.slice(0, limit),
      count: suggestions.length,
      cached: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch suggestions";
    console.error("[GET /api/search/suggestions] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: message,
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
