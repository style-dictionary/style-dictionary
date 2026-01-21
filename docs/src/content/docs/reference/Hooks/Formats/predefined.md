---
title: Built-in formats
---

These are the formats included in Style Dictionary by default, pulled from [lib/common/formats.js](https://github.com/style-dictionary/style-dictionary/blob/main/lib/common/formats.js)

Want a format? [You can request it here](https://github.com/style-dictionary/style-dictionary/issues).

You created a format and think it should be included? [Send us a PR](https://github.com/style-dictionary/style-dictionary/pulls).

### css/variables

Creates a CSS file with variable definitions based on the style dictionary

| Param                              | Type                                  | Description                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                          | `Object`                              |                                                                                                                                                                                                                                                                                                                                                  |
| `options.showFileHeader`           | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                                                                                                                                  |
| `options.outputReferences`         | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis.                                                                                                               |
| `options.outputReferenceFallbacks` | `boolean`                             | Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.                                                                                                                                                                            |
| `options.selector`                 | `string \| string[]`                  | Override the root CSS selector. When a string array is provided, the styles will be nested within the specified selectors in order - the first selector in the array acts as the outermost layer.                                                                                                                                                |
| `options.sort`                     | `SortOption`                          | Optional sorting strategy. Use `'name'` to sort by token name, an array to apply multiple sorters, or a custom comparator function. Defaults to no sorting. When `outputReferences: true`, reference-safe ordering is automatically applied first. See [Sorting variables](/reference/hooks/formats/#sorting-token-output-wip) for more details. |
| `options.formatting`               | `FormattingOverrides`                 | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `indentation`, `commentStyle` and `commentPosition`. The `fileHeaderTimestamp`, `header`, and `footer` formatting options are used for the fileHeader helper.                                                                        |

Example:

```css title="variables.css"
:root {
  --color-background-base: #f0f0f0;
  --color-background-alt: #eeeeee;
}
```

---

### scss/map-flat

Creates a SCSS file with a flat map based on the style dictionary

Name the map by adding a `mapName` property on the `options` object property on the `file` object property in your config.

Example:

```scss title="vars.scss"
$tokens: (
  'color-background-base': #f0f0f0; 'color-background-alt': #eeeeee;,
);
```

---

### scss/map-deep

Creates a SCSS file with a deep map based on the style dictionary.

Name the map by adding a `mapName` property on the `options` object property on the `file` object property in your config.

| Param                              | Type                                  | Description                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                          | `Object`                              |                                                                                                                                                                                                                                                                                                                                                  |
| `options.outputReferences`         | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis.                                                                                                               |
| `options.outputReferenceFallbacks` | `boolean`                             | Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.                                                                                                                                                                            |
| `options.themeable`                | `boolean`                             | Whether or not tokens should default to being themeable, if not otherwise specified per token. Defaults to `false`.                                                                                                                                                                                                                              |
| `options.mapName`                  | `string`                              | Name of your SCSS map.                                                                                                                                                                                                                                                                                                                           |
| `options.sort`                     | `SortOption`                          | Optional sorting strategy. Use `'name'` to sort by token name, an array to apply multiple sorters, or a custom comparator function. Defaults to no sorting. When `outputReferences: true`, reference-safe ordering is automatically applied first. See [Sorting variables](/reference/hooks/formats/#sorting-token-output-wip) for more details. |
| `options.formatting`               | `FormattingOverrides`                 | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `indentation`, `commentStyle` and `commentPosition`. The `fileHeaderTimestamp`, `header`, and `footer` formatting options are used for the fileHeader helper.                                                                        |

Example:

```scss title="vars.scss"
$color-background-base: #f0f0f0 !default;
$color-background-alt: #eeeeee !default;

$tokens: (
  'color': (
    'background': (
      'base': $color-background-base,
      'alt': $color-background-alt,
    ),
  ),
);
```

---

### scss/variables

Creates a SCSS file with variable definitions based on the style dictionary.

Add `!default` to any variable by setting a `themeable: true` attribute in the token's definition.

| Param                              | Type                                  | Description                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                          | `Object`                              |                                                                                                                                                                                                                                                                                                                                                  |
| `options.showFileHeader`           | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                                                                                                                                  |
| `options.outputReferences`         | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis.                                                                                                               |
| `options.outputReferenceFallbacks` | `boolean`                             | Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.                                                                                                                                                                            |
| `options.themeable`                | `boolean`                             | Whether or not tokens should default to being themeable, if not otherwise specified per token. Defaults to `false`.                                                                                                                                                                                                                              |
| `options.sort`                     | `SortOption`                          | Optional sorting strategy. Use `'name'` to sort by token name, an array to apply multiple sorters, or a custom comparator function. Defaults to no sorting. When `outputReferences: true`, reference-safe ordering is automatically applied first. See [Sorting variables](/reference/hooks/formats/#sorting-token-output-wip) for more details. |
| `options.formatting`               | `FormattingOverrides`                 | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `indentation`, `commentStyle` and `commentPosition`. The `fileHeaderTimestamp`, `header`, and `footer` formatting options are used for the fileHeader helper.                                                                        |

Example:

```scss title="vars.scss"
$color-background-base: #f0f0f0;
$color-background-alt: #eeeeee !default;
```

---

### scss/icons

Creates a SCSS file with variable definitions and helper classes for icons

Example:

```scss title="vars.scss"
$content-icon-email: '\E001';
.icon.email:before {
  content: $content-icon-email;
}
```

---

### less/variables

Creates a LESS file with variable definitions based on the style dictionary

| Param                              | Type                                  | Description                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                          | `Object`                              |                                                                                                                                                                                                                                                                                                                                                  |
| `options.showFileHeader`           | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                                                                                                                                  |
| `options.outputReferences`         | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis.                                                                                                               |
| `options.outputReferenceFallbacks` | `boolean`                             | Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.                                                                                                                                                                            |
| `options.sort`                     | `SortOption`                          | Optional sorting strategy. Use `'name'` to sort by token name, an array to apply multiple sorters, or a custom comparator function. Defaults to no sorting. When `outputReferences: true`, reference-safe ordering is automatically applied first. See [Sorting variables](/reference/hooks/formats/#sorting-token-output-wip) for more details. |
| `options.formatting`               | `FormattingOverrides`                 | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `indentation`, `commentStyle` and `commentPosition`. The `fileHeaderTimestamp`, `header`, and `footer` formatting options are used for the fileHeader helper.                                                                        |

Example:

```less title="vars.less"
@color-background-base: #f0f0f0;
@color-background-alt: #eeeeee;
```

---

### less/icons

Creates a LESS file with variable definitions and helper classes for icons

Example:

```less title="vars.less"
@content-icon-email: '\E001';
.icon.email:before {
  content: @content-icon-email;
}
```

---

### stylus/variables

Creates a Stylus file with variable definitions based on the style dictionary

| Param                | Type                                                                                             | Description                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`            | `Object`                                                                                         |                                                                                                                                                                                                                                                                                                                                                  |
| `options.sort`       | `'name' \| ('name')[] \| ((a: Token, b: Token) => number) \| ((a: Token, b: Token) => number)[]` | Optional sorting strategy. Use `'name'` to sort by token name, an array to apply multiple sorters, or a custom comparator function. Defaults to no sorting. When `outputReferences: true`, reference-safe ordering is automatically applied first. See [Sorting variables](/reference/hooks/formats/#sorting-token-output-wip) for more details. |
| `options.formatting` | `FormattingOverrides`                                                                            | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `indentation`, `commentStyle` and `commentPosition`. The `fileHeaderTimestamp`, `header`, and `footer` formatting options are used for the fileHeader helper.                                                                        |

Example:

```stylus title="vars.stylus"
$color-background-base= #f0f0f0;
$color-background-alt= #eeeeee;
```

---

### javascript/module

Creates a CommonJS module with the whole style dictionary

Example:

```js title="vars.cjs"
module.exports = {
  color: {
    base: {
      red: {
        value: '#ff0000',
      },
    },
  },
};
```

---

### javascript/module-flat

Creates a CommonJS module with the whole style dictionary flattened to a single level.

Example:

```js title="vars.cjs"
module.exports = {
  ColorBaseRed: '#ff0000',
};
```

---

### javascript/object

Creates a JS file a global var that is a plain javascript object of the style dictionary.
Name the variable by adding a `name` property on the `options` object property of the `file` object property in your config.

Example:

```js title="vars.js"
var StyleDictionary = {
  color: {
    base: {
      red: {
        value: '#ff0000',
      },
    },
  },
};
```

---

### javascript/umd

Creates a [UMD](https://github.com/umdjs/umd) module of the style
dictionary. Name the module by adding a `name` property on the `options` object property of the `file` object property in your config.

Example

```js title="vars.js"
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof exports === 'object') {
    exports['_styleDictionary'] = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root['_styleDictionary'] = factory();
  }
})(this, function () {
  return {
    color: {
      red: {
        value: '#FF0000',
      },
    },
  };
});
```

---

### javascript/es6

Creates a ES6 module of the style dictionary.

```json title="config.json"
{
  "platforms": {
    "js": {
      "transformGroup": "js",
      "files": [
        {
          "format": "javascript/es6",
          "destination": "colors.js",
          "filter": {
            "type": "color"
          }
        }
      ]
    }
  }
}
```

Example:

```js title="vars.js"
export const ColorBackgroundBase = '#ffffff';
export const ColorBackgroundAlt = '#fcfcfcfc';
```

### javascript/esm

Creates an ES6 module object of the style dictionary.

```json title="config.json"
{
  "platforms": {
    "js": {
      "transformGroup": "js",
      "files": [
        {
          "format": "javascript/esm",
          "destination": "colors.js",
          "options": {
            "minify": true
          }
        }
      ]
    }
  }
}
```

| Param                     | Type                | Description                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `Object`            |                                                                                                                                                                                                                                                                                                                               |
| `options.minify`          | `boolean`           | Whether or not to minify the output. Defaults to `false`. Has no effect when `options.flat` is `true`.                                                                                                                                                                                                                        |
| `options.flat`            | `boolean`           | Whether or not to flatten the output. Defaults to `false`. If `true`, renders only the token value, which means it is minified.                                                                                                                                                                                               |
| `options.stripMeta`       | `Object \| boolean` | Control whether meta data is stripped from the output tokens. `false` by default. If set to `true`, will strip known Style Dictionary meta props: `['attributes', 'filePath', 'name', 'path', 'comment']`. Note that using minify means that meta is stripped as a side effect of this already, so using both is unnecessary. |
| `options.stripMeta.keep`  | `string[]`          | Array of property keys to keep in the output.                                                                                                                                                                                                                                                                                 |
| `options.stripMeta.strip` | `string[]`          | Array of property keys to strip from the output.                                                                                                                                                                                                                                                                              |

Example:

```js title="vars.js"
export default {
  colors: {
    black: {
      $value: '#000000',
      filePath: 'src/tokens/color.json',
      isSource: true,
      $type: 'color',
      original: {
        $value: '#000000',
        $type: 'color',
      },
      name: 'ColorsBlack',
      attributes: {
        category: 'colors',
        type: 'black',
      },
      path: ['colors', 'black'],
    },
  },
};
```

Example with `minify` flag:

```js title="vars.js"
export default {
  colors: {
    black: '#000000',
  },
};
```

Example with `stripMeta` flag:

```js title="vars.js"
export default {
  colors: {
    black: {
      $value: '#000000',
      $type: 'color',
    },
  },
};
```

---

### typescript/es6-declarations

Creates TypeScript declarations for ES6 modules

```json title="config.json"
{
  "platforms": {
    "ts": {
      "transformGroup": "js",
      "files": [
        {
          "format": "javascript/es6",
          "destination": "colors.js"
        },
        {
          "format": "typescript/es6-declarations",
          "destination": "colors.d.ts"
        }
      ]
    }
  }
}
```

| Param                          | Type      | Description                                                                    |
| ------------------------------ | --------- | ------------------------------------------------------------------------------ |
| `options`                      | `Object`  |                                                                                |
| `options.outputStringLiterals` | `boolean` | Whether or not to output literal types for string values. Defaults to `false`. |

Example:

```typescript title="vars.ts"
export const ColorBackgroundBase: string;
export const ColorBackgroundAlt: string;
```

---

### typescript/module-declarations

Creates TypeScript declarations for module

```json title="config.json"
{
  "platforms": {
    "ts": {
      "transformGroup": "js",
      "files": [
        {
          "format": "javascript/module",
          "destination": "colors.js"
        },
        {
          "format": "typescript/module-declarations",
          "destination": "colors.d.ts"
        }
      ]
    }
  }
}
```

Example:

```typescript title="vars.ts"
export default tokens;
declare interface DesignToken {
  value?: any;
  type?: string;
  name?: string;
  comment?: string;
  themeable?: boolean;
  attributes?: Record<string, unknown>;
  [key: string]: any;
}
declare const tokens: {
  color: {
    red: DesignToken;
  };
};
```

As you can see above example output this does not generate 100% accurate d.ts.
This is a compromise between of what style-dictionary can do to help and not bloating the library with rarely used dependencies.

Thankfully you can extend style-dictionary very easily:

```js title="build-tokens.js"
import JsonToTS from 'json-to-ts';

StyleDictionaryPackage.registerFormat({
  name: 'typescript/accurate-module-declarations',
  format: function ({ dictionary }) {
    return (
      'declare const root: RootObject\n' +
      'export default root\n' +
      JsonToTS(dictionary.tokens).join('\n')
    );
  },
});
```

---

### android/resources

Creates a [resource](https://developer.android.com/guide/topics/resources/providing-resources) xml file. It is recommended to use a filter with this format
as it is generally best practice in Android development to have resource files
organized by type (color, dimension, string, etc.). However, a resource file
with mixed resources will still work.

This format will try to use the proper resource type for each token based on
the category (color => color, size => dimen, etc.). However if you want to
force a particular resource type you can provide a `resourceType` property on the `options`
object property on the `file` object property configuration.
You can also provide a `resourceMap` if you
don't use Style Dictionary's built-in CTI structure.

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `Object`                              |                                                                                                                                                                                                                                    |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |

Example:

```xml title="resources.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
 <color name="color_base_red_5">#fffaf3f2</color>
 <color name="color_base_red_30">#fff0cccc</color>
 <dimen name="size_font_base">14sp</color>
```

---

### android/colors

Creates a color resource xml file with all the colors in your style dictionary.

It is recommended to use the 'android/resources' format with a custom filter
instead of this format:

```javascript title="config.js"
format: formats.androidResources, // formats enum for string 'android/resources'
filter: {
  type: "color"
}
```

Example:

```xml title="resources.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
 <color name="color_base_red_5">#fffaf3f2</color>
 <color name="color_base_red_30">#fff0cccc</color>
 <color name="color_base_red_60">#ffe19d9c</color>
```

---

### android/dimens

Creates a dimen resource xml file with all the sizes in your style dictionary.

It is recommended to use the 'android/resources' format with a custom filter
instead of this format:

```javascript title="config.js"
format: formats.androidResources, // formats enum for string 'android/resources'
filter: {
  type: "dimension"
}
```

Example:

```xml title="dimens.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
 <dimen name="size_padding_tiny">5.00dp</dimen>
 <dimen name="size_padding_small">10.00dp</dimen>
 <dimen name="size_padding_medium">15.00dp</dimen>
```

---

### android/fontDimens

Creates a dimen resource xml file with all the font sizes in your style dictionary.

It is recommended to use the 'android/resources' format with a custom filter
instead of this format:

```javascript title="config.js"
format: formats.androidResources, // formats enum for string 'android/resources'
filter: {
  type: "dimension"
}
```

Example:

```xml title="font-dimens.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
 <dimen name="size_font_tiny">10.00sp</dimen>
 <dimen name="size_font_small">13.00sp</dimen>
 <dimen name="size_font_medium">15.00sp</dimen>
```

---

### android/integers

Creates a resource xml file with all the integers in your style dictionary. It filters your
design tokens by `token.type === 'time'`

It is recommended to use the 'android/resources' format with a custom filter
instead of this format:

```javascript title="config.js"
format: formats.androidResources, // formats enum for string 'android/resources'
filter: {
  type: 'time'
}
```

Example:

```xml title="integers.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
  <integer name="time_duration_short">1000</integer>
  <integer name="time_duration_medium">2000</integer>
  <integer name="time_duration_long">4000</integer>
```

---

### android/strings

Creates a resource xml file with all the strings in your style dictionary. Filters your
design tokens by `token.type === 'content'`

It is recommended to use the 'android/resources' format with a custom filter
instead of this format:

```javascript title="config.js"
format: formats.androidResources, // formats enum for string 'android/resources'
filter: {
  type: 'content'
}
```

Example:

```xml title="icons.xml"
<?xml version="1.0" encoding="UTF-8"?>
<resources>
  <string name="content_icon_email">&#xE001;</string>
  <string name="content_icon_chevron_down">&#xE002;</string>
  <string name="content_icon_chevron_up">&#xE003;</string>
```

---

### compose/object

Creates a Kotlin file for Compose containing an object with a `val` for each property.

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `Object`                              |                                                                                                                                                                                                                                    |
| `options.import`           | `string[] \| string`                  | Modules to import. Can be a string or array of strings. Defaults to `['androidx.compose.ui.graphics.Color', 'androidx.compose.ui.unit.*']`.                                                                                        |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |
| `options.className`        | `string`                              | The name of the generated Kotlin object                                                                                                                                                                                            |
| `options.packageName`      | `string`                              | The package for the generated Kotlin object                                                                                                                                                                                        |
| `options.accessControl`    | `string`                              | Level of access of the generated compose properties and object. Defaults to `''`.                                                                                                                                                  |
| `options.objectType`       | `string`                              | Type of Kotlin object. Defaults to `''` (regular object).                                                                                                                                                                          |

Example:

```kotlin title="vars.kt"
package com.example.tokens;

import androidx.compose.ui.graphics.Color

object StyleDictionary {
 val colorBaseRed5 = Color(0xFFFAF3F2)
}
```

---

### ios/macros

Creates an Objective-C header file with macros for design tokens

Example:

```swift title="macros.swift"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#define ColorFontLink [UIColor colorWithRed:0.00f green:0.47f blue:0.80f alpha:1.00f]
#define SizeFontTiny 176.00f
```

---

### ios/plist

Creates an Objective-C plist file

**Todo**

- Fix this template and add example and usage

---

### ios/singleton.m

Creates an Objective-C implementation file of a style dictionary singleton class

**Todo**

- Add example and usage

---

### ios/singleton.h

Creates an Objective-C header file of a style dictionary singleton class

**Todo**

- Add example and usage

---

### ios/static.h

Creates an Objective-C header file of a static style dictionary class

**Todo**

- Add example and usage

---

### ios/static.m

Creates an Objective-C implementation file of a static style dictionary class

**Todo**

- Add example and usage

---

### ios/colors.h

Creates an Objective-C header file of a color class

**Todo**

- Add example and usage

---

### ios/colors.m

Creates an Objective-C implementation file of a color class

**Todo**

- Add example and usage

---

### ios/strings.h

Creates an Objective-C header file of strings

**Todo**

- Add example and usage

---

### ios/strings.m

Creates an Objective-C implementation file of strings

**Todo**

- Add example and usage

---

### ios-swift/class.swift

Creates a Swift implementation file of a class with values. It adds default `class` object type, `public` access control and `UIKit` import.

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `Object`                              |                                                                                                                                                                                                                                    |
| `options.accessControl`    | `string`                              | Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object. Defaults to `public`.                                                                                         |
| `options.import`           | `string[] \| string`                  | Modules to import. Can be a string or array of strings. Defaults to `'UIKit'`.                                                                                                                                                     |
| `options.className`        | `string`                              | The name of the generated Swift object                                                                                                                                                                                             |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |

Example:

```swift title="colors.swift"
public class StyleDictionary {
  public static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
}
```

---

### ios-swift/enum.swift

Creates a Swift implementation file of an enum with values. It adds default `enum` object type, `public` access control and `UIKit` import.

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `Object`                              |                                                                                                                                                                                                                                    |
| `options.accessControl`    | `string`                              | Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object. Defaults to `public`.                                                                                         |
| `options.import`           | `string[] \| string`                  | Modules to import. Can be a string or array of strings. Defaults to `'UIKit'`.                                                                                                                                                     |
| `options.className`        | `string`                              | The name of the generated Swift object                                                                                                                                                                                             |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |

Example:

```swift title="colors.swift"
public enum StyleDictionary {
  public static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
}
```

---

### ios-swift/any.swift

Creates a Swift implementation file of any given type with values. It has by default `class` object type, `public` access control and `UIKit` import.

```javascript title="config.js"
format: 'ios-swift/any.swift',
import: ['UIKit', 'AnotherModule'],
objectType: 'struct',
accessControl: 'internal',
```

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `Object`                              |                                                                                                                                                                                                                                    |
| `options.accessControl`    | `string`                              | Level of [access](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html) of the generated swift object. Defaults to `public`.                                                                                         |
| `options.import`           | `string[] \| string`                  | Modules to import. Can be a string or array of strings. Defaults to `'UIKit'`.                                                                                                                                                     |
| `options.className`        | `string`                              | The name of the generated Swift object                                                                                                                                                                                             |
| `options.objectType`       | `string`                              | The type of the generated Swift object. Defaults to `'class'`.                                                                                                                                                                     |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |

Example:

```swift title="colors.swift"
import UIKit
import AnotherModule

internal struct StyleDictionary {
  internal static let colorBackgroundDanger = UIColor(red: 1.000, green: 0.918, blue: 0.914, alpha: 1)
}
```

---

### css/fonts.css

Creates CSS file with @font-face declarations

**Todo**

- Add example and usage

---

### json

Creates a JSON file of the style dictionary.

| Param                     | Type                | Description                                                                                                                                                                                               |
| ------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `Object`            |                                                                                                                                                                                                           |
| `options.stripMeta`       | `Object \| boolean` | Control whether meta data is stripped from the output tokens. `false` by default. If set to `true`, will strip known Style Dictionary meta props: `['attributes', 'filePath', 'name', 'path', 'comment']` |
| `options.stripMeta.keep`  | `string[]`          | Array of property keys to keep in the output.                                                                                                                                                             |
| `options.stripMeta.strip` | `string[]`          | Array of property keys to strip from the output.                                                                                                                                                          |

Live Demo:

~ sd-playground

```json tokens
{
  "color": {
    "base": {
      "red": {
        "value": "#ff0000",
        "type": "color"
      }
    }
  }
}
```

```js config
export default {
  platforms: {
    json: {
      files: [
        {
          destination: 'output.json',
          format: 'json',
          options: {
            stripMeta: {
              keep: ['value'],
            },
          },
        },
      ],
    },
  },
};
```

---

### json/asset

Creates a JSON file of the assets defined in the style dictionary.

Example:

```json title="assets.json"
{
  "asset": {
    "image": {
      "logo": {
        "value": "assets/logo.png"
      }
    }
  }
}
```

---

### json/nested

Creates a JSON nested file of the style dictionary.

Example:

```json title="vars.json"
{
  "color": {
    "base": {
      "red": "#ff0000"
    }
  }
}
```

---

### json/flat

Creates a JSON flat file of the style dictionary.

Example:

```json title="vars.json"
{
  "color-base-red": "#ff0000"
}
```

---

### sketch/palette

Creates a sketchpalette file of all the base colors

Example:

```json title="palette.json"
{
  "compatibleVersion": "1.0",
  "pluginVersion": "1.1",
  "colors": ["#ffffff", "#ff0000", "#fcfcfc"]
}
```

---

### sketch/palette/v2

Creates a sketchpalette file compatible with version 2 of
the sketchpalette plugin. To use this you should use the
'color/sketch' transform to get the correct value for the colors.

Example:

```json title="palette-2.json"
{
  "compatibleVersion": "2.0",
  "pluginVersion": "2.2",
  "colors": [
    { "name": "red", "r": 1.0, "g": 0.0, "b": 0.0, "a": 1.0 },
    { "name": "green", "r": 0.0, "g": 1.0, "b": 0.0, "a": 1.0 },
    { "name": "blue", "r": 0.0, "g": 0.0, "b": 1.0, "a": 1.0 }
  ]
}
```

---

### flutter/class.dart

Creates a Dart implementation file of a class with values

| Param                      | Type                                  | Description                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options.showFileHeader`   | `boolean`                             | Whether or not to include a comment that has the build date. Defaults to `true`                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | Whether or not to keep [references](/reference/hooks/formats#references-in-output-files) (a -> b -> c) in the output. Defaults to `false`. Also allows passing a function to conditionally output references on a per token basis. |
| `options.className`        | `string`                              | The name of the generated Dart Class                                                                                                                                                                                               |

Example:

```dart title="tokens.dart"
import 'package:flutter/material.dart';

class StyleDictionary {
  StyleDictionary._();

    static const colorBrandPrimary = Color(0x00ff5fff);
    static const sizeFontSizeMedium = 16.00;
    static const contentFontFamily1 = "NewJune";
```

---
