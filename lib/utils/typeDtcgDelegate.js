import isPlainObject from 'is-plain-obj';
import { regexDefault } from './references/createReferenceRegex.js';

/**
 * @typedef {import('../../types/DesignToken.d.ts').DesignTokens} DesignTokens
 * @typedef {import('../../types/DesignToken.d.ts').DesignToken} DesignToken
 * @typedef {import('../../types/DesignToken.d.ts').PreprocessedTokens} PreprocessedTokens
 */

/**
 * @param {DesignTokens} tokens
 * @returns {PreprocessedTokens}
 */
export function typeDtcgDelegate(tokens) {
  const clone = /** @type {PreprocessedTokens} */ (structuredClone(tokens));
  /** @type {Map<string, DesignToken>} */
  const tokensByPath = new Map();
  /** @type {Map<DesignToken, string>} */
  const pendingAliases = new Map();
  /** @type {Map<DesignToken, string>} */
  const fallbackTypes = new Map();

  /**
   * @param {DesignTokens | DesignToken} slice
   * @param {string | undefined} path
   * @param {string} [parentType]
   */
  const recurse = (slice, path, parentType) => {
    let type = parentType;
    const isToken = Object.hasOwn(slice, '$value');
    if (isToken) {
      if (path !== undefined) {
        tokensByPath.set(path, slice);
      }
      if (!Object.hasOwn(slice, '$type')) {
        const value = slice.$value;
        const reference = typeof value === 'string' ? value.match(regexDefault)?.[0] : undefined;
        if (path !== undefined && reference && reference === value) {
          pendingAliases.set(slice, reference.slice(1, -1).trim());
          if (type) {
            fallbackTypes.set(slice, type);
          }
        } else if (type) {
          slice.$type = type;
        }
      }
    }

    if (slice.$type) {
      type = /** @type {string} */ (slice.$type);
      // remove group level $type
      if (slice.$value === undefined) {
        delete slice.$type;
      }
    }

    Object.entries(slice).forEach(([key, val]) => {
      if (isPlainObject(val)) {
        // Keep delegating nested values as before, but only index paths to tokens in the groups.
        let childPath;
        if (path !== undefined && !isToken) {
          childPath = path ? `${path}.${key}` : key;
        }
        recurse(val, childPath, type);
      }
    });
  };

  /**
   * @param {DesignToken | undefined} token
   * @returns {string | undefined}
   */
  const resolveType = (token) => {
    if (!token) {
      return undefined;
    }
    const targetPath = pendingAliases.get(token);
    if (targetPath === undefined) {
      return token.$type;
    }

    // Mark this alias as visited so missing or circular references stay with the value resolver.
    pendingAliases.delete(token);
    const type = resolveType(tokensByPath.get(targetPath));
    if (type !== undefined) {
      token.$type = type;
    }
    return type;
  };

  recurse(clone, '');
  for (const alias of pendingAliases.keys()) {
    resolveType(alias);
  }
  // Apply fallback types after resolution so broken chains use each alias's own group type.
  for (const [alias, groupType] of fallbackTypes) {
    alias.$type ??= groupType;
  }
  return clone;
}
