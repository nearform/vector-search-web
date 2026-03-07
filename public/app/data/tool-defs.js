import { searchPosts } from "./search.js";
import { POST_TYPE_OPTIONS } from "../components/forms.js";
import { CATEGORIES_LIST } from "../components/category.js";

const POST_TYPE_VALUES = POST_TYPE_OPTIONS.map((o) => o.value);

export const TOOL_SCHEMA = {
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
        description: `Filter by type: ${POST_TYPE_VALUES.join(", ")}. ALMOST NEVER USE THIS. Only set when user literally asks for 'case studies' (work) or 'blog posts' (blog). Omit for all other queries.`,
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

export const executeSearch = async (args) => {
  const result = await searchPosts({
    query: args.query,
    postType: args.postType || [],
    minDate: args.minDate || "",
    categoryPrimary: args.categoryPrimary || [],
    chunkSize: 256,
  });
  return {
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
};
