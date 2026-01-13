import { useState } from "react";
import { html, getElements } from "./util/html.js";
import {
  QueryField,
  PostTypeSelect,
  CategorySelect,
  MinDateInput,
  ChunkSizeSelect,
  SubmitButton,
} from "./components/forms.js";
import { PostsTable } from "./components/posts-table.js";
import { searchPosts } from "./data/index.js";

export const App = () => {
  const [searchData, setSearchData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minDate, setMinDate] = useState("");
  const [chunkSize, setChunkSize] = useState(256);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { query } = getElements(event);

    if (!query?.trim()) {
      return;
    }

    setIsFetching(true);
    setSearchData(null);
    setPosts([]);
    setError(null);
    try {
      const result = await searchPosts({
        query,
        chunkSize,
        postType: selectedPostTypes.map(({ value }) => value),
        categoryPrimary: selectedCategories.map(({ value }) => value),
        minDate,
      });
      setSearchData(result);
      setPosts(result.posts);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setIsFetching(false);
    }
  };

  return html`
    <div className="container">
      <header className="header">
        <h1>Vector Search Web Demo</h1>
        <p className="intro">
          Client-side vector search powered by${" "}
          <a
            href="https://docs.oramasearch.com/docs/orama-js"
            target="_blank"
            rel="noopener noreferrer"
          >
            Orama </a
          >${" "} — search for${" "}
          <a
            href="https://nearform.com/insights/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nearform articles</a
          >${" "} entirely in the browser!${" "}
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

      <section className="search-section">
        <h2>Search</h2>
        <form className="search-form" onSubmit=${handleSubmit}>
          <${QueryField} />
          <div className="filters-row">
            <${PostTypeSelect}
              selected=${selectedPostTypes}
              setSelected=${setSelectedPostTypes}
            />
            <${CategorySelect}
              selected=${selectedCategories}
              setSelected=${setSelectedCategories}
            />
            <${MinDateInput} value=${minDate} setValue=${setMinDate} />
            <${ChunkSizeSelect} value=${chunkSize} setValue=${setChunkSize} />
            <${SubmitButton} isFetching=${isFetching} />
          </div>
        </form>
      </section>

      ${error &&
      html`
        <div className="error-alert">
          <i className="ph ph-warning-circle"></i>
          <span>${error}</span>
          <button className="error-dismiss" onClick=${() => setError(null)}>
            <i className="ph ph-x"></i>
          </button>
        </div>
      `}

      <${PostsTable} posts=${posts} searchData=${searchData} />

      <footer className="footer">
        <a
          href="https://www.nearform.com/contact/?utm_source=open-source&utm_medium=banner&utm_campaign=os-project-pages"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://raw.githubusercontent.com/nearform/.github/refs/heads/master/assets/os-banner-green.svg"
            alt="Nearform Open Source"
            className="nearform-banner"
          />
        </a>
      </footer>
    </div>
  `;
};
