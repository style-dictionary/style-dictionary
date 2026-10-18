import Color from 'tinycolor2';
import ColorJS from 'colorjs.io';

/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/DesignToken.d.ts').DTCGColorValue} DTCGColorValue
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

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
export function dtcgToColorJS(dtcgColor) {
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
export function dtcgColorToRgb(dtcgColor) {
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
 * Get a CSS compatible color string from a token value that contains a color property
 * Used in CSS shorthand transforms for token types that can have color poperties, like border, gradient, shadow.
 * @param {unknown} tokenValue
 * @returns {string | undefined}
 */
export function getColorStringFromTokenObjectValue(tokenValue) {
  /** @type {string | undefined} */
  let hex;
  if (typeof tokenValue === 'object' && tokenValue !== null && 'color' in tokenValue) {
    if (typeof tokenValue.color === 'string') {
      return tokenValue.color;
    }
    let color = /** @type {DTCGColorValue} */ (tokenValue.color);
    let colorJS = getColorJS(color);
    hex = colorJS.toString();
  }
  return hex;
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
 * @param {DTCGColorValue | string} val
 * @returns {ColorJS}
 */
export function getColorJS(val) {
  if (isDTCGColorObject(val)) {
    return dtcgToColorJS(val);
  }

  // Parse legacy format with ColorJS
  return new ColorJS(val);
}

/**
 * Round an alpha that comes from a hex color (one of 256 steps) the way browsers serialize it:
 * two decimals if that maps back to the same 8-bit value, otherwise three.
 * https://www.w3.org/TR/css-color-4/#serializing-alpha-values
 * @param {number} alpha
 * @returns {number}
 */
export function roundHexAlpha(alpha) {
  const int = Math.round(alpha * 255);
  const twoDecimals = Math.round((int * 100) / 255);
  if (Math.round((twoDecimals * 255) / 100) === int) {
    return twoDecimals / 100;
  }
  return Math.round((int * 1000) / 255) / 1000;
}

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
