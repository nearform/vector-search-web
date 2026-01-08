/**
 * Memoize an async function. Returns a function that caches the promise
 * from the first call and returns it on subsequent calls.
 * @param {Function} fn - Async function to memoize
 * @returns {Function} Memoized function
 */
export const getAndCache = (fn) => {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
};

/**
 * Dequantize a uint8 embedding back to float values.
 * Reverses the quantization done during embedding generation.
 * @param {{ values: number[], min: number, max: number }} quantized - The quantized embedding
 * @returns {number[]} - The dequantized embedding as float array
 */
export const dequantizeEmbedding = (quantized) => {
  const { values, min, max } = quantized;
  const range = max - min;

  // Handle edge case where all values were the same
  if (range === 0) {
    return values.map(() => min);
  }

  const scale = range / 255;
  return values.map((val) => val * scale + min);
};
