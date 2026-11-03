import { stripMeta as stripMetaUtil } from '../../utils/stripMeta.js';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} LocalOptions
 * @typedef {import('../../utils/stripMeta.js').StripMetaOptions} StripMetaOptions
 */

/**
 * Strip meta properties from tokens object
 *
 * @param {Tokens} tokens
 * @param {Config & LocalOptions & { stripMeta?: boolean | StripMetaOptions}} [options]
 */
export function stripMetaProps(tokens, options = {}) {
  if (!options.stripMeta) return tokens;

  const sdMetaProps = ['attributes', 'filePath', 'name', 'path', 'comment'];
  let opts = /** @type {StripMetaOptions} */ ({ usesDtcg: options.usesDtcg });
  opts.usesDtcg = options.usesDtcg;

  if (options.stripMeta === true) {
    opts.strip = sdMetaProps;
  } else {
    if (options.stripMeta?.strip) {
      opts.strip = options.stripMeta.strip;
    }
    if (options.stripMeta?.keep) {
      opts.keep = options.stripMeta.keep;
    }
  }

  return stripMetaUtil(tokens, opts);
}
