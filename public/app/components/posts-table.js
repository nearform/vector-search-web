import { html } from "../util/html.js";
import { Category } from "./category.js";
import { JsonDataLink } from "./json-data-link.js";
import { useTableSort } from "../hooks/use-table-sort.js";

const HEADINGS = {
  date: "Date",
  title: "Title",
  type: "Type",
  "categories.primary": "Category",
};

export const PostsTable = ({ posts = [], searchData = null }) => {
  const { getSortSymbol, handleColumnSort, sortItems } = useTableSort();

  if (posts.length === 0) {
    return html`<p className="no-results">No posts found.</p>`;
  }

  return html`
    <div className="results-section">
      <div className="results-header">
        <h2>Results</h2>
        <span className="results-count">${posts.length} posts found</span>
        <${JsonDataLink} data=${searchData} />
      </div>
      <div className="table-container">
        <table className="posts-table">
          <thead>
            <tr>
              ${Object.entries(HEADINGS).map(
                ([key, label]) => html`
                  <th
                    key=${key}
                    className="sortable-header"
                    onClick=${() => handleColumnSort(key)}
                  >
                    ${label} ${getSortSymbol(key)}
                  </th>
                `,
              )}
            </tr>
          </thead>
          <tbody>
            ${sortItems(posts).map(
              ({ date, title, href, type, categories }, i) => html`
                <tr key=${`post-${i}`}>
                  <td className="date-cell">
                    ${date ? new Date(date).toISOString().substring(0, 10) : ""}
                  </td>
                  <td className="title-cell">
                    <a href=${href} target="_blank" rel="noopener noreferrer">
                      ${title}
                    </a>
                  </td>
                  <td className="type-cell">${type}</td>
                  <td className="category-cell">
                    <${Category} category=${categories.primary} />
                  </td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    </div>
  `;
};
