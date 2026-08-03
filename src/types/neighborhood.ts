export type PriorityFactor =
  | 'Safety & Crime'
  | 'Environment & Air Quality'
  | 'Public Transport'
  | 'Basic Amenities'
  | 'Schools'
  | 'Healthcare'
  | 'Affordability'
  | 'Nightlife'
  | 'Parks & Recreation'
  | 'Traffic & Commute'

export interface Neighborhood {
  id: string
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
}

export interface NeighborhoodMetrics {
  safety: number
  environment: number
  transport: number
  amenities: number
  schools: number
  healthcare: number
  affordability: number
  nightlife: number
  parks: number
  traffic: number
}

export interface Score {
  overall: number
  safety: number
  connectivity: number
  healthcare: number
  education: number
  environment: number
  infrastructure: number
}

export interface PersonalizedScoreResult {
  personalizedScore: number
  factorBreakdown: Record<PriorityFactor, number>
  strongestFactors: PriorityFactor[]
  weakestFactors: PriorityFactor[]
}

export interface PrioritySelection {
  factor: PriorityFactor
  rank: number
}

export interface NeighborhoodData {
  neighborhood: Neighborhood
  score: Score
}

export interface PersonalizationRequest {
  neighborhoodId: string
  priorities: PriorityFactor[]
}
