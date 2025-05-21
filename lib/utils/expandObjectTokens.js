import { resolveMap } from './resolveMap.js';
import { deepmerge } from './deepmerge.js';
import isPlainObject from 'is-plain-obj';

/**
 * @typedef {import('../../types/DesignToken.d.ts').DesignToken} DesignToken
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} TransformedToken
 * @typedef {import('../../types/DesignToken.d.ts').PreprocessedTokens} PreprocessedTokens
 * @typedef {import('../../types/Config.d.ts').Expand} Expand
 * @typedef {import('../../types/Config.d.ts').ExpandConfig} ExpandConfig
 * @typedef {import('../../types/Config.d.ts').ExpandFilter} ExpandFilter
 * @typedef {import('../../types/Config.d.ts').Config} Config
 * @typedef {import('../../types/Config.d.ts').PlatformConfig} PlatformConfig
 */

export const DTCGTypesMap = {
  // https://design-tokens.github.io/community-group/format/#border
  border: {
    style: 'strokeStyle',
    width: 'dimension',
  },
  // https://design-tokens.github.io/community-group/format/#transition
  transition: {
    delay: 'duration',
    // needs more discussion https://github.com/design-tokens/community-group/issues/103
    timingFunction: 'cubicBezier',
  },
  // https://design-tokens.github.io/community-group/format/#shadow
  shadow: {
    offsetX: 'dimension',
    offsetY: 'dimension',
    blur: 'dimension',
    spread: 'dimension',
  },
  // https://design-tokens.github.io/community-group/format/#gradient
  gradient: {
    position: 'number',
  },
  // https://design-tokens.github.io/community-group/format/#typography
  typography: {
    fontSize: 'dimension',
    letterSpacing: 'dimension',
    lineHeight: 'number',
  },
  // https://design-tokens.github.io/community-group/format/#object-value
  strokeStyle: {
    dashArray: 'dimension',
  },
};

/**
 * expandTypesMap and this function may be slightly confusing,
 * refer to the unit tests for a better explanation
 * @param {string} subtype
 * @param {string} compositionType
 * @param {Expand['typesMap']} expandTypesMap
 * @returns {string}
 */
export function getTypeFromMap(subtype, compositionType, expandTypesMap = {}) {
  const typeMap = deepmerge(DTCGTypesMap, expandTypesMap);
  // the map might exist within the compositionType
  const mapObjForComp = typeMap[compositionType];
  // or instead, it may be on the top-level, independent of the compositionType
  const mappedSubType = typeMap[subtype];
  if (typeof mapObjForComp === 'object' && mapObjForComp[subtype]) {
    return mapObjForComp[subtype];
    // the type mapping might be on the top-level, independent of the compositionType
  } else if (typeof mappedSubType === 'string') {
    return mappedSubType;
  }
  return subtype;
}

/**
 * @param {DesignToken} token
 * @param {Config} opts
 * @param {PlatformConfig} [platform]
 */
function shouldExpand(token, opts, platform) {
  const expand = platform?.expand ?? opts.expand ?? false;

  /** @type {ExpandFilter | boolean} */
  let condition = false;
  let reverse = false;

  if (typeof expand === 'function' || typeof expand === 'boolean') {
    condition = expand;
  } else {
    const type = /** @type {string} */ (opts.usesDtcg ? token.$type : token.type);
    if (expand.include === undefined && expand.exclude === undefined) {
      condition = true;
    }

    if (expand.include) {
      condition =
        typeof expand.include === 'function' ? expand.include : expand.include.includes(type);
    }

    if (/** @type {Expand} */ (expand).exclude) {
      if (expand.include) {
        throw Error(
          'expand.include should not be combined with expand.exclude, use one or the other.',
        );
      }
      condition =
        typeof expand.exclude === 'function' ? expand.exclude : expand.exclude.includes(type);
      reverse = true;
    }
  }

  let result = condition;
  if (typeof condition === 'function') {
    result = condition(token, opts, platform);
  }

  return reverse ? !result : result;
}

/**
 *
 * @param {DesignToken} token already resolved refs
 * @param {Map<string, DesignToken>} tokenMap
 * @param {Config} opts
 * @param {PlatformConfig} [platform]
 */
