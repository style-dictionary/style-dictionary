import { regexDefault } from './createReferenceRegex.js';

/**
 * Checks if the value uses a value reference.
 * @memberof Dictionary
 * @param {string|any} value
 * @returns {boolean} - True, if the value uses a value reference
 */
export default function usesReferences(value) {
  const regex = regexDefault;

  if (typeof value === 'string') {
    return !!value.match(regex);
  }

  if (typeof value === 'object') {
    let hasReference = false;
    // iterate over each property in the object,
    // if any element passes the regex test,
    // the whole thing should be true
    for (const key in value) {
      if (Object.hasOwn(value, key)) {
        const element = value[key];
        let reference = usesReferences(element);
        if (reference) {
          hasReference = true;
          break;
        }
      }
    }
    return hasReference;
  }

  return false;
}
