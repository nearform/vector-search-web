import { Fragment, useRef } from "react";
import { html } from "../util/html.js";

const formatMs = (ms) => (ms < 10 ? ms.toFixed(1) : Math.round(ms).toString());

const Ms = ({ value }) => html`
  <span className="timings-value">
    ${formatMs(value)}<span className="timings-unit">ms</span>
  </span>
`;

export const TimingsLink = ({ data }) => {
  const dialogRef = useRef(null);
  const elapsed = data?.metadata?.elapsed;

  if (!elapsed) {
    return "";
  }

  const total = elapsed.embedding + elapsed.search;
  const rows = [
    ["Query embedding", elapsed.embedding],
    ["Vector search", elapsed.search],
  ];

  const handleOpen = () => dialogRef.current?.showModal();
  const handleClose = () => dialogRef.current?.close();

  // Clicks on the backdrop land on the dialog element itself.
  const handleDialogClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return html`
    <${Fragment}>
      <button
        type="button"
        onClick=${handleOpen}
        title="View search timings"
        className="json-data-link"
      >
        <i className="ph ph-timer"></i>
      </button>
      <dialog
        ref=${dialogRef}
        className="timings-dialog"
        onClick=${handleDialogClick}
      >
        <div className="timings-header">
          <span className="timings-title">
            <i className="ph ph-lightning"></i>
            Search time
          </span>
          <button
            type="button"
            onClick=${handleClose}
            title="Close"
            className="error-dismiss"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>
        <div className="timings-total">
          <${Ms} value=${total} />
        </div>
        <dl className="timings-list">
          ${rows.map(
            ([label, ms]) => html`
              <div key=${label} className="timings-row">
                <dt>${label}</dt>
                <dd><${Ms} value=${ms} /></dd>
              </div>
            `,
          )}
        </dl>
      </dialog>
    </${Fragment}>
  `;
};
