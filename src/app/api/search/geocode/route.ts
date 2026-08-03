/**
 * Backend API Route: /api/search/geocode
 * Geocoding & Reverse-geocoding proxy for India localities.
 * Resolves exact coordinates and bounding administrative areas.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  city: string;
  state: string;
  country: string;
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLon, maxLon]
  type?: string;
  osmId?: string;
}

const geocodeCache = new Map<string, GeocodeResult>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    // Forward Geocoding
    if (query && query.trim().length > 0) {
      const trimmed = query.trim().toLowerCase();
      if (geocodeCache.has(trimmed)) {
        return NextResponse.json({
          success: true,
          data: geocodeCache.get(trimmed),
          cached: true,
        });
      }

      const encoded = encodeURIComponent(trimmed);
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&countrycodes=in&limit=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `Nominatim status ${res.status}` },
          { status: 502 }
        );
      }

      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) {
        return NextResponse.json(
          { success: false, error: "Location not found in India" },
          { status: 404 }
        );
      }

      const primary = results[0];
      const addr = primary.address || {};
      const resultLat = parseFloat(primary.lat);
      const resultLon = parseFloat(primary.lon);

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.state_district ||
        addr.district ||
        "";
      const state = addr.state || "";
      const country = addr.country || "India";
      const name =
        primary.name ||
        addr.neighbourhood ||
        addr.suburb ||
        addr.quarter ||
        primary.display_name.split(",")[0]?.trim() ||
        query;

      const geocodeResult: GeocodeResult = {
        latitude: resultLat,
        longitude: resultLon,
        displayName: primary.display_name,
        name,
        city: city || (state ? state : "India"),
        state: state || "India",
        country,
        type: primary.type,
        osmId: `osm_${primary.osm_type ? primary.osm_type[0].toLowerCase() : "n"}${primary.osm_id}`,
      };

      if (Array.isArray(primary.boundingbox) && primary.boundingbox.length === 4) {
        geocodeResult.boundingBox = [
          parseFloat(primary.boundingbox[0]),
          parseFloat(primary.boundingbox[1]),
          parseFloat(primary.boundingbox[2]),
          parseFloat(primary.boundingbox[3]),
        ];
      }

      geocodeCache.set(trimmed, geocodeResult);

      return NextResponse.json({
        success: true,
        data: geocodeResult,
        cached: false,
      });
    }

    // Reverse Geocoding
    if (lat && lon) {
      const cacheKey = `rev:${lat},${lon}`;
      if (geocodeCache.has(cacheKey)) {
        return NextResponse.json({
          success: true,
          data: geocodeCache.get(cacheKey),
          cached: true,
        });
      }

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: `Nominatim status ${res.status}` },
          { status: 502 }
        );
      }

      const result = await res.json();
      const addr = result.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.state_district ||
        "";
      const state = addr.state || "";
      const country = addr.country || "India";
      const name =
        result.name ||
        addr.neighbourhood ||
        addr.suburb ||
        result.display_name?.split(",")[0]?.trim() ||
        "Locality";

      const reverseResult: GeocodeResult = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        displayName: result.display_name || `${name}, ${city}`,
        name,
        city: city || (state ? state : "India"),
        state: state || "India",
        country,
        type: result.type,
      };

      geocodeCache.set(cacheKey, reverseResult);

      return NextResponse.json({
        success: true,
        data: reverseResult,
        cached: false,
      });
    }

    return NextResponse.json(
      { success: false, error: "Missing query or coordinate parameters (?q=... or ?lat=...&lon=...)" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Geocoding failed";
    console.error("[GET /api/search/geocode] Error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
