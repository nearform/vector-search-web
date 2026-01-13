/* global performance:false, console:false, URLSearchParams:false, location:false */

export const DEBUG_TIMINGS =
  new URLSearchParams(location.search).get("timings") === "true";

/**
 * Create a timer for measuring elapsed time.
 * Call end() to log the timing (if DEBUG_TIMINGS is true).
 * @param {string} label - Description for the timing log
 * @returns {{ end: () => number }} Timer object with end() method that returns elapsed ms
 */
export const createTimer = (label) => {
  const start = performance.now();
  return {
    end: () => {
      const elapsed = performance.now() - start;
      if (DEBUG_TIMINGS) {
        console.log(`[Timing] ${label}: ${elapsed.toFixed(2)}ms`);
      }
      return elapsed;
    },
  };
};
