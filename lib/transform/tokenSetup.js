import isPlainObject from 'is-plain-obj';

/**
 * @typedef {import('../../types/DesignToken.d.ts').DesignToken} Token
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} TransformedToken
 */

/**
 * Takes a token object, a leaf node in a tokens object, and
 * returns a new object that has some tokens set. It clones the
 * original object for safekeeping, adds a name, adds an attributes object,
 * and a path array.
 * @private
 * @param {Token|TransformedToken} token - the token object to setup
 * @param {string} name - The name of the token, which will should be its key in the object.
 * @param {string[]} path - The path of keys to get to the token from the top level of the tokens object.
 * @returns {TransformedToken} - A new object that is setup and ready to go.
 */
export default function tokenSetup(token, name, path) {
  if (!token && !isPlainObject(token)) throw new Error('Token object must be of type "object"');
  if (!name || !(typeof name === 'string')) throw new Error('Token name must be a string');
  if (!path || !Array.isArray(path)) throw new Error('Token path must be an array');

  let to_ret = token;

  // Only do this once
  if (!token.original) {
    // Initial token setup
    // Keep the original object tokens like it was in file (whitout additional data)
    // so we can key off them in the transforms
    let to_ret_original = structuredClone(token);
    delete to_ret_original.filePath;
    delete to_ret_original.isSource;

    to_ret.original = to_ret_original;
    // Copy the name - it will be our base name to transform
    to_ret.name = to_ret.name || name || '';
    // Create an empty attributes object that we can transform on it later
    to_ret.attributes = to_ret.attributes || {};
    // An array of the path down the object tree; we will use it to build readable names
    // like color_font_base
    to_ret.path = structuredClone(path);
  }
  // now the token is for sure transformed and contains path, attributes, name and original props
  return /** @type {TransformedToken} */ (to_ret);
}
