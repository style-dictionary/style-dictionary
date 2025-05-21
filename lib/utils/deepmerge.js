import _deepmerge from '@bundled-es-modules/deepmerge';
import isPlainObject from 'is-plain-obj';

/**
 * Wrapper around deepmerge that merges only plain objects and arrays
 * @param {Object} target
 * @param {Object} source
 * @param {boolean} [dedupeArrays]
 */
export const deepmerge = (target, source, dedupeArrays = true) => {
  return _deepmerge(target, source, {
    /**
     * Merge if object is array or a plain object (so not merging functions/class instances together)
     * @param {Object} obj
     */
    isMergeableObject: (obj) => Array.isArray(obj) || isPlainObject(obj),
    /**
     * Combine arrays but remove duplicate primitives (e.g. no duplicate transforms)
     * @param {Array<unknown>} target
     * @param {Array<unknown>} source
     */
    arrayMerge: (target, source) => {
      return dedupeArrays && target.length > 0 && source.length > 0
        ? // if both arrays have values, dedupe them
          Array.from(new Set([...target, ...source]))
        : [...target, ...source];
    },
  });
};
