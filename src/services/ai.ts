/**
 * AI Service for LocalLens
 * Standardized on Claude as the exclusive LLM provider.
 * Re-exports claudeService and localityService for backwards-compatible imports.
 */

import { claudeService, ClaudeService, RawLocalityAIOutputSchema } from "./claude";
import { localityService, LocalityService } from "./locality";
import {
  RawLocalityAIOutput,
  LocalityReport,
  LocalitySearchContext,
} from "@/types/locality";

export { claudeService, localityService, RawLocalityAIOutputSchema };
export { ClaudeError, ClaudeAuthError, ClaudeAPIError, ClaudeValidationError } from "./claude";

export class AIService {
  private claude: ClaudeService;
  private locality: LocalityService;

  constructor() {
    this.claude = claudeService;
    this.locality = localityService;
  }

  async generateLocalityReport(
    query: string,
    searchContext: LocalitySearchContext
  ): Promise<RawLocalityAIOutput> {
    return this.claude.generateLocalityReport(query, searchContext);
  }

  async analyzeLocality(query: string): Promise<LocalityReport> {
    return this.locality.analyzeLocality(query);
  }

  async generatePersonalizedExplanation(
    neighborhoodName: string,
    personalizedScore: number,
    priorities: string[],
    factorBreakdown: Record<string, number>,
    strongestFactors: string[],
    weakestFactors: string[]
  ): Promise<string> {
    return this.claude.generatePersonalizedExplanation(
      neighborhoodName,
      personalizedScore,
      priorities,
      factorBreakdown,
      strongestFactors,
      weakestFactors
    );
  }
}

export const aiService = new AIService();
export default aiService;
