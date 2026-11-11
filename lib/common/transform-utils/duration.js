import { durationUnit } from '../../enums/index.js';
import { getTokenUnitAndValue } from './value-unit.js';

/**
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDuration} TokenTypeDuration
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDurationUnit} TokenTypeDurationUnit
 *
 */

/**
 * Convert a duration value into seconds, using the minimum amount of decimals
 * that keeps the precision of the input, so a 1ms duration becomes "0.001s"
 * rather than being rounded away to "0s".
 * @param {string | number} _value
 * @param {TokenTypeDurationUnit | undefined} unit a value without a unit is milliseconds
 * @returns {string}
 */
export function durationToSeconds(_value, unit) {
  const parsed = parseFloat(`${_value}`);
  // toPrecision guards against the floating point artifacts the division introduces,
  // e.g. 1.1 / 1000 = 0.0011000000000000001. 15 significant digits is the most a 64 bit
  // float represents before those artifacts show up, see
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding
  // Number() then drops the trailing zeros, leaving the minimum needed precision.
  const seconds = Number((unit === durationUnit.s ? parsed : parsed / 1000).toPrecision(15));
  // small numbers stringify to scientific notation, e.g. 1e-7, so count the decimals
  // the notation implies and render them out in full
  const [coefficient, exponent] = `${seconds}`.split('e-');
  const decimals = (coefficient.split('.')[1] ?? '').length + Number(exponent ?? 0);
  return `${seconds.toFixed(decimals)}s`;
}

/**
 * @param {string | number | TokenTypeDuration | undefined} prop
 * @returns
 */
export function normalizeDurationProp(prop) {
  if (prop === undefined) {
    return prop;
  }
  const { value, unit } = getTokenUnitAndValue(prop);
  if (unit !== undefined) {
    return `${value}${unit}`;
  }
  // DTCG describes a duration as a length of time in milliseconds,
  // so a unitless numeric value is milliseconds
  return Number.isNaN(parseFloat(`${value}`)) ? `${value}` : `${value}${durationUnit.ms}`;
}
