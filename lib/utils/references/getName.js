/**
 * Returns the paths name be joining its parts with separator '.'.
 *
 * @private
 * @param {string[]} path
 * @returns {string} - The paths name
 */
export default function getName(path) {
  if (!Array.isArray(path)) {
    throw new Error('Getting name for path failed. Token path must be an array of strings');
  }
  return path.join('.');
}
