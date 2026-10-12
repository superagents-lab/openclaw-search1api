import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import entry from "../dist/index.js";
import { getToolPluginMetadata } from "openclaw/plugin-sdk/tool-plugin";

test("declares all Search1API tools in static metadata", () => {
  const metadata = getToolPluginMetadata(entry);
  assert.equal(metadata?.id, "search1api");
  const manifest = JSON.parse(readFileSync(new URL("../openclaw.plugin.json", import.meta.url), "utf8"));
  assert.deepEqual(manifest.contracts.tools, metadata.tools.map(tool => tool.name));
  assert.deepEqual(
    metadata?.tools.map((tool) => tool.name),
    [
      "search1api_search",
      "search1api_news",
      "search1api_ask",
      "search1api_crawl",
      "search1api_sitemap",
      "search1api_trending",
    ]
  );
});


function registeredTools() {
  const tools = new Map();
  entry.register({ pluginConfig: { apiKey: "plugin-key" }, registerTool(tool) { tools.set(tool.name, tool); } });
  return tools;
}

test("current search engines, week and pagination preserve the API metadata", async (context) => {
  const tools = registeredTools();
  const wire = { results: [{ title: "Repo", link: "https://example.com", snippet: "s", published_date: "2026-10-12", metadata: { stars: 0 } }] };
  const requests = [];
  context.mock.method(globalThis, "fetch", async (input, init) => {
    requests.push(JSON.parse(init.body));
    return Response.json(wire);
  });
  for (const searchService of ["bingcn", "yandex", "grokipedia"]) {
    const output = await tools.get("search1api_search").execute("call", { query: "q", searchService, timeRange: "week", page: 2 });
    assert.deepEqual(output.details, wire);
    assert.equal(requests.at(-1).search_service, searchService);
    assert.equal(requests.at(-1).time_range, "week");
    assert.equal(requests.at(-1).page, 2);
  }
  const metadata = getToolPluginMetadata(entry);
  const search = metadata.tools.find(tool => tool.name === "search1api_search");
  const engines = search.parameters.properties.searchService.anyOf.map(value => value.const);
  assert.ok(["bingcn", "yandex", "grokipedia"].every(engine => engines.includes(engine)));
  assert.ok(!engines.includes("sogou"));
  assert.ok(search.parameters.properties.timeRange.anyOf.some(value => value.const === "week"));
});

test("ask uses query only, preserves the response, and handles cancellation", async (context) => {
  const tools = registeredTools();
  const wire = { query: "Bun", intent: { search_query: "Bun", sources: ["github"], time_range: null }, results: [{ title: "Bun", link: "https://example.com", snippet: "s", source: "github", relevance: 0.9 }], errors: [] };
  const controller = new AbortController();
  let calls = 0;
  context.mock.method(globalThis, "fetch", async (input, init) => {
    calls++;
    assert.equal(String(input), "https://api.search1api.com/ask");
    assert.deepEqual(JSON.parse(init.body), { query: "Bun" });
    assert.equal(init.signal, controller.signal);
    return Response.json(wire);
  });
  const output = await tools.get("search1api_ask").execute("call", { query: "Bun", maxResults: 2 }, controller.signal);
  assert.deepEqual(output.details, wire);
  controller.abort();
  await assert.rejects(tools.get("search1api_ask").execute("call", { query: "Bun" }, controller.signal));
  assert.equal(calls, 1);
  const schema = getToolPluginMetadata(entry).tools.find(tool => tool.name === "search1api_ask").parameters;
  assert.deepEqual(Object.keys(schema.properties), ["query"]);
});
