import Color from 'tinycolor2';
import ColorJS from 'colorjs.io';
import { join } from 'path-unified/posix';
import { snakeCase, kebabCase, camelCase } from 'change-case';
import convertToBase64 from '../utils/convertToBase64.js';
import GroupMessages from '../utils/groupMessages.js';
import { transforms, transformTypes } from '../enums/index.js';

/**
 * @typedef {import('../../types/Transform.d.ts').Transform} Transform
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../types/DesignToken.d.ts').DTCGColorValue} DTCGColorValue
 * @typedef {import('../../types/DesignToken.d.ts').DTCGColorSpace} DTCGColorSpace
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 * @typedef {import('../../types/Config.d.ts').Config} Config
 */

const UNKNOWN_CSS_FONT_PROPS_WARNINGS = GroupMessages.GROUP.UnknownCSSFontProperties;
const { value, name, attribute } = transformTypes;

/**
 * Valid DTCG v2025.10 color spaces
 * @type {Set<string>}
 */
const DTCG_COLOR_SPACES = new Set([
  'srgb',
  'srgb-linear',
  'display-p3',
  'a98-rgb',
  'prophoto-rgb',
  'rec2020',
  'xyz-d50',
  'xyz-d65',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'hsl',
  'hwb',
]);

/**
 * Map DTCG color space names to colorjs.io color space IDs
 * @type {Record<string, string>}
 */
const DTCG_TO_COLORJS_SPACE = {
  srgb: 'srgb',
  'srgb-linear': 'srgb-linear',
  'display-p3': 'p3',
  'a98-rgb': 'a98rgb',
  'prophoto-rgb': 'prophoto',
  rec2020: 'rec2020',
  'xyz-d50': 'xyz-d50',
  'xyz-d65': 'xyz-d65',
  lab: 'lab',
  lch: 'lch',
  oklab: 'oklab',
  oklch: 'oklch',
  hsl: 'hsl',
  hwb: 'hwb',
};

/**
 * Check if a value is a DTCG color object
 * @param {unknown} val
 * @returns {val is DTCGColorValue}
 */
export function isDTCGColorObject(val) {
  return (
    typeof val === 'object' &&
    val !== null &&
    'colorSpace' in val &&
    typeof val.colorSpace === 'string' &&
    DTCG_COLOR_SPACES.has(val.colorSpace) &&
    'components' in val &&
    Array.isArray(val.components)
  );
}

/**
 * Convert a DTCG color object to a ColorJS Color instance
 * Handles 'none' values in components and alpha
 * @param {DTCGColorValue} dtcgColor
 * @returns {ColorJS}
 */
function dtcgToColorJS(dtcgColor) {
  const { colorSpace, components, alpha } = dtcgColor;

  // Map DTCG color space to colorjs.io color space ID
  const colorjsSpace = DTCG_TO_COLORJS_SPACE[colorSpace] ?? colorSpace;

  // Convert 'none' values to NaN (as per CSS Color spec)
  const coords = /** @type {[number, number, number]} */ (
    components.map((c) => (c === 'none' ? NaN : c))
  );
  const alphaValue = alpha === 'none' ? NaN : (alpha ?? 1);

  return new ColorJS(colorjsSpace, coords, alphaValue);
}

/**
 * Get the sRGB representation of a color, with gamut mapping if needed
 * Uses the hex property as fallback if provided and color is out of gamut
 * @param {DTCGColorValue} dtcgColor
 * @returns {{ r: number, g: number, b: number, a: number }}
 */
function dtcgColorToRgb(dtcgColor) {
  const color = dtcgToColorJS(dtcgColor);

  // Check if color is in sRGB gamut
  if (!color.inGamut('srgb')) {
    // If hex fallback is provided, use it
    if (dtcgColor.hex) {
      const fallback = Color(dtcgColor.hex).toRgb();
      return fallback;
    }
    // Otherwise, perform gamut mapping
    color.toGamut({ space: 'srgb' });
  }

  const srgb = color.to('srgb');
  const alpha = isNaN(srgb.alpha) ? 1 : srgb.alpha;

  return {
    r: Math.round(Math.max(0, Math.min(1, srgb.coords[0])) * 255),
    g: Math.round(Math.max(0, Math.min(1, srgb.coords[1])) * 255),
    b: Math.round(Math.max(0, Math.min(1, srgb.coords[2])) * 255),
    a: alpha,
  };
}

/**
 * Get color RGB values from either legacy string format or DTCG object format
 * @param {Token} token
 * @param {Config} options
 * @returns {{ r: number, g: number, b: number, a: number }}
 */
export function getColorRgb(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;

  if (isDTCGColorObject(val)) {
    return dtcgColorToRgb(val);
  }

  // Legacy format - use tinycolor2
  return Color(val).toRgb();
}

/**
 * Get a tinycolor2 Color instance from either legacy string format or DTCG object format
 * This provides backward compatibility for transformers that use tinycolor2 methods
 * @param {Token} token
 * @param {Config} options
 * @returns {ReturnType<typeof Color>}
 */
export function getColor(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;

  if (isDTCGColorObject(val)) {
    const rgb = dtcgColorToRgb(val);
    return Color(rgb);
  }

  return Color(val);
}

