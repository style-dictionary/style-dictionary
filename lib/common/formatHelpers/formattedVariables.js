import createPropertyFormatter from './createPropertyFormatter.js';
import sortByReference from './sortByReference.js';
import sortByName from './sortByName.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/File.d.ts').FormattingOptions} Formatting
 * @typedef {import('../../../types/Format.d.ts').OutputReferences} OutputReferences
 * @typedef {import('../../../types/Sort.d.ts').SortFn} SortFn
 * @typedef {import('../../../types/Sort.d.ts').SortOption} SortOption
 * @typedef {import('../../../types/DesignToken.d.ts').Dictionary} Dictionary
 */

const defaultFormatting = {
  lineSeparator: '\n',
};

/**
 *
 * This is used to create lists of variables like Sass variables or CSS custom properties
 * @memberof module:formatHelpers
 * @name formattedVariables
 * @param {Object} options
 * @param {String} options.format - What type of variables to output. Options are: css, sass, less, and stylus
 * @param {Dictionary} options.dictionary - The dictionary object that gets passed to the format method.
 * @param {OutputReferences} [options.outputReferences] - Whether or not to output references
 * @param {Boolean} [options.outputReferenceFallbacks] - Whether or not to output a faLLback value for output references
 * @param {Formatting} [options.formatting] - Custom formatting properties that define parts of a declaration line in code. This will get passed to `formatHelpers` -> `createPropertyformat` and used for the `lineSeparator` between lines of code.
 * @param {Boolean} [options.themeable] [false] - Whether tokens should default to being themeable.
 * @param {boolean} [options.usesDtcg] [false] - Whether DTCG token syntax should be uses.
 * @param {SortOption} [options.sort] - Optional sorting strategy.
 * @returns {String}
 * @example
 * ```js
 * import { propertyFormatNames } from 'style-dictionary/enums';
 *
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *     return formattedVariables({
 *       format: propertyFormatNames.less,
 *       dictionary,
 *       outputReferences: options.outputReferences
 *     });
 *   }
 * });
 * ```
 */
export default function formattedVariables({
  format,
  dictionary,
  outputReferences = false,
  outputReferenceFallbacks,
  formatting = {},
  themeable = false,
  usesDtcg = false,
  sort,
}) {
  // typecast, we know that by know the tokens have been transformed
  let allTokens = /** @type {Token[]} */ (dictionary.allTokens);
  /** @type {Tokens} */
  const tokens = dictionary.tokens;

  let { lineSeparator } = Object.assign({}, defaultFormatting, formatting);

  const sortInputs = sort ? (Array.isArray(sort) ? sort : [sort]) : [];

  // reference-safety sorter is an internal concern:
  // we only compute it when outputReferences=true
  const byReference = outputReferences
    ? sortByReference(tokens, { unfilteredTokens: dictionary.unfilteredTokens, usesDtcg })
    : null;

  /**
   * @param {SortFn} keyOrFn
   * @returns {((a: Token, b: Token) => number) | null}
   */
  const normalize = (keyOrFn) => {
    if (typeof keyOrFn === 'function') return keyOrFn;

    if (keyOrFn === 'name') return sortByName;

    // Fail loudly for invalid values (esp. typos)
    if (typeof keyOrFn === 'string') {
      throw new Error(
        `Invalid "sort" option: "${keyOrFn}". ` +
          `Use "name", a comparator function, or an array of those.`,
      );
    }

    // Non-string non-function values are also invalid
    throw new Error(
      `Invalid "sort" option type: ${typeof keyOrFn}. ` +
        `Use "name", a comparator function, or an array of those.`,
    );
  };

  /**
   * @param {((a: Token, b: Token) => number) | null} s
   * @returns {s is ((a: Token, b: Token) => number)}
   */
  const isComparator = (s) => s !== null;

  const requestedSorters = sortInputs.map(normalize).filter(isComparator);

  // If outputReferences=true, enforce reference-safe ordering first (define-before-use safety).
  // The user-provided sort acts as a tie-breaker on top.
  const comparators = outputReferences
    ? [byReference, ...requestedSorters].filter(isComparator)
    : requestedSorters.filter(isComparator);

  if (comparators.length > 0) {
    // note: using the spread operator here so we get a new array rather than
    // mutating the original
    allTokens = [...allTokens].sort((a, b) => {
      for (const cmp of comparators) {
        const r = cmp(a, b);
        if (r !== 0) return r;
      }
      return 0;
    });
  }

  return allTokens
    .map(
      createPropertyFormatter({
        outputReferences,
        outputReferenceFallbacks,
        dictionary,
        format,
        formatting,
        themeable,
        usesDtcg,
      }),
    )
    .filter(function (strVal) {
      return !!strVal;
    })
    .join(lineSeparator);
}
