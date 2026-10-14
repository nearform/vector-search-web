/* global navigator:false, document:false, setTimeout:false, console:false */
import { useState } from "react";
import { html } from "../util/html.js";
import { areToolsRegistered, executeTool } from "../data/webmcp.js";

// Ported from web-agents' tool-status.js: a modal to hand-call one WebMCP tool
// with a form built from its input schema.

const summarizeDescription = (text) => {
  if (!text) return "";
  let tail = "";
  const parenMatch = text.match(/\s+(\([^)]+\))\s*$/);
  const body = parenMatch ? text.slice(0, parenMatch.index) : text;
  if (parenMatch) tail = " " + parenMatch[1];
  const match = body.match(/^[^.!?]+[.!?]?/);
  return (match ? match[0].trim() : body.trim()) + tail;
};

const buildInitialArgs = (schema) => {
  const args = {};
  if (!schema?.properties) return args;
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.type === "boolean") args[key] = false;
  }
  return args;
};

const unwrapContent = (result) => {
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  const text = parsed?.content?.[0]?.text;
  return text ? JSON.parse(text) : parsed;
};

// Prefer `executeTool` to gut check tooling invocation through WebMCP (native
// or polyfilled). Fall back to invoking the tool directly when WebMCP is
// unavailable or the tool did not register.
const callTool = async (tool, args) => {
  const { modelContext } = document;
  const registeredTool = areToolsRegistered()
    ? (await modelContext.getTools()).find((t) => t.name === tool.name)
    : null;
  const result = registeredTool
    ? await executeTool(modelContext, registeredTool, args)
    : await tool.execute(args);
  return unwrapContent(result);
};

