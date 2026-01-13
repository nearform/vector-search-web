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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { query } = getElements(event);

    if (!query?.trim()) {
      return;
    }

    setIsFetching(true);
    setSearchData(null);
    setPosts([]);
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
      // TODO(CLEANUP): Use a proper UI error for user.
      console.error("Search failed:", err); // eslint-disable-line no-undef
    } finally {
      setIsFetching(false);
    }
  };

  return html`
    <div className="container">
      <header className="header">
        <h1>Vector Search Web Demo</h1>
        <div className="subtitle-row">
          <p>Search blog posts using semantic vector similarity.</p>
          <a
            href="https://github.com/nearform/vector-search-web"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            aria-label="View on GitHub"
          >
            <i className="ph ph-github-logo"></i>
          </a>
        </div>
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
