/**
 * Locality Intelligence Types
 * Strict TypeScript interfaces for AI-powered locality reports, search context, and API responses.
 */

export interface LocalityQueryRequest {
  query: string;
}

export interface LocalityNewsItem {
  headline: string;
  source: string;
  published_time?: string;
  summary: string;
  link?: string;
}

/**
 * Expected strict JSON schema from LLM
 */
export interface RawLocalityAIOutput {
  overview: string;
  population: string;
  highlights: string[];
  education: string[];
  healthcare: string[];
  markets: string[];
  restaurants: string[];
  parks: string[];
  touristPlaces: string[];
  connectivity: string;
  safety: string;
  pros: string[];
  cons: string[];
  latestNews: (string | LocalityNewsItem)[];
  summary: string;
  scores: Record<string, number>;
}

export interface LocalityAirQuality {
  aqi: number;
  usAqi?: number;
  category: "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous";
  pm25: number;
  pm10: number;
  no2?: number;
  o3?: number;
  advisory: string;
  source: string;
  updatedAt: string;
}

export interface LocalityPOICensus {
  radiusKm: number;
  healthcareCount: number;
  educationCount: number;
  transitCount: number;
  parksCount: number;
  marketsCount: number;
  diningCount: number;
  totalAmenities: number;
  topHospitals: string[];
  topSchools: string[];
  topTransitStops: string[];
  topParks: string[];
  topMarkets: string[];
  topRestaurants: string[];
}

export interface LocalityGeoPoint {
  id: string;
  name: string;
  category: "healthcare" | "education" | "transit" | "park" | "market" | "dining";
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address?: string;
}

export interface LocalityCategoryScores {
  safetyAndCrime: number;
  environmentAndAirQuality: number;
  publicTransport: number;
  basicAmenities: number;
  schools: number;
  healthcare: number;
  affordability: number;
  nightlife: number;
  parksAndRecreation: number;
  trafficAndCommute: number;
  walkability: number;
  restaurants: number;
  shopping: number;
  familyFriendly: number;
}

/**
 * Full locality report delivered to the UI
 */
export interface LocalityReport extends RawLocalityAIOutput {
  id: string;
  localityName: string;
  query: string;
  city: string;
  state: string;
  country?: string;
  latitude: number;
  longitude: number;
  overallScore: number;
  categoryScores: LocalityCategoryScores;
  latestNewsNormalized: LocalityNewsItem[];
  airQuality?: LocalityAirQuality;
  poiCensus?: LocalityPOICensus;
  geoPoints?: LocalityGeoPoint[];
  cachedAt: number;
  sourceContextSummary?: string;
}

export interface LocalityAPIResponse {
  success: boolean;
  data?: LocalityReport;
  error?: string;
  detail?: string;
  cached?: boolean;
}

export interface SearchContextItem {
  title: string;
  snippet: string;
  url?: string;
  source: string;
}

export interface LocalitySearchContext {
  query: string;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  summarySnippets: string[];
  factualDetails: Record<string, string>;
  items: SearchContextItem[];
  airQuality?: LocalityAirQuality;
  poiCensus?: LocalityPOICensus;
  geoPoints?: LocalityGeoPoint[];
}

