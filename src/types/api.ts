/**
 * API Response Types
 * Types for all backend API responses
 */

export * from './locality';

// Maps API Types
export interface MetricScore {
  name: string
  score: number
  description: string
}

export interface NewsArticle {
  headline: string
  source: string
  published_time: string
  summary: string
  link: string
}

export interface MapDetails {
  latitude: number
  longitude: number
  embed_url: string
  provider: string
  zoom: number
  google_maps_url: string
}

export interface AmenitiesDetails {
  hospitals: string[]
  schools: string[]
  parks: string[]
  markets: string[]
  transport: string[]
  police_stations: string[]
  fire_stations: string[]
  parking: string
}

export interface NeighborhoodInsights {
  walkability: number
  green_cover: string
  road_connectivity: string
  public_transport_accessibility: number
  healthcare_accessibility: string
  education_accessibility: string
  shopping_accessibility: string
  entertainment_accessibility: string
  sports_facilities: string
  food_dining_availability: string
  lifestyle_score: number
}

export interface NeighborhoodBasic {
  id: number | string
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
}

export interface SearchResponse {
  query: string
  results: NeighborhoodBasic[]
  count: number
}

export interface NeighborhoodResponse {
  id: number | string
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
  population: number
  area_sqmi: number
  overall_score: number
  metrics: MetricScore[]
  
  // Chandigarh enriched fields
  population_status?: string
  area_sqkm?: number
  density?: number
  households?: number
  ward?: string
  admin_region?: string
  news?: NewsArticle[]
  map_details?: MapDetails
  amenities_details?: AmenitiesDetails
  insights?: NeighborhoodInsights
}

// Personalization API Types
export interface PersonalizationRequest {
  neighborhood_id: number | string
  priorities: string[]
}

export interface PersonalizedScoreResponse {
  personalizedScore: number
  factorBreakdown: Record<string, number>
  strongestFactors: string[]
  weakestFactors: string[]
}

// Summary API Types
export interface AISummaryRequest {
  neighborhood_id: number | string
  priorities: string[]
  personalizedScore: number
  factorBreakdown: Record<string, number>
}

export interface AISummaryResponse {
  summary: string
}

// Health Check
export interface HealthResponse {
  status: string
}
