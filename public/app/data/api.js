/* global fetch:false */
import { getAndCache } from "./util.js";
import { createTimer } from "./timing.js";

const GH_BLOB_URL =
  "https://raw.githubusercontent.com/nearform/joyce/main/public/data";

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
};

/**
 * Fetch posts.json from GitHub (cached).
 * @returns {Promise<Object>} Posts object keyed by slug
 */
export const getPosts = getAndCache(async () => {
  const timer = createTimer("Download posts.json");
  const data = await fetchJson(`${GH_BLOB_URL}/posts.json`);
  timer.end();
  return data;
});

/**
 * Fetch posts-embeddings-256.json from GitHub (cached).
 * @returns {Promise<Object>} Embeddings object keyed by slug
 */
export const getPostsEmbeddings256 = getAndCache(async () => {
  const timer = createTimer("Download embeddings-256");
  const data = await fetchJson(`${GH_BLOB_URL}/posts-embeddings-256.json`);
  timer.end();
  return data;
});

/**
 * Fetch posts-embeddings-512.json from GitHub (cached).
 * @returns {Promise<Object>} Embeddings object keyed by slug
 */
export const getPostsEmbeddings512 = getAndCache(async () => {
  const timer = createTimer("Download embeddings-512");
  const data = await fetchJson(`${GH_BLOB_URL}/posts-embeddings-512.json`);
  timer.end();
  return data;
});
