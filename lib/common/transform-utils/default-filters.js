import Color from 'tinycolor2';
import { isDTCGColorObject } from './colors.js';
/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
export function isDimension(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'dimension';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
export function isFontSize(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'fontSize';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
export function isAsset(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'asset';
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {boolean}
 */
export function isContent(token, options) {
  return (options.usesDtcg ? token.$type : token.type) === 'content';
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
