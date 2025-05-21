import {
  fileHeader,
  formattedVariables,
  getTypeScriptType,
  iconsWithPrefix,
  minifyDictionary,
  sortByReference,
  createPropertyFormatter,
  sortByName,
  setSwiftFileProperties,
  setComposeObjectProperties,
} from './formatHelpers/index.js';

import { stripMeta as stripMetaUtil } from '../utils/stripMeta.js';

import androidColorsTemplate from './templates/android/colors.template.js';
import androidDimensTemplate from './templates/android/dimens.template.js';
import androidFontDimensTemplate from './templates/android/fontDimens.template.js';
import androidIntegersTemplate from './templates/android/integers.template.js';
import androidResourcesTemplate from './templates/android/resources.template.js';
import androidStringsTemplate from './templates/android/strings.template.js';
import composeObjectTemplate from './templates/compose/object.kt.template.js';
import cssFontsTemplate from './templates/css/fonts.css.template.js';
import flutterClassDartTemplate from './templates/flutter/class.dart.template.js';
import iosColorsHTemplate from './templates/ios/colors.h.template.js';
import iosColorsMTemplate from './templates/ios/colors.m.template.js';
import iosSingletonHTemplate from './templates/ios/singleton.h.template.js';
import iosSingletonMTemplate from './templates/ios/singleton.m.template.js';
import iosStaticHTemplate from './templates/ios/static.h.template.js';
import iosStaticMTemplate from './templates/ios/static.m.template.js';
import iosStringsHTemplate from './templates/ios/strings.h.template.js';
import iosStringsMTemplate from './templates/ios/strings.m.template.js';
import iosSwiftAnyTemplate from './templates/ios-swift/any.swift.template.js';
import scssMapDeepTemplate from './templates/scss/map-deep.template.js';
import scssMapFlatTemplate from './templates/scss/map-flat.template.js';
import macrosTemplate from './templates/ios/macros.template.js';
import plistTemplate from './templates/ios/plist.template.js';
import {
  commentPositions,
  commentStyles,
  fileHeaderCommentStyles,
  formats as fileFormats,
  propertyFormatNames,
} from '../enums/index.js';
import { addComment } from './formatHelpers/createPropertyFormatter.js';

/**
 * @typedef {import('../../types/Format.d.ts').Format} Format
 * @typedef {import('../../types/Format.d.ts').FormatFnArguments} FormatArgs
 * @typedef {import('../../types/File.d.ts').FormattingOverrides} FormattingOverrides
 * @typedef {import('../../types/Format.d.ts').OutputReferences} OutputReferences
 * @typedef {import('../../types/DesignToken.d.ts').TransformedToken} Token
 * @typedef {import('../../types/DesignToken.d.ts').TransformedTokens} Tokens
 * @typedef {import('../../types/Config.d.ts').Config} Config
 * @typedef {import('../../types/Config.d.ts').LocalOptions} LocalOptions
 * @typedef {import('../utils/stripMeta.js').StripMetaOptions} StripMetaOptions
 */

const { above } = commentPositions;
const { none } = commentStyles;
const { long, short, xml } = fileHeaderCommentStyles;
const { css, sass, less, stylus } = propertyFormatNames;
const {
  cssVariables,
  cssFonts,
  scssMapFlat,
  scssMapDeep,
  scssVariables,
  scssIcons,
  lessVariables,
  lessIcons,
  stylusVariables,
  javascriptEs6,
  javascriptEsm,
  javascriptModule,
  javascriptModuleFlat,
  javascriptObject,
  javascriptUmd,
  typescriptEs6Declarations,
  typescriptModuleDeclarations,
  androidResources,
  androidColors,
  androidDimens,
  androidFontDimens,
  androidIntegers,
  androidStrings,
  composeObject,
  iosMacros,
  iosPlist,
  iosSingletonM,
  iosSingletonH,
  iosStaticH,
  iosStaticM,
  iosColorsH,
  iosColorsM,
  iosStringsH,
  iosStringsM,
  iosSwiftClassSwift,
  iosSwiftEnumSwift,
  iosSwiftAnySwift,
  json,
  jsonAsset,
  jsonNested,
  jsonFlat,
  sketchPalette,
  sketchPaletteV2,
  flutterClassDart,
} = fileFormats;

/**
 * @namespace Formats
 */

/**
 * Strip meta properties from tokens object
 *
 * @param {Tokens} tokens
 * @param {Config & LocalOptions & { stripMeta: boolean | StripMetaOptions}} options
 */
function stripMetaProps(tokens, options) {
  const sdMetaProps = ['attributes', 'filePath', 'name', 'path', 'comment'];
  const { stripMeta, usesDtcg } = options;
  let opts = /** @type {StripMetaOptions} */ ({ usesDtcg });

  if (stripMeta) {
    if (stripMeta === true) {
      opts.strip = sdMetaProps;
    } else {
      opts = {
        usesDtcg: usesDtcg ?? false,
        ...stripMeta,
      };
    }
    tokens = stripMetaUtil(tokens, opts);
  }
  return tokens;
}

