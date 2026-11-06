import usesReferences from '../../utils/references/usesReferences.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} LocalOptions
 */

/**
 * Formats a dictionary token tree into a Panda CSS-compatible token object,
 * ensuring each token node contains a `value` property and strips Style Dictionary metadata.
 *
 * @memberof module:formatHelpers
 * @name formatPandaTokens
 * @param {Tokens} obj - The token dictionary object to format.
 * @param {LocalOptions & Config & { dictionary?: Dictionary }} [options]
 * @returns {Record<string, any>}
 */
export default function formatPandaTokens(obj, options = {}) {
  const { usesDtcg, outputReferences = false, dictionary } = options;

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj;
  }

  if (Object.hasOwn(obj, usesDtcg ? '$value' : 'value')) {
    let value = /** @type {any} */ (usesDtcg ? obj.$value : obj.value);

    const shouldOutputRef =
      outputReferences &&
      (typeof outputReferences === 'function'
        ? outputReferences(/** @type {Token} */ (obj), {
            dictionary: /** @type {Dictionary} */ (dictionary),
            usesDtcg,
          })
        : outputReferences);

    if (shouldOutputRef) {
      const originalValue = usesDtcg ? obj.original?.$value : obj.original?.value;
      if (typeof originalValue === 'string' && usesReferences(originalValue)) {
        // Normalize Style Dictionary reference syntax {color.brand.value} -> {color.brand}
        value = originalValue.replace(/\.value\}/g, '}');
      }
    }

    /** @type {Record<string, unknown>} */
    const token = { value };

    const description = obj.description ?? (usesDtcg ? obj.$description : undefined) ?? obj.comment;
    if (description !== undefined) {
      token.description = description;
    }

    const type = obj.type ?? (usesDtcg ? obj.$type : undefined);
    if (type !== undefined) {
      token.type = type;
    }

    return token;
  }

  /** @type {Record<string, any>} */
  const res = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      res[key] = formatPandaTokens(obj[key], options);
    }
  }
  return res;
}
