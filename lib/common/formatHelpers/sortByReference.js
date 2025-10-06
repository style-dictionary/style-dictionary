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

  /**
   * The sorter function is recursive to account for multiple levels of nesting
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

    const aUsesRefs = a.original && usesReferences(a.original[valueKey]);
    const bUsesRefs = b.original && usesReferences(b.original[valueKey]);

    // -----BOTH REFERENCE-----
    if (aUsesRefs && bUsesRefs) {
      // Collect references for 'a' and 'b'
      const aRefs = getReferences(a.original[valueKey], tokens, {
        unfilteredTokens,
        usesDtcg,
        warnImmediately: false,
      });
      const bRefs = getReferences(b.original[valueKey], tokens, {
        unfilteredTokens,
        usesDtcg,
        warnImmediately: false,
      });

      // 'a' references 'b' -> 'b' should come first
      if (aRefs.some((aRef) => aRef.name === b.name)) {
        return B_COMES_FIRST;
      }
      // 'b' references 'a' -> 'a' should come first
      if (bRefs.some((bRef) => bRef.name === a.name)) {
        return A_COMES_FIRST;
      }

      // 'a' and 'b' reference, but not each other. Recurse to next level
      return sorter(aRefs[0], bRefs[0]);
    }

    // ----- ONLY ONE REFERENCES -----
    // 'a' references, 'b' doesn't -> 'b' should come first
    if (aUsesRefs) {
      return B_COMES_FIRST;
    }

    // 'b' references, 'a' doesn't -> 'a' should come first
    if (bUsesRefs) {
      return A_COMES_FIRST;
    }

    // no references, keep existing order
    return 0;
  }

  return sorter;
}
