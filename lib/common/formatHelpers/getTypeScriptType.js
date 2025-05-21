/**
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} Options
 * @typedef {import('../../../types/Config.d.ts').Config} Config
 */

/**
 * Given some value, returns a basic valid TypeScript type for that value.
 * Supports numbers, strings, booleans, arrays and objects of any of those types.
 *
 * @memberof module:formatHelpers
 * @name getTypeScriptType
 * @example
 * ```javascript
 * StyleDictionary.registerFormat({
 *   name: 'myCustomFormat',
 *   format: function({ dictionary, options }) {
 *    return dictionary.allTokens.map(function(prop) {
 *      var to_ret_prop = 'export const ' + prop.name + ' : ' + getTypeScriptType(prop.value) + ';';
 *      if (prop.comment)
 *        to_ret_prop = to_ret_prop.concat(' // ' + prop.comment);
 *      return to_ret_prop;
 *    }).join('\n');
 *   }
 * });
 *```
 * @param {any} value A value to check the type of.
 * @param {Config & {outputStringLiterals?: boolean}} [options]
 * @return {String} A valid name for a TypeScript type.
 *
 */
export default function getTypeScriptType(value, options) {
  const { outputStringLiterals = false } = options ?? {};

  if (Array.isArray(value)) return getArrayType(value);
  if (typeof value === 'object') return getObjectType(value);
  if (outputStringLiterals && typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  if (['string', 'number', 'boolean'].includes(typeof value)) return typeof value;

  return 'any';
}

/**
 * @param {Object} value An object with uknown type properties
 * @returns {String} A representation of the type model for the passed object
 */
function getObjectType(value) {
  const entries = Object.entries(value);
  return `{ ${entries
    .map(([key, property], index) => {
      const isLast = entries.length === index + 1;
      return `${key}: ${getTypeScriptType(property)}${!isLast ? ', ' : ''}`;
    })
    .join('')} }`;
}

/**
 * @param {any[]} arr An array to check each property of
 * @returns {String} A valid type for the passed array and it's items
 */
function getArrayType(arr) {
  if (arr.length > 0) {
    const firstValueType = getTypeScriptType(arr[0]);
    if (arr.every((v) => getTypeScriptType(v) === firstValueType)) {
      return firstValueType + '[]';
    } else {
      return `(${Array.from(
        new Set(
          arr.map((item, index) => {
            const isLast = arr.length === index + 1;
            return `${getTypeScriptType(item)}${!isLast ? ' | ' : ''}`;
          }),
        ),
      ).join('')})[]`;
    }
  }
  return 'any[]';
}
