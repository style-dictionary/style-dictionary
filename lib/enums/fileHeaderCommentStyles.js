/**
 * Comment styles for file header comments.
 *
 * Use these values for `formatting.fileHeader.commentStyle` or when passing
 * `commentStyle` to the `fileHeader()` format helper.
 *
 * @example
 * ```js
 * import { fileHeaderCommentStyles } from 'style-dictionary/enums';
 *
 * // In config
 * options: {
 *   formatting: {
 *     fileHeader: {
 *       commentStyle: fileHeaderCommentStyles.short
 *     }
 *   }
 * }
 * ```
 *
 * @property {string} short - Single-line comment style: `// comment`
 * @property {string} long - Block comment style: `/** comment *​/`
 * @property {string} xml - XML comment style: `<!-- comment -->`
 */
export const fileHeaderCommentStyles = {
  short: /** @type {'short'} */ ('short'),
  long: /** @type {'long'} */ ('long'),
  xml: /** @type {'xml'} */ ('xml'),
};
