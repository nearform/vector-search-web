# WebMCP Integration

[WebMCP][webmcp-blog] is a W3C-proposed browser API (`navigator.modelContext`) that lets websites register structured tools for AI agents to discover and call directly. This site exposes a vector search tool so agents can programmatically search the Nearform knowledge base.

Requires Chrome 146+ with the "WebMCP for testing" flag enabled. See the [W3C spec][webmcp-spec] for the full API surface.

## Exposed Tool

### `search_nearform_knowledge`

Vector search across Nearform blog posts, case studies, and services using semantic similarity.

**Parameters:**

| Parameter         | Type     | Required | Description                                         |
| ----------------- | -------- | -------- | --------------------------------------------------- |
| `query`           | string   | Yes      | Search query (e.g. "microservices architecture")    |
| `postType`        | string[] | No       | Filter by type: `blog`, `service`, `work`           |
| `minDate`         | string   | No       | Only posts after this date, `YYYY-MM-DD`            |
| `categoryPrimary` | string[] | No       | Filter by category: `ai`, `design`, `backend`, etc. |

## Local Demo

1. Start the dev server:
   ```sh
   $ npm run dev
   ```
2. Open the site in Chrome 146+ with the "WebMCP for testing" flag enabled (`chrome://flags`).
3. The `search_nearform_knowledge` tool registers automatically via `navigator.modelContext`.
4. An MCP-capable agent running in Chrome can discover and invoke the tool.

## Example Queries

```json
{ "query": "microservices architecture" }
```

```json
{ "query": "React performance", "postType": ["blog"], "minDate": "2024-01-01" }
```

```json
{ "query": "AI strategy", "categoryPrimary": ["ai"] }
```

## Example Response

```json
{
  "postCount": 3,
  "posts": [
    {
      "title": "Building Microservices with Node.js",
      "href": "https://nearform.com/blog/building-microservices",
      "date": "2024-06-15",
      "type": "blog",
      "categories": { "primary": "backend", "others": ["nodejs"] },
      "similarity": 0.92
    }
  ],
  "chunks": [
    {
      "slug": "building-microservices",
      "text": "Microservices architecture allows teams to...",
      "similarity": 0.92
    }
  ],
  "metadata": {
    "elapsed": { "embedding": 45, "search": 12 },
    "chunks": {
      "count": 5,
      "similarity": { "min": 0.81, "max": 0.92, "avg": 0.86 }
    }
  }
}
```

## References

- [Chrome Developer Blog — WebMCP early preview][webmcp-blog]
- [W3C WebMCP spec (webmachinelearning/webmcp)][webmcp-spec]

[webmcp-blog]: https://developer.chrome.com/blog/webmcp-epp
[webmcp-spec]: https://github.com/webmachinelearning/webmcp
