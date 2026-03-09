/* global window:false, URLSearchParams:false */
import { IframeChildTransport } from "@mcp-b/transports";
import { TOOL_SCHEMA, executeSearch } from "./tool-defs.js";

const DEBUG = new URLSearchParams(window.location.search).has("debug");
const log = (level, ...args) => {
  if (DEBUG) console[level]("[iframe-server]", ...args); // eslint-disable-line no-undef
};

export const initIframeServer = () => {
  if (window === window.parent) return;

  const transport = new IframeChildTransport({
    allowedOrigins: [
      "http://localhost:4610",
      "http://127.0.0.1:4610",
      "https://nearform.github.io",
    ],
  });

  transport.onmessage = async (message) => {
    const { jsonrpc, id, method, params } = message;
    if (jsonrpc !== "2.0" || id == null) return;

    if (method === "tools/list") {
      transport.send({ jsonrpc: "2.0", id, result: { tools: [TOOL_SCHEMA] } });
      return;
    }

    if (method === "tools/call") {
      try {
        const payload = await executeSearch(params.arguments);
        transport.send({ jsonrpc: "2.0", id, result: payload });
      } catch (err) {
        transport.send({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: err.message },
        });
      }
      return;
    }

    transport.send({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  };

  transport.onerror = (err) => {
    log("warn", "Transport error:", err);
  };

  transport.start();
  log("log", "MCP transport started");
};
