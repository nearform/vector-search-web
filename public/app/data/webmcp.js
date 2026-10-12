/* global navigator:false,document:false */
import { TOOLS } from "./tools/index.js";

const getModelContext = () => document.modelContext ?? navigator.modelContext;

const checkWebMcpSupport = () => {
  const modelContext = getModelContext();
  if (modelContext) return true;

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

  const modelContext = getModelContext();
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