export const ToolModal = ({ tool, onClose }) => {
  const [args, setArgs] = useState(() => buildInitialArgs(tool.inputSchema));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result == null) return;
    const text = result.ok
      ? JSON.stringify(result.data, null, 2)
      : `Error: ${result.data}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const properties = tool.inputSchema?.properties || {};
  const required = tool.inputSchema?.required || [];
  const propEntries = Object.entries(properties);
  const source = areToolsRegistered() ? "webmcp" : "direct";

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (key, value) => {
    setArgs((prev) => ({ ...prev, [key]: value }));
  };

  const isRequiredMissing = (key, prop) => {
    if (!required.includes(key)) return false;
    if (prop.type === "boolean") return false;
    const val = args[key];
    if (prop.type === "string") return val === undefined;
    return val === "" || val === undefined;
  };

  const handleExecute = async () => {
    setLoading(true);
    setResult(null);
    try {
      const parsed = {};
      for (const [key, prop] of Object.entries(properties)) {
        const val = args[key];
        if (prop.type === "string") {
          if (val === undefined) continue;
          parsed[key] = val;
        } else if (prop.type === "number" || prop.type === "integer") {
          if (val === "" || val === undefined) continue;
          parsed[key] = Number(val);
        } else if (prop.type === "boolean") {
          parsed[key] = val;
        } else if (prop.type === "array") {
          // Comma-separated in the textarea, e.g. `work, blog`.
          const items = (val ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (items.length === 0) continue;
          parsed[key] = items;
        } else {
          if (val === "" || val === undefined) continue;
          parsed[key] = val;
        }
      }
      const res = await callTool(tool, parsed);
      setResult({ ok: true, data: res });
    } catch (err) {
      console.error("[tool-modal] Tool execution error:", err);
      setResult({ ok: false, data: err.message });
    } finally {
      setLoading(false);
    }
  };

  const hasValidationErrors = propEntries.some(([key, prop]) =>
    isRequiredMissing(key, prop),
  );
  const canExecute = !loading && !hasValidationErrors;

  return html`
    <div className="activity-modal-overlay" onClick=${handleOverlayClick}>
      <div className="tool-modal">
        <div className="activity-modal-header">
          <div>
            <strong>${tool.name}</strong>
            <span className="tool-modal-source">${source}</span>
            <span
              className="tool-status-dot connected"
              style=${{ display: "inline-block", marginLeft: 8 }}
            ></span>
          </div>
          <button className="activity-modal-close" onClick=${onClose}>
            <i className="ph ph-x"></i>
          </button>
        </div>

        <div className="tool-modal-body">
          <div className="tool-modal-left">
            <div className="tool-modal-schema">
              ${
                tool.description &&
                html`<div className="tool-modal-description">
                  ${tool.description}
                </div>`
              }
              ${
                propEntries.length > 0 &&
                html`
                  <table className="tool-modal-properties">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${propEntries.map(
                        ([name, prop]) => html`
                          <tr key=${name}>
                            <td>
                              <code>${name}</code>
                              ${
                                required.includes(name) &&
                                html`<span className="tool-modal-required">
                                  ${" "}*</span
                                >`
                              }
                            </td>
                            <td>${prop.type || "any"}</td>
                            <td>${summarizeDescription(prop.description)}</td>
                          </tr>
                        `,
                      )}
                    </tbody>
                  </table>
                `
              }
            </div>

            ${
              propEntries.length > 0 &&
              html`
                <div className="tool-modal-form">
                  ${propEntries.map(([name, prop]) => {
                    if (prop.type === "boolean") {
                      return html`
                        <label key=${name} className="tool-modal-field">
                          <span className="tool-modal-label"
                            >${name}${required.includes(name) ? " *" : ""}</span
                          >
                          <input
                            type="checkbox"
                            checked=${args[name] || false}
                            onChange=${(e) =>
                              handleChange(name, e.target.checked)}
                          />
                        </label>
                      `;
                    }
                    if (prop.type === "number" || prop.type === "integer") {
                      return html`
                        <label key=${name} className="tool-modal-field">
                          <span className="tool-modal-label"
                            >${name}${required.includes(name) ? " *" : ""}</span
                          >
                          <input
                            type="number"
                            className="tool-modal-input"
                            value=${args[name] || ""}
                            placeholder=${
                              summarizeDescription(prop.description) || name
                            }
                            onChange=${(e) => handleChange(name, e.target.value)}
                          />
                        </label>
                      `;
                    }
                    return html`
                      <label key=${name} className="tool-modal-field">
                        <span className="tool-modal-label"
                          >${name}${required.includes(name) ? " *" : ""}</span
                        >
                        <textarea
                          className="tool-modal-input"
                          rows=${2}
                          value=${args[name] || ""}
                          placeholder=${
                            summarizeDescription(prop.description) || name
                          }
                          onChange=${(e) => handleChange(name, e.target.value)}
                        />
                      </label>
                    `;
                  })}
                </div>
              `
            }

            <div className="tool-modal-actions">
              <button
                className="tool-modal-execute"
                disabled=${!canExecute}
                onClick=${handleExecute}
              >
                ${loading ? "Executing..." : "Execute"}
              </button>
            </div>
          </div>

          <div className="tool-modal-right">
            <div className="tool-modal-right-header">
              <span>Output</span>
              ${
                result != null &&
                html`
                  <button
                    className="tool-modal-copy-btn"
                    onClick=${handleCopy}
                    title=${copied ? "Copied!" : "Copy raw result"}
                  >
                    <i className="ph ph-${copied ? "check" : "copy"}"></i>
                    ${
                      copied &&
                      html`<span className="tool-modal-copy-tooltip"
                        >Copied!</span
                      >`
                    }
                  </button>
                `
              }
            </div>
            <pre className="tool-modal-result">
${
                result == null
                  ? "No output yet. Execute the tool to see results."
                  : result.ok
                    ? JSON.stringify(result.data, null, 2)
                    : `Error: ${result.data}`
              }</pre>
          </div>
        </div>
      </div>
    </div>
  `;
};
