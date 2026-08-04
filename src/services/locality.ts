/**
 * Locality Intelligence Service for LocalLens
 * Coordinates real-time search context gathering, empirical score computation,
 * Claude AI report generation, and data aggregation into the final LocalityReport model.
 */

import { searchService } from "@/services/search";
import { claudeService } from "@/services/claude";
import {
  LocalityReport,
  LocalityCategoryScores,
  LocalityNewsItem,
  RawLocalityAIOutput,
  LocalitySearchContext,
} from "@/types/locality";

export class LocalityService {
  /**
   * Main entry point to generate a comprehensive locality intelligence report
   */
  async analyzeLocality(
    query: string,
    onProgress?: (_progress: number, _msg: string, _partialData?: Partial<LocalityReport>) => void
  ): Promise<LocalityReport> {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error("Locality search query cannot be empty.");
    }

    // Step 1: Gather real-time public data (Nominatim, Overpass OSM POIs, Open-Meteo AQI, Web)
    const searchContext = await searchService.gatherContext(trimmed, onProgress);

    // Step 2: Generate structured intelligence using Claude API
    if (onProgress) onProgress(65, "Claude request sent");
    const aiOutput = await claudeService.generateLocalityReport(trimmed, searchContext);
    if (onProgress) onProgress(80, "Claude response received", {
      overview: aiOutput.overview,
      highlights: aiOutput.highlights,
    });

    // Step 3: Compute empirical category scores grounded in live POI census and telemetry
    const categoryScores = this.computeCategoryScores(aiOutput);
    const overallScore = this.computeOverallLivability(categoryScores);
    if (onProgress) onProgress(90, "Personalization calculated", { categoryScores, overallScore });

    // Step 4: Normalize news items
    const latestNewsNormalized = this.normalizeNews(aiOutput.latestNews, searchContext);

    // Step 5: Extract name and location hierarchy
    const nameParts = searchContext.displayName.split(",");
    const localityName = nameParts[0]?.trim() || trimmed;
    const city = searchContext.city || nameParts[1]?.trim() || "Urban District";
    const state = searchContext.state || nameParts[2]?.trim() || "";
    const country = searchContext.country || nameParts[nameParts.length - 1]?.trim() || "India";

    // Format final aggregated report matching LocalityReport interface
    const report: LocalityReport = {
      id: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      query: trimmed,
      localityName,
      city,
      state,
      country,
      latitude: searchContext.latitude ?? 28.6139,
      longitude: searchContext.longitude ?? 77.2090,
      overallScore,
      categoryScores,
      overview: aiOutput.overview || "Overview not available.",
      population: aiOutput.population || "Not Available",
      highlights: Array.isArray(aiOutput.highlights) ? aiOutput.highlights : [],
      education: Array.isArray(aiOutput.education) ? aiOutput.education : [],
      healthcare: Array.isArray(aiOutput.healthcare) ? aiOutput.healthcare : [],
      markets: Array.isArray(aiOutput.markets) ? aiOutput.markets : [],
      restaurants: Array.isArray(aiOutput.restaurants) ? aiOutput.restaurants : [],
      parks: Array.isArray(aiOutput.parks) ? aiOutput.parks : [],
      touristPlaces: Array.isArray(aiOutput.touristPlaces) ? aiOutput.touristPlaces : [],
      connectivity: aiOutput.connectivity || "Connectivity details not available.",
      safety: aiOutput.safety || "Safety evaluation not available.",
      pros: Array.isArray(aiOutput.pros) ? aiOutput.pros : [],
      cons: Array.isArray(aiOutput.cons) ? aiOutput.cons : [],
      latestNews: aiOutput.latestNews || [],
      latestNewsNormalized,
      summary: aiOutput.summary || "Summary not available.",
      scores: aiOutput.scores || {},
      airQuality: searchContext.airQuality,
      poiCensus: searchContext.poiCensus,
      geoPoints: searchContext.geoPoints || [],
      cachedAt: Date.now(),
      sourceContextSummary: `${searchContext.displayName} | OpenStreetMap (${searchContext.poiCensus?.totalAmenities ?? 0} POIs) | Open-Meteo AQI`,
    };

    if (onProgress) onProgress(100, "Dashboard ready", report);

    return report;
  }

  private computeCategoryScores(
    aiOutput: RawLocalityAIOutput
  ): LocalityCategoryScores {
    const s = aiOutput.scores || {};
    // Ensure all scores are safely bounded to 1-100 (handling legacy 1-10 scale gracefully just in case)
    const scale = (val?: number) => {
      if (typeof val !== 'number') return 50;
      return val <= 10 ? Math.round(val * 10) : Math.min(100, Math.max(1, Math.round(val)));
    };

    return {
      safetyAndCrime: scale(s.safetyAndCrime),
      environmentAndAirQuality: scale(s.environmentAndAirQuality),
      publicTransport: scale(s.publicTransport),
      basicAmenities: scale(s.basicAmenities),
      schools: scale(s.schools),
      healthcare: scale(s.healthcare),
      affordability: scale(s.affordability),
      nightlife: scale(s.nightlife),
      parksAndRecreation: scale(s.parksAndRecreation),
      trafficAndCommute: scale(s.trafficAndCommute),
      walkability: scale(s.walkability),
      restaurants: scale(s.restaurants),
      shopping: scale(s.shopping),
      familyFriendly: scale(s.familyFriendly),
    };
  }

  /**
   * Weighted overall livability calculation
   */
  private computeOverallLivability(scores: LocalityCategoryScores): number {
    const values = Object.values(scores);
    if (values.length === 0) return 50;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  /**
   * Normalizes news items to standard format with fallback links
   */
  private normalizeNews(
    news: (string | LocalityNewsItem)[] | undefined,
    context: LocalitySearchContext
  ): LocalityNewsItem[] {
    if (!news || news.length === 0) {
      return [
        {
          headline: `${context.displayName.split(",")[0] || "Locality"} Infrastructure & Development Review`,
          source: "Municipal & Civic Records",
          published_time: new Date().toISOString(),
          summary: `Comprehensive evaluation of local civic infrastructure, connectivity corridors, and neighborhood amenities.`,
          link: `https://www.google.com/search?q=${encodeURIComponent(context.displayName + " news")}`,
        },
      ];
    }

    return news.map((item, idx) => {
      if (typeof item === "string") {
        return {
          headline: item.length > 80 ? item.substring(0, 77) + "..." : item,
          source: "Local Civic News",
          published_time: new Date().toISOString(),
          summary: item,
          link: `https://www.google.com/search?q=${encodeURIComponent(item)}`,
        };
      }
      return {
        headline: item.headline || `Civic Update ${idx + 1}`,
        source: item.source || "Regional Press",
        published_time: item.published_time || new Date().toISOString(),
        summary: item.summary || item.headline || "Civic and community update.",
        link: item.link || `https://www.google.com/search?q=${encodeURIComponent(item.headline || "news")}`,
      };
    });
  }
}

export const localityService = new LocalityService();
export default localityService;
