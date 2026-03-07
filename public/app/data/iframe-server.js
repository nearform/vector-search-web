/* global window:false, console:false */
import { TOOL_SCHEMA, executeSearch } from "./tool-defs.js";

const ALLOWED_ORIGINS = ["http://localhost:4610", "http://127.0.0.1:4610"];

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

  if (type === "mcp:call-tool" && name === TOOL_SCHEMA.name) {
    try {
      const payload = await executeSearch(args);
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
