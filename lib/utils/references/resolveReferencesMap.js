import GroupMessages from '../groupMessages.js';
import getName from './getName.js';
import usesReferences from './usesReferences.js';
import { regexCaptureGroups } from './createReferenceRegex.js';

const PROPERTY_REFERENCE_WARNINGS = GroupMessages.GROUP.PropertyReferenceWarnings;

/**
 * @typedef {import('../../../types/Config.d.ts').ResolveReferencesOptions} RefOpts
 * @typedef {import('../../../types/Config.d.ts').ResolveReferencesOptionsInternal} RefOptsInternal
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} Token
 */

/**
 * Public API wrapper around the functon below this one
 * @param {string} value
 * @param {Map<string, Token>} tokenMap
 * @param {RefOpts} [opts]
 * @returns {unknown}
 */
export function resolveReferences(value, tokenMap, opts) {
  // when using this public API / util, we always throw warnings immediately rather than
  // putting them in the GroupMessages PROPERTY_REFERENCE_WARNINGS to collect and throw later on.
  return _resolveReferences(value, tokenMap, opts);
}

/**
 * Utility to resolve references inside a string value
 * @param {string} value
 * @param {Map<string, Token>} tokenMap
 * @param {RefOptsInternal} [opts]
 * @returns {unknown}
 */
export function _resolveReferences(
  value,
  tokenMap,
  {
    usesDtcg = false,
    warnImmediately = true,
    // for internal usage
    ignorePaths = new Set(),
    current_context = '',
    stack = [],
    foundCirc = {},
    firstIteration = true,
    objectsOnly = false,
  } = {},
) {
  /** @type {unknown} */
  let to_ret = value;
  const valProp = usesDtcg ? '$value' : 'value';
  const reg = regexCaptureGroups;

  // When we know the current context:
  // the key associated with the value that we are resolving the reference for
  // Then we can push this to the stack to improve our circular reference warnings
  // by starting them with the key
  if (firstIteration && current_context) {
    stack.push(getName([current_context]));
  }

  // this replace may be confusing, since we don't do anything with the return value
  // we just use this as a regex match iterator, so read it like a "for each match"
  value.replace(reg, (match) => {
    // trim spaces between right after { or before } e.g. '{ foo.bar }' => '{foo.bar}'
    let trimmedMatch = `{${match.slice(1, match.length - 1).trim()}}`;
    if (ignorePaths.has(match)) {
      return '';
    }

    stack.push(match);
    const ref = tokenMap.get(trimmedMatch)?.[valProp];
    /**
     * @param {unknown} ref
     */
    const replaceMatchWithRef = (ref) => {
      if (objectsOnly && typeof ref !== 'object') {
        return to_ret;
      }
      // If the token value is exclusively the ref
      // we can put the ref in "as is", rather than stringifying.
      // this way, if the reference is a primitive type like boolean, array, object, number,
      // it wil remain that type.
      if (match === to_ret) {
        return ref;
      }
      // otherwise, stringify the ref (e.g. when it's a number ref inside a bigger string)
      return `${to_ret}`.replace(match, `${ref}`);
    };

    if (typeof ref !== 'undefined') {
      if (typeof ref === 'string' && usesReferences(ref)) {
        // Recursive, therefore we can compute multi-layer variables like a = b, b = c, eventually a = c
        // Compare to found circular references
        if (Object.hasOwn(foundCirc, ref)) {
          // If the current reference is a member of a circular reference, do nothing
        } else if (stack.indexOf(ref) !== -1) {
          // If the current stack already contains the current reference, we found a new circular reference
          // chop down only the circular part, save it to our circular reference info, and spit out an error

          // Get the position of the existing reference in the stack
          const stackIndexReference = stack.indexOf(ref);

          // Get the portion of the stack that starts at the circular reference and brings you through until the end
          const circStack = stack.slice(stackIndexReference);

          // For all the references in this list, add them to the list of references that end up in a circular reference
          circStack.forEach(function (key) {
            foundCirc[key] = true;
          });

          // Add our found circular reference to the end of the cycle
          circStack.push(ref);

          // Add circ reference info to our list of warning messages
          const warning = `Circular definition cycle for ${
            current_context ?? ''
          } => ${circStack.join(', ')}`;
          if (warnImmediately) {
            throw new Error(warning);
          } else {
            GroupMessages.add(PROPERTY_REFERENCE_WARNINGS, warning);
          }
        } else {
          const nestedRef = _resolveReferences(ref, tokenMap, {
            ignorePaths,
            usesDtcg,
            warnImmediately,
            current_context,
            stack,
            foundCirc,
            firstIteration: false,
          });
          to_ret = replaceMatchWithRef(nestedRef);
        }
      } else {
        to_ret = replaceMatchWithRef(ref);
      }
    } else {
      // User might have passed current_context option which is path (arr) pointing to key
      // that this value is associated with, helpful for debugging
      const warning = `${
        current_context ? `${current_context} ` : ''
      }tries to reference ${value}, which is not defined.`;
      if (warnImmediately) {
        throw new Error(warning);
      } else {
        GroupMessages.add(PROPERTY_REFERENCE_WARNINGS, warning);
      }
    }
    stack.pop();
    return match;
  });

  return to_ret;
}
