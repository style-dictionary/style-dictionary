import usesReferences from '../../utils/references/usesReferences.js';
import { getReferences } from '../../utils/references/getReferences.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 */

const A_COMES_FIRST = -1;
const B_COMES_FIRST = 1;

/**
 * A function that returns a sorting function to be used with Array.sort that
 * will sort the allTokens array based on references. This is to make sure
 * if you use output references that you never use a reference before it is
 * defined.
 * @memberof module:formatHelpers
 * @name sortByReference
 * @example
 * ```javascript
 * dictionary.allTokens.sort(sortByReference(dictionary))
 * ```
 * @param {Tokens} tokens
 * @param {{unfilteredTokens?: Tokens, usesDtcg?: boolean}} [opts]
 * @returns {(a: Token, b: Token) => number}
 */
export default function sortByReference(tokens, { unfilteredTokens, usesDtcg } = {}) {
  const valueKey = usesDtcg ? '$value' : 'value';
  // Sorting only needs to resolve references, so look them up in the unfiltered set
  // directly. Passing it as `unfilteredTokens` would make getReferences collect
  // "filtered out token references" warnings, including for references of tokens
  // that are never output (the sorter recurses into referenced tokens), and those
  // warnings would never be cleared by outputReferencesFilter.
  const refTokens = unfilteredTokens ?? tokens;

  /**
   * How many levels of references sit below a token: 0 if it uses no references,
   * otherwise one more than the deepest token it references. A token always has a
   * greater depth than every token it references, so ordering by depth puts each
   * definition before its use. Comparing depths is also a consistent ordering, which
   * Array.sort needs: comparing pairs by "does one reference the other" is not, and
   * left some tokens before the tokens they reference (#658).
   * @type {Map<string | object, number>}
   */
  const depths = new Map();
  /** @type {Set<string | object>} */
  const visiting = new Set();

  /**
   * getReferences returns shallow copies of the referenced tokens, so remember depths by
   * the token's path (how references name it), or else by its `original` object, which the
   * copies share.
   * @param {Token} token
   * @returns {string | object}
   */
  const keyOf = (token) =>
    Array.isArray(token.path) ? token.path.join('.') : (token.original ?? token);

  /**
   * @param {Token} token
   * @returns {number}
   */
  function depthOf(token) {
    const key = keyOf(token);
    const known = depths.get(key);
    if (known !== undefined) {
      return known;
    }
    // circular references are reported elsewhere; don't loop on them here
    if (visiting.has(key) || !token.original || !usesReferences(token.original[valueKey])) {
      return 0;
    }
    visiting.add(key);
    const refs = getReferences(token.original[valueKey], refTokens, {
      usesDtcg,
      warnImmediately: false,
    });
    const depth = 1 + Math.max(0, ...refs.filter(Boolean).map(depthOf));
    visiting.delete(key);
    depths.set(key, depth);
    return depth;
  }

  /**
   * Tokens with the same depth keep their existing order (Array.sort is stable).
   * @param {Token} a
   * @param {Token} b
   * @returns {number}
   */
  function sorter(a, b) {
    if (typeof a === 'undefined') {
      return A_COMES_FIRST;
    }
    if (typeof b === 'undefined') {
      return B_COMES_FIRST;
    }
    return Math.sign(depthOf(a) - depthOf(b));
  }

  return sorter;
}
