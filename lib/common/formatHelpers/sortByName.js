/**
 * @typedef {import("../../../types/DesignToken.ts").TransformedToken} Token
 */

/**
 * A sorting function to be used when iterating over `dictionary.allTokens` in
 * a format.
 * @memberof module:formatHelpers
 * @name sortByName
 * @example
 * ```javascript
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *     return dictionary.allTokens.sort(sortByName)
 *       .map(token => `${token.name} = ${token.value}`)
 *       .join('\n');
 *   }
 * });
 * ```
 * @param {Token} a - first element for comparison
 * @param {Token} b - second element for comparison
 * @returns {number} -1 or 1 depending on which element should come first based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
export default function sortByName(a, b) {
  if (b.name > a.name) {
    return -1;
  } else {
    return 1;
  }
}
