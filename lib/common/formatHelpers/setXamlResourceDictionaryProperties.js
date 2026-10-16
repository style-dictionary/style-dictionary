/**
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} Options
 * @typedef {'maui' | 'wpf'} XamlPresetName
 * @typedef {{
 *   namespaces: Record<string, string>;
 *   referenceKeyAttribute: string;
 * }} XamlPreset
 */

/**
 * @type {Readonly<Record<string, string>>}
 */
const defaultResourceTypeMap = Object.freeze({
  color: 'Color',
  dimension: 'x:Double',
  fontSize: 'x:Double',
  number: 'x:Double',
  string: 'x:String',
  content: 'x:String',
  boolean: 'x:Boolean',
});

/**
 * @type {Readonly<Record<XamlPresetName, Readonly<XamlPreset>>>}
 */
const xamlPresets = Object.freeze({
  maui: Object.freeze({
    namespaces: Object.freeze({
      default: 'http://schemas.microsoft.com/dotnet/2021/maui',
      x: 'http://schemas.microsoft.com/winfx/2009/xaml',
    }),
    referenceKeyAttribute: 'Key',
  }),
  wpf: Object.freeze({
    namespaces: Object.freeze({
      default: 'http://schemas.microsoft.com/winfx/2006/xaml/presentation',
      x: 'http://schemas.microsoft.com/winfx/2006/xaml',
    }),
    referenceKeyAttribute: 'ResourceKey',
  }),
});

const reservedNamespacePrefixes = new Set(['xml', 'xmlns']);

/**
 * Outputs an object for XAML ResourceDictionary format configurations.
 * Sets resource type defaults, reference style and brush options.
 * @memberof module:formatHelpers
 * @name setXamlResourceDictionaryProperties
 * @param {{
 *   preset?: XamlPresetName;
 *   resourceType?: string;
 *   resourceTypeMap?: Record<string, string>;
 *   className?: string;
 *   brushSuffix?: string;
 *   outputColorBrushes?: boolean;
 *   resourceReferenceType?: string;
 *   namespaces?: Record<string, string>;
 *   rootAttributes?: Record<string, string>;
 *   referenceKeyAttribute?: string;
 *   tokenValueSerializer?: Function;
 *   resourceFactory?: Function;
 * }} [options] - The options object declared at configuration
 * @returns {Options & {
 *   preset: 'maui' | 'wpf';
 *   resourceTypeMap: Record<string, string>;
 *   brushSuffix: string;
 *   outputColorBrushes: boolean;
 *   resourceReferenceType: 'StaticResource' | 'DynamicResource';
 *   namespaces: Record<string, string>;
 *   rootAttributes: Record<string, string>;
 *   referenceKeyAttribute: string;
 * }}
 */
