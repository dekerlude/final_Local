/**
 * Backend API Route: /api/locality
 * Input: { "query": "Sector 17 Chandigarh" } or GET ?query=Koramangala+Bangalore
 * Output: Structured Locality Report JSON
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { localityService } from "@/services/locality";
import { localityCache } from "@/lib/cache";
import { LocalityReport } from "@/types/locality";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const QuerySchema = z.object({
  query: z.string().min(1, "Locality query cannot be empty").max(200, "Query is too long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = QuerySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          detail: parseResult.error.errors[0]?.message || "A valid locality query is required.",
        },
        { status: 400 }
      );
    }

    const { query } = parseResult.data;

    // Utilize runtime memory cache with in-flight deduplication
    const { data: report, cached } = await localityCache.getOrFetch(
      query,
      async (): Promise<LocalityReport> => {
        return localityService.analyzeLocality(query);
      }
    );

    return NextResponse.json(
      {
        success: true,
        cached,
        ...report,
        data: report,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error occurred while analyzing locality";
    console.error("[POST /api/locality] Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Locality Analysis Failed",
        detail: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q") || searchParams.get("id");

    if (!query || !query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing query parameter",
          detail: "Please supply ?query=... in the request URL.",
        },
        { status: 400 }
      );
    }

    const trimmed = decodeURIComponent(query.trim());

    const { data: report, cached } = await localityCache.getOrFetch(
      trimmed,
      async (): Promise<LocalityReport> => {
        return localityService.analyzeLocality(trimmed);
      }
    );

    return NextResponse.json(
      {
        success: true,
        cached,
        ...report,
        data: report,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch locality";
    console.error("[GET /api/locality] Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Locality Lookup Failed",
        detail: message,
      },
      { status: 500 }
    );
  }
}