export function expandTokenInMap(token, tokenMap, opts, platform) {
  const uses$ = opts.usesDtcg;
  // create a copy of the token without the value/type, so that we have all the meta props
  // which have to be inherited in the expanded tokens.
  /** @type {Record<string, unknown>} */
  const copyMeta = {};
  Object.keys(token)
    // either filter $value & $type, or value and type depending on whether $ is used
    .filter(
      (key) =>
        !['$value', 'value', '$type', 'type']
          .filter((key) => (uses$ ? key.startsWith('$') : !key.startsWith('$')))
          .includes(key),
    )
    .forEach((key) => {
      copyMeta[key] = token[key];
    });

  const value = uses$ ? token.$value : token.value;
  // the $type and type may both be missing if the $type is coming from an ancestor token group,
  // however, prior to expand and preprocessors, we run a step so missing $type is added from the closest ancestor
  const compositionType = /** @type {string} */ (uses$ ? token.$type : token.type);
  /** @type {Expand['typesMap']} */
  let typesMap = {};
  const expand = platform?.expand ?? opts.expand;
  if (typeof expand === 'object') {
    typesMap = expand.typesMap ?? {};
  }

  // array of objects is also valid e.g. multi-shadow values
  // https://github.com/design-tokens/community-group/issues/100 there seems to be a consensus for this
  // so this code adds forward-compatibility with that
  const _value = Array.isArray(value) ? value : [value];

  _value.forEach((objectVal, index, arr) => {
    let key = /** @type {string} */ (token.key);
    // more than 1 means multi-value, meaning we should add nested token group
    // with index to the expanded result
    if (arr.length > 1) {
      key = key.replace('}', `.${index + 1}}`);
    }

    Object.entries(objectVal).forEach(([propKey, value]) => {
      const innerKey = key.replace('}', `.${propKey}}`);
      const expandedValue = {
        ...copyMeta,
        [`${uses$ ? '$' : ''}value`]: value,
        [`${uses$ ? '$' : ''}type`]: getTypeFromMap(propKey, compositionType, typesMap),
        key: innerKey,
      };
      // If the value is an object, we're dealing with a nested composite token and we have to recurse
      // TODO: do we need to also handle recursing array values? Items could be nested objects as well.
      // e.g. a multi-shadow inside a border as a (hypothetical, not realistic) example
      if (isPlainObject(value) /* || Array.isArray(value)*/) {
        // recurse, and make sure to pass the key so we don't lose the parent relation
        expandTokenInMap(expandedValue, tokenMap, opts, platform);
      } else {
        // if we're expanding on platform level, we already have a path property
        // we will need to adjust this by adding the new keys of the expanded tokens to the path array
        if (Array.isArray(expandedValue.path)) {
          if (arr.length > 1) {
            expandedValue.path = [...expandedValue.path, `${index + 1}`];
          }
          expandedValue.path = [...expandedValue.path, propKey];
        }
        tokenMap.set(innerKey, expandedValue);
      }
    });
  });

  // We've expanded it, now delete the original
  tokenMap.delete(/** @type {string} */ (token.key));
}

/**
 * @param {Map<string, DesignToken>} tokenMap
 * @param {Config} opts
 * @param {PlatformConfig} [platform]
 */
export function expandTokens(tokenMap, opts, platform) {
  const uses$ = opts.usesDtcg;
  // create a copy in which we will do mutations
  const copy = structuredClone(tokenMap);
  // create another copy which has resolved refs
  const copyResolved = structuredClone(tokenMap);
  try {
    // @ts-expect-error in this instance it is acceptable to pass DesignTokens before transform step
    resolveMap(copyResolved, { usesDtcg: uses$, objectsOnly: true });
  } catch (_e) {
    console.error(_e);
    // do nothing, references may be broken but now is not the time to
    // complain about it, as we're just doing this here so we can expand
    // tokens that reference object-value tokens that need to be expanded
  }

  Array.from(copyResolved).forEach(([, token]) => {
    let value = uses$ ? token.$value : token.value;
    if (
      isPlainObject(value) ||
      // support multi-value arrays where each item is an object, e.g. shadow tokens
      (Array.isArray(value) && value.every((sub) => isPlainObject(sub)))
    ) {
      if (shouldExpand(token, opts, platform)) {
        expandTokenInMap(token, copy, opts, platform);
      }
    }
  });

  return copy;
}
