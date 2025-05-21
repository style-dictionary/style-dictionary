/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 */

/**
 * Outputs an object stripping out everything except values
 * @memberof module:formatHelpers
 * @name minifyDictionary
 * @param {Tokens} obj - The object to minify. You will most likely pass `dictionary.tokens` to it.
 * @param {boolean} [usesDtcg] - Whether or not tokens are using DTCG syntax.
 * @returns {Tokens}
 * @example
 * ```js
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary }) {
 *     return JSON.stringify(minifyDictionary(dictionary.tokens));
 *   }
 * });
 * ```
 */
export default function minifyDictionary(obj, usesDtcg = false) {
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  /** @type {Tokens} */
  const toRet = {};

  if (Object.hasOwn(obj, `${usesDtcg ? '$' : ''}value`)) {
    return usesDtcg ? obj.$value : obj.value;
  } else {
    for (const name in obj) {
      if (Object.hasOwn(obj, name)) {
        toRet[name] = minifyDictionary(obj[name], usesDtcg);
      }
    }
  }
  return toRet;
}
