import GroupMessages from '../groupMessages.js';

const FILTER_WARNINGS = GroupMessages.GROUP.FilteredOutputReferences;

/**
 * Files are formatted concurrently, so filtered out reference warnings are
 * collected per file instead of in one shared message group, otherwise
 * a file could report (and flush) the warnings of another file.
 * Maps the filtered tokens objects that are passed to a file's format
 * to the message group of that file.
 * @type {WeakMap<object, string>}
 */
const fileGroups = new WeakMap();
let fileCount = 0;

/**
 * Create the message group for the filtered out reference warnings of a single file.
 * @param {object[]} filteredTokens the filtered tokens objects that are passed to the file's format
 * @returns {string}
 */
export function createFilterWarningsGroup(filteredTokens) {
  const group = `${FILTER_WARNINGS}:${fileCount++}`;
  filteredTokens.forEach((tokens) => fileGroups.set(tokens, group));
  return group;
}

/**
 * Get the message group for filtered out reference warnings found in the given tokens,
 * falls back to the shared group if the tokens do not belong to a filtered file.
 * @param {object} tokens
 * @returns {string}
 */
export function getFilterWarningsGroup(tokens) {
  return fileGroups.get(tokens) ?? FILTER_WARNINGS;
}
