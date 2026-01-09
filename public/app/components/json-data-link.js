import { html, openTextInNewWindow } from "../util/html.js";

export const JsonDataLink = ({ data }) => {
  if (!data) {
    return "";
  }

  const handleOpen = () => openTextInNewWindow(JSON.stringify(data, null, 2));

  return html`
    <span
      onClick=${handleOpen}
      title="View raw search data"
      className="json-data-link"
    >
      <i className="ph ph-brackets-curly"></i>
    </span>
  `;
};