export default function setXamlResourceDictionaryProperties(options = {}) {
  const preset = options.preset ?? 'maui';

  if (!Object.hasOwn(xamlPresets, preset)) {
    throw new Error(`xaml/resourceDictionary preset must be either "maui" or "wpf"`);
  }
  options.preset = preset;

  const presetDefaults = xamlPresets[preset];

  if (typeof options.resourceType !== 'undefined' && typeof options.resourceType !== 'string') {
    throw new Error(`xaml/resourceDictionary resourceType must be a string`);
  }

  if (typeof options.className !== 'undefined' && typeof options.className !== 'string') {
    throw new Error(`xaml/resourceDictionary className must be a string`);
  }

  if (typeof options.outputColorBrushes === 'undefined') {
    options.outputColorBrushes = false;
  } else if (typeof options.outputColorBrushes !== 'boolean') {
    throw new Error(`xaml/resourceDictionary outputColorBrushes must be a boolean`);
  }

  if (typeof options.brushSuffix === 'undefined') {
    options.brushSuffix = 'Brush';
  } else if (typeof options.brushSuffix !== 'string') {
    throw new Error(`xaml/resourceDictionary brushSuffix must be a string`);
  }

  if (typeof options.resourceReferenceType === 'undefined') {
    options.resourceReferenceType = 'StaticResource';
  } else if (
    options.resourceReferenceType !== 'StaticResource' &&
    options.resourceReferenceType !== 'DynamicResource'
  ) {
    throw new Error(
      `xaml/resourceDictionary resourceReferenceType must be either "StaticResource" or "DynamicResource"`,
    );
  }

  if (
    typeof options.tokenValueSerializer !== 'undefined' &&
    typeof options.tokenValueSerializer !== 'function'
  ) {
    throw new Error(`xaml/resourceDictionary tokenValueSerializer must be a function`);
  }

  if (
    typeof options.resourceFactory !== 'undefined' &&
    typeof options.resourceFactory !== 'function'
  ) {
    throw new Error(`xaml/resourceDictionary resourceFactory must be a function`);
  }

  if (typeof options.referenceKeyAttribute === 'undefined') {
    options.referenceKeyAttribute = presetDefaults.referenceKeyAttribute;
  } else if (typeof options.referenceKeyAttribute !== 'string') {
    throw new Error(`xaml/resourceDictionary referenceKeyAttribute must be a string`);
  }

  /** @type {Record<string, string>} */
  let namespaces;
  if (typeof options.namespaces === 'undefined') {
    namespaces = { ...presetDefaults.namespaces };
  } else if (
    typeof options.namespaces !== 'object' ||
    options.namespaces === null ||
    Array.isArray(options.namespaces)
  ) {
    throw new Error(`xaml/resourceDictionary namespaces must be an object`);
  } else {
    for (const [prefix, namespace] of Object.entries(options.namespaces)) {
      if (typeof namespace !== 'string') {
        throw new Error(`xaml/resourceDictionary namespaces["${prefix}"] must be a string`);
      }
    }
    namespaces = {
      ...presetDefaults.namespaces,
      ...options.namespaces,
    };
  }
  options.namespaces = namespaces;

  if (typeof namespaces.default !== 'string' || typeof namespaces.x !== 'string') {
    throw new Error(
      `xaml/resourceDictionary namespaces must include string "default" and "x" entries`,
    );
  }

  /** @type {Record<string, string>} */
  let rootAttributes;
  if (typeof options.rootAttributes === 'undefined') {
    rootAttributes = {};
  } else if (
    typeof options.rootAttributes !== 'object' ||
    options.rootAttributes === null ||
    Array.isArray(options.rootAttributes)
  ) {
    throw new Error(`xaml/resourceDictionary rootAttributes must be an object`);
  } else {
    for (const [attribute, value] of Object.entries(options.rootAttributes)) {
      if (typeof value !== 'string') {
        throw new Error(`xaml/resourceDictionary rootAttributes["${attribute}"] must be a string`);
      }
    }
    rootAttributes = { ...options.rootAttributes };
  }
  options.rootAttributes = rootAttributes;

  for (const attribute of Object.keys(rootAttributes)) {
    const prefix = attribute.split(':', 1)[0];
    if (
      attribute.includes(':') &&
      !reservedNamespacePrefixes.has(prefix) &&
      !Object.hasOwn(namespaces, prefix)
    ) {
      throw new Error(
        `xaml/resourceDictionary rootAttributes["${attribute}"] uses namespace prefix "${prefix}" but options.namespaces does not declare it`,
      );
    }
  }

  if (typeof options.resourceTypeMap === 'undefined') {
    options.resourceTypeMap = { ...defaultResourceTypeMap };
  } else if (
    typeof options.resourceTypeMap !== 'object' ||
    options.resourceTypeMap === null ||
    Array.isArray(options.resourceTypeMap)
  ) {
    throw new Error(`xaml/resourceDictionary resourceTypeMap must be an object`);
  } else {
    for (const [tokenType, resourceType] of Object.entries(options.resourceTypeMap)) {
      if (typeof resourceType !== 'string') {
        throw new Error(`xaml/resourceDictionary resourceTypeMap["${tokenType}"] must be a string`);
      }
    }
    options.resourceTypeMap = {
      ...defaultResourceTypeMap,
      ...options.resourceTypeMap,
    };
  }

  return /** @type {ReturnType<typeof setXamlResourceDictionaryProperties>} */ (options);
}