/**
 * Prettier format JS contents
 * @param {string} content
 * @param {boolean} [ts] whether or not to use typescript
 */
async function formatJS(content, ts = false) {
  const prettier = await import('prettier/standalone');
  const prettierPluginBabel = await import('prettier/plugins/babel');
  const prettierPluginEstree = await import('prettier/plugins/estree');
  const prettierPluginTypescript = await import('prettier/plugins/typescript');

  return prettier.format(content, {
    parser: ts ? `typescript` : `babel`,
    plugins: [
      prettierPluginBabel,
      /** @type {import('prettier').Plugin} */ (prettierPluginEstree),
      prettierPluginTypescript,
    ],
  });
}

/**
 * Remove prefix because the prefix option for createPropertyFormatter
 * is not the same as the prefix inside header comment
 * @param {FormattingOverrides} [formatting]
 */
function getFormattingCloneWithoutPrefix(formatting) {
  const formattingWithoutPrefix = structuredClone(formatting) ?? {};
  // @ts-expect-error users are not supposed to pass "prefix" but they might because it used to be supported
  delete formattingWithoutPrefix.prefix;
  return formattingWithoutPrefix;
}

/**
 * @type {Record<string, Format['format']>}
 */
const formats = {
  /**
   * Creates a CSS file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   *
   * @example
   * ```css
   * :root {
   *   --color-background-base: #f0f0f0;
   *   --color-background-alt: #eeeeee;
   * }
   * ```
   */
  [cssVariables]: async function ({ dictionary, options = {}, file }) {
    const selector = Array.isArray(options.selector)
      ? options.selector
      : options.selector
        ? [options.selector]
        : [`:root`];
    const { outputReferences, outputReferenceFallbacks, usesDtcg, formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const indentation = formatting?.indentation || '  ';

    const nestInSelector = (
      /** @type {string} */ content,
      /** @type {string} */ selector,
      /** @type {string} */ indentation,
    ) => {
      return `${indentation}${selector} {\n` + content + `\n${indentation}}`;
    };

    const variables = formattedVariables({
      format: css,
      dictionary,
      outputReferences,
      outputReferenceFallbacks,
      formatting: {
        ...formatting,
        indentation: indentation.repeat(selector.length),
      },
      usesDtcg,
    });

    return (
      header +
      selector
        .reverse()
        .reduce(
          (content, currentSelector, index) =>
            nestInSelector(
              content,
              currentSelector,
              indentation.repeat(selector.length - 1 - index),
            ),
          variables,
        ) +
      '\n'
    );
  },

  /**
   * Creates a SCSS file with a flat map based on the style dictionary
   *
   * Name the map by adding a 'mapName' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $tokens: (
   *   'color-background-base': #f0f0f0;
   *   'color-background-alt': #eeeeee;
   * )
   * ```
   */
  [scssMapFlat]: async function ({ dictionary, options, file }) {
    const { allTokens } = dictionary;
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: long,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return scssMapFlatTemplate({ allTokens, options, header });
  },

  /**
   * Creates a SCSS file with a deep map based on the style dictionary.
   *
   * Name the map by adding a 'mapName' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $color-background-base: #f0f0f0 !default;
   * $color-background-alt: #eeeeee !default;
   *
   * $tokens: {
   *   'color': (
   *     'background': (
   *       'base': $color-background-base,
   *       'alt': $color-background-alt
   *     )
   *   )
   * )
   * ```
   */
  [scssMapDeep]: async function ({ dictionary, options, file }) {
    // Default the "themeable" option to true for backward compatibility.
    const { outputReferences, themeable = true, formatting, usesDtcg } = options;
    const header = await fileHeader({
      file,
      commentStyle: long,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return (
      '\n' +
      header +
      formattedVariables({
        format: sass,
        dictionary,
        outputReferences,
        themeable,
        formatting,
        usesDtcg,
      }) +
      '\n' +
      scssMapDeepTemplate({ dictionary, options })
    );
  },

  /**
   * Creates a SCSS file with variable definitions based on the style dictionary.
   *
   * Add `!default` to any variable by setting a `themeable: true` attribute in the token's definition.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $color-background-base: #f0f0f0;
   * $color-background-alt: #eeeeee !default;
   * ```
   */
  [scssVariables]: async function ({ dictionary, options, file }) {
    const { outputReferences, themeable = false, formatting, usesDtcg } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return (
      header +
      formattedVariables({
        format: sass,
        dictionary,
        outputReferences,
        themeable,
        formatting,
        usesDtcg,
      }) +
      '\n'
    );
  },

  /**
   * Creates a SCSS file with variable definitions and helper classes for icons
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```scss
   * $content-icon-email: '\E001';
   * .icon.email:before { content:$content-icon-email; }
   * ```
   */
  [scssIcons]: async function ({ dictionary, options, file, platform }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return header + iconsWithPrefix('$', dictionary.allTokens, options, platform);
  },

  /**
   * Creates a LESS file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```less
   * \@color-background-base: #f0f0f0;
   * \@color-background-alt: #eeeeee;
   * ```
   */
  [lessVariables]: async function ({ dictionary, options, file }) {
    const { outputReferences, formatting, usesDtcg } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return (
      header +
      formattedVariables({
        format: less,
        dictionary,
        outputReferences,
        formatting,
        usesDtcg,
      }) +
      '\n'
    );
  },

  /**
   * Creates a LESS file with variable definitions and helper classes for icons
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```less
   * \@content-icon-email: '\E001';
   * .icon.email:before { content:\@content-icon-email; }
   * ```
   */
  [lessIcons]: async function ({ dictionary, options, file, platform }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return header + iconsWithPrefix('@', dictionary.allTokens, options, platform);
  },

  /**
   * Creates a Stylus file with variable definitions based on the style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```stylus
   * $color-background-base= #f0f0f0;
   * $color-background-alt= #eeeeee;
   * ```
   */
  [stylusVariables]: async function ({ dictionary, options, file, platform }) {
    const { formatting, usesDtcg } = options;
    const outputReferences = !!platform.options?.outputReferences;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return (
      header +
      formattedVariables({
        format: stylus,
        dictionary,
        outputReferences,
        formatting,
        usesDtcg,
      }) +
      '\n'
    );
  },

  /**
   * Creates a CommonJS module with the whole style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * module.exports = {
   *   color: {
   *     base: {
   *        red: {
   *          value: '#ff0000'
   *        }
   *     }
   *   }
   * }
   * ```
   */
  [javascriptModule]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content =
      header + 'module.exports = ' + JSON.stringify(dictionary.tokens, null, 2) + ';\n';
    return formatJS(content);
  },

  /**
   * Creates a CommonJS module with the whole style dictionary flattened to a single level.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * module.exports = {
   *  "ColorBaseRed": "#ff0000"
   *}
   *```
   */
  [javascriptModuleFlat]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content =
      header +
      'module.exports = ' +
      '{\n' +
      dictionary.allTokens
        .map(function (token) {
          return `  "${token.name}": ${JSON.stringify(
            options.usesDtcg ? token.$value : token.value,
          )}`;
        })
        .join(',\n') +
      '\n}' +
      ';\n';
    return formatJS(content);
  },

  /**
   * Creates a JS file a global var that is a plain javascript object of the style dictionary.
   * Name the variable by adding a 'name' attribute on the file object in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * var StyleDictionary = {
   *   color: {
   *     base: {
   *        red: {
   *          value: '#ff0000'
   *        }
   *     }
   *   }
   * }
   * ```
   */
  [javascriptObject]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content =
      header +
      'var ' +
      (file.options?.name || '_styleDictionary') +
      ' = ' +
      JSON.stringify(dictionary.tokens, null, 2) +
      ';\n';
    return formatJS(content);
  },

  /**
   * Creates a [UMD](https://github.com/umdjs/umd) module of the style
   * dictionary. Name the module by adding a 'name' attribute on the file object
   * in your config.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * (function(root, factory) {
   *   if (typeof module === "object" && module.exports) {
   *     module.exports = factory();
   *   } else if (typeof exports === "object") {
   *     exports["_styleDictionary"] = factory();
   *   } else if (typeof define === "function" && define.amd) {
   *     define([], factory);
   *   } else {
   *     root["_styleDictionary"] = factory();
   *   }
   * }(this, function() {
   *   return {
   *     "color": {
   *       "red": {
   *         "value": "#FF0000"
   *       }
   *     }
   *   };
   * }))
   * ```
   */
  [javascriptUmd]: async function ({ dictionary, file, options }) {
    const name = file.options?.name || '_styleDictionary';
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content =
      header +
      '(function(root, factory) {\n' +
      '  if (typeof module === "object" && module.exports) {\n' +
      '    module.exports = factory();\n' +
      '  } else if (typeof exports === "object") {\n' +
      '    exports["' +
      name +
      '"] = factory();\n' +
      '  } else if (typeof define === "function" && define.amd) {\n' +
      '    define([], factory);\n' +
      '  } else {\n' +
      '    root["' +
      name +
      '"] = factory();\n' +
      '  }\n' +
      '}(this, function() {\n' +
      '  return ' +
      JSON.stringify(dictionary.tokens, null, 2) +
      ';\n' +
      '}))\n';
    return formatJS(content);
  },

  /**
   * Creates a ES6 module of the style dictionary.
   *
   * ```json
   * {
   *   "platforms": {
   *     "js": {
   *       "transformGroup": "js",
   *       "files": [
   *         {
   *           "format": "javascript/es6",
   *           "destination": "colors.js",
   *           "filter": {
   *             "type": "color"
   *           }
   *         }
   *       ]
   *     }
   *   }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * export const ColorBackgroundBase = '#ffffff';
   * export const ColorBackgroundAlt = '#fcfcfcfc';
   * ```
   */
  [javascriptEs6]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content = [
      header,
      dictionary.allTokens.map((token) => {
        const value = JSON.stringify(options.usesDtcg ? token.$value : token.value);
        const comment = options.usesDtcg ? token.$description : token.comment;
        const to_ret = `export const ${token.name} = ${value};`;

        const format = {
          commentStyle: short,
          indentation: '',
          ...formatting,
        };

        return comment ? addComment(to_ret, comment, format) : to_ret;
      }),
    ]
      .flat()
      .join('\n');
    return formatJS(content);
  },

  /**
   * Creates a ES6 module with the whole style dictionary
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * export default {
   *   "color": {
   *     "base": {
   *        "red": "#ff0000"
   *     }
   *   }
   * }
   * ```
   */
  [javascriptEsm]: async function ({ dictionary, file, options }) {
    const { formatting, minify = false, flat = false } = options;
    let { tokens } = dictionary;
    tokens = stripMetaProps(
      tokens,
      /** @type {LocalOptions & Config & { stripMeta: boolean | StripMetaOptions}} */ (options),
    );

    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });

    let dictionaryString;
    if (flat) {
      dictionaryString = JSON.stringify(
        Object.fromEntries(
          dictionary.allTokens.map((token) => [
            token.name,
            options.usesDtcg ? token.$value : token.value,
          ]),
        ),
        null,
        2,
      );
    } else {
      dictionaryString = JSON.stringify(
        minify ? minifyDictionary(tokens, options.usesDtcg) : tokens,
        null,
        2,
      );
    }

    const content = `${header}export default ${dictionaryString};\n`;
    return formatJS(content);
  },

  // TypeScript declarations
  /**
   * Creates TypeScript declarations for ES6 modules
   *
   * ```json
   * {
   *   "platforms": {
   *     "ts": {
   *       "transformGroup": "js",
   *       "files": [
   *         {
   *           "format": "javascript/es6",
   *           "destination": "colors.js"
   *         },
   *         {
   *           "format": "typescript/es6-declarations",
   *           "destination": "colors.d.ts"
   *         }
   *       ]
   *     }
   *   }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```typescript
   * export const ColorBackgroundBase : string;
   * export const ColorBackgroundAlt : string;
   * ```
   */
  [typescriptEs6Declarations]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const content = [
      header,
      dictionary.allTokens.map((token) => {
        const typescriptType = getTypeScriptType(
          options.usesDtcg ? token.$value : token.value,
          options,
        );
        const comment = options.usesDtcg ? token.$description : token.comment;
        const to_ret = `export const ${token.name} : ${typescriptType};`;
        const format = {
          commentPosition: above,
          commentStyle: long,
          indentation: '',
          ...formatting,
        };

        return comment ? addComment(to_ret, comment, format) : to_ret;
      }),
    ]
      .flat()
      .join('\n');
    return formatJS(content, true);
  },

  /**
   * Creates TypeScript declarations for CommonJS module
   *
   * ```json
   * {
   *   "platforms": {
   *     "ts": {
   *       "transformGroup": "js",
   *       "files": [
   *         {
   *           "format": "javascript/module",
   *           "destination": "colors.js"
   *         },
   *         {
   *           "format": "typescript/module-declarations",
   *           "destination": "colors.d.ts"
   *         }
   *       ]
   *     }
   *   }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```typescript
   * export default tokens;
   * declare interface DesignToken { value: string; name?: string; path?: string[]; comment?: string; attributes?: any; original?: any; }
   * declare const tokens: {
   *  "color": {
   *    "red": DesignToken
   *  }
   * }
   * ```
   *
   * As you can see above example output this does not generate 100% accurate d.ts.
   * This is a compromise between of what style-dictionary can do to help and not bloating the library with rarely used dependencies.
   *
   * Thankfully you can extend style-dictionary very easily:
   *
   * ```js
   * const JsonToTS = require('json-to-ts');
   * StyleDictionaryPackage.registerFormat({
   *   name: 'typescript/accurate-module-declarations',
   *   format: function({ dictionary }) {
   *     return 'declare const root: RootObject\n' +
   *     'export default root\n' +
   *     JsonToTS(dictionary.tokens).join('\n');
   *   },
   * });
   * ```
   */
  [typescriptModuleDeclarations]: async function ({ dictionary, file, options }) {
    const { moduleName = `tokens` } = options;
    /**
     * @param {Tokens} obj
     * @returns
     */
    function treeWalker(obj) {
      let type = Object.create(null);
      const propToCheck = options.usesDtcg ? '$value' : 'value';
      if (Object.hasOwn(obj, propToCheck)) {
        type = 'DesignToken';
      } else {
        for (let k in obj)
          if (Object.hasOwn(obj, k)) {
            switch (typeof obj[k]) {
              case 'object':
                type[k] = treeWalker(obj[k]);
            }
          }
      }
      return type;
    }

    // TODO: find a browser+node compatible way to read from '../../types/DesignToken.d.ts'
    const designTokenInterface = `interface DesignToken {
  ${options.usesDtcg ? '$' : ''}value?: any;
  ${options.usesDtcg ? '$' : ''}type?: string;
  ${options.usesDtcg ? '$description?: string;' : 'comment?: string;'}
  name?: string;
  themeable?: boolean;
  attributes?: Record<string, unknown>;
  [key: string]: any;
}`;

    const { formatting } = options;
    const header = await fileHeader({
      file,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    const output =
      header +
      `export default ${moduleName};

declare ${designTokenInterface}

declare const ${moduleName}: ${JSON.stringify(treeWalker(dictionary.tokens), null, 2)}`;

    // JSON stringify will quote strings, because this is a type we need
    // it unquoted.
    const content = output.replace(/"DesignToken"/g, 'DesignToken') + '\n';
    return formatJS(content, true);
  },

  // Android templates
  /**
   * Creates a [resource](https://developer.android.com/guide/topics/resources/providing-resources) xml file. It is recommended to use a filter with this format
   * as it is generally best practice in Android development to have resource files
   * organized by type (color, dimension, string, etc.). However, a resource file
   * with mixed resources will still work.
   *
   * This format will try to use the proper resource type for each token based on
   * the category (color => color, size => dimen, etc.). However if you want to
   * force a particular resource type you can provide a 'resourceType' attribute
   * on the file configuration. You can also provide a 'resourceMap' if you
   * don't use Style Dictionary's built-in CTI structure.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <color name="color_base_red_5">#fffaf3f2</color>
   *  <color name="color_base_red_30">#fff0cccc</color>
   *  <dimen name="size_font_base">14sp</color>
   * ```
   */
  [androidResources]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidResourcesTemplate({ dictionary, file, header, options });
  },

  /**
   * Creates a color resource xml file with all the colors in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: formats.androidResources,
   * filter: {
   *   attributes: { category: 'color' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <color name="color_base_red_5">#fffaf3f2</color>
   *  <color name="color_base_red_30">#fff0cccc</color>
   *  <color name="color_base_red_60">#ffe19d9c</color>
   * ```
   */
  [androidColors]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidColorsTemplate({ dictionary, options, header });
  },

  /**
   * Creates a dimen resource xml file with all the sizes in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: formats.androidResources,
   * filter: {
   *   attributes: { category: 'size' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <dimen name="size_padding_tiny">5.00dp</dimen>
   *  <dimen name="size_padding_small">10.00dp</dimen>
   *  <dimen name="size_padding_medium">15.00dp</dimen>
   * ```
   */
  [androidDimens]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidDimensTemplate({ dictionary, options, header });
  },

  /**
   * Creates a dimen resource xml file with all the font sizes in your style dictionary.
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: formats.androidResources,
   * filter: {
   *   attributes: { category: 'size' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *  <dimen name="size_font_tiny">10.00sp</dimen>
   *  <dimen name="size_font_small">13.00sp</dimen>
   *  <dimen name="size_font_medium">15.00sp</dimen>
   * ```
   */
  [androidFontDimens]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidFontDimensTemplate({ dictionary, options, header });
  },

  /**
   * Creates a resource xml file with all the integers in your style dictionary. It filters your
   * design tokens by `token.type === 'time'`
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: formats.androidResources,
   * filter: {
   *   attributes: { category: 'time' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @todo Update the filter on this.
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *   <integer name="time_duration_short">1000</integer>
   *   <integer name="time_duration_medium">2000</integer>
   *   <integer name="time_duration_long">4000</integer>
   * ```
   */
  [androidIntegers]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidIntegersTemplate({ dictionary, options, header });
  },

  /**
   * Creates a resource xml file with all the strings in your style dictionary. Filters your
   * design tokens by `token.type === 'content'`
   *
   * It is recommended to use the 'android/resources' format with a custom filter
   * instead of this format:
   *
   * ```javascript
   * format: formats.androidResources,
   * filter: {
   *   attributes: { category: 'content' }
   * }
   * ```
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```xml
   * <?xml version="1.0" encoding="UTF-8"?>
   * <resources>
   *   <string name="content_icon_email">&#xE001;</string>
   *   <string name="content_icon_chevron_down">&#xE002;</string>
   *   <string name="content_icon_chevron_up">&#xE003;</string>
   * ```
   */
  [androidStrings]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return androidStringsTemplate({ dictionary, options, header });
  },

  // Compose templates
  /**
   * Creates a Kotlin file for Compose containing an object with a `val` for each property.
   *
   * @memberof Formats
   * @kind member
   * @typedef {Object} composeObjectOpts
   * @property {String} [composeObjectOpts.className] The name of the generated Kotlin object
   * @property {String} [composeObjectOpts.packageName] The package for the generated Kotlin object
   * @property {String[]} [composeObjectOpts.import=['androidx.compose.ui.graphics.Color', 'androidx.compose.ui.unit.*']] - Modules to import. Can be a string or array of strings
   * @property {boolean} [composeObjectOpts.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @property {OutputReferences} [composeObjectOpts.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @param {FormatArgs & { options?: composeObjectOpts }} options
   * @example
   * ```kotlin
   * package com.example.tokens;
   *
   * import androidx.compose.ui.graphics.Color
   *
   * object StyleDictionary {
   *  val colorBaseRed5 = Color(0xFFFAF3F2)
   * }
   * ```
   */
  [composeObject]: async function ({ dictionary, options, file }) {
    const { allTokens, tokens, unfilteredTokens } = dictionary;
    const { outputReferences, formatting, usesDtcg } = options;
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      formatting: {
        suffix: '',
        commentStyle: /** @type {'short' | 'long' | 'none'} */ (none), // We will add the comment in the format template
        ...formatting,
      },
      usesDtcg,
    });

    let sortedTokens;
    if (outputReferences) {
      sortedTokens = [...allTokens].sort(sortByReference(tokens, { unfilteredTokens }));
    } else {
      sortedTokens = [...allTokens].sort(sortByName);
    }

    options = setComposeObjectProperties(options);
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return composeObjectTemplate({ allTokens: sortedTokens, options, formatProperty, header });
  },

  // iOS templates

  /**
   * Creates an Objective-C header file with macros for design tokens
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```objective-c
   * #import <Foundation/Foundation.h>
   * #import <UIKit/UIKit.h>
   *
   * #define ColorFontLink [UIColor colorWithRed:0.00f green:0.47f blue:0.80f alpha:1.00f]
   * #define SizeFontTiny 176.00f
   * ```
   */
  [iosMacros]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return macrosTemplate({ dictionary, options, file, header });
  },

  /**
   * Creates an Objective-C plist file
   *
   * @memberof Formats
   * @kind member
   * @todo Fix this template and add example and usage
   */
  [iosPlist]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: xml,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return plistTemplate({ dictionary, options, header });
  },

  /**
   * Creates an Objective-C implementation file of a style dictionary singleton class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosSingletonM]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosSingletonMTemplate({ dictionary, options, file, header });
  },

  /**
   * Creates an Objective-C header file of a style dictionary singleton class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosSingletonH]: async function ({ file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosSingletonHTemplate({ file, options, header });
  },

  /**
   * Creates an Objective-C header file of a static style dictionary class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosStaticH]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosStaticHTemplate({ dictionary, file, options, header });
  },

  /**
   * Creates an Objective-C implementation file of a static style dictionary class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosStaticM]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosStaticMTemplate({ dictionary, options, file, header });
  },

  /**
   * Creates an Objective-C header file of a color class
   *
   * @memberof Formats
   * @kind memberx
   * @todo Add example and usage
   */
  [iosColorsH]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosColorsHTemplate({ dictionary, file, options, header });
  },

  /**
   * Creates an Objective-C implementation file of a color class
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosColorsM]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosColorsMTemplate({ dictionary, options, file, header });
  },

  /**
   * Creates an Objective-C header file of strings
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosStringsH]: async function ({ dictionary, file, options }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosStringsHTemplate({ dictionary, file, options, header });
  },

  /**
   * Creates an Objective-C implementation file of strings
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [iosStringsM]: async function ({ dictionary, options, file }) {
    const { formatting } = options;
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosStringsMTemplate({ dictionary, options, file, header });
  },

  /**
   * Creates a Swift implementation file of a class with values. It adds default `class` object type, `public` access control and `UIKit` import.
   *
   * @memberof Formats
   * @kind member
   * @typedef {Object} iosSwiftClassOpts
   * @property {String} [iosSwiftClassOpts.accessControl='public'] - Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object
   * @property {String[]} [iosSwiftClassOpts.import='UIKit'] - Modules to import. Can be a string or array of strings
   * @property {String} [iosSwiftClassOpts.className] - The name of the generated Swift class
   * @property {boolean} [iosSwiftClassOpts.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @property {OutputReferences} [iosSwiftClassOpts.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @param {FormatArgs & { options?: iosSwiftClassOpts }} options
   * @example
   * ```swift
   * public class StyleDictionary {
   *   public static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
   * }
   * ```
   */
  [iosSwiftClassSwift]: async function ({ dictionary, options, file, platform }) {
    const { allTokens, tokens, unfilteredTokens } = dictionary;
    const { outputReferences, formatting, usesDtcg } = options;
    options = setSwiftFileProperties(options, 'class', platform.transformGroup);
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      formatting: {
        suffix: '',
        ...formatting,
      },
      usesDtcg,
    });

    let sortedTokens;
    if (outputReferences) {
      sortedTokens = [...allTokens].sort(sortByReference(tokens, { unfilteredTokens, usesDtcg }));
    } else {
      sortedTokens = [...allTokens].sort(sortByName);
    }
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosSwiftAnyTemplate({ allTokens: sortedTokens, file, options, formatProperty, header });
  },

  /**
   * Creates a Swift implementation file of an enum with values. It adds default `enum` object type, `public` access control and `UIKit` import.
   *
   * @memberof Formats
   * @kind member
   * @typedef {Object} iosSwiftEnumOpts
   * @property {String} [iosSwiftEnumOpts.accessControl='public'] - Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object
   * @property {String[]} [iosSwiftEnumOpts.import='UIKit'] - Modules to import. Can be a string or array of strings
   * @property {String} [iosSwiftEnumOpts.className] - The name of the generated Swift enum
   * @property {boolean} [iosSwiftEnumOpts.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @property {OutputReferences} [iosSwiftEnumOpts.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @param {FormatArgs & { options?: iosSwiftEnumOpts }} options
   * @example
   * ```swift
   * public enum StyleDictionary {
   *   public static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
   * }
   * ```
   */
  [iosSwiftEnumSwift]: async function ({ dictionary, options, file, platform }) {
    const { allTokens, tokens, unfilteredTokens } = dictionary;
    const { outputReferences, formatting, usesDtcg } = options;
    options = setSwiftFileProperties(options, 'enum', platform.transformGroup);
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      formatting: {
        suffix: '',
        ...formatting,
      },
      usesDtcg,
    });

    let sortedTokens;
    if (outputReferences) {
      sortedTokens = [...allTokens].sort(sortByReference(tokens, { unfilteredTokens, usesDtcg }));
    } else {
      sortedTokens = [...allTokens].sort(sortByName);
    }
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosSwiftAnyTemplate({ allTokens: sortedTokens, file, options, formatProperty, header });
  },

  /**
   * Creates a Swift implementation file of any given type with values. It has by default `class` object type, `public` access control and `UIKit` import.
   *
   * ```javascript
   * format: 'ios-swift/any.swift',
   * import: ['UIKit', 'AnotherModule'],
   * objectType: 'struct',
   * accessControl: 'internal',
   * ```
   *
   * @memberof Formats
   * @kind member
   * @typedef {Object} iosSwiftAnyOpts
   * @property {string} [iosSwiftAnyOpts.accessControl='public'] - Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object
   * @property {string[]} [iosSwiftAnyOpts.import='UIKit'] - Modules to import. Can be a string or array of strings
   * @property {String} [iosSwiftAnyOpts.className] - The name of the generated Swift object
   * @property {string} [iosSwiftAnyOpts.objectType='class'] - The type of the generated Swift object
   * @property {boolean} [iosSwiftAnyOpts.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @property {OutputReferences} [iosSwiftAnyOpts.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @param {FormatArgs & { options?: iosSwiftAnyOpts }} options
   * @example
   * ```swift
   * import UIKit
   * import AnotherModule
   *
   * internal struct StyleDictionary {
   *   internal static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
   * }
   * ```
   */
  [iosSwiftAnySwift]: async function ({ dictionary, options, file, platform }) {
    const { allTokens, tokens, unfilteredTokens } = dictionary;
    const { outputReferences, formatting, usesDtcg } = options;
    options = setSwiftFileProperties(options, options.objectType, platform.transformGroup);
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      formatting: {
        suffix: '',
        ...formatting,
      },
      usesDtcg,
    });

    let sortedTokens;
    if (outputReferences) {
      sortedTokens = [...allTokens].sort(sortByReference(tokens, { unfilteredTokens, usesDtcg }));
    } else {
      sortedTokens = [...allTokens].sort(sortByName);
    }
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return iosSwiftAnyTemplate({ allTokens: sortedTokens, file, options, formatProperty, header });
  },

  // Css templates

  /**
   * Creates CSS file with @font-face declarations
   *
   * @memberof Formats
   * @kind member
   * @todo Add example and usage
   */
  [cssFonts]: ({ dictionary }) => cssFontsTemplate(dictionary.tokens),

  // Web templates

  /**
   * Creates a JSON file of the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color": {
   *     "base": {
   *        "red": {
   *          "value": "#ff0000"
   *        }
   *     }
   *   }
   * }
   * ```
   */
  [json]: function ({ dictionary, options }) {
    let { tokens } = dictionary;
    tokens = stripMetaProps(
      tokens,
      /** @type {LocalOptions & Config & { stripMeta: boolean | StripMetaOptions}} */ (options),
    );
    return JSON.stringify(tokens, null, 2) + '\n';
  },

  /**
   * Creates a JSON file of the assets defined in the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```js
   * {
   *   "asset": {
   *     "image": {
   *        "logo": {
   *          "value": "assets/logo.png"
   *        }
   *     }
   *   }
   * }
   * ```
   */
  [jsonAsset]: function ({ dictionary }) {
    return JSON.stringify({ asset: dictionary.tokens.asset }, null, 2);
  },

  /**
   * Creates a JSON nested file of the style dictionary.
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color": {
   *     "base": {
   *        "red": "#ff0000"
   *     }
   *   }
   * }
   * ```
   */
  [jsonNested]: function ({ dictionary, options }) {
    return JSON.stringify(minifyDictionary(dictionary.tokens, options.usesDtcg), null, 2) + '\n';
  },

  /**
   * Creates a JSON flat file of the style dictionary.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "color-base-red": "#ff0000"
   * }
   * ```
   */
  [jsonFlat]: function ({ dictionary, options }) {
    return (
      '{\n' +
      dictionary.allTokens
        .map(function (token) {
          return `  "${token.name}": ${JSON.stringify(
            options.usesDtcg ? token.$value : token.value,
          )}`;
        })
        .join(',\n') +
      '\n}' +
      '\n'
    );
  },

  /**
   * Creates a sketchpalette file of all the base colors
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "compatibleVersion": "1.0",
   *   "pluginVersion": "1.1",
   *   "colors": [
   *     "#ffffff",
   *     "#ff0000",
   *     "#fcfcfc"
   *   ]
   * }
   * ```
   */
  [sketchPalette]: function ({ dictionary, options }) {
    const to_ret = {
      compatibleVersion: '1.0',
      pluginVersion: '1.1',
      /** @type {any[]} */
      colors: [],
    };
    to_ret.colors = dictionary.allTokens
      .filter(function (token) {
        return token.type === 'color';
      })
      .map(function (token) {
        return options.usesDtcg ? token.$value : token.value;
      });
    return JSON.stringify(to_ret, null, 2) + '\n';
  },

  /**
   * Creates a sketchpalette file compatible with version 2 of
   * the sketchpalette plugin. To use this you should use the
   * 'color/sketch' transform to get the correct value for the colors.
   *
   * @memberof Formats
   * @kind member
   * @example
   * ```json
   * {
   *   "compatibleVersion": "2.0",
   *   "pluginVersion": "2.2",
   *   "colors": [
   *     {name: "red", r: 1.0, g: 0.0, b: 0.0, a: 1.0},
   *     {name: "green", r: 0.0, g: 1.0, b: 0.0, a: 1.0},
   *     {name: "blue", r: 0.0, g: 0.0, b: 1.0, a: 1.0}
   *   ]
   * }
   * ```
   */
  [sketchPaletteV2]: function ({ dictionary, options }) {
    const to_ret = {
      compatibleVersion: '2.0',
      pluginVersion: '2.2',
      colors: dictionary.allTokens.map(function (token) {
        // Merging the token's value, which should be an object with r,g,b,a channels
        return Object.assign(
          {
            name: token.name,
          },
          options.usesDtcg ? token.$value : token.value,
        );
      }),
    };
    return JSON.stringify(to_ret, null, 2) + '\n';
  },

  // Flutter templates
  /**
   *  Creates a Dart implementation file of a class with values
   *
   * @memberof Formats
   * @kind member
   * @typedef {Object} flutterClassOpts
   * @property {boolean} [flutterClassOpts.showFileHeader=true] - Whether or not to include a comment that has the build date
   * @property {OutputReferences} [flutterClassOpts.outputReferences=false] - Whether or not to keep [references](/#/formats?id=references-in-output-files) (a -> b -> c) in the output.
   * @property {String} [flutterClassOpts.className] - The name of the generated Dart Class
   * @param {FormatArgs & { options?: flutterClassOpts }} options
   * @example
   * ```dart
   * import 'package:flutter/material.dart';
   *
   * class StyleDictionary {
   *   StyleDictionary._();
   *
   *     static const colorBrandPrimary = Color(0x00ff5fff);
   *     static const sizeFontSizeMedium = 16.00;
   *     static const contentFontFamily1 = "NewJune";
   * ```
   */
  [flutterClassDart]: async function ({ dictionary, options, file }) {
    const { allTokens, tokens, unfilteredTokens } = dictionary;
    const { outputReferences, formatting, usesDtcg } = options;
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      formatting,
      usesDtcg,
    });

    let sortedTokens;
    if (outputReferences) {
      sortedTokens = [...allTokens].sort(sortByReference(tokens, { unfilteredTokens, usesDtcg }));
    } else {
      sortedTokens = [...allTokens].sort(sortByName);
    }
    const header = await fileHeader({
      file,
      commentStyle: short,
      formatting: getFormattingCloneWithoutPrefix(formatting),
      options,
    });
    return flutterClassDartTemplate({
      allTokens: sortedTokens,
      file,
      options,
      formatProperty,
      header,
    });
  },
};

// Mark which formats are nested
formats[jsonNested].nested = true;
formats[javascriptModule].nested = true;
formats[javascriptObject].nested = true;
formats[javascriptEsm].nested = true;

export default formats;
