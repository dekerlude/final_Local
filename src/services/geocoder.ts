/**
 * Geocoder Service for LocalLens
 * Client-side geocoding and reverse geocoding via backend API proxy (/api/search/geocode).
 * Strictly routes through the backend to avoid exposing direct external calls.
 */

export interface GeocodeLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  city: string;
  state: string;
  country: string;
  boundingBox?: [number, number, number, number];
  type?: string;
  osmId?: string;
}

export class GeocoderService {
  private clientCache = new Map<string, GeocodeLocation>();

  /**
   * Forward geocode a locality or address string in India
   */
  async geocode(query: string): Promise<GeocodeLocation | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const cacheKey = trimmed.toLowerCase();
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    try {
      const encoded = encodeURIComponent(trimmed);
      const res = await fetch(`/api/search/geocode?q=${encoded}`);

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json.success && json.data) {
        this.clientCache.set(cacheKey, json.data);
        return json.data;
      }

      return null;
    } catch (err) {
      console.error("[GeocoderService.geocode] Error:", err);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to an Indian address hierarchy
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeLocation | null> {
    const cacheKey = `rev:${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    if (this.clientCache.has(cacheKey)) {
      return this.clientCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`/api/search/geocode?lat=${latitude}&lon=${longitude}`);
      if (!res.ok) return null;

      const json = await res.json();
      if (json.success && json.data) {
        this.clientCache.set(cacheKey, json.data);
        return json.data;
      }

      return null;
    } catch (err) {
      console.error("[GeocoderService.reverseGeocode] Error:", err);
      return null;
    }
  }

  /**
   * Cleanly format location string as "Area, City, State"
   */
  formatDisplayName(location: GeocodeLocation): string {
    const parts: string[] = [];
    if (location.name) parts.push(location.name);
    if (location.city && location.city.toLowerCase() !== location.name.toLowerCase()) {
      parts.push(location.city);
    }
    if (
      location.state &&
      location.state.toLowerCase() !== location.city.toLowerCase() &&
      location.state.toLowerCase() !== location.name.toLowerCase()
    ) {
      parts.push(location.state);
    }
    return parts.length > 0 ? parts.join(", ") : location.displayName;
  }
}

export const geocoderService = new GeocoderService();
export default geocoderService;
