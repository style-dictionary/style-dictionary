import isPlainObject from 'is-plain-obj';

/**
 * @typedef {import('../../types/DesignToken.d.ts').DesignTokens} Tokens
 * @typedef {import('../../types/DesignToken.d.ts').TransformedTokens} TransformedTokens
 */

/**
 * TODO: see if we can use deepmerge instead of maintaining our own utility
 * Main reason for having our own is that we have a collision function that warns users
 * when props from different objects collide, e.g. multiple token files colliding on the same token name
 * https://github.com/TehShrike/deepmerge/issues/262 created a feature request
 *
 * Performs an deep extend on the objects, from right to left.
 * @private
 * @template {Object} T - Generic type T extends from "Object", to be maximally permissive
 * @param {Array<T>} objects - An array of JS objects
 * @param {{collision?: Function, overrideKeys?: string[]}} [opts] - deepExtend options to change its behavior.
 * @param {string[]} [path] - (for internal use) An array of strings which is the current path down the object when this is called recursively.
 * @returns {T}
 */
export default function deepExtend(objects, opts = {}, path) {
  const { collision, overrideKeys } = opts;
  // typecast it to T, to circumvent error thrown because technically,
  // T could be instantiated with a type that has more limited constraints than Obj
  // but this isn't actually a problem for us since we are only merging objects together..
  const defaultVal = /** @type {T} */ ({});

  if (objects == null) return defaultVal;

  let target = objects[0] || {};

  path = path || [];

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object') {
    target = defaultVal;
  }

  for (let i = 1; i < objects.length; i++) {
    const options = objects[i];
    // Only deal with non-null/undefined values
    if (options != null) {
      // Extend the base object
      for (const name in options) {
        // Not everything extends from Object in browser context, so bind from Object just in case
        if (!Object.hasOwn(options, name)) continue;
        if (name === '__proto__') continue;

        const src = target[name];
        const copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        let copyIsArray = Array.isArray(copy);
        // Recurse if we're merging plain objects or arrays
        if (copy && (isPlainObject(copy) || copyIsArray)) {
          /** @type {Tokens|TransformedTokens|any} */
          let clone;
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && Array.isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          const nextPath = path.slice(0);
          nextPath.push(name);

          // Never move original objects, clone them
          target[name] = deepExtend([clone, copy], opts, nextPath);

          // Don't bring in undefined values
        } else if (copy !== undefined) {
          if (src != null) {
            // if src & copy are the exact same value, then the collision doesn't matter
            if (typeof collision === 'function' && src !== copy) {
              collision({ target, copy: options, path, key: name });
            }

            if (overrideKeys?.includes(name)) {
              // we dont always want merging behavior, sometimes
              // we want to fully override an object, e.g. for design tokens
              // we dont want sibling props of target to be merged into the copy
              // see tests for more details
              target = options;
            }
          }
          target[name] = copy;
        }
      }
    }
  }

  return target;
}
