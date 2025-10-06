import { getReferences } from '../../utils/references/getReferences.js';
import usesReferences from '../../utils/references/usesReferences.js';
import { commentStyles, commentPositions, propertyFormatNames } from '../../enums/index.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} TransformedToken
 * @typedef {import('../../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../../types/File.d.ts').FormattingOptions} Formatting
 * @typedef {import('../../../types/Format.d.ts').OutputReferences} OutputReferences
 */

const { short, long, none } = commentStyles;
const { above, inline } = commentPositions;
const { css, sass, less, stylus } = propertyFormatNames;

/**
 * @type {Formatting}
 */
const defaultFormatting = {
  prefix: '',
  commentStyle: long,
  commentPosition: inline,
  indentation: '',
  separator: ' =',
  suffix: ';',
};

/**
 * Split a string comment by newlines and
 * convert to multi-line comment if necessary
 * @param {string} to_ret_token
 * @param {string} comment
 * @param {Formatting} options
 * @returns {string}
 */
export function addComment(to_ret_token, comment, options) {
  const { commentStyle, indentation } = options;
  let { commentPosition } = options;

  const commentsByNewLine = comment.split('\n');
  if (commentsByNewLine.length > 1) {
    commentPosition = above;
  }

  let processedComment;
  switch (commentStyle) {
    case short:
      if (commentPosition === inline) {
        processedComment = `// ${comment}`;
      } else {
        processedComment = commentsByNewLine.reduce(
          (acc, curr) => `${acc}${indentation}// ${curr}\n`,
          '',
        );
        // remove trailing newline
        processedComment = processedComment.replace(/\n$/g, '');
      }
      break;
    case long:
      if (commentsByNewLine.length > 1) {
        processedComment = commentsByNewLine.reduce(
          (acc, curr) => `${acc}${indentation} * ${curr}\n`,
          `${indentation}/**\n`,
        );
        processedComment += `${indentation} */`;
      } else {
        processedComment = `${commentPosition === above ? indentation : ''}/** ${comment} */`;
      }
      break;
  }

  if (commentPosition === above) {
    // put the comment above the token if it's multi-line or if commentStyle ended with -above
    to_ret_token = `${processedComment}\n${to_ret_token}`;
  } else {
    to_ret_token = `${to_ret_token} ${processedComment}`;
  }

  return to_ret_token;
}

/**
 * Creates a function that can be used to format a token. This can be useful
 * to use as the function on `dictionary.allTokens.map`. The formatting
 * is configurable either by supplying a `format` option or a `formatting` object
 * which uses: prefix, indentation, separator, suffix, and commentStyle.
 * @memberof module:formatHelpers
 * @name createPropertyFormatter
 * @example
 * ```javascript
 * import { propertyFormatNames } from 'style-dictionary/enums';
 *
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *     const { outputReferences } = options;
 *     const formatProperty = createPropertyFormatter({
 *       outputReferences,
 *       dictionary,
 *       format: propertyFormatNames.css
 *     });
 *     return dictionary.allTokens.map(formatProperty).join('\n');
 *   }
 * });
 * ```
 * @param {Object} options
 * @param {OutputReferences} [options.outputReferences] - Whether or not to output references. You will want to pass this from the `options` object sent to the format function.
 * @param {boolean} [options.outputReferenceFallbacks] - Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.
 * @param {Dictionary} options.dictionary - The dictionary object sent to the format function
 * @param {string} [options.format] - Available formats are: 'css', 'sass', 'less', and 'stylus'. If you want to customize the format and can't use one of those predefined formats, use the `formatting` option
 * @param {Formatting} [options.formatting] - Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `prefix`, `indentation`, `separator`, `suffix`, `lineSeparator`, `fileHeaderTimestamp`, `header`, `footer`, `commentStyle` and `commentPosition`. Those are used to generate a line like this: `${indentation}${prefix}${token.name}${separator} ${token.value}${suffix}`. The remaining formatting options are used for the fileHeader helper.
 * @param {boolean} [options.themeable] [false] - Whether tokens should default to being themeable.
 * @param {boolean} [options.usesDtcg] [false] - Whether DTCG token syntax should be uses.
 * @returns {(token: import('../../../types/DesignToken.d.ts').TransformedToken) => string}
 */
