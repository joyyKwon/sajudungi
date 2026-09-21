import { BUNDLED_CONTENT, ContentBundle } from './content/bundled';

// Module-level holder so plain functions (interpret, flow, ...) can read the
// current text without React. ContentProvider swaps it when server text arrives.
let current: ContentBundle = BUNDLED_CONTENT;

export const getContent = (): ContentBundle => current;
export const setContent = (bundle: ContentBundle) => {
  current = bundle;
};
