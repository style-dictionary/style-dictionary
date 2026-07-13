/**
 * @typedef {import('../../../types/Config.d.ts').LocalOptions} Options
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
 * Outputs an object for XAML ResourceDictionary format configurations.
 * Sets resource type defaults, reference style and brush options.
 * @memberof module:formatHelpers
 * @name setXamlResourceDictionaryProperties
 * @param {{
 *   resourceType?: string;
 *   resourceTypeMap?: Record<string, string>;
 *   className?: string;
 *   brushSuffix?: string;
 *   outputColorBrushes?: boolean;
 *   resourceReferenceType?: string;
 * }} [options] - The options object declared at configuration
 * @returns {Options & {
 *   resourceTypeMap: Record<string, string>;
 *   brushSuffix: string;
 *   outputColorBrushes: boolean;
 *   resourceReferenceType: 'StaticResource' | 'DynamicResource';
 * }}
 */
export default function setXamlResourceDictionaryProperties(options = {}) {
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
