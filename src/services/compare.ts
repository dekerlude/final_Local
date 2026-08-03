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

    const rawText = await claudeService.executeClaudeRequest(systemPrompt, userPrompt);
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
}

export const compareService = new CompareService();
