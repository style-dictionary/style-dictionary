---
title: Format Helpers
---

We provide some helper methods we use internally in some of the built-in formats to make building custom formats a bit easier.

They are accessible at `style-dictionary/utils` entrypoint.

```javascript
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { propertyFormatNames } from 'style-dictionary/enums';

StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: async ({ dictionary, file, options }) => {
    const { outputReferences, sort } = options;
    const header = await fileHeader({ file });
    return (
      header +
      ':root {\n' +
      formattedVariables({
        format: propertyFormatNames.css,
        dictionary,
        outputReferences,
        sort, // 'name' | ['name'] | [customFn, 'name'] | (a, b) => number
      }) +
      '\n}\n'
    );
  },
});
```

Here are the available format helper methods:

### createPropertyFormatter

Creates a function that can be used to format a property. This can be useful
to use as the function on `dictionary.allTokens.map`. The formatting
is configurable either by supplying a `format` option or a `formatting` object
which uses: prefix, indentation, separator, suffix, and commentStyle.

| Param                                    | Type                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                                | `Object`                              | A single argument to support named parameters and destructuring.                                                                                                                                                                                                                                                                                                                                                                                           |
| `options.outputReferences`               | `boolean \| OutputReferencesFunction` | Whether or not to output references. You will want to pass this from the `options` object sent to the format function. Also allows passing a function to conditionally output references on a per token basis.                                                                                                                                                                                                                                             |
| `options.outputReferenceFallbacks`       | `boolean`                             | Whether or not to output css variable fallback values when using output references. You will want to pass this from the `options` object sent to the format function.                                                                                                                                                                                                                                                                                      |
| `options.dictionary`                     | `Dictionary`                          | Transformed Dictionary object containing allTokens, tokens and unfilteredTokens.                                                                                                                                                                                                                                                                                                                                                                           |
| `options.dictionary.tokens`              | `TransformedTokens`                   | All tokens, still in unflattened object format.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `options.dictionary.allTokens`           | `TransformedToken[]`                  | Flattened array of all tokens, easiest to loop over and export to a flat format.                                                                                                                                                                                                                                                                                                                                                                           |
| `options.dictionary.tokenMap`            | `Record<string, TransformedToken>`    | All tokens as JavaScript. Map                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `options.dictionary.unfilteredTokens`    | `TransformedTokens`                   | All tokens, still in unflattened object format, including tokens that were filtered out by filters.                                                                                                                                                                                                                                                                                                                                                        |
| `options.dictionary.unfilteredAllTokens` | `TransformedToken[]`                  | Flattened array of all tokens, easiest to loop over and export to a flat, including tokens that were filtered out by filters.                                                                                                                                                                                                                                                                                                                              |
| `options.dictionary.unfilteredTokenMap`  | `Record<string, TransformedToken>`    | All tokens as JavaScript Map, still in unflattened object format, including tokens that were filtered out by filters.                                                                                                                                                                                                                                                                                                                                      |
| `options.format`                         | `string`                              | Available formats are: 'css', 'sass', 'less', and 'stylus'. If you want to customize the format and can't use one of those predefined formats, use the `formatting` option                                                                                                                                                                                                                                                                                 |
| `options.formatting`                     | `FormattingOptions`                   | Custom formatting properties that define parts of a declaration line in code. The configurable strings are: `prefix`, `indentation`, `separator`, `suffix`, `lineSeparator`, `fileHeaderTimestamp`, `header`, `footer`, `commentStyle` and `commentPosition`. Those are used to generate a line like this: `${indentation}${prefix}${token.name}${separator} ${prop.value}${suffix}`. The remaining formatting options are used for the fileHeader helper. |
| `options.themeable`                      | `boolean`                             | Whether tokens should default to being themeable. Defaults to false.                                                                                                                                                                                                                                                                                                                                                                                       |
| `options.usesDtcg`                       | `boolean`                             | Whether tokens use the DTCG standard. Defaults to `false`                                                                                                                                                                                                                                                                                                                                                                                                  |

Example:

```javascript title="build-tokens.js"
import { propertyFormatNames } from 'style-dictionary/enums';

StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    const { outputReferences } = options;
    const formatProperty = createPropertyFormatter({
      outputReferences,
      dictionary,
      format: propertyFormatNames.css,
    });
    return dictionary.allTokens.map(formatProperty).join('\n');
  },
});
```