export default function createPropertyFormatter({
  outputReferences = false,
  outputReferenceFallbacks = false,
  dictionary,
  format,
  formatting = {},
  themeable = false,
  usesDtcg = false,
}) {
  /** @type {Formatting} */
  const formatDefaults = {};
  switch (format) {
    case css:
      formatDefaults.prefix = '--';
      formatDefaults.indentation = '  ';
      formatDefaults.separator = ':';
      break;
    case sass:
      formatDefaults.prefix = '$';
      formatDefaults.commentStyle = short;
      formatDefaults.indentation = '';
      formatDefaults.separator = ':';
      break;
    case less:
      formatDefaults.prefix = '@';
      formatDefaults.commentStyle = short;
      formatDefaults.indentation = '';
      formatDefaults.separator = ':';
      break;
    case stylus:
      formatDefaults.prefix = '$';
      formatDefaults.commentStyle = short;
      formatDefaults.indentation = '';
      formatDefaults.separator = '=';
      break;
  }
  const mergedOptions = {
    ...defaultFormatting,
    ...formatDefaults,
    ...formatting,
  };
  let { prefix, commentStyle, indentation, separator, suffix } = mergedOptions;
  const { tokens, unfilteredTokens } = dictionary;
  return function (token) {
    let to_ret_token = `${indentation}${prefix}${token.name}${separator} `;
    let value = usesDtcg ? token.$value : token.value;
    const originalValue = usesDtcg ? token.original.$value : token.original.value;

    const shouldOutputRef =
      usesReferences(originalValue) &&
      (typeof outputReferences === 'function'
        ? outputReferences(token, { dictionary, usesDtcg })
        : outputReferences);
    /**
     * A single value can have multiple references either by interpolation:
     * "value": "{size.border.width} solid {color.border.primary}"
     * or if the value is an object:
     * "value": {
     *    "size": "{size.border.width}",
     *    "style": "solid",
     *    "color": "{color.border.primary.value"}
     * }
     * This will see if there are references and if there are, replace
     * the resolved value with the reference's name.
     */
    if (shouldOutputRef) {
      // Formats that use this function expect `value` to be a string
      // or else you will get '[object Object]' in the output
      const refs = getReferences(
        originalValue,
        tokens,
        { unfilteredTokens, usesDtcg, warnImmediately: false },
        [],
      );

      // original can either be an object value, which requires transitive value transformation in web CSS formats
      // or a different (primitive) type, meaning it can be stringified.
      const originalIsObject = typeof originalValue === 'object' && originalValue !== null;

      if (!originalIsObject) {
        // TODO: find a better way to deal with object-value tokens and outputting refs
        // e.g. perhaps it is safer not to output refs when the value is transformed to a non-object
        // for example for CSS-like formats we always flatten to e.g. strings

        // when original is object value, we replace value by matching ref.value and putting a var instead.
        // Due to the original.value being an object, it requires transformation, so undoing the transformation
        // by replacing value with original.value is not possible. (this is the early v3 approach to outputting refs)

        // when original is string value, we replace value by matching original.value and putting a var instead
        // this is more friendly to transitive transforms that transform the string values (v4 way of outputting refs)
        value = originalValue;
      }

      refs.forEach((ref) => {
        // value should be a string that contains the resolved reference
        // because Style Dictionary resolved this in the resolution step.
        // Here we are undoing that by replacing the value with
        // the reference's name
        if (Object.hasOwn(ref, `${usesDtcg ? '$' : ''}value`) && Object.hasOwn(ref, 'name')) {
          const refVal = usesDtcg ? ref.$value : ref.value;
          const replaceFunc = function () {
            if (format === css) {
              if (outputReferenceFallbacks) {
                return `var(${prefix}${ref.name}, ${refVal})`;
              } else {
                return `var(${prefix}${ref.name})`;
              }
            } else {
              return `${prefix}${ref.name}`;
            }
          };
          // TODO: add test
          // technically speaking a reference can be made to a number or boolean token, in this case we stringify it first
          value = `${value}`.replace(
            originalIsObject ? refVal : new RegExp(`{${ref.path.join('\\.')}(\\.\\$?value)?}`, 'g'),
            replaceFunc,
          );
        }
      });
    }

    to_ret_token += value;

    const themeable_token = typeof token.themeable === 'boolean' ? token.themeable : themeable;
    if (format === sass && themeable_token) {
      to_ret_token += ' !default';
    }

    to_ret_token += suffix;

    const comment = token.$description ?? token.comment;
    if (comment && commentStyle !== none) {
      to_ret_token = addComment(to_ret_token, comment, mergedOptions);
    }

    return to_ret_token;
  };
}
