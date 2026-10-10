/**
 * @param {string} hex - `#rgb` or `#rrggbb`
 * @returns {number[]} red, green and blue channels from 0 to 255
 */
function hexToRgb(hex) {
  let digits = hex.replace('#', '');
  if (digits.length === 3) {
    digits = [...digits].map((digit) => digit + digit).join('');
  }
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
}

/**
 * @see https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * @param {string} hex
 */
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 * @param {string} foreground
 * @param {string} background
 */
export function contrastRatio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG level reached by a contrast ratio for normal text, or for large text only.
 * @param {number} ratio
 */
export function contrastLevel(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large text';
  return 'Fail';
}

/**
 * Rounds down, so a ratio never displays as passing a threshold it misses.
 * @param {number} ratio
 */
export function formatRatio(ratio) {
  return `${(Math.floor(ratio * 100) / 100).toFixed(2)}:1`;
}
