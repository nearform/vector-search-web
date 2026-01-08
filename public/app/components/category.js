import { html } from "../util/html.js";

export const CATEGORIES_LIST = [
  "ai",
  "design",
  "product",
  "frontend",
  "mobile",
  "backend",
  "data",
  "cloud",
  "oss",
  "work",
  "test",
  "perf",
  "devops",
  "security",
  "a11y",
];

const CATEGORY_COLORS = [
  "#1B9CFC", // Light Blue
  "#F7B731", // Bright Yellow
  "#2ED573", // Vibrant Green
  "#FF3838", // Strong Red
  "#9B59B6", // Purple
  "#FF9F1A", // Orange
  "#6C5CE7", // Indigo
  "#00B894", // Teal
  "#D63031", // Crimson
  "#E84393", // Pink
  "#0984E3", // Blue
  "#00CEC9", // Aqua
  "#FEA47F", // Peach
  "#B53471", // Magenta
  "#55E6C1", // Mint
];

const CATEGORY_COLORS_MAP = new Map(
  CATEGORIES_LIST.map((category, idx) => [category, CATEGORY_COLORS[idx]]),
);

const getCategoryColor = (category) => CATEGORY_COLORS_MAP.get(category);

const getRgbaCategoryColor = (category) => {
  const color = getCategoryColor(category);
  if (!color) {
    return "128, 128, 128"; // Fallback gray
  }
  return color
    .slice(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join(", ");
};

export const Category = ({ category }) => html`
  <span
    className="category-label"
    style=${{ "--label-color": getRgbaCategoryColor(category) }}
  >
    ${category}
  </span>
`;
