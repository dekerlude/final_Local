export type UserProfile = "FAMILY" | "STUDENT" | "PROFESSIONAL";

export interface ProfileDefinition {
  id: UserProfile;
  label: string;
  icon: string;
  description: string;
  weights: Record<string, number>;
}

export const PROFILE_DEFINITIONS: Record<UserProfile, ProfileDefinition> = {
  FAMILY: {
    id: "FAMILY",
    label: "Family",
    icon: "👨‍👩‍👧‍👦",
    description: "Prioritizes schools, safety, healthcare",
    weights: {
      SAFETY: 0.25,
      EDUCATION: 0.25,
      HEALTHCARE: 0.15,
      CONNECTIVITY: 0.15,
      ENVIRONMENT: 0.15,
      INFRASTRUCTURE: 0.05,
    },
  },
  STUDENT: {
    id: "STUDENT",
    label: "Student",
    icon: "🎓",
    description: "Prioritizes affordability, transit, culture",
    weights: {
      CONNECTIVITY: 0.3,
      INFRASTRUCTURE: 0.25,
      SAFETY: 0.15,
      ENVIRONMENT: 0.15,
      HEALTHCARE: 0.1,
      EDUCATION: 0.05,
    },
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    label: "Professional",
    icon: "💼",
    description: "Prioritizes commute time, dining, nightlife",
    weights: {
      CONNECTIVITY: 0.35,
      INFRASTRUCTURE: 0.2,
      ENVIRONMENT: 0.2,
      SAFETY: 0.15,
      HEALTHCARE: 0.05,
      EDUCATION: 0.05,
    },
  },
};

export const SCORE_CATEGORIES = [
  { id: "SAFETY", label: "Safety", icon: "🛡" },
  { id: "CONNECTIVITY", label: "Connectivity", icon: "🚗" },
  { id: "HEALTHCARE", label: "Healthcare", icon: "🏥" },
  { id: "EDUCATION", label: "Education", icon: "📚" },
  { id: "ENVIRONMENT", label: "Environment", icon: "🌱" },
  { id: "INFRASTRUCTURE", label: "Infrastructure", icon: "🏗" },
];
