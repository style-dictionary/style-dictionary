/**
 * @typedef {import('../../types/DesignToken.d.ts').TransformedTokens} TransformedTokens
 * @typedef {{strip?: string[]; keep?: string[]; usesDtcg?: boolean;}} StripMetaOptions
 */

/**
 * @param {TransformedTokens} obj
 * @param {StripMetaOptions} options
 */
export function _stripMeta(obj, options) {
  const { strip, keep, usesDtcg } = options;
  Object.keys(obj).forEach((key) => {
    if (Object.hasOwn(obj, usesDtcg ? '$value' : 'value')) {
      if (strip && strip.includes(key)) {
        delete obj[key];
      }

      if (keep && !keep.includes(key)) {
        delete obj[key];
      }
    }

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      _stripMeta(obj[key], options);
    }
  });

  return obj;
}

/**
 * @param {TransformedTokens} obj
 * @param {StripMetaOptions} options
 */
export function stripMeta(obj, options) {
  const clone = structuredClone(obj);
  return _stripMeta(clone, options);
}
