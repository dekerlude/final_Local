import { SearchProvider, SearchProviderResult, SearchContextItem } from "../types";

export class WebSearchProvider implements SearchProvider {
  name = "Commercial-Web-Search";

  isEnabled(): boolean {
    return Boolean(process.env.TAVILY_API_KEY || process.env.SERPAPI_API_KEY);
  }

  async search(query: string): Promise<SearchProviderResult> {
    if (!this.isEnabled()) {
      return {
        providerName: this.name,
        success: true,
        items: [],
      };
    }

    try {
      const items: SearchContextItem[] = [];

      // 1. Tavily Search API if configured
      if (process.env.TAVILY_API_KEY) {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${query} neighborhood locality infrastructure schools hospitals crime connectivity`,
            search_depth: "basic",
            max_results: 5,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            for (const r of data.results) {
              items.push({
                title: r.title || "Web Result",
                snippet: r.content || "",
                url: r.url,
                source: "Tavily Search",
              });
            }
          }
        }
      }

      // 2. SerpAPI if configured and Tavily not used
      else if (process.env.SERPAPI_API_KEY) {
        const encoded = encodeURIComponent(query);
        const res = await fetch(`https://serpapi.com/search.json?q=${encoded}&api_key=${process.env.SERPAPI_API_KEY}&num=5`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.organic_results)) {
            for (const r of data.organic_results) {
              items.push({
                title: r.title || "Web Result",
                snippet: r.snippet || "",
                url: r.link,
                source: "Google Search (SerpAPI)",
              });
            }
          }
        }
      }

      return {
        providerName: this.name,
        success: true,
        items,
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
