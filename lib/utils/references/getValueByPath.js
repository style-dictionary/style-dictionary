/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @param {string[]} path
 * @param {Tokens|Map<string,Token>} tokens
 * @returns {Token|undefined}
 */
export default function getValueByPath(path, tokens) {
  if (tokens instanceof Map) {
    return tokens.get(`{${path.join('.')}}`);
  }

  let ref = tokens;

  if (!Array.isArray(path)) {
    return;
  }

  for (let i = 0; i < path.length; i++) {
    // Check for undefined as 0 is a valid, truthy value
    if (typeof ref[path[i]] !== 'undefined') {
      ref = ref[path[i]];
    } else {
      // set the reference as undefined if we don't find anything
      return undefined;
    }
  }
  return /** @type {Token} */ (ref);
}
