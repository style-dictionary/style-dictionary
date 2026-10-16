import Color from 'tinycolor2';
import usesReferences from '../../../utils/references/usesReferences.js';
import { getReferences } from '../../../utils/references/getReferences.js';
import { regexDefault } from '../../../utils/references/createReferenceRegex.js';

/**
 * @typedef {import('../../../../types/DesignToken.d.ts').Dictionary} Dictionary
 * @typedef {import('../../../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../../../types/Config.d.ts').Config} Config
 * @typedef {import('../../../../types/Config.d.ts').LocalOptions} LocalOptions
 */

const numericResourceTypes = new Set([
  'x:Byte',
  'x:Decimal',
  'x:Double',
  'x:Int16',
  'x:Int32',
  'x:Int64',
  'x:Single',
]);

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {string | boolean | number | object}
 */
function getTokenValue(token, options) {
  return options.usesDtcg ? token.$value : token.value;
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {string | boolean | number | object}
 */
function getOriginalTokenValue(token, options) {
  return options.usesDtcg ? token.original.$value : token.original.value;
}

/**
 * @param {Token} token
 * @param {Config & LocalOptions & { resourceTypeMap: Record<string, string>; resourceType?: string }} options
 * @returns {string}
 */
function getResourceType(token, options) {
  if (options.resourceType) {
    return options.resourceType;
  }

  const tokenType = options.usesDtcg ? token.$type : token.type;
  if (tokenType && options.resourceTypeMap[tokenType]) {
    return options.resourceTypeMap[tokenType];
  }

  const value = getTokenValue(token, options);
  if (typeof value === 'boolean') return 'x:Boolean';
  if (typeof value === 'number') return Number.isInteger(value) ? 'x:Int32' : 'x:Double';
  return 'x:String';
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * @param {string} value
 * @returns {string}
 */
function sanitizeComment(value) {
  return value.replaceAll('--', '- -').replace(/-$/g, '- ');
}

/**
 * @param {string | number | boolean | object} value
 * @param {string} tokenName
 * @returns {string}
 */
function getColorInput(value, tokenName) {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'hex' in value &&
    typeof value.hex === 'string'
  ) {
    return value.hex;
  }

  throw new Error(
    `xaml/resourceDictionary expected token "${tokenName}" to resolve to a string color value, received ${JSON.stringify(value)}`,
  );
}

/**
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
function serializeColor(token, options) {
  const value = getTokenValue(token, options);
  const colorValue = getColorInput(value, token.name);

  const trimmedValue = colorValue.trim();
  if (/^#[0-9a-f]{8}$/i.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
    return `#FF${trimmedValue.slice(1).toUpperCase()}`;
  }

  const color = Color(colorValue);
  if (!color.isValid()) {
    throw new Error(
      `xaml/resourceDictionary expected token "${token.name}" to resolve to a valid color value, received ${JSON.stringify(value)}`,
    );
  }

  const rgb = color.toRgb();
  /** @param {number} value */
  const toHex = (value) => Math.round(value).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(rgb.a * 255)}${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * @param {string | number | boolean | object} value
 * @param {string} tokenName
 * @returns {string}
 */
function serializeNumeric(value, tokenName) {
  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string' && /^-?(?:\d+|\d*\.\d+)(?:f)?$/i.test(value.trim())) {
    return value.trim().replace(/f$/i, '');
  }

  throw new Error(
    `xaml/resourceDictionary expected token "${tokenName}" to resolve to a numeric value, received ${JSON.stringify(value)}`,
  );
}

/**
 * @param {string | number | boolean | object} value
 * @param {string} resourceType
 * @param {Token} token
 * @param {Config} options
 * @returns {string}
 */
function serializeTokenValue(value, resourceType, token, options) {
  if (resourceType === 'Color') {
    return serializeColor(token, options);
  }

  if (resourceType === 'x:Boolean') {
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    if (value === 'true' || value === 'True') return 'True';
    if (value === 'false' || value === 'False') return 'False';
    throw new Error(
      `xaml/resourceDictionary expected token "${token.name}" to resolve to a boolean value, received ${JSON.stringify(value)}`,
    );
  }

  if (numericResourceTypes.has(resourceType)) {
    return serializeNumeric(value, token.name);
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return escapeXml(String(value));
  }

  throw new Error(
    `xaml/resourceDictionary does not support object values for token "${token.name}" with resource type "${resourceType}"`,
  );
}

