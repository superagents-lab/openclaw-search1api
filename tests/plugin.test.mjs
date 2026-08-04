import assert from "node:assert/strict";
import test from "node:test";
import entry from "../dist/index.js";
import { getToolPluginMetadata } from "openclaw/plugin-sdk/tool-plugin";

test("declares all Search1API tools in static metadata", () => {
  const metadata = getToolPluginMetadata(entry);
  assert.equal(metadata?.id, "search1api");
  assert.deepEqual(
    metadata?.tools.map((tool) => tool.name),
    [
      "search1api_search",
      "search1api_news",
      "search1api_crawl",
      "search1api_sitemap",
      "search1api_trending",
    ]
  );
});
