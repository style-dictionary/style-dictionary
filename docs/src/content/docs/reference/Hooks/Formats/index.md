---
title: Formats
sidebar:
  label: Overview
---

Formats define the output of your created files. For example, to use your styles in CSS
you use the `css/variables` format. This will create a CSS file containing the variables from
your style dictionary.

## Using formats

You use formats in your config file under `platforms` > `[Platform]` > `files` > `[File]` > `format`.

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "files": [
        {
          "format": "css/variables",
          "destination": "variables.css"
        }
      ]
    }
  }
}
```

There is an extensive (but not exhaustive) list of [built-in formats](/reference/hooks/formats/predefined) available in Style Dictionary.

## Format configuration

Formats can take configuration to make them more flexible. This allows you to re-use the same format multiple times with different configurations or to allow the format to use data not defined in the tokens themselves. To configure a format, add extra attributes on the file `options` in your configuration like the following:

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "scss": {
      "transformGroup": "scss",
      "files": [
        {
          "destination": "map.scss",
          "format": "scss/map-deep",
          "options": {
            "mapName": "my-tokens"
          }
        }
      ]
    }
  }
}
```

In this example we are adding the `mapName` configuration to the `scss/map-deep` format. This will change the name of the SCSS map in the output. Not all formats have the configuration options; format configuration is defined by the format itself. To see the configuration options of a format, take a look at the documentation of the [specific format](/reference/hooks/formats/predefined).

## Filtering tokens

A special file configuration is [`filter`](/reference/hooks/filters), which will filter the tokens before they get to the format.
This allows you to re-use the same format to generate multiple files with different sets of tokens.
Filtering tokens works by adding a `filter` attribute on the file object, where `filter` is:

