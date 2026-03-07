/* global window:false, console:false */
import { searchPosts } from "./search.js";
import { POST_TYPE_OPTIONS } from "../components/forms.js";
import { CATEGORIES_LIST } from "../components/category.js";

const ALLOWED_ORIGINS = ["http://localhost:4610", "http://127.0.0.1:4610"];

const POST_TYPE_VALUES = POST_TYPE_OPTIONS.map((o) => o.value);

const TOOL_SCHEMA = {
  name: "search_nearform_knowledge",
  description:
    "Vector search across Nearform blog posts and case studies using semantic similarity. Returns matching posts with titles, URLs, dates, and similarity scores.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (e.g. 'microservices architecture')",
      },
      postType: {
        type: "array",
        items: { type: "string", enum: POST_TYPE_VALUES },
        description: `Filter by type: ${POST_TYPE_VALUES.join(", ")}. Only use when the user explicitly requests case studies (work) or blog posts. Omit for general queries.`,
      },
      minDate: {
        type: "string",
        description: "Only posts after this date, YYYY-MM-DD (optional)",
      },
      categoryPrimary: {
        type: "array",
        items: { type: "string", enum: CATEGORIES_LIST },
        description: `Filter by category: ${CATEGORIES_LIST.join(", ")} (optional)`,
      },
    },
    required: ["query"],
  },
};

const handleMessage = async (event) => {
  if (!ALLOWED_ORIGINS.includes(event.origin)) return;

  const { type, name, args, id } = event.data || {};

  if (type === "mcp:list-tools") {
    event.source.postMessage(
      { type: "mcp:tools", tools: [TOOL_SCHEMA], id },
      event.origin,
    );
    return;
  }

  if (type === "mcp:call-tool" && name === "search_nearform_knowledge") {
    try {
      const result = await searchPosts({
        query: args.query,
        postType: args.postType || [],
        minDate: args.minDate || "",
        categoryPrimary: args.categoryPrimary || [],
        chunkSize: 256,
      });
      const payload = {
        postCount: result.posts.length,
        posts: result.posts.map((p) => ({
          title: p.title,
          href: p.href,
          date: p.date,
          type: p.postType,
          categories: p.categories,
          similarity: p.similarityMax,
        })),
        chunks: result.chunks.map((c) => ({
          slug: c.slug,
          text: c.text,
          similarity: c.similarity,
        })),
        metadata: result.metadata,
      };
      event.source.postMessage(
        { type: "mcp:tool-result", result: payload, id },
        event.origin,
      );
    } catch (err) {
      event.source.postMessage(
        { type: "mcp:tool-error", error: err.message, id },
        event.origin,
      );
    }
  }
};

export const initIframeServer = () => {
  if (window === window.parent) return;
  window.addEventListener("message", handleMessage);
  console.log("[iframe-server] Listening for MCP messages");

  // Notify parent that the server is ready (module scripts load after iframe load event)
  for (const origin of ALLOWED_ORIGINS) {
    window.parent.postMessage({ type: "mcp:ready" }, origin);
  }
};
