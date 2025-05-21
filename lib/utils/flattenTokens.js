import isPlainObject from 'is-plain-obj';

/**
 * @typedef {import('../../types/DesignToken.ts').DesignToken} Token
 * @typedef {import('../../types/DesignToken.ts').DesignTokens} Tokens
 * @typedef {import('../../types/DesignToken.ts').TransformedToken} TransformedToken
 * @typedef {import('../../types/DesignToken.ts').TransformedTokens} TransformedTokens
 */

/**
 * @private
 * @template {Token | TransformedToken} T
 * @template {Tokens | TransformedTokens} U
 * @param  {U} slice - The plain object you want flattened into an array.
 * @param {boolean} [usesDtcg] - Whether or not tokens are using DTCG syntax.
 * @param  {Array<T>} [result] - Tokens array. This function is recursive therefore this is what gets passed along.
 * @param  {string[]} [keyMemo] - Memo of keys we're traversing in order of depth
 * @return {Array<T>}
 */
function _flattenTokens(slice, usesDtcg, result = [], keyMemo = []) {
  for (let key in slice) {
    if (Object.hasOwn(slice, key)) {
      // Stop either when we encounter a "value" prop or if we find that every prop is not an object, meaning we cannot traverse any further
      if (isPlainObject(slice[key]) && Object.hasOwn(slice[key], `${usesDtcg ? '$' : ''}value`)) {
        result.push({
          .../** @type {T} */ (slice[key]),
          // this keeps track of the ancestor keys of the token e.g. 'colors.red.500'
          key: `{${[...keyMemo, key].join('.')}}`,
        });
      } else if (isPlainObject(slice[key])) {
        // pass the current slice key to the end of the memo onto the next recursive call
        _flattenTokens(slice[key], usesDtcg, result, keyMemo.concat(key));
      }
    }
  }
  return result;
}

/**
 * Takes an plain javascript object and will make a flat array of all the leaf nodes.
 * A leaf node in this context has a 'value' property. Potentially refactor this to
 * be more generic.
 * @template {Token | TransformedToken} T
 * @template {Tokens | TransformedTokens} U
 * @param  {U} tokens - The plain object you want flattened into an array.
 * @param {boolean} [usesDtcg] - Whether or not tokens are using DTCG syntax.
 * @return {Array<T>}
 */
export default function flattenTokens(tokens, usesDtcg = false) {
  return _flattenTokens(tokens, usesDtcg);
}
