import { SearchProvider, SearchProviderResult, SearchContextItem } from "../types";

interface WikipediaSearchResult {
  title: string;
  snippet?: string;
  pageid?: number;
}

interface WikipediaSummaryResponse {
  title: string;
  extract?: string;
  description?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
}

export class WikipediaProvider implements SearchProvider {
  name = "Wikipedia-Knowledge";

  isEnabled(): boolean {
    return true;
  }

  async search(query: string): Promise<SearchProviderResult> {
    try {
      const items: SearchContextItem[] = [];
      const extractedFacts: Record<string, string> = {};

      // 1. Search Wikipedia for articles matching locality
      const encoded = encodeURIComponent(query.trim());
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&utf8=1&srlimit=3&origin=*`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const searchRes = await fetch(searchUrl, {
        headers: {
          "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!searchRes.ok) {
        return {
          providerName: this.name,
          success: false,
          items: [],
          error: `Wikipedia search returned ${searchRes.status}`,
        };
      }

      const searchData = await searchRes.json();
      const searchHits: WikipediaSearchResult[] = searchData?.query?.search || [];

      if (searchHits.length > 0) {
        // Fetch detailed summary of the top matching article
        const topHit = searchHits[0];
        const pageTitle = encodeURIComponent(topHit.title.replace(/ /g, "_"));
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;

        const summaryController = new AbortController();
        const summaryTimeout = setTimeout(() => summaryController.abort(), 4000);

        try {
          const summaryRes = await fetch(summaryUrl, {
            headers: {
              "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
            },
            signal: summaryController.signal,
          });
          clearTimeout(summaryTimeout);

          if (summaryRes.ok) {
            const summaryData: WikipediaSummaryResponse = await summaryRes.json();
            if (summaryData.extract) {
              items.push({
                title: `Wikipedia: ${summaryData.title}`,
                snippet: summaryData.extract,
                url: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${pageTitle}`,
                source: "Wikipedia",
              });
              extractedFacts["Wikipedia Title"] = summaryData.title;
              if (summaryData.description) {
                extractedFacts["Description"] = summaryData.description;
              }
            }
          }
        } catch {
          // Fallback to snippets if summary fails
        }

        // Add additional snippets from search hits
        for (const hit of searchHits.slice(items.length > 0 ? 1 : 0, 3)) {
          const cleanSnippet = hit.snippet
            ? hit.snippet.replace(/<[^>]*>?/gm, "").trim()
            : "";
          if (cleanSnippet) {
            items.push({
              title: `Wikipedia Topic: ${hit.title}`,
              snippet: cleanSnippet,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
              source: "Wikipedia",
            });
          }
        }
      }

      return {
        providerName: this.name,
        success: true,
        items,
        metadata: {
          extractedFacts,
        },
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        providerName: this.name,
        success: false,
        items: [],
        error: errorMessage,
      };
    }
  }
}
