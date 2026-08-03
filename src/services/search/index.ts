import { NominatimProvider } from "./providers/nominatim";
import { WikipediaProvider } from "./providers/wikipedia";
import { DuckDuckGoProvider } from "./providers/duckduckgo";
import { WebSearchProvider } from "./providers/webSearch";
import { AirQualityProvider } from "./providers/aqi";
import { OverpassProvider } from "./providers/overpass";
import {
  SearchProvider,
  SearchProviderResult,
  LocalitySearchContext,
  SearchContextItem,
} from "./types";
import {
  LocalityAirQuality,
  LocalityPOICensus,
  LocalityGeoPoint,
} from "@/types/locality";

export class SearchService {
  private baseProviders: SearchProvider[];
  private aqiProvider: AirQualityProvider;
  private overpassProvider: OverpassProvider;

  constructor() {
    this.baseProviders = [
      new NominatimProvider(),
      new WikipediaProvider(),
      new DuckDuckGoProvider(),
      new WebSearchProvider(),
    ];
    this.aqiProvider = new AirQualityProvider();
    this.overpassProvider = new OverpassProvider();
  }

  /**
   * Gather comprehensive real-time public information and hard metrics for a locality query
   */
  async gatherContext(
    query: string,
    onProgress?: (_progress: number, _msg: string, _partialData?: Partial<any>) => void
  ): Promise<LocalitySearchContext> {
    const trimmed = query.trim();
    if (onProgress) onProgress(10, "Request received");
    
    const enabledBase = this.baseProviders.filter((p) => p.isEnabled());

    // Phase 1: Textual context & coordinate resolution
    const results = await Promise.allSettled(
      enabledBase.map((p) => p.search(trimmed))
    );

    const items: SearchContextItem[] = [];
    const factualDetails: Record<string, string> = {};
    let displayName = trimmed;
    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;

    for (const res of results) {
      if (res.status === "fulfilled" && res.value.success) {
        const providerRes: SearchProviderResult = res.value;

        if (providerRes.metadata) {
          if (providerRes.metadata.latitude !== undefined && latitude === undefined) {
            latitude = providerRes.metadata.latitude;
          }
          if (providerRes.metadata.longitude !== undefined && longitude === undefined) {
            longitude = providerRes.metadata.longitude;
          }
          if (providerRes.metadata.displayName && displayName === trimmed) {
            displayName = providerRes.metadata.displayName;
          }
          if (providerRes.metadata.city && !city) {
            city = providerRes.metadata.city;
          }
          if (providerRes.metadata.state && !state) {
            state = providerRes.metadata.state;
          }
          if (providerRes.metadata.country && !country) {
            country = providerRes.metadata.country;
          }
          if (providerRes.metadata.extractedFacts) {
            Object.assign(factualDetails, providerRes.metadata.extractedFacts);
          }
        }

        if (Array.isArray(providerRes.items)) {
          items.push(...providerRes.items);
        }
      }
    }

    if (onProgress) onProgress(25, "Location search complete");

    let airQuality: LocalityAirQuality | undefined;
    let poiCensus: LocalityPOICensus | undefined;
    let geoPoints: LocalityGeoPoint[] | undefined;

    // Phase 2: Hard Metrics & Sensor Grounding (if coordinates resolved)
    if (latitude !== undefined && longitude !== undefined) {
      const [aqiResult, overpassResult] = await Promise.allSettled([
        this.aqiProvider.fetchAirQuality(latitude, longitude),
        this.overpassProvider.fetchPOICensus(latitude, longitude, 2500),
      ]);

      if (aqiResult.status === "fulfilled" && aqiResult.value) {
        airQuality = aqiResult.value;
        items.push({
          title: `Live Air Quality: ${airQuality.category} (AQI ${airQuality.aqi})`,
          snippet: `Current atmospheric telemetry: AQI ${airQuality.aqi}, PM2.5: ${airQuality.pm25} µg/m³, PM10: ${airQuality.pm10} µg/m³. Health advisory: ${airQuality.advisory}`,
          source: airQuality.source,
        });
        factualDetails["Air Quality (AQI)"] = `${airQuality.aqi} (${airQuality.category})`;
        factualDetails["PM2.5 Level"] = `${airQuality.pm25} µg/m³`;
      }

      if (overpassResult.status === "fulfilled" && overpassResult.value) {
        poiCensus = overpassResult.value.census;
        geoPoints = overpassResult.value.geoPoints;
        items.push(...overpassResult.value.items);

        factualDetails["Verified Healthcare Amenities (2.5km)"] = `${poiCensus.healthcareCount} facilities`;
        factualDetails["Verified Educational Institutions (2.5km)"] = `${poiCensus.educationCount} institutes`;
        factualDetails["Verified Transit Hubs (2.5km)"] = `${poiCensus.transitCount} stops/stations`;
        factualDetails["Parks & Greenery (2.5km)"] = `${poiCensus.parksCount} open spaces`;
      }
    }

    // Deduplicate and filter items
    const seenSnippets = new Set<string>();
    const uniqueItems: SearchContextItem[] = [];

    for (const item of items) {
      const cleanSnippet = item.snippet.trim();
      if (!cleanSnippet || seenSnippets.has(cleanSnippet)) continue;
      seenSnippets.add(cleanSnippet);
      uniqueItems.push(item);
    }

    const summarySnippets = uniqueItems.map((item) => `[${item.source}] ${item.title}: ${item.snippet}`);

    const context: LocalitySearchContext = {
      query: trimmed,
      displayName,
      city,
      state,
      country,
      latitude,
      longitude,
      summarySnippets,
      factualDetails,
      items: uniqueItems,
      airQuality,
      poiCensus,
      geoPoints,
    };
    
    if (onProgress) onProgress(45, "Geocoding complete", context);
    
    return context;
  }
}

export const searchService = new SearchService();
export default searchService;
export * from "./types";

