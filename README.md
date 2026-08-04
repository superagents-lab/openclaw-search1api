# Search1API for OpenClaw

Native OpenClaw tools for live web search, news, page retrieval, sitemap discovery, and trending topics.

## Install

```bash
openclaw plugins install clawhub:fatwang2/openclaw-search1api
```

Restart or reload the OpenClaw Gateway after installation, then verify the runtime:

```bash
openclaw plugins inspect search1api --runtime --json
```

## Authentication

Use one of these methods:

1. Set `SEARCH1API_KEY` in the OpenClaw Gateway environment.
2. Install `search1api-cli` and run `s1 login` once; the plugin reuses the same OAuth session.
3. Set the optional plugin `apiKey` configuration using OpenClaw's secret-management facilities.

Get an API key at [search1api.com](https://www.search1api.com/).

## Tools

- `search1api_search` — search the live web
- `search1api_news` — search current news
- `search1api_crawl` — retrieve readable page content
- `search1api_sitemap` — discover site links
- `search1api_trending` — explore GitHub or Hacker News trends

## Development

```bash
npm install
npm run plugin:build
npm run plugin:validate
npm test
```

## License

MIT
