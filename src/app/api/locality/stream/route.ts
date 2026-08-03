import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { localityService } from "@/services/locality";
import { localityCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow enough time for Claude

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
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (percent: number, msg: string, partialData?: any) => {
          const payload = JSON.stringify({ progress: percent, message: msg, partialData });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        };

        try {
          const { data: report, cached } = await localityCache.getOrFetch(
            query,
            async () => {
              return localityService.analyzeLocality(query, sendEvent);
            }
          );

          if (cached) {
            sendEvent(100, "Dashboard ready (Cached)", report);
          } else {
            // Already sent 100 in the fetcher
          }

          // Also send a 'complete' event to signal client to close stream safely
          controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ success: true, cached, data: report })}\n\n`));
          controller.close();
        } catch (err: any) {
          console.error("[SSE /api/locality/stream] Error:", err);
          const message = err.message || "Internal server error occurred while analyzing locality";
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
