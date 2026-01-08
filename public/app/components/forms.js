import Select from "react-select";
import { html } from "../util/html.js";
import { CATEGORIES_LIST } from "./category.js";

const CATEGORY_OPTIONS = CATEGORIES_LIST.map((category) => ({
  label: category,
  value: category,
}));

const POST_TYPE_OPTIONS = [
  { label: "Services", value: "service" },
  { label: "Work", value: "work" },
  { label: "Blogs", value: "blog" },
];

export const QueryField = ({ placeholder = "Search posts..." }) => html`
  <div className="form-field">
    <label htmlFor="query">Query</label>
    <textarea
      id="query"
      placeholder=${placeholder}
      className="query-input"
      rows="2"
    ></textarea>
  </div>
`;

export const PostTypeSelect = ({ selected, setSelected }) => html`
  <div className="form-field form-field-inline">
    <label htmlFor="postType">Types</label>
    <${Select}
      id="postType"
      placeholder="All types..."
      isMulti=${true}
      options=${POST_TYPE_OPTIONS}
      value=${selected}
      onChange=${setSelected}
      className="multi-select"
      classNamePrefix="select"
    />
  </div>
`;

export const CategorySelect = ({ selected, setSelected }) => html`
  <div className="form-field form-field-inline">
    <label htmlFor="category">Categories</label>
    <${Select}
      id="category"
      placeholder="All categories..."
      isMulti=${true}
      options=${CATEGORY_OPTIONS}
      value=${selected}
      onChange=${setSelected}
      className="multi-select"
      classNamePrefix="select"
    />
  </div>
`;

export const MinDateInput = ({ value, setValue }) => html`
  <div className="form-field form-field-inline">
    <label htmlFor="minDate">After</label>
    <input
      id="minDate"
      type="date"
      className="date-input"
      value=${value}
      onChange=${(e) => setValue(e.target.value)}
    />
  </div>
`;

export const SubmitButton = ({ isFetching, label = "Search" }) => html`
  <button
    type="submit"
    className="submit-button ${isFetching ? "disabled" : ""}"
    disabled=${isFetching}
  >
    <i className="ph ph-magnifying-glass"></i>
    ${label}
  </button>
`;
