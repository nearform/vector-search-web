/* global window:false, URLSearchParams:false */

// `?present` trims the page down for demoing on a projector: a generic title
// and one-line description in place of the project blurb and its links, and no
// footer banner. Nothing for an audience to read past while you talk over it.
export const IS_PRESENT_MODE = new URLSearchParams(window.location.search).has(
  "present",
);

export const PRESENT_TITLE = "Content Search";

export const PRESENT_INTRO =
  "Vector similarity search over a library of articles.";
