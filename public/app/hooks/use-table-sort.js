import { useState } from "react";
import { html } from "../util/html.js";

const SORT_DIRS = {
  ASC: "asc",
  DESC: "desc",
};

const sortIconHtml = (className) => html`<i className="ph ${className}"></i>`;

const SORT_CHARS = {
  [SORT_DIRS.ASC]: sortIconHtml("ph-sort-ascending"),
  [SORT_DIRS.DESC]: sortIconHtml("ph-sort-descending"),
  empty: sortIconHtml("ph-arrows-down-up"),
};

export const useTableSort = (initialSort = { key: null, direction: null }) => {
  const [sort, setSort] = useState(initialSort);

  const getSortSymbol = (key) => {
    if (sort.key === key) {
      return SORT_CHARS[sort.direction || "empty"];
    }
    return SORT_CHARS.empty;
  };

  const handleColumnSort = (key) => {
    let direction = SORT_DIRS.ASC;
    if (sort.key === key) {
      if (sort.direction === SORT_DIRS.ASC) {
        direction = SORT_DIRS.DESC;
      } else if (sort.direction === SORT_DIRS.DESC) {
        direction = null;
        key = null;
      }
    }
    setSort({ key, direction });
  };

  const compare = (a, b) => {
    if (
      (typeof a === "string" || a === null) &&
      (typeof b === "string" || b === null)
    ) {
      return (a || "").localeCompare(b || "");
    }
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  const getVal = (key, val) => {
    if (key.includes(".")) {
      const keys = key.split(".");
      let value = val;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) break;
      }
      return value;
    }
    return val[key];
  };

  const sortItems = (items) => {
    if (sort.key && sort.direction) {
      const dir = sort.direction === SORT_DIRS.ASC ? 1 : -1;
      return [...items].sort((a, b) => {
        const aVal = getVal(sort.key, a);
        const bVal = getVal(sort.key, b);
        return dir * compare(aVal, bVal);
      });
    }
    return items;
  };

  return { sort, getSortSymbol, handleColumnSort, sortItems };
};
