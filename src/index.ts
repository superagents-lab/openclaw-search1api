import {
  crawl,
  news,
  search,
  sitemap,
  trending,
  type NewsService,
  type SearchService,
  type TimeRange,
  type TrendingService,
} from "search1api-cli/sdk";
import { Type } from "typebox";
import { defineToolPlugin } from "openclaw/plugin-sdk/tool-plugin";

const searchServices = Type.Union([
  Type.Literal("google"),
  Type.Literal("bing"),
  Type.Literal("duckduckgo"),
  Type.Literal("yahoo"),
  Type.Literal("x"),
  Type.Literal("reddit"),
  Type.Literal("github"),
  Type.Literal("youtube"),
  Type.Literal("arxiv"),
  Type.Literal("wechat"),
  Type.Literal("bilibili"),
  Type.Literal("imdb"),
  Type.Literal("wikipedia"),
]);

const newsServices = Type.Union([
  Type.Literal("google"),
  Type.Literal("bing"),
  Type.Literal("duckduckgo"),
  Type.Literal("yahoo"),
  Type.Literal("hackernews"),
]);

const timeRanges = Type.Union([
  Type.Literal("day"),
  Type.Literal("month"),
  Type.Literal("year"),
]);

const configSchema = Type.Object({
  apiKey: Type.Optional(
    Type.String({
      description:
        "Search1API API key. Prefer the SEARCH1API_KEY environment variable or shared s1 OAuth login when possible.",
    })
  ),
});

export default defineToolPlugin({
  id: "search1api",
  name: "Search1API",
  description:
    "Search the live web, read pages, find news, discover site links, and explore trending topics.",
  configSchema,
  tools: (tool) => [
    tool({
      name: "search1api_search",
      label: "Search1API Web Search",
      description:
        "Search the live web. Use for current facts, research, documentation, people, companies, products, and source discovery.",
      parameters: Type.Object({
        query: Type.String({ description: "Search query." }),
        maxResults: Type.Optional(
          Type.Integer({ minimum: 1, maximum: 50, description: "Maximum number of results." })
        ),
        searchService: Type.Optional(searchServices),
        crawlResults: Type.Optional(
          Type.Integer({ minimum: 0, maximum: 50, description: "Number of results to retrieve in full." })
        ),
        includeSites: Type.Optional(
          Type.Array(Type.String(), { description: "Only return results from these domains." })
        ),
        excludeSites: Type.Optional(
          Type.Array(Type.String(), { description: "Exclude results from these domains." })
        ),
        timeRange: Type.Optional(timeRanges),
      }),
      execute: async (params, config, context) => {
        context.signal?.throwIfAborted();
        return search(params.query, {
          apiKey: config.apiKey,
          signal: context.signal,
          maxResults: params.maxResults,
          searchService: params.searchService as SearchService | undefined,
          crawlResults: params.crawlResults,
          includeSites: params.includeSites,
          excludeSites: params.excludeSites,
          timeRange: params.timeRange as TimeRange | undefined,
        });
      },
    }),
    tool({
      name: "search1api_news",
      label: "Search1API News",
      description: "Search current news and optionally retrieve full article content.",
      parameters: Type.Object({
        query: Type.String({ description: "News query." }),
        maxResults: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })),
        searchService: Type.Optional(newsServices),
        crawlResults: Type.Optional(Type.Integer({ minimum: 0, maximum: 50 })),
        includeSites: Type.Optional(Type.Array(Type.String())),
        excludeSites: Type.Optional(Type.Array(Type.String())),
        timeRange: Type.Optional(timeRanges),
      }),
      execute: async (params, config, context) => {
        context.signal?.throwIfAborted();
        return news(params.query, {
          apiKey: config.apiKey,
          signal: context.signal,
          maxResults: params.maxResults,
          searchService: params.searchService as NewsService | undefined,
          crawlResults: params.crawlResults,
          includeSites: params.includeSites,
          excludeSites: params.excludeSites,
          timeRange: params.timeRange as TimeRange | undefined,
        });
      },
    }),
    tool({
      name: "search1api_crawl",
      label: "Search1API Page Reader",
      description: "Retrieve clean readable content from a public URL.",
      parameters: Type.Object({
        url: Type.String({ format: "uri", description: "Public page URL to retrieve." }),
      }),
      execute: async ({ url }, config, context) => {
        context.signal?.throwIfAborted();
        return crawl(url, { apiKey: config.apiKey, signal: context.signal });
      },
    }),
    tool({
      name: "search1api_sitemap",
      label: "Search1API Sitemap",
      description: "Discover links related to a public URL or domain.",
      parameters: Type.Object({
        url: Type.String({ format: "uri", description: "Public URL or domain to explore." }),
      }),
      execute: async ({ url }, config, context) => {
        context.signal?.throwIfAborted();
        return sitemap(url, { apiKey: config.apiKey, signal: context.signal });
      },
    }),
    tool({
      name: "search1api_trending",
      label: "Search1API Trending",
      description: "Find trending repositories on GitHub or stories on Hacker News.",
      parameters: Type.Object({
        service: Type.Union([Type.Literal("github"), Type.Literal("hackernews")]),
        maxResults: Type.Optional(Type.Integer({ minimum: 1, maximum: 50 })),
      }),
      execute: async ({ service, maxResults }, config, context) => {
        context.signal?.throwIfAborted();
        return trending(service as TrendingService, {
          apiKey: config.apiKey,
          signal: context.signal,
          maxResults,
        });
      },
    }),
  ],
});
