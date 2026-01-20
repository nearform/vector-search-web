import { create, insertMultiple, search } from "@orama/orama";
import { pipeline } from "@xenova/transformers";

import { getAndCache, dequantizeEmbedding } from "./util.js";
import { createTimer } from "./timing.js";
import {
  getPosts,
  getPostsEmbeddings256,
  getPostsEmbeddings512,
} from "./api.js";

const MAX_CHUNKS = 50;
const MIN_SIMILARITY = 0.8;
const EMBEDDING_MODEL = "Xenova/gte-small";

const dateToNumber = (date) => Date.parse(date);

/**
 * Get the feature-extraction pipeline (cached).
 * Downloads the model on first call (~30MB).
 * @returns {Promise<Function>} Transformers pipeline
 */
export const getExtractor = getAndCache(() =>
  pipeline("feature-extraction", EMBEDDING_MODEL),
);

/**
 * Get embeddings data for a given chunk size.
 * @param {number} chunkSize - Chunk size (256 or 512)
 * @returns {Promise<Object>} Embeddings object keyed by slug
 */
const getEmbeddingsForSize = (chunkSize) => {
  return chunkSize === 512 ? getPostsEmbeddings512() : getPostsEmbeddings256();
};

/**
 * Create the Orama chunks database (cached per chunk size).
 * Depends on posts and embeddings being fetched first.
 * @param {number} chunkSize - Chunk size (256 or 512)
 * @returns {Promise<Object>} Orama database instance
 */
export const getChunksDb = getAndCache(async (chunkSize = 256) => {
  const [embeddingsObj, postsObj] = await Promise.all([
    getEmbeddingsForSize(chunkSize),
    getPosts(),
  ]);

  // Flatten chunks: each chunk becomes a document with slug reference and post metadata
  // Dequantize embeddings from uint8 back to floats for Orama vector search
  const chunks = Object.entries(embeddingsObj).flatMap(([slug, { chunks }]) => {
    const post = postsObj[slug];
    if (!post) {
      throw new Error(`No post found for slug: ${slug}`);
    }

    return chunks.map((chunk) => ({
      slug,
      date: dateToNumber(post?.date),
      postType: post?.postType,
      categories: post?.categories,
      ...chunk,
      // Dequantize embeddings: { values, min, max } -> float[]
      embeddings: dequantizeEmbedding(chunk.embeddings),
    }));
  });

  const dbTimer = createTimer(`Create chunksDb (${chunkSize})`);
  const db = await create({
    schema: {
      // Post metadata for filtering.
      slug: "string",
      date: "number",
      postType: "string",
      categories: {
        primary: "string",
        others: "string[]",
      },

      // Chunk data.
      start: "number",
      end: "number",
      embeddings: "vector[384]",
    },
  });

  await insertMultiple(db, chunks);
  dbTimer.end();

  return db;
});

/**
 * Search for posts matching a query using vector similarity.
 * @param {Object} params
 * @param {string} params.query - The search query
 * @param {number} [params.chunkSize=256] - Chunk size for embeddings (256 or 512)
 * @param {string[]} [params.postType] - Filter by post types
 * @param {string} [params.minDate] - Filter by minimum date (YYYY-MM-DD)
 * @param {string[]} [params.categoryPrimary] - Filter by primary categories
 * @returns {Promise<{posts: Object[], chunks: Array, metadata: Object}>}
 */
export const searchPosts = async ({
  query,
  chunkSize = 256,
  postType,
  minDate,
  categoryPrimary,
}) => {
  const [chunksDb, extractor, postsData, chunksData] = await Promise.all([
    getChunksDb(chunkSize),
    getExtractor(),
    getPosts(),
    getEmbeddingsForSize(chunkSize),
  ]);

  // Generate query embedding
  const embeddingTimer = createTimer("Query embedding");
  const queryExtracted = await extractor(query, {
    pooling: "mean",
    normalize: true,
  });
  const queryEmbedding = Array.from(queryExtracted.data);
  const embeddingTime = embeddingTimer.end();

  // Build where clause for filtering
  const where = {};
  if (postType?.length) {
    where.postType = postType;
  }
  if (categoryPrimary?.length) {
    where["categories.primary"] = categoryPrimary;
  }
  if (minDate) {
    where.date = { gte: dateToNumber(minDate) };
  }

  // Vector search on chunks DB
  const searchTimer = createTimer("Vector search");
  const results = await search(chunksDb, {
    mode: "vector",
    vector: { value: queryEmbedding, property: "embeddings" },
    limit: MAX_CHUNKS,
    similarity: MIN_SIMILARITY,
    where: Object.keys(where).length > 0 ? where : undefined,
  });
  const searchTime = searchTimer.end();

  // Build posts map and chunks array
  const postsMap = {};
  const chunksArray = [];
  const similarities = [];

  for (const hit of results.hits) {
    const { document, score: similarity } = hit;
    const { slug, start: chunkStart, end: chunkEnd } = document;
    const slugChunks = chunksData[slug]?.chunks;
    if (!slugChunks) {
      continue;
    }
    const chunkMeta = slugChunks.find(
      (chunk) => chunk.start === chunkStart && chunk.end === chunkEnd,
    );
    const embeddingNumTokens = chunkMeta?.embeddingNumTokens;
    similarities.push(similarity);

    // Add chunk to array
    chunksArray.push({
      slug,
      start: chunkStart,
      end: chunkEnd,
      embeddingNumTokens,
      similarity,
    });

    // Build/update post entry
    if (!postsMap[slug]) {
      const post = postsData[slug];
      if (post) {
        postsMap[slug] = {
          slug,
          title: post.title,
          href: post.href,
          date: post.date,
          type: post.postType, // Alias for table compatibility
          postType: post.postType,
          categories: post.categories,
          similarityMax: similarity,
        };
      }
    } else if (similarity > postsMap[slug].similarityMax) {
      postsMap[slug].similarityMax = similarity;
    }
  }

  // Sort posts by similarityMax descending and convert to array
  const posts = Object.values(postsMap).sort(
    (a, b) => b.similarityMax - a.similarityMax,
  );

  // Compute similarity stats
  const similarityStats =
    similarities.length > 0
      ? {
          min: Math.min(...similarities),
          max: Math.max(...similarities),
          avg: similarities.reduce((a, b) => a + b, 0) / similarities.length,
        }
      : { min: 0, max: 0, avg: 0 };

  return {
    metadata: {
      elapsed: {
        embedding: embeddingTime,
        search: searchTime,
      },
      chunks: {
        count: chunksArray.length,
        similarity: similarityStats,
      },
    },
    posts,
    chunks: chunksArray,
  };
};
