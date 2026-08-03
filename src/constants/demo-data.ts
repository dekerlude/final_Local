import { UserProfile } from "./profiles";

export interface DemoNeighborhood {
  id: string;
  name: string;
  location: string;
  state: string;
  baseScore: number;
  population: number;
  categoryScores: Record<string, number>;
}

export interface PersonalizedScore {
  baseScore: number;
  personalizedScore: number;
  delta: number;
  summary: string;
}

export const DEMO_NEIGHBORHOODS: DemoNeighborhood[] = [
  {
    id: "brooklyn-heights",
    name: "Brooklyn Heights",
    location: "Brooklyn",
    state: "New York, USA",
    baseScore: 87,
    population: 1500000,
    categoryScores: {
      SAFETY: 85,
      CONNECTIVITY: 72,
      HEALTHCARE: 88,
      EDUCATION: 92,
      ENVIRONMENT: 79,
      INFRASTRUCTURE: 80,
    },
  },
  {
    id: "mission-district",
    name: "Mission District",
    location: "San Francisco",
    state: "California, USA",
    baseScore: 82,
    population: 1200000,
    categoryScores: {
      SAFETY: 75,
      CONNECTIVITY: 89,
      HEALTHCARE: 85,
      EDUCATION: 78,
      ENVIRONMENT: 82,
      INFRASTRUCTURE: 88,
    },
  },
  {
    id: "capitol-hill",
    name: "Capitol Hill",
    location: "Seattle",
    state: "Washington, USA",
    baseScore: 79,
    population: 850000,
    categoryScores: {
      SAFETY: 72,
      CONNECTIVITY: 85,
      HEALTHCARE: 82,
      EDUCATION: 75,
      ENVIRONMENT: 88,
      INFRASTRUCTURE: 80,
    },
  },
];

export function getPersonalizedScore(
  baseScore: number,
  profile: UserProfile
): PersonalizedScore {
  const adjustments: Record<UserProfile, number> = {


    FAMILY: 4,
    STUDENT: -8,
    PROFESSIONAL: 2,
  };

  const personalizedScore = Math.min(
    100,
    Math.max(0, baseScore + adjustments[profile])
  );
  const delta = personalizedScore - baseScore;

  const summaries: Record<UserProfile, string> = {
    FAMILY:
      "Brooklyn Heights is an excellent neighborhood for families due to outstanding schools (PS 8 consistently ranks in top 5%), low crime rates, and proximity to multiple hospitals and medical centers. The neighborhood also benefits from excellent infrastructure and well-maintained public spaces. Trade-offs: Limited nightlife, higher cost of living, and some traffic congestion during peak hours.",
    STUDENT:
      "Mission District offers great connectivity with excellent transit options and vibrant nightlife. However, the cost of living is high, which may impact students on tight budgets. Safety is a consideration in some areas. Best for: Young professionals and students willing to invest in the neighborhood experience.",
    PROFESSIONAL:
      "Capitol Hill provides excellent connectivity to downtown Seattle with great dining and entertainment options. The neighborhood has good infrastructure and a vibrant professional community. Some noise from nightlife venues during weekends. Best for: Young professionals seeking an active social and professional scene.",
  };

  return {
    baseScore,
    personalizedScore,
    delta,
    summary: summaries[profile],
  };
}