/**
 * @param {string | number | boolean | object} value
 * @returns {boolean}
 */
function isSingleReferenceValue(value) {
  if (typeof value !== 'string') return false;
  const trimmedValue = value.trim();
  const matches = [...trimmedValue.matchAll(regexDefault)];
  return matches.length === 1 && matches[0][0] === trimmedValue;
}

/**
 * @param {Token} token
 * @param {Dictionary} dictionary
 * @param {Config & LocalOptions & { resourceReferenceType: 'StaticResource' | 'DynamicResource' }} options
 * @returns {Token | undefined}
 */
function getReferencedToken(token, dictionary, options) {
  const originalValue = getOriginalTokenValue(token, options);
  const referenceValue =
    typeof originalValue === 'string' ||
    (typeof originalValue === 'object' && originalValue !== null)
      ? originalValue
      : undefined;
  const shouldOutputReference =
    referenceValue != null &&
    usesReferences(referenceValue) &&
    isSingleReferenceValue(referenceValue) &&
    (typeof options.outputReferences === 'function'
      ? options.outputReferences(token, { dictionary, usesDtcg: options.usesDtcg })
      : options.outputReferences);

  if (!shouldOutputReference) {
    return undefined;
  }

  return getReferences(referenceValue, dictionary.tokens, {
    unfilteredTokens: dictionary.unfilteredTokens,
    usesDtcg: options.usesDtcg,
    warnImmediately: false,
  })[0];
}

/**
 * @param {Token} token
 * @param {string} resourceType
 * @param {string} body
 * @returns {string}
 */
function createResourceLine(token, resourceType, body) {
  return `  <${resourceType} x:Key="${escapeXml(token.name)}">${body}</${resourceType}>`;
}

/**
 * @param {Token} token
 * @param {Token} referencedToken
 * @param {string} resourceReferenceType
 * @param {string} referenceKeyAttribute
 * @returns {string}
 */
function createAliasResourceLine(
  token,
  referencedToken,
  resourceReferenceType,
  referenceKeyAttribute,
) {
  return `  <${resourceReferenceType} x:Key="${escapeXml(token.name)}" ${referenceKeyAttribute}="${escapeXml(
    referencedToken.name,
  )}" />`;
}

/**
 * @param {Token} token
 * @param {string} brushSuffix
 * @param {'StaticResource' | 'DynamicResource'} resourceReferenceType
 * @returns {string}
 */
function createColorBrushLine(token, brushSuffix, resourceReferenceType) {
  return `  <SolidColorBrush x:Key="${escapeXml(token.name + brushSuffix)}" Color="{${resourceReferenceType} ${escapeXml(
    token.name,
  )}}" />`;
}

/**
 * @param {Record<string, string>} namespaces
 * @returns {string}
 */
function renderNamespaces(namespaces) {
  const namespaceEntries = [
    ['default', namespaces.default],
    ...Object.entries(namespaces).filter(([prefix]) => prefix !== 'default'),
  ];

  return namespaceEntries
    .map(([prefix, namespace]) =>
      prefix === 'default'
        ? `  xmlns="${escapeXml(namespace)}"`
        : `  xmlns:${prefix}="${escapeXml(namespace)}"`,
    )
    .join('\n');
}

/**
 * @param {Record<string, string>} rootAttributes
 * @returns {string}
 */
function renderRootAttributes(rootAttributes) {
  const entries = Object.entries(rootAttributes);
  if (entries.length === 0) return '';

  return entries.map(([attribute, value]) => `\n  ${attribute}="${escapeXml(value)}"`).join('');
}

