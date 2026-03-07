/* global navigator:false */
import { searchPosts } from "./search.js";
import { POST_TYPE_OPTIONS } from "../components/forms.js";
import { CATEGORIES_LIST } from "../components/category.js";

const POST_TYPE_VALUES = POST_TYPE_OPTIONS.map((o) => o.value);

const checkWebMcpSupport = () => {
  if ("modelContext" in navigator) return true;

  const { warn } = console; // eslint-disable-line no-undef
  const BLOG_URL = "https://developer.chrome.com/blog/webmcp-epp";
  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;

  if (!chromeMatch) {
    warn(`WebMCP requires Chrome 146+. See ${BLOG_URL}`);
  } else if (chromeVersion < 146) {
    warn(
      `WebMCP requires Chrome 146+ (you have ${chromeVersion}). See ${BLOG_URL}`,
    );
  } else {
    warn(
      `WebMCP not enabled. Go to chrome://flags, search "WebMCP", enable "WebMCP for testing", and relaunch Chrome. See ${BLOG_URL}`,
    );
  }
  return false;
};

export const registerWebMcpTools = () => {
  if (!checkWebMcpSupport()) return;

  navigator.modelContext.registerTool({
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
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const result = await searchPosts({
        query: input.query,
        postType: input.postType || [],
        minDate: input.minDate || "",
        categoryPrimary: input.categoryPrimary || [],
        chunkSize: 256,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
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
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  });
};
