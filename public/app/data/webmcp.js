/* global navigator:false */
import { TOOLS } from "./tools/index.js";

const checkWebMcpSupport = () => {
  if ("modelContext" in navigator) return true;

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

export const registerWebMcpTools = () => {
  if (!checkWebMcpSupport()) return;

  for (const tool of TOOLS) {
    navigator.modelContext.registerTool(tool);
  }
};
