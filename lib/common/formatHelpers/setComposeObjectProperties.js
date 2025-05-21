/**
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} Options
 */

/**
 * Outputs an object for compose format configurations. Sets import.
 * @memberof module:formatHelpers
 * @name setComposeObjectProperties
 * @param {{import?:string[]}} [options] - The options object declared at configuration
 * @returns {Object}
 */
export default function setComposeObjectProperties(options = {}) {
  if (typeof options.import === 'undefined') {
    options.import = ['androidx.compose.ui.graphics.Color', 'androidx.compose.ui.unit.*'];
  } else if (typeof options.import === 'string') {
    options.import = [options.import];
  }

  return options;
}
