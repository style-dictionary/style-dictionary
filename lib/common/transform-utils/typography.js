/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

/**
 * @param {string} character
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
export function wrapValueWith(character, token, options) {
  return `${character}${options.usesDtcg ? token.$value : token.value}${character}`;
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
export function wrapValueWithDoubleQuote(token, options) {
  return wrapValueWith('"', token, options);
}

/**
 * @param {string} name
 * @param {string|number} value
 * @param {string} unitType
 * @returns {string}
 */
export function throwSizeError(name, value, unitType) {
  throw new Error(
    `Invalid Number: '${name}: ${value}' is not a valid number, cannot transform to '${unitType}' \n`,
  );
}

/**
 * @param {PlatformConfig} config
 * @returns {number}
 */
export function getBasePxFontSize(config) {
  return (config && config.basePxFontSize) || 16;
}

/**
 * @param {string} fontString
 */
function quoteWrapWhitespacedFont(fontString) {
  let fontName = fontString.trim();
  const isQuoted =
    (fontName.startsWith("'") && fontName.endsWith("'")) ||
    (fontName.startsWith('"') && fontName.endsWith('"'));
  if (!isQuoted) {
    fontName = fontName.replace(/'/g, "\\'");
  }
  const hasWhiteSpace = new RegExp('\\s+').test(fontName);
  return hasWhiteSpace && !isQuoted ? `'${fontName}'` : fontName;
}

/**
 * @param {Token} token
 * @param {Config} options
 */
export function processFontFamily(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;
  const type = options.usesDtcg ? token.$type : token.type;

  /**
   * @param {string|string[]} _family
   * @returns
   */
  const processFamily = (_family) => {
    let family = _family;
    if (typeof family === 'string' && family.includes(',')) {
      family = family.split(',').map((part) => part.trim());
    }

    if (Array.isArray(family)) {
      return family.map((part) => quoteWrapWhitespacedFont(part)).join(', ');
    }

    return quoteWrapWhitespacedFont(family);
  };

  if (type === 'typography') {
    if (val.fontFamily) {
      return {
        ...val,
        fontFamily: processFamily(val.fontFamily),
      };
    }
    return val;
  }

  return processFamily(val);
}

/**
 * @param {Token} token
 * @param {Config} options
 */
export function transformCubicBezierCSS(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;
  const type = options.usesDtcg ? token.$type : token.type;

  /** @param {number[]|string} easing */
  const transformEasing = (easing) => {
    if (Array.isArray(easing)) {
      return `cubic-bezier(${easing.join(', ')})`;
    }
    return easing;
  };

  if (type === 'transition') {
    if (val.timingFunction) {
      return {
        ...val,
        timingFunction: transformEasing(val.timingFunction),
      };
    }
    return val;
  }
  return transformEasing(val);
}