- An object which gets passed to [Lodash's filter method](https://lodash.com/docs/4.17.14#filter).
- A string that references the name of a registered [`filter`](/reference/hooks/filters), using the [`registerFilter`](/reference/api#registerfilter) method
- A function that takes a token and returns a boolean if the token should be included (true) or excluded (false). **This is only available if you are defining your configuration in Javascript.**

```javascript
{
  "destination": "destination",
  "format": "myCustomFormat",
  "filter": "myCustomFilter", // a named filter defined with .registerFilter
  "filter": function(token) {}, // an inline function
  "filter": {} // an object pass to lodash's filter method
}
```

The design token that is passed to the filter function has already been [transformed](/reference/hooks/transforms) and has [default metadata](/info/tokens#default-design-token-metadata) added by Style Dictionary.

## References in output files

Some formats can keep the references in the output. This is a bit hard to explain, so let's look at an example. Say you have this very basic set of design tokens:

```json
// tokens.json
{
  "color": {
    "red": { "value": "#ff0000" },
    "danger": { "value": "{color.red}" },
    "error": { "value": "{color.danger}" }
  }
}
```

With this configuration:

```json
// config.json
{
  "source": ["tokens.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "files": [
        {
          "destination": "variables.css",
          "format": "css/variables",
          "options": {
            // Look here 👇
            "outputReferences": true
          }
        }
      ]
    }
  }
}
```

This would be the output:

```css title="variables.css"
:root {
  --color-red: #ff0000;
  --color-danger: var(--color-red);
  --color-error: var(--color-danger);
}
```

The css variables file now keeps the references you have in your Style Dictionary! This is useful for outputting themeable and dynamic code.

Without `outputReferences: true` Style Dictionary would resolve all references and the output would be:

```css title="variables.css"
:root {
  --color-red: #ff0000;
  --color-danger: #ff0000;
  --color-error: #ff0000;
}
```

It is also possible to provide a function instead of `true` or `false` to `outputReferences`, if you need to conditionally output references on a per token basis.

```js
// config.js
import { formats, transformGroups } from 'style-dictionary/enums';

export default {
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      files: [
        {
          destination: 'variables.css',
          format: formats.cssVariables,
          options: {
            // Look here 👇
            outputReferences: (token, { dictionary, usesDtcg }) => {
              // `dictionary` contains `allTokens`, `tokens`, `tokenMap`, `unfilteredTokens`, `unfilteredAllTokens` and `unfilteredTokenMap` props
              // `usesDtcg` tells you whether the Design Token Community Group spec is used with $ prefixes ($value, $type etc.)
              // return true or false
            },
          },
        },
      ],
    },
  },
};
```

Not all formats use the `outputReferences` option because that file format might not support it (like JSON for example). The current list of formats that handle `outputReferences`:

- [css/variables](/reference/hooks/formats/predefined/#cssvariables)
- [scss/variables](/reference/hooks/formats/predefined/#scssvariables)
- [less/variables](/reference/hooks/formats/predefined/#lessvariables)
- [android/resources](/reference/hooks/formats/predefined/#androidresources)
- [compose/object](/reference/hooks/formats/predefined/#composeobject)
- [ios-swift/class.swift](/reference/hooks/formats/predefined/#ios-swiftclassswift)
- [flutter/class.dart](/reference/hooks/formats/predefined/#flutterclassdart)

You can create custom formats that output references as well. See the [Custom format with output references](#custom-format-with-output-references) section.

### Filtering out references

When combining [`filters`](/reference/hooks/filters) with `outputReferences`, it could happen that a token is referencing another token that is getting filtered out.
When that happens, Style Dictionary will throw a warning. However, it is possible to configure `outputReferences` to use [our `outputReferencesFilter` utility function](/reference/utils/references/#outputreferencesfilter), which will prevent tokens that reference other tokens that are filtered out from outputting references, they will output the resolved values instead.

### outputReferences with transitive transforms

When combining [transitive value transforms](/reference/hooks/transforms/#transitive-transforms) with `outputReferences`,
it could happen that a token that contains references has also been transitively transformed.
What this means is that putting back the references in the output would mean we are undoing that work.
In this scenario, it's often preferable not to output a reference.

There is an [`outputReferencesTransformed`](/reference/utils/references/#outputreferencestransformed) utility function that takes care of checking if this happened and not outputting refs for tokens in this scenario.

## File headers

By default Style Dictionary adds a file header comment in the top of files built using built-in formats like this:

```js title="variables.js"
// Do not edit directly
// Generated on Sat, 01 Jan 2000 00:00:00 GMT
```

You can remove these comments with the option: `showFileHeader: false` if you do not want them in your generated files. You can also create your own file header or extend the default one. This could be useful if you want to put a version number or hash of the source files rather than a timestamp.

Custom file headers can be added the same way you would add a custom format, either by using the [`registerFileHeader`](/reference/api#registerfileheader) function or adding the [`fileHeader`](/reference/hooks/file-headers) object directly in the Style Dictionary [configuration](/reference/config). Your custom file header can be used in built-in formats as well as custom formats. To use a custom file header in a custom format see the [`fileHeader`](/reference/hooks/file-headers) format helper method.

```js title="build-tokens.js"
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFileHeader({
  name: 'myCustomHeader',
  // This can be an async function as well
  fileHeader: (defaultMessage) => {
    // defaultMessage are the 2 lines above that appear in the default file header
    // you can use this to add a message before or after the default message 👇

    // the fileHeader function should return an array of strings
    // which will be formatted in the proper comment style for a given format
    return [...defaultMessage, `hello?`, `is it me you're looking for?`];
  },
});
```

Then you can use your custom file header in a file similar to a custom format:

```json title="config.json"
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "files": [
        {
          "destination": "variables.css",
          "format": "css/variables",
          "options": {
            "fileHeader": "myCustomHeader"
          }
        }
      ]
    }
  }
}
```

Which should output a file that will start like this:

```css title="variables.css"
/**
 * Do not edit directly
 * Generated on Thu, 18 Mar 2021 21:30:47 GMT
 * hello?
 * is it me you're looking for?
 */
```

## Custom formats

You can create custom formats using the [`registerFormat`](/reference/api#registerformat) function or by directly including them in your [configuration](/reference/config). A format has a name and a format function, which takes an object as the argument and should return a string which is then written to a file.

### format

`format.format(args)` ⇒ `unknown`

The format function that is called when Style Dictionary builds files.

:::tip
You might be wondering why the return type of a format function is `unknown`.
[More information about this here](#custom-return-types)
:::

| Param                                 | Type                               | Description                                                                                                           |
| ------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `args`                                | `Object`                           | A single argument to support named parameters and destructuring.                                                      |
| `args.dictionary`                     | `Dictionary`                       | Transformed Dictionary object containing allTokens, tokens and unfilteredTokens.                                      |
| `args.dictionary.allTokens`           | `TransformedToken[]`               | Flattened array of all tokens, easiest to loop over and export to a flat format.                                      |
| `args.dictionary.tokens`              | `TransformedTokens`                | All tokens, still in unflattened object format.                                                                       |
| `args.dictionary.tokenMap`            | `Record<string, TransformedToken>` | All tokens as a JavaScript Map that's keyed, making it easy to access a single token as well as iterate through them. |
| `args.dictionary.unfilteredAllTokens` | `TransformedToken[]`               | Flattened array of all tokens, including tokens that were filtered out by filters.                                    |
| `args.dictionary.unfilteredTokens`    | `TransformedTokens`                | All tokens, still in unflattened object format, including tokens that were filtered out by filters.                   |
| `args.dictionary.unfilteredTokenMap`  | `TransformedTokens`                | All tokens as a JavaScript Map, including tokens that were filtered out by filters.                                   |
| `args.platform`                       | `Platform`                         | [Platform config](/reference/config#platform)                                                                         |
| `args.file`                           | `File`                             | [File config](/reference/config#file)                                                                                 |
| `args.options`                        | `Object`                           | Merged object with SD [Config](/reference/config#properties) & [FormatOptions](#format-configuration)                 |

Example:

```js
StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, platform, options, file }) {
    return JSON.stringify(dictionary.tokens, null, 2);
  },
});
```

---

To use your custom format, you call it by name in the file configuration object:

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "options": {
        "showFileHeader": true
      },
      "transformGroup": "css",
      "files": [
        {
          "destination": "destination",
          "format": "myCustomFormat",
          "options": {
            "showFileHeader": false
          }
        }
      ]
    }
  }
}
```

It is recommended for any configuration needed for your custom format to use the `options` object. Style Dictionary will merge platform and file options so that in your Style Dictionary configuration you can specify options at a platform or file level. In the configuration above, the `options` object passed to the format would have `showFileHeader: false`.

## Custom return types

When writing outputs to the filesystem, the return type of the `format` function is always `string`.
However, since v4 you can return any data format and use [`SD.formatAllPlatforms`](/reference/api#formatallplatforms)
or [`SD.formatPlatform`](/reference/api#formatplatform) methods when you do not intend to write the output to the filesystem,
but want to do something custom with the output instead.

Note that when you have a format that returns something that isn't a string, you won't be able to use it with
[`buildPlatform`](/reference/api#buildplatform) or [`buildAllPlatforms`](/reference/api#buildallplatforms) methods,
because they are writing to the filesystem and you can't really write data to the filesystem that isn't a string/buffer/stream.

This also means that the `destination` property is therefore optional for formats that aren't ran by the `build` methods:

```json title="config.json"
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "options": {
        "showFileHeader": true
      },
      "transformGroup": "css",
      "files": [
        {
          "format": "format-that-returns-array"
        }
      ]
    }
  }
}
```

```js title="grabTokens.js"
const sd = new StyleDictionary('config.json');

const cssTokens = (await sd.formatPlatform('css')).output;
/**
 * Example:
 * [
 *   ["--colors-red-500", "#ff0000"],
 *   ["--colors-blue-500", "#0000ff"]
 * ]
 */
```

## Custom format with output references

To take advantage of outputting references in your custom formats there are 2 helper methods in the `dictionary` argument passed to your format function: `usesReference(value)` and `getReferences(value)`. Here is an example using those:

```javascript title="build-tokens.js"
import { usesReferences, getReferences } from 'style-dictionary/utils';

StyleDictionary.registerFormat({
  name: `es6WithReferences`,
  format: function ({ dictionary, options }) {
    const { usesDtcg, outputReferences } = options;
    return dictionary.allTokens
      .map((token) => {
        let value = JSON.stringify(token.value);
        const originalValue = token.original.value;
        // the `dictionary` object now has `usesReferences()` and
        // `getReferences()` methods. `usesReferences()` will return true if
        // the value has a reference in it. `getReferences()` will return
        // an array of references to the whole tokens so that you can access their
        // names or any other attributes.
        const shouldOutputRef =
          usesReferences(originalValue) &&
          (typeof outputReferences === 'function'
            ? outputReferences(token, { dictionary, usesDtcg })
            : outputReferences);

        if (shouldOutputRef) {
          // Note: make sure to use `originalValue` because
          // `token.value` is already resolved at this point.
          const refs = getReferences(originalValue, dictionary.tokens);
          let isEntirelyRef = refs.length === 1 && refs[0].value === value;
          refs.forEach((ref) => {
            // wrap in template literal ${} braces if the value is more than just entirely a reference
            value = value.replace(ref.value, isEntirelyRef ? ref.name : `\${${ref.name}}`);
          });
        }
        // if the value is not entirely a reference, we have to wrap in template literals
        return `export const ${token.name} = ${
          shouldOutputRef && !isEntirelyRef ? `\`${value}\`` : value
        };`;
      })
      .join(`\n`);
  },
});
```

---

## Using a template / templating engine to create a format

Formats are functions and created easily with most templating engines. Formats can be built using templates if there is a lot of boilerplate code to insert (e.g. ObjectiveC files). If the output consists of only the values (e.g. a flat SCSS variables file), writing a format function directly may be easier.

Any templating language can work as long as there is a node module for it. All you need to do is register a format that calls your template and returns a string.

Our recommendation is to use Template Literals for this as the easiest way to accomplish this:

```js title="build-tokens.js"
import StyleDictionary from 'style-dictionary';

// Very simplistic/naive custom CSS format, just as an example, for CSS you should prefer using our predefined formats
const template = ({ dictionary, file, options, platform }) => `:root {
${dictionary.allTokens.map(token => `  ${token.name}`: `"${token.value}"`).join('\n')}
}
`;

StyleDictionary.registerFormat({
  name: 'my/format',
  format: template,
});

// format: 'my/format' is now available for use...
```

Here is a quick example for Lodash templates.

```js title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import _ from 'lodash-es';
import fs from 'node:fs';

const template = _.template(fs.readFileSync('templates/myFormat.template'));

StyleDictionary.registerFormat({
  name: 'my/format',
  format: template,
});

// format: 'my/format' is now available for use...
```

And another example for Handlebars.

```js title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import Handlebars from 'handlebars';

const template = Handlebars.compile(fs.readFileSync('templates/MyTemplate.hbs').toString());

StyleDictionary.registerFormat({
  name: 'my/format',
  format: function ({ dictionary, platform }) {
    return template({
      tokens: dictionary.tokens,
      options: platform,
    });
  },
});

// format: 'my/format' is now available for use...
```
