/* global window:false, document:false, URLSearchParams:false */
import { IframeChildTransport } from "@mcp-b/transports";
import { TOOLS } from "./tools/index.js";
import { areToolsRegistered } from "./webmcp.js";

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
      const tools = TOOLS.map((tool) => {
        const { execute, ...rest } = tool; // eslint-disable-line no-unused-vars
        return rest;
      });
      transport.send({
        jsonrpc: "2.0",
        id,
        result: { tools },
      });
      return;
    }

    if (method === "tools/call") {
      try {
        const tool = TOOLS.find((t) => t.name === params.name);
        if (!tool) {
          transport.send({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `Unknown tool: ${params.name}`,
            },
          });
          return;
        }
        // Prefer `executeTool` to gut check tooling invocation through WebMCP
        // (native or polyfilled). When the tools never registered (the
        // polyfill refuses cross-origin frames), fall back to invoking the
        // tool directly, since `getTools` would not find them.
        const { modelContext } = document;
        const registeredTool = areToolsRegistered()
          ? (await modelContext.getTools()).find((t) => t.name === tool.name)
          : null;
        const args = params.arguments ?? {};
        const result = registeredTool
          ? await modelContext.executeTool(registeredTool, args)
          : await tool.execute(args);
        const parsedResult =
          typeof result === "string" ? JSON.parse(result) : result;
        transport.send({
          jsonrpc: "2.0",
          id,
          result: { isError: false, ...parsedResult },
        });
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
