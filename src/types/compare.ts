import { z } from "zod";
import { LocalityReport } from "./locality";

export const ComparisonSummarySchema = z.object({
  winner: z.string(),
  betterForFamilies: z.string(),
  betterForStudents: z.string(),
  betterForProfessionals: z.string(),
  betterConnectivity: z.string(),
  betterHealthcare: z.string(),
  betterNightlife: z.string(),
  overall: z.string(),
});

export type ComparisonSummary = z.infer<typeof ComparisonSummarySchema>;

export interface CompareResponse {
  locationA: LocalityReport;
  locationB: LocalityReport;
  comparison: ComparisonSummary;
}
