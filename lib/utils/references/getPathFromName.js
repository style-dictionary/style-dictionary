/**
 * Returns the path from a path name be splitting the name by separator '.'.
 * @private
 * @param {string} pathName
 * @returns {string[]} - The path
 */
export default function getPathFromName(pathName) {
  if (typeof pathName !== 'string') {
    throw new Error('Getting path from name failed. Token name must be a string');
  }
  return pathName.split('.');
}