---

### fileHeader

This is for creating the comment at the top of generated files with the generated at date.
It will use the custom file header if defined on the configuration, or use the
default file header.

| Param                     | Type                             | Description                                                                                                                                                                                                                                                   |
| ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                 | `Object`                         |                                                                                                                                                                                                                                                               |
| `options.file`            | [`File`](/reference/config#file) | The file object that is passed to the format.                                                                                                                                                                                                                 |
| `options.commentStyle`    | `string`                         | The only options are `'short'`, `'xml'` and `'long'`, which will use the `//`, `<!-- -->` or `/*` style comments respectively. Defaults to `'long'`. There is an [enum-like JS object](/reference/enums#comment-styles) `commentStyles` available for import. |
| `options.commentPosition` | `string`                         | `'above'` or `'inline'`, so either above the token or inline with the token. There is an [enum-like JS object](/reference/enums#comment-positions) `commentPositions` available for import.                                                                   |
| `options.formatting`      | `Object`                         | Custom formatting properties that define parts of a comment in code. The configurable strings are: `prefix`, `lineSeparator`, `header`, `footer` and `fileHeaderTimestamp`.                                                                                   |

Example:

```js title="build-tokens.js"
import { commentStyles } from 'style-dictionary/enums';

StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: async ({ dictionary, file }) => {
    const header = await fileHeader({ file, commentStyle: commentStyles.short });
    return (
      header + dictionary.allTokens.map((token) => `${token.name} = ${token.value};`).join('\n')
    );
  },
});
```

Use `options.formatting.fileHeaderTimestamp` set to `true` to create a fileHeader that contains a timestamp for when the file was created.
This used to be default behavior but was made opt-in to accompany the common use case of Style Dictionary running in Continuous Integration (CI) pipelines,
and not wanting to create redundant git diffs just because of the timestamp changing between versions.

---

### formattedVariables

This is used to create lists of variables like Sass variables or CSS custom properties

| Param                                 | Type                                  | Description                                                                                                                                                                                                    |
| ------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                             | `Object`                              |                                                                                                                                                                                                                |
| `options.format`                      | `string`                              | What type of variables to output. Options are: `'css'`, `'sass'`, `'less'`, and `'stylus'`.                                                                                                                    |
| `options.dictionary`                  | `Dictionary`                          | Transformed Dictionary object containing `allTokens`, `tokens` and `unfilteredTokens`.                                                                                                                         |
| `options.dictionary.allTokens`        | `TransformedToken[]`                  | Flattened array of all tokens, easiest to loop over and export to a flat format.                                                                                                                               |
| `options.dictionary.tokens`           | `TransformedTokens`                   | All tokens, still in unflattened object format.                                                                                                                                                                |
| `options.dictionary.unfilteredTokens` | `TransformedTokens`                   | All tokens, still in unflattened object format, including tokens that were filtered out by filters.                                                                                                            |
| `options.outputReferences`            | `boolean \| OutputReferencesFunction` | Whether or not to output references. You will want to pass this from the `options` object sent to the format function. Also allows passing a function to conditionally output references on a per token basis. |
| `options.formatting`                  | `Object`                              | Custom formatting properties that define parts of a comment in code. The configurable strings are: `prefix`, `lineSeparator`, `header`, and `footer`.                                                          |
| `options.themeable`                   | `boolean`                             | Whether tokens should default to being themeable. Defaults to `false`.                                                                                                                                         |
| `options.usesDtcg`                    | `boolean`                             | Whether tokens use the DTCG standard. Defaults to `false`                                                                                                                                                      |
| `options.sort`                        | `SortOption`                          | Optional sorting strategy. Use `'name'` to sort alphabetically by token name or a custom comparator function `(a: Token, b: Token) => -1                                                                       | 1   | 0`. You can chain multiple sorters with an array of sorters (e.g., `[customFn, 'name']`). When `outputReferences`is`true`, reference-safe ordering is automatically enforced first, and your sort acts as a tie-breaker. Defaults to no sorting. |

Example:

```js title="build-tokens.js"
import { propertyFormatNames } from 'style-dictionary/enums';

StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    return formattedVariables({
      format: propertyFormatNames.less,
      dictionary,
      outputReferences: options.outputReferences,
      sort: options.sort,
    });
  },
});
```

---

### getTypeScriptType

Given some value, returns a basic valid TypeScript type for that value.
Supports numbers, strings, booleans, arrays and objects of any of those types.

Returns: `string` - A valid name for a TypeScript type.

| Param                          | Type      | Description                                              |
| ------------------------------ | --------- | -------------------------------------------------------- |
| `value`                        | `any`     | A value to check the type of.                            |
| `options`                      | `Object`  |                                                          |
| `options.outputStringLiterals` | `boolean` | Whether or not to output literal types for string values |

Example:

```javascript title="build-tokens.js"
StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    return dictionary.allTokens
      .map(function (prop) {
        var to_ret_prop = 'export const ' + prop.name + ' : ' + getTypeScriptType(prop.value) + ';';
        if (prop.comment) to_ret_prop = to_ret_prop.concat(' // ' + prop.comment);
        return to_ret_prop;
      })
      .join('\n');
  },
});
```

---

### iconsWithPrefix

This is used to create CSS (and CSS pre-processor) lists of icons. It assumes you are
using an icon font and creates helper classes with the :before pseudo-selector to add
a unicode character.
**You probably don't need this.**

| Param       | Type                 | Description                                                                      |
| ----------- | -------------------- | -------------------------------------------------------------------------------- |
| `prefix`    | `string`             | Character to prefix variable names, like `$` for Sass                            |
| `allTokens` | `TransformedToken[]` | Flattened array of all tokens, easiest to loop over and export to a flat format. |
| `options`   | `Object`             | options object passed to the format function.                                    |

Example:

```js title="build-tokens.js"
StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    return iconsWithPrefix('$', dictionary.allTokens, options);
  },
});
```

---

### minifyDictionary

Outputs an object stripping out everything except values

| Param | Type                | Description                                                                           |
| ----- | ------------------- | ------------------------------------------------------------------------------------- |
| `obj` | `TransformedTokens` | The object to minify. You will most likely pass <code>dictionary.tokens</code> to it. |

Example:

```js title="build-tokens.js"
StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary }) {
    return JSON.stringify(minifyDictionary(dictionary.tokens));
  },
});
```

---

### setComposeObjectProperties

Outputs an object for compose format configurations. Sets import.

| Param     | Type     | Description                                  |
| --------- | -------- | -------------------------------------------- |
| `options` | `Object` | The options object declared at configuration |

---

### setSwiftFileProperties

Outputs an object with swift format configurations. Sets import, object type and access control.

| Param        | Type     | Description                                                                    |
| ------------ | -------- | ------------------------------------------------------------------------------ |
| `options`    | `Object` | The options object declared at configuration                                   |
| `objectType` | `string` | The type of the object in the final file. Could be a class, enum, struct, etc. |
| `options`    | `string` | The transformGroup of the file, so it can be applied proper import             |

---

### sortByName

A sorting function to be used when iterating over `dictionary.allTokens` in
a format.

**Returns**: `Integer` - `-1` or `1` depending on which element should come first based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

| Param | Type  | Description                   |
| ----- | ----- | ----------------------------- |
| `a`   | `any` | first element for comparison  |
| `b`   | `any` | second element for comparison |

Example:

```javascript title="build-tokens.js"
StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    return dictionary.allTokens
      .sort(sortByName)
      .map((token) => `${token.name} = ${token.value}`)
      .join('\n');
  },
});
```

---

### sortByReference

A function that returns a sorting function to be used with Array.sort that
will sort the allTokens array based on references. This is to make sure
if you use output references that you never use a reference before it is
defined.

| Param                         | Type                 | Description                                                                                         |
| ----------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| `dictionary`                  | `Dictionary`         | Transformed Dictionary object containing allTokens, tokens and unfilteredTokens.                    |
| `dictionary.allTokens`        | `TransformedToken[]` | Flattened array of all tokens, easiest to loop over and export to a flat format.                    |
| `dictionary.tokens`           | `TransformedTokens`  | All tokens, still in unflattened object format.                                                     |
| `dictionary.unfilteredTokens` | `TransformedTokens`  | All tokens, still in unflattened object format, including tokens that were filtered out by filters. |

Example:

```javascript title="build-tokens.js"
dictionary.allTokens.sort(sortByReference(dictionary));
```
