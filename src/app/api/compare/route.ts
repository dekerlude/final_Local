import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { localityService } from "@/services/locality";
import { compareService } from "@/services/compare";
import { localityCache, comparisonCache } from "@/lib/cache";
import { CompareResponse } from "@/types/compare";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CompareRequestSchema = z.object({
  locationA: z.string().min(1),
  locationB: z.string().min(1),
  reportA: z.any().optional(),
  reportB: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = CompareRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload", detail: parseResult.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { locationA, locationB, reportA, reportB } = parseResult.data;

    // Fetch reports for A and B concurrently if not supplied in request body
    const [reportAResult, reportBResult] = await Promise.all([
      reportA 
        ? Promise.resolve({ data: reportA }) 
        : localityCache.getOrFetch(locationA, () => localityService.analyzeLocality(locationA)),
      reportB 
        ? Promise.resolve({ data: reportB }) 
        : localityCache.getOrFetch(locationB, () => localityService.analyzeLocality(locationB)),
    ]);

    const finalReportA = reportAResult.data;
    const finalReportB = reportBResult.data;

    const comparisonKey = `${locationA}_vs_${locationB}`;
    
    // Generate AI comparison
    const comparisonResult = await comparisonCache.getOrFetch(
      comparisonKey,
      async () => compareService.generateComparisonSummary(locationA, finalReportA, locationB, finalReportB)
    );

    const responseData: CompareResponse = {
      locationA: finalReportA,
      locationB: finalReportB,
      comparison: comparisonResult.data,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (err: any) {
    console.error("[API /compare] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate AI comparison." },
      { status: 500 }
    );
  }
}