/**
 * @param {{
 *   dictionary: Dictionary;
 *   allTokens: Token[];
 *   options: Config & LocalOptions & {
 *     className?: string;
 *     outputColorBrushes: boolean;
 *     brushSuffix: string;
 *     resourceType?: string;
 *     resourceTypeMap: Record<string, string>;
 *     resourceReferenceType: 'StaticResource' | 'DynamicResource';
 *     namespaces: Record<string, string>;
 *     rootAttributes: Record<string, string>;
 *     referenceKeyAttribute: string;
 *     tokenValueSerializer?: (args: {
 *       dictionary: Dictionary;
 *       token: Token;
 *       value: string | number | boolean | object;
 *       resourceType: string;
 *       options: Config & LocalOptions;
 *       serializeValue: typeof serializeTokenValue;
 *     }) => string | { value: string; resourceType?: string };
 *     resourceFactory?: (args: {
 *       dictionary: Dictionary;
 *       token: Token;
 *       value: string | number | boolean | object;
 *       resourceType: string;
 *       referencedToken?: Token;
 *       options: Config & LocalOptions;
 *       serializedValue?: string;
 *       createResource: typeof createResourceLine;
 *       createAliasResource: typeof createAliasResourceLine;
 *       createColorBrushResource: typeof createColorBrushLine;
 *       escapeXml: typeof escapeXml;
 *     }) => string | string[] | undefined;
 *   };
 *   header: string;
 * }} opts
 */
export default ({ dictionary, allTokens, options, header }) => {
  /** @type {string[]} */
  const resourceLines = [];
  /** @type {string[]} */
  const brushLines = [];

  for (const token of allTokens) {
    let resourceType = getResourceType(token, options);
    const referencedToken = getReferencedToken(token, dictionary, options);
    const value = getTokenValue(token, options);
    const comment = token.$description ?? token.comment;
    /** @type {string | undefined} */
    let serializedValue;

    if (comment) {
      resourceLines.push(
        ...comment.split('\n').map((line) => `  <!-- ${sanitizeComment(line)} -->`),
      );
    }

    if (!referencedToken && typeof options.tokenValueSerializer === 'function') {
      const formattedValue = options.tokenValueSerializer({
        dictionary,
        token,
        value,
        resourceType,
        options,
        serializeValue: serializeTokenValue,
      });

      if (typeof formattedValue === 'string') {
        serializedValue = formattedValue;
      } else {
        if (typeof formattedValue.resourceType === 'string') {
          resourceType = formattedValue.resourceType;
        }
        serializedValue = formattedValue.value;
      }
    }

    let factoryOutput;
    if (typeof options.resourceFactory === 'function') {
      factoryOutput = options.resourceFactory({
        dictionary,
        token,
        value,
        resourceType,
        referencedToken,
        options,
        serializedValue,
        createResource: createResourceLine,
        createAliasResource: createAliasResourceLine,
        createColorBrushResource: createColorBrushLine,
        escapeXml,
      });
    }

    if (typeof factoryOutput === 'string') {
      resourceLines.push(factoryOutput);
    } else if (Array.isArray(factoryOutput)) {
      resourceLines.push(...factoryOutput);
    } else if (referencedToken) {
      resourceLines.push(
        createAliasResourceLine(
          token,
          referencedToken,
          options.resourceReferenceType,
          options.referenceKeyAttribute,
        ),
      );
    } else {
      if (serializedValue == null) {
        serializedValue = serializeTokenValue(value, resourceType, token, options);
      }

      resourceLines.push(createResourceLine(token, resourceType, serializedValue));
    }

    if (options.outputColorBrushes && resourceType === 'Color') {
      brushLines.push(
        createColorBrushLine(token, options.brushSuffix, options.resourceReferenceType),
      );
    }
  }

  const classNameAttribute = options.className
    ? `\n  x:Class="${escapeXml(options.className)}"`
    : '';
  const rootAttributes = renderRootAttributes(options.rootAttributes);
  const resourceSection = [...resourceLines, ...brushLines].join('\n');
  const body = resourceSection ? `\n${resourceSection}\n` : '\n';

  return `<?xml version="1.0" encoding="UTF-8"?>\n${header}\n<ResourceDictionary\n${renderNamespaces(
    options.namespaces,
  )}${classNameAttribute}${rootAttributes}>${body}</ResourceDictionary>\n`;
};
