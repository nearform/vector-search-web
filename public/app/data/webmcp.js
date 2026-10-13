/* global navigator:false,document:false */
import { TOOLS } from "./tools/index.js";

const checkWebMcpSupport = () => {
  if (document.modelContext) return true;

  const { warn } = console; // eslint-disable-line no-undef
  const BLOG_URL = "https://developer.chrome.com/blog/webmcp-epp";
  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;

  if (!chromeMatch) {
    warn(`WebMCP requires Chrome 146+. See ${BLOG_URL}`);
  } else if (chromeVersion < 146) {
    warn(
      `WebMCP requires Chrome 146+ (you have ${chromeVersion}). See ${BLOG_URL}`,
    );
  } else {
    warn(
      `WebMCP not enabled. Go to chrome://flags, search "WebMCP", enable "WebMCP for testing", and relaunch Chrome. See ${BLOG_URL}`,
    );
  }
  return false;
};

let registered = false;

/** Whether TOOLS are registered with WebMCP (native or polyfilled). */
export const areToolsRegistered = () => registered;

export const registerWebMcpTools = async () => {
  if (!checkWebMcpSupport()) return;

  const { modelContext } = document;
  try {
    await Promise.all(TOOLS.map((tool) => modelContext.registerTool(tool)));
    registered = true;
  } catch (err) {
    const { warn } = console; // eslint-disable-line no-undef
    // Most likely the "tools" permissions policy when this page is framed
    // cross-origin. With native WebMCP, the embedder must delegate it with
    // `allow="tools"`. Without native WebMCP the polyfill cannot check that
    // delegation, so it refuses registration in cross-origin frames outright.
    warn(`WebMCP tool registration failed: ${err?.message ?? String(err)}`);
  }
};

// Chrome 154 and earlier take `executeTool` arguments as a JSON string and
// reject an object with "Failed to parse input arguments" before the tool
// runs; 155+ takes the object. Nothing else tells them apart, so try the object
// and, on that refusal, retry with the string and keep using it.
const STRING_ARGS_REFUSAL = /parse input arguments/i;
let stringArgs = false;

/** `modelContext.executeTool`, with `args` in whichever form the host takes. */
export const executeTool = async (modelContext, tool, args = {}) => {
  if (!stringArgs) {
    try {
      return await modelContext.executeTool(tool, args);
    } catch (err) {
      if (!STRING_ARGS_REFUSAL.test(err?.message ?? "")) throw err;
      stringArgs = true;
    }
  }
  return modelContext.executeTool(tool, JSON.stringify(args));
};
