/* global fetch:false */
import { getAndCache } from "./util.js";

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
export const getPosts = getAndCache(() =>
  fetchJson(`${GH_BLOB_URL}/posts.json`),
);

/**
 * Fetch posts-embeddings-256.json from GitHub (cached).
 * @returns {Promise<Object>} Embeddings object keyed by slug
 */
export const getPostsEmbeddings = getAndCache(() =>
  fetchJson(`${GH_BLOB_URL}/posts-embeddings-256.json`),
);
