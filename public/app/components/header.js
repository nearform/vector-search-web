import { html } from "../util/html.js";
import {
  IS_PRESENT_MODE,
  PRESENT_TITLE,
  PRESENT_INTRO,
} from "../util/present.js";

const PresentHeader = () => html`
  <header className="header">
    <h1>${PRESENT_TITLE}</h1>
    <p className="intro">${PRESENT_INTRO}</p>
  </header>
`;

const DefaultHeader = () => html`
  <header className="header">
    <h1>Vector Search Web Demo</h1>
    <p className="intro">
      Client-side vector search powered by${" "}
      <a
        href="https://docs.orama.com/docs/orama-js"
        target="_blank"
        rel="noopener noreferrer"
      >
        Orama</a
      >${" "}— search for${" "}
      <a
        href="https://nearform.com/insights/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Nearform articles</a
      >${" "} entirely in the browser! Read the${" "}
      <a
        href="https://nearform.com/digital-community/browser-based-vector-search-fast-private-and-no-backend-required/"
        target="_blank"
        rel="noopener noreferrer"
      >
        blog post</a
      >.${" "}
      <a
        href="https://github.com/nearform/vector-search-web"
        target="_blank"
        rel="noopener noreferrer"
        className="intro-github-link"
        aria-label="View on GitHub"
      >
        <i className="ph ph-github-logo"></i>
      </a>
    </p>
  </header>
`;

export const Header = () =>
  IS_PRESENT_MODE ? html`<${PresentHeader} />` : html`<${DefaultHeader} />`;
