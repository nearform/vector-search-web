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
import { Footer } from "./components/footer.js";
import { Header } from "./components/header.js";
import { PostsTable } from "./components/posts-table.js";
import { ToolModal } from "./components/tool-modal.js";
import { searchTool } from "./data/tools/search.js";
import { searchPosts } from "./data/index.js";
import { IS_PRESENT_MODE } from "./util/present.js";

export const App = () => {
  const [searchData, setSearchData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minDate, setMinDate] = useState("");
  const [chunkSize, setChunkSize] = useState(256);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [hasQuery, setHasQuery] = useState(false);

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

  const handleClear = (event) => {
    const query = event.currentTarget.form?.elements.query;
    if (query) {
      query.value = "";
      query.focus();
    }
    setHasQuery(false);
    setSearchData(null);
    setPosts([]);
    setError(null);
  };

  return html`
    <div className="container">
      <${Header} />

      <section className="search-section">
        <h2>
          Search
          <button
            type="button"
            className="tool-modal-open"
            title=${`Call the ${searchTool.name} WebMCP tool`}
            aria-label="Open WebMCP tool caller"
            onClick=${() => setShowToolModal(true)}
          >
            <i className="ph ph-plugs-connected"></i>
          </button>
        </h2>
        <form className="search-form" onSubmit=${handleSubmit}>
          <${QueryField}
            onInput=${(e) => setHasQuery(e.target.value.length > 0)}
            onClear=${handleClear}
            showClear=${!isFetching && (hasQuery || searchData || error)}
          />
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

      ${
        error &&
        html`
          <div className="error-alert">
            <i className="ph ph-warning-circle"></i>
            <span>${error}</span>
            <button className="error-dismiss" onClick=${() => setError(null)}>
              <i className="ph ph-x"></i>
            </button>
          </div>
        `
      }

      <${PostsTable} posts=${posts} searchData=${searchData} />

      ${!IS_PRESENT_MODE && html`<${Footer} />`}
      ${
        showToolModal &&
        html`<${ToolModal}
          tool=${searchTool}
          onClose=${() => setShowToolModal(false)}
        />`
      }
    </div>
  `;
};
