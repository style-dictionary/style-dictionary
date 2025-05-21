/**
 * @typedef {import('../../types/Filter.d.ts').Filter} Filter
 */

/**
 * @namespace Filters
 */

/** @type {Record<string, Filter['filter']>} */
export default {
  /**
   * Remove a token from the ditribution output if it contains a key `private` set to true
   * @memberof Filters
   */
  removePrivate: function (token) {
    return token && token.private ? false : true;
  },
};
