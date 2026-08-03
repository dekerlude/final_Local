import { SearchProvider, SearchProviderResult, SearchContextItem } from "../types";

interface DDGRelatedTopic {
  Text?: string;
  FirstURL?: string;
  Topics?: Array<{
    Text?: string;
    FirstURL?: string;
  }>;
}

interface DDGResponse {
  AbstractText?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: DDGRelatedTopic[];
}

export class DuckDuckGoProvider implements SearchProvider {
  name = "DuckDuckGo-Instant";

  isEnabled(): boolean {
    return true;
  }

  async search(query: string): Promise<SearchProviderResult> {
    try {
      const items: SearchContextItem[] = [];
      const encoded = encodeURIComponent(query.trim());
      const url = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=0`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "LocalLens-Platform/2.0 (locality-intelligence; contact@locallens.app)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          providerName: this.name,
          success: false,
          items: [],
          error: `DuckDuckGo responded with ${response.status}`,
        };
      }

      const data: DDGResponse = await response.json();

      if (data.AbstractText) {
        items.push({
          title: data.Heading || `Information on ${query}`,
          snippet: data.AbstractText,
          url: data.AbstractURL,
          source: data.AbstractSource || "DuckDuckGo Abstract",
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics) {
          if (items.length >= 6) break;
          if (topic.Text) {
            items.push({
              title: topic.Text.slice(0, 60),
              snippet: topic.Text,
              url: topic.FirstURL,
              source: "DuckDuckGo Related Topic",
            });
          } else if (Array.isArray(topic.Topics)) {
            for (const subTopic of topic.Topics) {
              if (items.length >= 6) break;
              if (subTopic.Text) {
                items.push({
                  title: subTopic.Text.slice(0, 60),
                  snippet: subTopic.Text,
                  url: subTopic.FirstURL,
                  source: "DuckDuckGo Related Topic",
                });
              }
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
