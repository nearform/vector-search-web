import { useState } from "react";
import { html, getElements } from "./util/html.js";
import {
  QueryField,
  PostTypeSelect,
  CategorySelect,
  MinDateInput,
  SubmitButton,
} from "./components/forms.js";
import { PostsTable } from "./components/posts-table.js";
import { DUMMY_POSTS } from "./data/dummy-posts.js";

export const App = () => {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [selectedPostTypes, setSelectedPostTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minDate, setMinDate] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const { query } = getElements(event);

    console.log("TODO: Implement Search", {
      query,
      postTypes: selectedPostTypes.map(({ value }) => value),
      categories: selectedCategories.map(({ value }) => value),
      minDate,
    });
  };

  return html`
    <div className="container">
      <header className="header">
        <h1>Vector Search Web Demo</h1>
        <p>Search blog posts using semantic vector similarity</p>
        <div className="badges">
          <a
            href="https://github.com/nearform/vector-search-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://badgen.net/github/release/nearform/vector-search-web?icon=github"
              alt="GitHub release"
            />
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
            <${SubmitButton} isFetching=${isFetching} />
          </div>
        </form>
      </section>

      <${PostsTable} posts=${posts} />

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
