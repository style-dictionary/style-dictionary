/**
 * Comment styles for token property comments.
 *
 * Use these values for `formatting.commentStyle` when configuring how token
 * description comments are rendered in output files.
 *
 * For file header comment styles, use `fileHeaderCommentStyles` instead
 * or configure via `formatting.fileHeader.commentStyle`.
 *
 * @example
 * ```js
 * import { commentStyles } from 'style-dictionary/enums';
 *
 * // In config
 * options: {
 *   formatting: {
 *     commentStyle: commentStyles.short
 *   }
 * }
 * ```
 *
 * @property {string} short - Single-line comment style: `// comment`
 * @property {string} long - Block comment style: `/** comment *​/`
 * @property {string} none - No comments rendered
 */
export const commentStyles = {
  short: /** @type {'short'} */ ('short'),
  long: /** @type {'long'} */ ('long'),
  none: /** @type {'none'} */ ('none'),
};
