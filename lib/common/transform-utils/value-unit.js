/**
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDimension} TokenTypeDimension
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDimensionUnit} TokenTypeDimensionUnit
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDuration} TokenTypeDuration
 * @typedef {import('../../../types/TokenTypes.d.ts').TokenTypeDurationUnit} TokenTypeDurationUnit
 */
/**
 * Parse and normalize the value of a Token that has a number value and string unit prop
 * as DTCG dimension value -> { value: 15, unit: 'em' }
 *                         -> { value: 15, unit: 'ms' }
 * Note: the result could contain a unitless
 * Historically in Style Dictionary, number tokens were defined as unitless tokens
 * We can `deprecated` this and remove that in a breaking change, forcing users to change them to number tokens
 * @param {Token['value']} _val
 *
 * unit can be undefined for this utility method as well to support old token values
 * which can be defined as unitless tokens or numbers
 * @returns {{ value: string | number; unit: TokenTypeDimensionUnit | TokenTypeDurationUnit | undefined }}
 */
export function getTokenUnitAndValue(_val) {
  let val = _val;
  /** @type {TokenTypeDimensionUnit | TokenTypeDurationUnit | undefined} */
  let unit;
  const valueObj = typeof val === 'object' && !Array.isArray(val) && val !== null;

  // old string dimension value
  if (!valueObj) {
    // if it contains a unit -> split it into unit and val
    const unitMatch = `${val}`.match(/[^0-9.-]+$/);

    // try to get the value already without unit
    const valWithoutUnit = `${val}`.replace(unitMatch?.[0] ?? '', '');

    // guard that we can actually parse the value as a number
    if (unitMatch && !Number.isNaN(parseFloat(valWithoutUnit))) {
      unit = /** @type {TokenTypeDimensionUnit | TokenTypeDurationUnit} */ (unitMatch[0]);
      val = valWithoutUnit;
    }
  }

  return valueObj
    ? { value: val.value, unit: val.unit }
    : { value: val, unit: unit ? unit : undefined };
}

/**
 * @param {string | number | TokenTypeDimension | TokenTypeDuration | undefined} prop
 * @returns
 */
export function stringifyUnitAndValueProp(prop) {
  if (prop !== undefined) {
    const { value, unit } = getTokenUnitAndValue(prop);
    return `${value}${unit ?? ''}`;
  }
  return prop;
}
