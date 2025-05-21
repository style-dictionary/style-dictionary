import { usesReferences, getReferences } from 'style-dictionary/utils';

/**
 * @typedef {import('../../../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../../types/File.d.ts').File} File
 * @typedef {import('../../../../types/Config.d.ts').Config} Config
 * @typedef {import('../../../../types/File.d.ts').FileHeader} FileHeader
 */

/**
 * @param {{
 *   dictionary: Dictionary;
 *   file?: File;
 *   header?: string;
 *   options: Config
 * }} opts
 */
export default (opts) => {
  const { file, header, dictionary, options } = opts;

  const resourceType = file?.options?.resourceType || null;

  const resourceMap = file?.options?.resourceMap || {
    dimension: 'dimen',
    fontSize: 'dimen',
    color: 'color',
    string: 'string',
    content: 'string',
    time: 'integer',
    number: 'integer',
  };

  /**
   * @param {Token} token
   * @param {Config} options
   * @returns {string}
   */
  function tokenToType(token, options) {
    const type = options.usesDtcg ? token.$type : token.type;
    if (resourceType) {
      return resourceType;
    }
    if (type && resourceMap[type]) {
      return resourceMap[type];
    }
    return 'string';
  }

  /**
   * @param {Token} token
   * @param {Tokens} tokens
   * @param {Config} options
   * @returns {string}
   */
  function tokenToValue(token, tokens, options) {
    let originalValue = options.usesDtcg ? token.original.$value : token.original.value;
    if (file?.options && file.options.outputReferences && usesReferences(originalValue)) {
      return `@${tokenToType(token, options)}/${
        getReferences(originalValue, tokens, {
          usesDtcg: options.usesDtcg,
          warnImmediately: false,
        })[0].name
      }`;
    } else {
      return options.usesDtcg ? token.$value : token.value;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>

${header}
<resources>
  ${
    /** @type {Token[]} */ (dictionary.allTokens)
      .map(
        (token) =>
          `<${tokenToType(token, options)} name="${token.name}">${tokenToValue(
            token,
            dictionary.tokens,
            options,
          )}</${tokenToType(token, options)}>${token.comment ? `<!-- ${token.comment} -->` : ''}`,
      )
      .join(`\n  `)
  }
</resources>`;
};
