import { claudeService, ClaudeError, ClaudeValidationError } from "./claude";
import { LocalityReport } from "@/types/locality";
import { ComparisonSummarySchema, ComparisonSummary } from "@/types/compare";

export class CompareService {
  public async generateComparisonSummary(
    queryA: string,
    reportA: LocalityReport,
    queryB: string,
    reportB: LocalityReport
  ): Promise<ComparisonSummary> {
    const systemPrompt = "You are an elite civic intelligence and urban planning analyst comparing two localities. Follow the instructions strictly and return ONLY JSON.";

    const extractEssentials = (report: LocalityReport) => ({
      population: report.population,
      categoryScores: report.categoryScores,
      overallScore: report.overallScore,
      highlights: report.highlights,
      pros: report.pros,
      cons: report.cons,
      connectivity: report.connectivity,
      safety: report.safety,
    });

    const promptA = `LOCALITY: ${queryA}\n${JSON.stringify(extractEssentials(reportA), null, 2)}`;
    const promptB = `LOCALITY: ${queryB}\n${JSON.stringify(extractEssentials(reportB), null, 2)}`;

    const userPrompt = `Compare these two localities strictly against each other:

${promptA}

---

${promptB}

CRITICAL RULES:
1. Return ONLY a single valid JSON object adhering strictly to the schema below.
2. Never output Markdown (no \`\`\`json or \`\`\` code fences).
3. Never include explanations outside of the JSON fields.
4. For the 'winner' field, use EXACTLY the locality name ("${queryA}", "${queryB}", or "Tie").

EXPECTED JSON SCHEMA:
{
  "winner": "Locality Name",
  "betterForFamilies": "Reasoning why...",
  "betterForStudents": "Reasoning why...",
  "betterForProfessionals": "Reasoning why...",
  "betterConnectivity": "Reasoning why...",
  "betterHealthcare": "Reasoning why...",
  "betterNightlife": "Reasoning why...",
  "overall": "Final summary paragraph"
}`;

    let rawText: string;
    try {
      rawText = await claudeService.executeClaudeRequest(systemPrompt, userPrompt);
    } catch (err) {
      console.warn("[CompareService] Claude API unavailable, using fallback comparison:", err);
      return this.generateFallbackComparison(queryA, reportA, queryB, reportB);
    }

    const jsonStr = claudeService.extractJSON(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      throw new ClaudeError("Claude output was not valid JSON", e);
    }

    const validated = ComparisonSummarySchema.safeParse(parsed);
    if (!validated.success) {
      const errors = validated.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      throw new ClaudeValidationError("Claude generated invalid comparison JSON format", errors);
    }

    return validated.data;
  }

  private generateFallbackComparison(
    queryA: string,
    reportA: LocalityReport,
    queryB: string,
    reportB: LocalityReport
  ): ComparisonSummary {
    const scoreA = reportA.overallScore;
    const scoreB = reportB.overallScore;
    const winner = scoreA > scoreB ? queryA : scoreB > scoreA ? queryB : "Tie";

    return {
      winner,
      betterForFamilies: scoreA >= scoreB 
        ? `${queryA} offers a more balanced family-friendly environment with excellent community infrastructure.` 
        : `${queryB} provides a stronger foundation for families with superior community amenities.`,
      betterForStudents: reportA.categoryScores.schools >= reportB.categoryScores.schools
        ? `${queryA} is preferable for students due to its educational proximity.`
        : `${queryB} is better suited for academic pursuits given its educational ecosystem.`,
      betterForProfessionals: reportA.categoryScores.trafficAndCommute >= reportB.categoryScores.trafficAndCommute
        ? `${queryA} is highly suitable for professionals prioritizing commute and connectivity.`
        : `${queryB} stands out for working professionals due to better transit access.`,
      betterConnectivity: reportA.categoryScores.publicTransport >= reportB.categoryScores.publicTransport
        ? `${queryA} provides superior arterial and public transit connectivity.`
        : `${queryB} maintains a more robust transit and road network.`,
      betterHealthcare: reportA.categoryScores.healthcare >= reportB.categoryScores.healthcare
        ? `${queryA} boasts better access to medical and emergency facilities.`
        : `${queryB} has a more comprehensive healthcare infrastructure.`,
      betterNightlife: reportA.categoryScores.nightlife >= reportB.categoryScores.nightlife
        ? `${queryA} has a more vibrant nightlife and culinary scene.`
        : `${queryB} offers more extensive evening entertainment options.`,
      overall: `${winner === 'Tie' ? 'Both localities' : winner} presents a compelling proposition based on real-time empirical data. While ${queryA} scores ${scoreA}/100 and ${queryB} scores ${scoreB}/100, the final choice depends on individual lifestyle priorities.`
    };
  }
}

export const compareService = new CompareService();
