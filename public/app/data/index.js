// Public API for data layer
import { searchPosts, getExtractor, getChunksDb } from "./search.js";
import {
  getPosts,
  getPostsEmbeddings256,
  getPostsEmbeddings512,
} from "./api.js";

/**
 * Start preloading all data and models in parallel.
 * Returns a Promise.all that resolves when everything is ready.
 * Callers can fire-and-forget or await if they need to wait.
 *
 * Errors are cached by getAndCache and will surface when searchPosts
 * awaits the failed promise, propagating to handleSubmit's setError.
 */
const initData = () =>
  Promise.all([
    getPosts(),
    getPostsEmbeddings256(),
    getPostsEmbeddings512(),
    getExtractor(),
    getChunksDb(256),
    getChunksDb(512),
  ]);

export {
  initData,
  searchPosts,
  getExtractor,
  getChunksDb,
  getPosts,
  getPostsEmbeddings256,
  getPostsEmbeddings512,
};