/**
 * Get a ColorJS Color instance from either legacy string format or DTCG object format
 * @param {Token} token
 * @param {Config} options
 * @returns {ColorJS}
 */
export function getColorJS(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;

  if (isDTCGColorObject(val)) {
    return dtcgToColorJS(val);
  }

  // Parse legacy format with ColorJS
  return new ColorJS(val);
}

/**
 * @param {string} str
 * @returns {string}
 */

const UNICODE_PATTERN = /&#x([^;]+);/g;
const camelOpts = {
  mergeAmbiguousCharacters: true,
};

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
export function isColor(token, options) {
  const val = options.usesDtcg ? token.$value : token.value;
  const type = options.usesDtcg ? token.$type : token.type;

  if (type !== 'color') return false;

  // DTCG object format
  if (isDTCGColorObject(val)) return true;

  // Legacy string format
  return (
    Color(val).isValid() &&
    // exclude gradients from being color transformed
    ['linear', 'radial', 'conic']
      .map((pre) => `${pre}-gradient`)
      .every((pre) => !`${val}`.startsWith(pre) && !`${val}`.startsWith(`repeating-${pre}`))
  );
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
function isDimension(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'dimension';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
function isFontSize(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'fontSize';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
function isAsset(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'asset';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
function isContent(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'content';
}

/**
 * @param {string} character
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
function wrapValueWith(character, token, options) {
  return `${character}${options.usesDtcg ? token.$value : token.value}${character}`;
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
function wrapValueWithDoubleQuote(token, options) {
  return wrapValueWith('"', token, options);
}

/**
 * @param {string} name
 * @param {string|number} value
 * @param {string} unitType
 * @returns {string}
 */
function throwSizeError(name, value, unitType) {
  throw new Error(
    `Invalid Number: '${name}: ${value}' is not a valid number, cannot transform to '${unitType}' \n`,
  );
}

/**
 * @param {PlatformConfig} config
 * @returns {number}
 */
function getBasePxFontSize(config) {
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
function processFontFamily(token, options) {
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
function transformCubicBezierCSS(token, options) {
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

/**
 * @namespace Transforms
 * @type {Record<string, Omit<Transform, 'name'>>}
 */
export default {
  /**
   * Adds: category, type, item, subitem, and state on the attributes object based on the location in the style dictionary.
   *
   * ```js
   * // Matches: all
   * // Returns:
   * {
   *   "category": "color",
   *   "type": "background",
   *   "item": "button",
   *   "subitem": "primary",
   *   "state": "active"
   * }
   * ```
   *
   * @memberof Transforms
   */
  [transforms.attributeCti]: {
    type: attribute,
    transform: function (token) {
      const attrNames = ['category', 'type', 'item', 'subitem', 'state'];
      const originalAttrs = token.attributes || {};
      /** @type {Record<string, string>} */
      const generatedAttrs = {};

      for (let i = 0; i < token.path.length && i < attrNames.length; i++) {
        generatedAttrs[attrNames[i]] = token.path[i];
      }

      return Object.assign(generatedAttrs, originalAttrs);
    },
  },

  /**
   * Adds: hex, hsl, hsv, rgb, red, blue, green.
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns
   * {
   *   "hex": "009688",
   *   "rgb": {"r": 0, "g": 150, "b": 136, "a": 1},
   *   "hsl": {"h": 174.4, "s": 1, "l": 0.294, "a": 1},
   *   "hsv": {"h": 174.4, "s": 1, "l": 0.588, "a": 1},
   * }
   * ```
   *
   * @memberof Transforms
   */
  [transforms.attributeColor]: {
    type: attribute,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColor(token, options);
      return {
        hex: color.toHex(),
        rgb: color.toRgb(),
        hsl: color.toHsl(),
        hsv: color.toHsv(),
      };
    },
  },

  /**
   * Creates a human-friendly name
   *
   * ```js
   * // Matches: All
   * // Returns:
   * "button primary"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.nameHuman]: {
    type: name,
    transform: function (token) {
      return [token.attributes?.item, token.attributes?.subitem].join(' ');
    },
  },

  /**
   * Creates a camel case name. If you define a prefix on the platform in your config, it will prepend with your prefix
   *
   * ```js
   * // Matches: all
   * // Returns:
   * "colorBackgroundButtonPrimaryActive"
   * "prefixColorBackgroundButtonPrimaryActive"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.nameCamel]: {
    type: name,
    transform: function (token, config) {
      return camelCase([config.prefix].concat(token.path).join(' '), camelOpts);
    },
  },

  /**
   * Creates a kebab case name. If you define a prefix on the platform in your config, it will prepend with your prefix
   *
   * ```js
   * // Matches: all
   * // Returns:
   * "color-background-button-primary-active"
   * "prefix-color-background-button-primary-active"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.nameKebab]: {
    type: name,
    transform: function (token, config) {
      return kebabCase([config.prefix].concat(token.path).join(' '));
    },
  },

  /**
   * Creates a snake case name. If you define a prefix on the platform in your config, it will prepend with your prefix
   *
   * ```js
   * // Matches: all
   * // Returns:
   * "color_background_button_primary_active"
   * "prefix_color_background_button_primary_active"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.nameSnake]: {
    type: name,
    transform: function (token, config) {
      return snakeCase([config.prefix].concat(token.path).join(' '));
    },
  },

  /**
   * Creates a constant-style name based on the full CTI of the token. If you define a prefix on the platform in your config, it will prepend with your prefix
   *
   * ```js
   * // Matches: all
   * // Returns:
   * "COLOR_BACKGROUND_BUTTON_PRIMARY_ACTIVE"
   * "PREFIX_COLOR_BACKGROUND_BUTTON_PRIMARY_ACTIVE"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.nameConstant]: {
    type: name,
    transform: function (token, config) {
      return snakeCase([config.prefix].concat(token.path).join(' ')).toUpperCase();
    },
  },

  /**
   * Creates a Pascal case name. If you define a prefix on the platform in your config, it will prepend with your prefix
   *
   * ```js
   * // Matches: all
   * // Returns:
   * "ColorBackgroundButtonPrimaryActive"
   * "PrefixColorBackgroundButtonPrimaryActive"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.namePascal]: {
    type: name,
    transform: function (token, config) {
      /** @param {string} str */
      const upperFirst = function (str) {
        return str ? str[0].toUpperCase() + str.slice(1) : '';
      };
      return upperFirst(camelCase([config.prefix].concat(token.path).join(' '), camelOpts));
    },
  },

  /**
   * Transforms the value into an RGB string
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "rgb(0, 150, 136)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorRgb]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      return getColor(token, options).toRgbString();
    },
  },

  /**
   * Transforms the value into an HSL string or HSLA if alpha is present. Better browser support than color/hsl-4
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "hsl(174, 100%, 29%)"
   * "hsl(174, 100%, 29%, .5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorHsl]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      return getColor(token, options).toHslString();
    },
  },

  /**
   * Transforms the value into an HSL string, using fourth argument if alpha is present.
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "hsl(174 100% 29%)"
   * "hsl(174 100% 29% / .5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorHsl4]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColor(token, options);
      const o = color.toHsl();
      const vals = `${Math.round(o.h)} ${Math.round(o.s * 100)}% ${Math.round(o.l * 100)}%`;
      if (color.getAlpha() === 1) {
        return `hsl(${vals})`;
      } else {
        return `hsl(${vals} / ${o.a})`;
      }
    },
  },

  /**
   * Transforms the value into a 6-digit (if alpha is undefined or 1.0) or 8-digit hex string
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "#009688DE"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorHex]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColor(token, options);
      if (color.getAlpha() === 1) {
        return color.toHexString();
      } else {
        return color.toHex8String();
      }
    },
  },

  /**
   * Transforms the value into an 8-digit hex string
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "#009688ff"
   * ```
   * @deprecated use colorHex ('color/hex') instead, which supports hex8 now.
   * @memberof Transforms
   */
  [transforms.colorHex8]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      return getColor(token, options).toHex8String();
    },
  },

  /**
   * Transforms the value into an 8-digit hex string for Android because they put the alpha channel first
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * "#ff009688"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorHex8android]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const str = getColor(token, options).toHex8();
      return '#' + str.slice(6) + str.slice(0, 6);
    },
  },

  /**
   * Transforms the value into a Color class for Compose
   *
   * ```kotlin
   * // Matches: token.type === 'color'
   * // Returns:
   * Color(0xFF009688)
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorComposeColor]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const str = getColor(token, options).toHex8();
      return 'Color(0x' + str.slice(6) + str.slice(0, 6) + ')';
    },
  },

  /**
   * Transforms the value into an UIColor class for iOS
   *
   * ```objective-c
   * // Matches: token.type === 'color'
   * // Returns:
   * [UIColor colorWithRed:0.114f green:0.114f blue:0.114f alpha:1.000f]
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorUIColor]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const rgb = getColor(token, options).toRgb();
      return (
        '[UIColor colorWithRed:' +
        (rgb.r / 255).toFixed(3) +
        'f' +
        ' green:' +
        (rgb.g / 255).toFixed(3) +
        'f' +
        ' blue:' +
        (rgb.b / 255).toFixed(3) +
        'f' +
        ' alpha:' +
        rgb.a.toFixed(3) +
        'f]'
      );
    },
  },

  /**
   * Transforms the value into an UIColor swift class for iOS
   *
   * ```swift
   * // Matches: token.type === 'color'
   * // Returns:
   * UIColor(red: 0.667, green: 0.667, blue: 0.667, alpha: 0.6)
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorUIColorSwift]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const { r, g, b, a } = getColor(token, options).toRgb();
      const rFixed = (r / 255.0).toFixed(3);
      const gFixed = (g / 255.0).toFixed(3);
      const bFixed = (b / 255.0).toFixed(3);
      return `UIColor(red: ${rFixed}, green: ${gFixed}, blue: ${bFixed}, alpha: ${a})`;
    },
  },

  /**
   * Transforms the value into an UIColor swift class for iOS
   *
   * ```swift
   * // Matches: token.type === 'color'
   * // Returns:
   * Color(red: 0.667, green: 0.667, blue: 0.667, opacity: 0.6)
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorColorSwiftUI]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const { r, g, b, a } = getColor(token, options).toRgb();
      const rFixed = (r / 255.0).toFixed(3);
      const gFixed = (g / 255.0).toFixed(3);
      const bFixed = (b / 255.0).toFixed(3);
      return `Color(red: ${rFixed}, green: ${gFixed}, blue: ${bFixed}, opacity: ${a})`;
    },
  },

  /**
   * Transforms the value into a hex or rgb string depending on if it has transparency
   *
   * ```css
   * // Matches: token.type === 'color'
   * // Returns:
   * #000000
   * rgba(0,0,0,0.5)
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorCss]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColor(token, options);
      if (color.getAlpha() === 1) {
        return color.toHexString();
      } else {
        return color.toRgbString();
      }
    },
  },

  /**
   *
   * Transforms a color into an object with red, green, blue, and alpha
   * attributes that are floats from 0 - 1. This object is how Sketch stores
   * colors.
   *
   * ```js
   * // Matches: token.type === 'color'
   * // Returns:
   * {
   *   red: 0.5,
   *   green: 0.5,
   *   blue: 0.5,
   *   alpha: 1
   * }
   * ```
   * @memberof Transforms
   */
  [transforms.colorSketch]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      let color = getColor(token, options).toRgb();
      return {
        red: (color.r / 255).toFixed(5),
        green: (color.g / 255).toFixed(5),
        blue: (color.b / 255).toFixed(5),
        alpha: color.a,
      };
    },
  },

  /**
   * Transforms the value into an OKLCH CSS color function string.
   * Preserves wide-gamut colors without lossy gamut mapping.
   *
   * ```css
   * // Matches: token.type === 'color'
   * // Returns:
   * "oklch(0.7 0.15 180)"
   * "oklch(0.7 0.15 180 / 0.5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorOklch]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColorJS(token, options).to('oklch');
      const [l, c, h] = color.coords;
      const alpha = isNaN(color.alpha) ? 1 : color.alpha;
      // Format: oklch(L C H) or oklch(L C H / alpha)
      const lStr = (isNaN(l) ? 0 : l).toFixed(4);
      const cStr = (isNaN(c) ? 0 : c).toFixed(4);
      const hStr = (isNaN(h) ? 0 : h).toFixed(2);
      if (alpha === 1) {
        return `oklch(${lStr} ${cStr} ${hStr})`;
      }
      return `oklch(${lStr} ${cStr} ${hStr} / ${alpha})`;
    },
  },

  /**
   * Transforms the value into an OKLAB CSS color function string.
   * Preserves wide-gamut colors without lossy gamut mapping.
   *
   * ```css
   * // Matches: token.type === 'color'
   * // Returns:
   * "oklab(0.7 -0.1 0.1)"
   * "oklab(0.7 -0.1 0.1 / 0.5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorOklab]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColorJS(token, options).to('oklab');
      const [l, a, b] = color.coords;
      const alpha = isNaN(color.alpha) ? 1 : color.alpha;
      // Format: oklab(L a b) or oklab(L a b / alpha)
      const lStr = (isNaN(l) ? 0 : l).toFixed(4);
      const aStr = (isNaN(a) ? 0 : a).toFixed(4);
      const bStr = (isNaN(b) ? 0 : b).toFixed(4);
      if (alpha === 1) {
        return `oklab(${lStr} ${aStr} ${bStr})`;
      }
      return `oklab(${lStr} ${aStr} ${bStr} / ${alpha})`;
    },
  },

  /**
   * Transforms the value into a Display P3 CSS color function string.
   * Preserves wide-gamut colors without lossy gamut mapping.
   *
   * ```css
   * // Matches: token.type === 'color'
   * // Returns:
   * "color(display-p3 0.5 0.5 0.5)"
   * "color(display-p3 0.5 0.5 0.5 / 0.5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorP3]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColorJS(token, options).to('p3');
      const [r, g, b] = color.coords;
      const alpha = isNaN(color.alpha) ? 1 : color.alpha;
      // Format: color(display-p3 r g b) or color(display-p3 r g b / alpha)
      const rStr = (isNaN(r) ? 0 : r).toFixed(5);
      const gStr = (isNaN(g) ? 0 : g).toFixed(5);
      const bStr = (isNaN(b) ? 0 : b).toFixed(5);
      if (alpha === 1) {
        return `color(display-p3 ${rStr} ${gStr} ${bStr})`;
      }
      return `color(display-p3 ${rStr} ${gStr} ${bStr} / ${alpha})`;
    },
  },

  /**
   * Transforms the value into an LCH CSS color function string.
   * Preserves wide-gamut colors without lossy gamut mapping.
   *
   * ```css
   * // Matches: token.type === 'color'
   * // Returns:
   * "lch(50% 30 180)"
   * "lch(50% 30 180 / 0.5)"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.colorLch]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const color = getColorJS(token, options).to('lch');
      const [l, c, h] = color.coords;
      const alpha = isNaN(color.alpha) ? 1 : color.alpha;
      // Format: lch(L% C H) or lch(L% C H / alpha)
      const lStr = (isNaN(l) ? 0 : l).toFixed(2);
      const cStr = (isNaN(c) ? 0 : c).toFixed(2);
      const hStr = (isNaN(h) ? 0 : h).toFixed(2);
      if (alpha === 1) {
        return `lch(${lStr}% ${cStr} ${hStr})`;
      }
      return `lch(${lStr}% ${cStr} ${hStr} / ${alpha})`;
    },
  },

  /**
   * Transforms the value into a scale-independent pixel (sp) value for font sizes on Android. It will not scale the number.
   *
   * ```js
   * // Matches: token.type === 'fontSize'
   * // Returns:
   * "10.0sp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeSp]: {
    type: value,
    filter: isFontSize,
    transform: function (token, _, options) {
      const nonParsedVal = options.usesDtcg ? token.$value : token.value;
      const val = parseFloat(nonParsedVal);
      if (isNaN(val)) throwSizeError(token.name, nonParsedVal, 'sp');
      return val.toFixed(2) + 'sp';
    },
  },

  /**
   * Transforms the value into a density-independent pixel (dp) value for non-font sizes on Android. It will not scale the number.
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "10.0dp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeDp]: {
    type: value,
    filter: isDimension,
    transform: function (token, _, options) {
      const nonParsedVal = options.usesDtcg ? token.$value : token.value;
      const val = parseFloat(nonParsedVal);
      if (isNaN(val)) throwSizeError(token.name, nonParsedVal, 'dp');
      return val.toFixed(2) + 'dp';
    },
  },

  /**
   * Transforms the value into a useful object ( for React Native support )
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * {
   *  original: "10px",
   *  number: 10,
   *  decimal: 0.1, // 10 divided by 100
   *  scale: 160, // 10 times 16
   * }
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeObject]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'object');

      return {
        original: value,
        number: parsedVal,
        decimal: parsedVal / 100,
        scale: parsedVal * getBasePxFontSize(config),
      };
    },
  },

  /**
   * Transforms the value from a REM size on web into a scale-independent pixel (sp) value for font sizes on Android. It WILL scale the number by a factor of 16 (or the value of 'basePxFontSize' on the platform in your config).
   *
   * ```js
   * // Matches: token.type === 'fontSize'
   * // Returns:
   * "16.0sp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeRemToSp]: {
    type: value,
    filter: isFontSize,
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'sp');
      return (parsedVal * baseFont).toFixed(2) + 'sp';
    },
  },

  /**
   * Transforms the value from a REM size on web into a density-independent pixel (dp) value for non font-sizes on Android. It WILL scale the number by a factor of 16 (or the value of 'basePxFontSize' on the platform in your config).
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "16.0dp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeRemToDp]: {
    type: value,
    filter: isDimension,
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'dp');
      return (parsedVal * baseFont).toFixed(2) + 'dp';
    },
  },

  /**
   * Adds 'px' to the end of the number. Does not scale the number
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "10px"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizePx]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, _, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'px');
      return parsedVal + 'px';
    },
  },

  /**
   * Adds 'rem' to the end of the number. Does not scale the number
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "10rem"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeRem]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, _, options) {
      const nonParsed = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(nonParsed);

      if (isNaN(parsedVal)) throwSizeError(token.name, nonParsed, 'rem');

      // if the dimension already has a unit (non-digit / . period character or any arbitrary character)
      if (`${nonParsed}`.match(/[^0-9.-]+$/)) {
        return nonParsed;
      }

      if (parsedVal === 0) return Number.isInteger(nonParsed) ? 0 : '0';

      return parsedVal + 'rem';
    },
  },

  /**
   * Scales the number by 16 (or the value of 'basePxFontSize' on the platform in your config) and adds 'pt' to the end.
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "16pt"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeRemToPt]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'pt');
      return (parsedVal * baseFont).toFixed(2) + 'f';
    },
  },

  /**
   * Transforms the value from a REM size on web into a scale-independent pixel (sp) value for font sizes in Compose. It WILL scale the number by a factor of 16 (or the value of 'basePxFontSize' on the platform in your config).
   *
   * ```kotlin
   * // Matches: token.type === 'fontSize'
   * // Returns:
   * "16.0.sp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeComposeRemToSp]: {
    type: value,
    filter: isFontSize,
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'sp');
      return (parsedVal * baseFont).toFixed(2) + '.sp';
    },
  },

  /**
   * Transforms the value from a REM size on web into a density-independent pixel (dp) value for font sizes in Compose. It WILL scale the number by a factor of 16 (or the value of 'basePxFontSize' on the platform in your config).
   *
   * ```kotlin
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "16.0.dp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeComposeRemToDp]: {
    type: value,
    filter: isDimension,
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'dp');
      return (parsedVal * baseFont).toFixed(2) + '.dp';
    },
  },

  /**
   * Adds the .em Compose extension to the end of a number. Does not scale the value
   *
   * ```kotlin
   * // Matches: token.type === 'fontSize'
   * // Returns:
   * "16.0em"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeComposeEm]: {
    type: value,
    filter: isFontSize,
    transform: function (token, _, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'em');
      return parsedVal + '.em';
    },
  },

  /**
   * Adds the .sp Compose extension to the end of a number. Does not scale the value
   *
   * ```kotlin
   * // Matches: token.type === 'fontSize'
   * // Returns:
   * "16.0.sp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeComposeSp]: {
    type: value,
    filter: isFontSize,
    transform: function (token, _, options) {
      const nonParsedVal = options.usesDtcg ? token.$value : token.value;
      const val = parseFloat(nonParsedVal);
      if (isNaN(val)) throwSizeError(token.name, nonParsedVal, 'sp');
      return val.toFixed(2) + '.sp';
    },
  },

  /**
   * Adds the .dp Compose extension to the end of a number. Does not scale the value
   *
   * ```kotlin
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "16.0.dp"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeComposeDp]: {
    type: value,
    filter: isDimension,
    transform: function (token, _, options) {
      const nonParsedVal = options.usesDtcg ? token.$value : token.value;
      const val = parseFloat(nonParsedVal);
      if (isNaN(val)) throwSizeError(token.name, nonParsedVal, 'dp');
      return val.toFixed(2) + '.dp';
    },
  },

  /**
   * Scales the number by 16 (or the value of 'basePxFontSize' on the platform in your config) to get to points for Swift and initializes a CGFloat
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns: "CGFloat(16.00)""
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeSwiftRemToCGFloat]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'CGFloat');
      return `CGFloat(${(parsedVal * baseFont).toFixed(2)})`;
    },
  },

  /**
   * Scales the number by 16 (or the value of 'basePxFontSize' on the platform in your config) and adds 'px' to the end.
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "16px"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeRemToPx]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, config, options) {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);
      if (isNaN(parsedVal)) throwSizeError(token.name, value, 'px');
      return (parsedVal * baseFont).toFixed(0) + 'px';
    },
  },

  /**
   * Scales non-zero numbers to rem, and adds 'rem' to the end. If you define a "basePxFontSize" on the platform in your config, it will be used to scale the value, otherwise 16 (default web font size) will be used.
   *
   * ```js
   * // Matches: token.type === 'dimension'
   * // Returns:
   * "0"
   * "1rem"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizePxToRem]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: (token, config, options) => {
      const value = options.usesDtcg ? token.$value : token.value;
      const parsedVal = parseFloat(value);
      const baseFont = getBasePxFontSize(config);

      if (isNaN(parsedVal)) {
        throwSizeError(token.name, value, 'rem');
      }

      if (parsedVal === 0) {
        return '0';
      }

      return `${parsedVal / baseFont}rem`;
    },
  },

  /**
   * Takes a unicode point and transforms it into a form CSS can use.
   *
   * ```js
   * // Matches: token.type === 'html'
   * // Returns:
   * "'\\E001'"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.htmlIcon]: {
    type: value,
    filter: function (token, options) {
      return (options.usesDtcg ? token.$type : token.type) === 'html';
    },
    transform: function (token, _, options) {
      return (options.usesDtcg ? token.$value : token.value).replace(
        UNICODE_PATTERN,
        /**
         * @param {string} match
         * @param {string} variable */
        function (match, variable) {
          return "'\\" + variable + "'";
        },
      );
    },
  },

  /**
   * Wraps the value in a single quoted string
   *
   * ```js
   * // Matches: token.type === 'content'
   * // Returns:
   * "'string'"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.contentQuote]: {
    type: value,
    filter: isContent,
    transform: function (token, _, options) {
      return wrapValueWith("'", token, options);
    },
  },

  /**
   * Wraps the value in a double-quoted string and prepends an '@' to make a string literal.
   *
   * ```objective-c
   * // Matches: token.type === 'content'
   * // Returns:
   * \@"string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.contentObjCLiteral]: {
    type: value,
    filter: isContent,
    transform: function (token, _, options) {
      return '@' + wrapValueWithDoubleQuote(token, options);
    },
  },

  /**
   * Wraps the value in a double-quoted string to make a string literal.
   *
   * ```swift
   * // Matches: token.type === 'content'
   * // Returns:
   * "string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.contentSwiftLiteral]: {
    type: value,
    filter: isContent,
    transform: (token, _, options) => wrapValueWithDoubleQuote(token, options),
  },

  /**
   * Assumes a time in miliseconds and transforms it into a decimal
   *
   * ```js
   * // Matches: token.type === 'time'
   * // Returns:
   * "0.5s"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.timeSeconds]: {
    type: value,
    filter: function (token, options) {
      return (options.usesDtcg ? token.$type : token.type) === 'time';
    },
    transform: function (token, _, options) {
      return (parseFloat(options.usesDtcg ? token.$value : token.value) / 1000).toFixed(2) + 's';
    },
  },

  /**
   * Turns fontFamily tokens into valid CSS string values
   * https://design-tokens.github.io/community-group/format/#font-family
   * https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
   *
   * ```js
   * // Matches: token.type === 'fontFamily'
   * // Returns:
   * "'Arial Narrow', Arial, sans-serif"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.fontFamilyCss]: {
    type: value,
    // typography properties can be references, while fontFamily prop might not
    transitive: true,
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
      return !!type && ['fontFamily', 'typography'].includes(type);
    },
    transform: (token, _, options) => {
      return processFontFamily(token, options);
    },
  },

  /**
   * Turns fontFamily tokens into valid CSS string values
   * https://design-tokens.github.io/community-group/format/#font-family
   * https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
   *
   * ```js
   * // Matches: token.type === 'fontFamily'
   * // Returns:
   * "'Arial Narrow', Arial, sans-serif"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.cubicBezierCss]: {
    type: value,
    // transition properties can be references, while timingFunction might not be
    transitive: true,
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
      return !!type && ['cubicBezier', 'transition'].includes(type);
    },
    transform: (token, _, options) => {
      return transformCubicBezierCSS(token, options);
    },
  },

  /**
   * Turns strokeStyle object-value tokens into stringified CSS fallback
   * https://design-tokens.github.io/community-group/format/#stroke-style
   * https://design-tokens.github.io/community-group/format/#example-fallback-for-object-stroke-style
   * CSS does not allow detailed control of the dash pattern or line caps on dashed borders, so we use dashed fallback
   * ```js
   * // Matches: token.type === 'border'
   * // Returns:
   * "dashed"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.strokeStyleCssShorthand]: {
    type: value,
    // border properties can be references, while style property might not be
    transitive: true,
    filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'strokeStyle',
    transform: (token, _, options) => {
      const val = options.usesDtcg ? token.$value : token.value;
      if (typeof val !== 'object') {
        // already transformed to string
        return val;
      }
      return 'dashed';
    },
  },

  /**
   * Turns border tokens object-value into stringified CSS shorthand
   * https://design-tokens.github.io/community-group/format/#border
   *
   * ```js
   * // Matches: token.type === 'border'
   * // Returns:
   * "2px solid #000000"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.borderCssShorthand]: {
    type: value,
    // border properties can be references
    transitive: true,
    filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'border',
    transform: (token, _, options) => {
      const val = options.usesDtcg ? token.$value : token.value;
      if (typeof val !== 'object') {
        // already transformed to string
        return val;
      }
      const { color, width } = val;
      let { style } = val;

      // use fallback for style object value, since CSS does not allow
      // detailed control of the dash pattern or line caps on dashed borders
      // https://design-tokens.github.io/community-group/format/#example-fallback-for-object-stroke-style
      if (typeof style === 'object') {
        style = 'dashed';
      }
      return `${width ? `${width} ` : ''}${style ? `${style}` : 'none'}${color ? ` ${color}` : ''}`;
    },
  },

  /**
   * Turns typography tokens object-value into stringified CSS shorthand
   * https://design-tokens.github.io/community-group/format/#typography
   *
   * Available props within typography has been extended here
   * to include those available in CSS font shorthand:
   * https://developer.mozilla.org/en-US/docs/Web/CSS/font
   *
   * ```js
   * // Matches: token.type === 'typography'
   * // Returns:
   * "500 20px/1.5 Arial"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.typographyCssShorthand]: {
    type: value,
    // typography properties can be references
    transitive: true,
    filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'typography',
    transform: (token, platform, options) => {
      const val = options.usesDtcg ? token.$value : token.value;
      if (typeof val !== 'object') {
        // already transformed to string
        return val;
      }
      let { fontFamily } = val;
      const { fontWeight, fontVariant, fontWidth, fontSize, fontStyle, lineHeight } = val;

      const CSSShorthandProps = [
        'fontStyle',
        'fontVariant',
        'fontWeight',
        'fontWidth',
        'fontSize',
        'lineHeight',
        'fontFamily',
      ];

      const unknownProps = Object.keys(val).filter((key) => !CSSShorthandProps.includes(key));
      if (unknownProps.length > 0) {
        GroupMessages.add(
          UNKNOWN_CSS_FONT_PROPS_WARNINGS,
          `${unknownProps.join(', ')} for token at ${token.path.join('.')}${
            token.filePath ? ` in ${token.filePath}` : ''
          }`,
        );
      }

      fontFamily = fontFamily ?? 'sans-serif';

      return `${fontStyle ? `${fontStyle} ` : ''}${fontVariant ? `${fontVariant} ` : ''}${
        fontWeight ? `${fontWeight} ` : ''
      }${fontWidth ? `${fontWidth} ` : ''}${
        fontSize ? `${fontSize}` : `${getBasePxFontSize(platform)}px`
      }${lineHeight ? `/${lineHeight} ` : ' '}${fontFamily}`;
    },
  },

  /**
   * Turns transition tokens object-value into stringified CSS shorthand
   * https://design-tokens.github.io/community-group/format/#border
   *
   * ```js
   * // Matches: token.type === 'transition'
   * // Returns:
   * "200ms linear 50ms"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.transitionCssShorthand]: {
    type: value,
    // transition properties can be references
    transitive: true,
    filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'transition',
    transform: (token, _, options) => {
      const val = options.usesDtcg ? token.$value : token.value;
      if (typeof val !== 'object') {
        // already transformed to string
        return val;
      }
      const { duration, delay, timingFunction } = val;

      return `${duration} ${timingFunction} ${delay}`;
    },
  },

  /**
   * Turns shadow tokens object-value into stringified CSS shorthand
   * https://design-tokens.github.io/community-group/format/#shadow
   *
   * ```js
   * // Matches: token.type === 'shadow'
   * // Returns:
   * "inset 2px 4px 10px 5px #000000"
   * ```.
   *
   * @memberof Transforms
   */
  [transforms.shadowCssShorthand]: {
    type: value,
    // shadow properties can be references
    transitive: true,
    filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'shadow',
    transform: (token, _, options) => {
      const val = options.usesDtcg ? token.$value : token.value;
      if (typeof val !== 'object') {
        // already transformed to string
        return val;
      }

      /** @param {any} val */
      const stringifyShadow = (val) => {
        // check if the shadows are objects, they might already be transformed to strings if they were refs
        if (typeof val !== 'object') {
          return val;
        }
        const { type, color, offsetX, offsetY, blur, spread } = val;
        return `${type ? `${type} ` : ''}${offsetX ?? 0} ${offsetY ?? 0} ${blur ?? 0} ${
          spread ? `${spread} ` : ''
        }${color ?? `#000000`}`;
      };

      if (Array.isArray(val)) {
        return val.map(stringifyShadow).join(', ');
      }
      return stringifyShadow(val);
    },
  },

  /**
   * Wraps the value in a CSS url() function https://developer.mozilla.org/en-US/docs/Web/CSS/url
   *
   * ```js
   * // Matches: token.type === 'asset'
   * // Returns:
   * url("https://www.example.com/style.css")
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetUrl]: {
    type: value,
    filter: isAsset,
    transform: function (token, _, options) {
      return `url("${(options.usesDtcg ? token.$value : token.value).replace(/"/g, `\\"`)}")`;
    },
  },

  /**
   * Wraps the value in a double-quoted string and prepends an '@' to make a string literal.
   *
   * ```js
   * // Matches: token.type === 'asset'
   * // Returns:
   * 'IyBlZGl0b3Jjb25maWcub3JnCnJvb3QgPSB0cnVlCgpbKl0KaW5kZW50X3N0eWxlID0gc3BhY2UKaW5kZW50X3NpemUgPSAyCmVuZF9vZl9saW5lID0gbGYKY2hhcnNldCA9IHV0Zi04CnRyaW1fdHJhaWxpbmdfd2hpdGVzcGFjZSA9IHRydWUKaW5zZXJ0X2ZpbmFsX25ld2xpbmUgPSB0cnVlCgpbKi5tZF0KdHJpbV90cmFpbGluZ193aGl0ZXNwYWNlID0gZmFsc2U='
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetBase64]: {
    type: value,
    filter: isAsset,
    transform: function (token, _, options, vol) {
      return convertToBase64(options.usesDtcg ? token.$value : token.value, vol);
    },
  },

  /**
   * Prepends the local file path
   *
   * ```js
   * // Matches: token.type === 'asset'
   * // Returns:
   * "path/to/file/asset.png"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetPath]: {
    type: value,
    filter: isAsset,
    transform: function (token, _, options) {
      return join(process?.cwd() ?? '/', options.usesDtcg ? token.$value : token.value);
    },
  },

  /**
   * Wraps the value in a double-quoted string and prepends an '@' to make a string literal.
   *
   * ```objective-c
   * // Matches: token.type === 'asset'
   * // Returns: \@"string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetObjCLiteral]: {
    type: value,
    filter: isAsset,
    transform: function (token, _, options) {
      return '@' + wrapValueWithDoubleQuote(token, options);
    },
  },

  /**
   * Wraps the value in a double-quoted string to make a string literal.
   *
   * ```swift
   * // Matches: token.type === 'asset'
   * // Returns: "string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetSwiftLiteral]: {
    type: value,
    filter: isAsset,
    transform: (token, _, options) => wrapValueWithDoubleQuote(token, options),
  },

  /**
   * Transforms the value into a Flutter Color object using 8-digit hex with the alpha chanel on start
   *  ```js
   *  // Matches: token.type === 'color'
   *  // Returns:
   *  Color(0xFF00FF5F)
   *  ```
   *  @memberof Transforms
   *
   */
  [transforms.colorHex8flutter]: {
    type: value,
    filter: isColor,
    transform: function (token, _, options) {
      const str = getColor(token, options).toHex8().toUpperCase();
      return `Color(0x${str.slice(6)}${str.slice(0, 6)})`;
    },
  },

  /**
   * Wraps the value in a double-quoted string to make a string literal.
   *
   * ```dart
   * // Matches: token.type === 'content'
   * // Returns: "string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.contentFlutterLiteral]: {
    type: value,
    filter: isContent,
    transform: (token, _, options) => wrapValueWithDoubleQuote(token, options),
  },

  /**
   * Wraps the value in a double-quoted string to make a string literal.
   *
   * ```dart
   * // Matches: token.type === 'asset'
   * // Returns: "string"
   * ```
   *
   * @memberof Transforms
   */
  [transforms.assetFlutterLiteral]: {
    type: value,
    filter: isAsset,
    transform: (token, _, options) => wrapValueWithDoubleQuote(token, options),
  },

  /**
   * Scales the number by 16 (or the value of 'basePxFontSize' on the platform in your config) to get to points for Flutter
   *
   * ```dart
   * // Matches: token.type === 'dimension'
   * // Returns: 16.00
   * ```
   *
   * @memberof Transforms
   */
  [transforms.sizeFlutterRemToDouble]: {
    type: value,
    filter: (token, options) => isDimension(token, options) || isFontSize(token, options),
    transform: function (token, config, options) {
      const baseFont = getBasePxFontSize(config);
      return (parseFloat(options.usesDtcg ? token.$value : token.value) * baseFont).toFixed(2);
    },
  },
};
