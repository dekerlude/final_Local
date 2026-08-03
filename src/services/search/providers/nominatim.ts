import { SearchProvider, SearchProviderResult } from "../types";

interface NominatimAddress {
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponseItem {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance?: number;
  address?: NominatimAddress;
}

export class NominatimProvider implements SearchProvider {
  name = "OpenStreetMap-Nominatim";

  isEnabled(): boolean {
    return true;
  }

  async search(query: string): Promise<SearchProviderResult> {
    try {
      const encoded = encodeURIComponent(query.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=3`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          providerName: this.name,
          success: false,
          items: [],
          error: `Nominatim responded with status ${response.status}`,
        };
      }

      const results: NominatimResponseItem[] = await response.json();

      if (!results || results.length === 0) {
        return {
          providerName: this.name,
          success: true,
          items: [],
        };
      }

      const primary = results[0];
      const lat = parseFloat(primary.lat);
      const lon = parseFloat(primary.lon);
      const addr = primary.address || {};

      const city = addr.city || addr.town || addr.municipality || addr.village || addr.state_district || "";
      const state = addr.state || "";
      const country = addr.country || "";

      const items = results.map((r) => ({
        title: `Geographic Location: ${r.display_name}`,
        snippet: `Location type: ${r.type}. Coordinates: ${r.lat}, ${r.lon}. Bounding administrative structure: ${r.address?.city || r.address?.state || ""}`,
        source: "OpenStreetMap",
        url: `https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}#map=15/${r.lat}/${r.lon}`,
      }));

      return {
        providerName: this.name,
        success: true,
        items,
        metadata: {
          latitude: isNaN(lat) ? undefined : lat,
          longitude: isNaN(lon) ? undefined : lon,
          displayName: primary.display_name,
          city,
          state,
          country,
          extractedFacts: {
            "OpenStreetMap Display Name": primary.display_name,
            "Coordinates": `${primary.lat}° N, ${primary.lon}° E`,
            "Administrative Category": primary.type,
          },
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        providerName: this.name,
        success: false,
        items: [],
        error: errorMessage,
      };
    }
  }
}
