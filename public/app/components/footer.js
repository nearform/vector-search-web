import { useState } from "react";
import { html } from "../util/html.js";

const CONTACT_URL =
  "https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages";

export const Footer = () => {
  const [minimized, setMinimized] = useState(false);

  return html`
    <footer className="footer ${minimized ? "footer--minimized" : ""}">
      ${
        minimized
          ? html`
              <div className="banner-mini">
                <a
                  href=${CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-mini-pill"
                  aria-label="Nearform Open Source"
                >
                  NF
                </a>
                <button
                  type="button"
                  className="banner-restore-btn"
                  onClick=${() => setMinimized(false)}
                  aria-label="Restore banner"
                  title="Restore banner"
                >
                  <i className="ph ph-arrow-square-out"></i>
                </button>
              </div>
            `
          : html`
              <div className="banner-wrapper">
                <a
                  href=${CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg"
                    alt="Nearform Open Source"
                    className="nearform-banner"
                  />
                </a>
                <button
                  type="button"
                  className="banner-minimize-btn"
                  onClick=${() => setMinimized(true)}
                  title="Minimize banner"
                  aria-label="Minimize banner"
                >
                  <i className="ph ph-minus"></i>
                </button>
              </div>
            `
      }
    </footer>
  `;
};
