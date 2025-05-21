import GroupMessages from '../groupMessages.js';
import getPathFromName from './getPathFromName.js';
import getName from './getName.js';
import getValueByPath from './getValueByPath.js';
import usesReferences from './usesReferences.js';
import { regexDefault } from './createReferenceRegex.js';
import { resolveReferences as resolveReferencesMap } from './resolveReferencesMap.js';

const PROPERTY_REFERENCE_WARNINGS = GroupMessages.GROUP.PropertyReferenceWarnings;

/**
 * @typedef {import('../../../types/Config.d.ts').ResolveReferencesOptions} RefOpts
 * @typedef {import('../../../types/Config.d.ts').ResolveReferencesOptionsInternalOld} RefOptsInternal
 * @typedef {import('../../../types/DesignToken.d.ts').PreprocessedTokens} Tokens
 * @typedef {import('../../../types/DesignToken.d.ts').DesignToken} Token
 *  @typedef {import('../../../types/DesignToken.d.ts').TransformedToken} TransformedToken
 */

/**
 * Public API wrapper around the functon below this one
 * @param {string} value
 * @param {Tokens|Map<string, TransformedToken>} tokens
 * @param {RefOpts} [opts]
 * @returns {unknown}
 */
export function resolveReferences(value, tokens, opts) {
  if (tokens instanceof Map) {
    return resolveReferencesMap(value, tokens, opts);
  }
  // when using this public API / util, we always throw warnings immediately rather than
  // putting them in the GroupMessages PROPERTY_REFERENCE_WARNINGS to collect and throw later on.
  return _resolveReferences(value, tokens, opts);
}

/**
 * Utility to resolve references inside a string value
 * @param {string} value
 * @param {Tokens} tokens
 * @param {RefOptsInternal} [opts]
 * @returns {unknown}
 */
export function _resolveReferences(
  value,
  tokens,
  {
    usesDtcg = false,
    warnImmediately = true,
    // for internal usage
    ignorePaths = [],
    current_context = [],
    stack = [],
    foundCirc = {},
    firstIteration = true,
  } = {},
) {
  const reg = regexDefault;
  /** @type {unknown} */
  let to_ret = value;
  /** @type {Token|string|number|undefined} */
  let ref;
  const valProp = usesDtcg ? '$value' : 'value';

  // When we know the current context:
  // the key associated with the value that we are resolving the reference for
  // Then we can push this to the stack to improve our circular reference warnings
  // by starting them with the key
  if (firstIteration && current_context.length > 0) {
    stack.push(getName(current_context));
  }

  /**
   * Replace the reference inline, but don't replace the whole string because
   * references can be part of the value such as "1px solid {color.border.light}"
   */
  value.replace(reg, (match, /** @type {string} */ variable) => {
    variable = variable.trim();

    // Find what the value is referencing
    const pathName = getPathFromName(variable);

    const refHasValue = valProp === pathName[pathName.length - 1];
    if (refHasValue && ignorePaths.indexOf(variable) !== -1) {
      return '';
    } else if (!refHasValue && ignorePaths.indexOf(`${variable}.${valProp}`) !== -1) {
      return '';
    }

    stack.push(variable);
    ref = getValueByPath(pathName, tokens);

    // If the reference doesn't end in 'value'
    // and
    // the reference points to someplace that has a `value` attribute
    // we should take the '.value' of the reference
    // per the DTCG draft spec where references do not have .value
    // https://design-tokens.github.io/community-group/format/#aliases-references
    if (!refHasValue && ref && Object.hasOwn(ref, valProp)) {
      ref = ref[valProp];
    }

    if (typeof ref !== 'undefined') {
      if (typeof ref === 'string' || typeof ref === 'number') {
        to_ret = value.replace(match, `${ref}`);

        // Recursive, therefore we can compute multi-layer variables like a = b, b = c, eventually a = c
        if (usesReferences(to_ret)) {
          const reference = /** @type {string} */ (to_ret).slice(1, -1);
          // Compare to found circular references
          if (Object.hasOwn(foundCirc, reference)) {
            // If the current reference is a member of a circular reference, do nothing
          } else if (stack.indexOf(reference) !== -1) {
            // If the current stack already contains the current reference, we found a new circular reference
            // chop down only the circular part, save it to our circular reference info, and spit out an error

            // Get the position of the existing reference in the stack
            const stackIndexReference = stack.indexOf(reference);

            // Get the portion of the stack that starts at the circular reference and brings you through until the end
            const circStack = stack.slice(stackIndexReference);

            // For all the references in this list, add them to the list of references that end up in a circular reference
            circStack.forEach(function (key) {
              foundCirc[key] = true;
            });

            // Add our found circular reference to the end of the cycle
            circStack.push(reference);

            // Add circ reference info to our list of warning messages
            const warning = `Circular definition cycle: ${circStack.join(', ')}`;
            if (warnImmediately) {
              throw new Error(warning);
            } else {
              GroupMessages.add(
                PROPERTY_REFERENCE_WARNINGS,
                'Circular definition cycle:  ' + circStack.join(', '),
              );
            }
          } else {
            to_ret = _resolveReferences(/** @type {string} */ (to_ret), tokens, {
              ignorePaths,
              usesDtcg,
              warnImmediately,
              current_context,
              stack,
              foundCirc,
              firstIteration: false,
            });
          }
        }
        // if evaluated value is a number and equal to the reference, we want to keep the type
        if (typeof ref === 'number' && ref.toString() === to_ret) {
          to_ret = ref;
        }
      } else {
        // if evaluated value is not a string or number, we want to keep the type
        to_ret = ref;
      }
    } else {
      // User might have passed current_context option which is path (arr) pointing to key
      // that this value is associated with, helpful for debugging
      const context = getName(current_context);
      const warning = `${
        context ? `${context} ` : ''
      }tries to reference ${variable}, which is not defined.`;
      if (warnImmediately) {
        throw new Error(warning);
      } else {
        GroupMessages.add(PROPERTY_REFERENCE_WARNINGS, warning);
      }
      to_ret = ref;
    }
    stack.pop();

    return '';
  });

  return to_ret;
}
