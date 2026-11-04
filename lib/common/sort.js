import sortByName from './formatHelpers/sortByName.js';

/**
 * @typedef {import('../../types/Sort.d.ts').Sort} Sort
 */

/**
 * Built-in sorts available for use in format options
 * @namespace Sorts
 */

/** @type {Record<string, Sort['sort']>} */
export default {
  /**
   * Sort tokens alphabetically by name
   * @memberof Sorts
   */
  name: sortByName,
};
