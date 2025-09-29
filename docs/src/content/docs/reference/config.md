---
title: Configuration
sidebar:
  order: 2
---

Style dictionaries are configuration driven. Your configuration lets Style Dictionary know:

1. Where to find your [design tokens](/info/tokens)
1. How to transform and format them to generate output files

Here is an example configuration:

```json title="config.json"
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "scss": {
      "transformGroup": "scss",
      "prefix": "sd",
      "buildPath": "build/scss/",
      "files": [
        {
          "destination": "_variables.scss",
          "format": "scss/variables"
        }
      ],
      "actions": ["copy_assets"]
    },
    "android": {
      "transforms": ["attribute/cti", "name/snake", "color/hex", "size/remToSp", "size/remToDp"],
      "buildPath": "build/android/src/main/res/values/",
      "files": [
        {
          "destination": "style_dictionary_colors.xml",
          "format": "android/colors"
        }
      ]
    }
  }
}
```

## Configuration file formats

Style Dictionary supports configuration files in these file formats:

- JSON
- JSONC
- JSON5
- Javascript (ES Modules, default export)

Here is an example using an ES module for configuration:

```javascript title="config.js"
export default {
  source: [`tokens/**/*.json`],
  // If you don't want to call the registerTransform method a bunch of times
  // you can override the whole transform object directly. This works because
  // the .extend method copies everything in the config
  // to itself, allowing you to override things. It's also doing a deep merge
  // to protect from accidentally overriding nested attributes.
  hooks: {
    transforms: {
      // Now we can use the transform 'myTransform' below
      myTransform: {
        type: transformTypes.name,
        transform: (token) => token.path.join('_').toUpperCase(),
      },
    },
    // Same with formats, you can now write them directly to this config
    // object. The name of the format is the key.
    formats: {
      myFormat: ({ dictionary }) => {
        return dictionary.allTokens.map((token) => `${token.name}: ${token.value};`).join('\n');
      },
    },
  },
  platforms: {
    // ...
  },
};
```

Some interesting things you can do in a JS file that you cannot do in a JSON file:

- Add custom transforms, formats, filters, actions, preprocessors and parsers
- Programmatically generate your configuration

---

## Using configuration files

By default, the Style Dictionary [CLI](/getting-started/using_the_cli) looks for a `config.json` or `config.js` file in the root of your package.

```json5
// package.json
"scripts": {
  "build": "style-dictionary build"
}
```

You can also specify a custom location when you use the [CLI](/getting-started/using_the_cli) with the `--config` parameter.

```json5
// package.json
"scripts": {
  "build": "style-dictionary build --config ./sd.config.js"
}
```

## Using in Node

You can also use Style Dictionary as an [npm module](/getting-started/using_the_npm_module) and further customize how Style Dictionary is run, for example running Style Dictionary multiple times with different configurations. To do this you would create a Javascript file that imports the Style Dictionary npm module and calls the [`.extend`](/reference/api#extend) and [`.buildAllPlatforms`](/reference/api#buildallplatforms) functions.

```javascript
// build-tokens.js
import StyleDictionary from 'style-dictionary';

const myStyleDictionary = new StyleDictionary({
  // configuration
});

await myStyleDictionary.buildAllPlatforms();

// You can also extend Style Dictionary multiple times:
const myOtherStyleDictionary = await myStyleDictionary.extend({
  // new configuration
});

await myOtherStyleDictionary.buildAllPlatforms();
```

You would then change your npm script or CLI command to run that file with Node:

```json5
// package.json
"scripts": {
  "build": "node build-tokens.js"
}
```

---

## Properties

| Property        | Type                       | Description                                                                                                                                                                                                                                                                                                                                                                                                     |
| :-------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `log`           | `Log`                      | [Configure logging behavior](/reference/logging) to either reduce/silence logs or to make them more verbose for debugging purposes.                                                                                                                                                                                                                                                                             |
| `source`        | `string[]`                 | An array of file path [globs](https://github.com/isaacs/node-glob) to design token files. Style Dictionary will do a deep merge of all of the token files, allowing you to organize your files however you want. Supports JSON, JSON5, JavaScript ESM (default export object) token files. TypeScript file is natively supported as well with Bun, Deno or NodeJS >= 22.6.0 + `--experimental-strip-types` flag |
| `include`       | `string[]`                 | An array of file path [globs](https://github.com/isaacs/node-glob) to design token files that contain default styles. Style Dictionary uses this as a base collection of design tokens. The tokens found using the "source" attribute will overwrite tokens found using include.                                                                                                                                |
| `tokens`        | `Object`                   | The tokens object is a way to include inline design tokens as opposed to using the `source` and `include` arrays.                                                                                                                                                                                                                                                                                               |
| `expand`        | `ExpandConfig`             | Configures whether and how composite (object-value) tokens will be expanded into separate tokens. `false` by default. Supports either `boolean`, `ExpandFilter` function or an Object containing a `typesMap` property and optionally an `include` OR `exclude` property.                                                                                                                                       |
| `platforms`     | `Record<string, Platform>` | An object containing [platform](#platform) config objects that describe how the Style Dictionary should build for that platform. You can add any arbitrary attributes on this object that will get passed to formats and actions (more on these in a bit). This is useful for things like build paths, name prefixes, variable names, etc.                                                                      |
| `hooks`         | `Hooks` object             | Object that contains all configured custom hooks: `preprocessors`. Note: `parsers`, `transforms`, `transformGroups`, `formats`, `fileHeaders`, `filters`, `actions` will be moved under property this later. Can be used to define hooks inline as an alternative to using `register<Hook>` methods.                                                                                                            |
| `parsers`       | `string[]`                 | Names of custom [file parsers](/reference/hooks/parsers) to run on input files                                                                                                                                                                                                                                                                                                                                  |
| `preprocessors` | `string[]`                 | Which [preprocessors](/reference/hooks/preprocessors) (by name) to run on the full token dictionary, before any transforms run, can be registered using `.registerPreprocessor`. You can also configure this on the platform config level if you need to run it on the dictionary only for specific platforms.                                                                                                  |
| `usesDtcg`      | `boolean`                  | Whether the tokens are using [DTCG Format](https://tr.designtokens.org/format/) or not. Usually you won't need to configure this, as style-dictionary will auto-detect this format.                                                                                                                                                                                                                             |

### Log

Log configuration object to configure the [logging behavior of Style Dictionary](/reference/logging).

### Platform

A platform is a build target that tells Style Dictionary how to properly transform and format your design tokens for output to a specific platform. You can have as many platforms as you need and you can name them anything, there are no restrictions.

| Property         | Type           | Description                                                                                                                                                                                                                                                                                                 |
| :--------------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transforms`     | `string[]`     | An array of [transform](/reference/hooks/transforms) keys to be performed on the design tokens. These will transform the tokens in a non-destructive way, allowing each platform to transform the tokens. Transforms to apply sequentially to all tokens. Can be a built-in one or you can create your own. |
| `transformGroup` | `string`       | A string that maps to an array of transforms. This makes it easier to reference transforms by grouping them together. Can be combined with [transforms](/reference/hooks/transforms).                                                                                                                       |
| `buildPath`      | `string`       | Base path to build the files, must end with a trailing slash.                                                                                                                                                                                                                                               |
| `expand`         | `ExpandConfig` | Configures whether and how composite (object-value) tokens will be expanded into separate tokens. `false` by default. Supports either `boolean`, `ExpandFilter` function or an Object containing a `typesMap` property and optionally an `include` OR `exclude` property.                                   |
| `preprocessors`  | `string[]`     | Which [preprocessors](/reference/hooks/preprocessors) (by name) to run on the full token dictionary when building for this particular platform, before any transforms run, can be registered using `.registerPreprocessor`. You can also configure this on the global config.                               |
| `options`        | `Object`       | Options that apply to all files in the platform, for example [`outputReferences`](/reference/hooks/formats#references-in-output-files) and `showFileHeader`                                                                                                                                                 |
| `prefix`         | `string`       | A string that prefix the name of the design tokens.                                                                                                                                                                                                                                                         |
| `files`          | `File[]`       | [Files](#file) to be generated for this platform.                                                                                                                                                                                                                                                           |
| `actions`        | `string[]`     | [Actions](/reference/hooks/actions) to be performed after the files are built for that platform. Actions can be any arbitrary code you want to run like copying files, generating assets, etc. You can use pre-defined actions or create custom actions.                                                    |

### File

A File configuration object represents a single output file. The `options` object on the file configuration will take precedence over the `options` object defined at the platform level. Apart from the options listed below, any other options can be added, which can then be used inside custom [formats](/reference/hooks/formats).

| Property                   | Type                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `destination`              | `[string]`                            | Location to build the file, will be appended to the buildPath. Can be ommitted if [`formatPlatform`](/reference/api#formatplatform) / [`formatAllPlatforms`](/reference/api#formatallplatforms) is used, and you're not outputting to the filesystem, but rather to memory.                                                                                                                                                                                                                                                                      |
| `format`                   | `string`                              | [Format](/reference/hooks/formats) used to generate the file. Can be a built-in one or you can create your own via [registerFormat](/reference/api#registerformat).                                                                                                                                                                                                                                                                                                                                                                              |
| `filter`                   | `string \| function \| Object`        | A function, string or object used to filter the tokens that will be included in the file. If a function is provided, each design token will be passed to the function and the result (true or false) will determine whether the design token is included. If an object is provided, each design token will be matched against the object using a partial deep comparison. If a match is found, the design token is included. If a string is passed, is considered a custom filter registered via [registerFilter](/reference/api#registerfilter) |
| `options`                  | `Object`                              | A set of extra options associated with the file. Includes `showFileHeader` and [`outputReferences`](/reference/hooks/formats#references-in-output-files).                                                                                                                                                                                                                                                                                                                                                                                        |
| `options.showFileHeader`   | `boolean`                             | If the generated file should have a comment at the top about being generated. The default fileHeader comment has "Do not edit + Timestamp". By default is "true".                                                                                                                                                                                                                                                                                                                                                                                |
| `options.fileHeader`       | `string \|function`                   | A custom fileHeader that can be either a name of a registered file header (string) or an inline [fileHeader](/reference/hooks/formats#file-headers) function.                                                                                                                                                                                                                                                                                                                                                                                    |
| `options.outputReferences` | `boolean \| OutputReferencesFunction` | If the file should keep token [references](/reference/hooks/formats#references-in-output-files). By default this is "false". Also allows passing a function to conditionally output references on a per token basis.                                                                                                                                                                                                                                                                                                                             |

### Expand

You can configure whether and how composite (object-value) tokens will be expanded into separate tokens.
By default, this functionality is disabled and for formats such as CSS where object values are not supported, you'd be relying on either a [custom value transform](/reference/hooks/transforms/#defining-custom-transforms) to turn such token values into strings, or [writing a custom format](/reference/hooks/formats/#custom-formats) to format object values into CSS compatible values.

#### Expand usage

Below are examples of how the `expand` property can be used.

```js
{
  expand: true, // expand all object-value (composite) type tokens

  expand: {}, // equivalent to true

  // conditionally expand, executes this callback for each individual token
  expand: (token, config, platformConfig) => true,

  // equivalent to true, but additionally passing a typesMap
  expand: {
    typesMap: {
      width: 'dimension',
    },
  },

  // only expands typography and border tokens, also passes a typesMap
  expand: {
    include: ['typography', 'border'],
    // more info about typesMap later...
    typesMap: {
      // all width props are mapped to 'dimension' type
      width: 'dimension',
      typography: {
        // fontSize prop is mapped to 'dimension' type if inside a typography composite type token
        fontSize: 'dimension',
      },
    },
  },

  //  expands everything except for typography and border tokens
  expand: {
    exclude: ['typography', 'border'],
  },

  // only expands tokens for which this function returns true
  expand: {
    include: (token, config, platformConfig) => true,
  },

  // expands everything except for tokens for which this function returns true
  expand: {
    exclude: (token, config, platformConfig) => true,
  },
}
```

The value of expand can be multiple things:

- `boolean`, `false` by default, when set to `true`, any object-value (composite) design token will be expanded into multiple tokens, one for each property.
- a function of type `ExpandFilter`, e.g. `(token, options, platform) => true`, must return a `boolean`, when `true` will expand that individual token, arguments:
  - `token`: the design token of which the value is an object (composite)
  - `options`: the StyleDictionary config options
  - `platform`: this is only passed when expand is used on the platform level, contains the platform specific config options
- An object:
  - Empty, which is equivalent of passing `true`
  - Containing just a `typesMap`, which is also equivalent of passing `true`, except you're also passing the `typesMap`
  - Also containing an `include` or `exclude` property which can be either an array of composite types or an `ExpandFilter` function, to conditionally expand or negate expand of individual tokens

#### Global vs Platform

You can enable the expanding of tokens both on a global level and on a platform level.

Whether configured on platform or global level, the token expansion will happen immediately **after** user-configured [preprocessors](/reference/hooks/preprocessors) and **before** [transform](/reference/hooks/transforms) hooks.\
That said, platform expand happens only when calling `(get/export/format/build)Platform` methods for the specific platform, whereas global expand happens on StyleDictionary instantiation already.

Refer to the [lifecycle hooks diagram](/info/architecture) for a better overview.

When expanding globally, token metadata properties that are added by Style Dictionary such as `name`, `filePath`, `path`, `attributes` etc. are not present yet.\
The advantage of global expand however, is having the expanded tokens (`sd.tokens` prop) available before doing any exporting to platforms.

If you configure it on the platform level, the metadata mentioned earlier is available and can be used to conditionally expand tokens.
It also allows you to expand tokens for some platforms but not for others.\
The downside there is needing to configure it for every platform separately.

:::caution
It's also important to note that if you configure expansion on the global level, you cannot undo those token expansions by negating it in the platform-specific expand configs.
:::

#### Type Mapping

While our expand utility comes with a `typesMap` out of the box that aligns with the [Design Token Community Group spec](https://design-tokens.github.io/community-group/format/#composite-design-token) to convert composite subtype properties to [defined DTCG types](https://design-tokens.github.io/community-group/format/#types), you can also pass a custom `typesMap` that will allow you to extend or override it.
A `typesMap` allows you to configure how object-value (composite) properties in the original token value should be mapped to the newly expanded individual tokens.

For example:

```json title="tokens-input.json"
{
  "value": {
    "width": "2px",
    "style": "solid",
    "color": "#000"
  },
  "type": "border"
}
```

Here, according to the DTCG spec, you would probably want to map the `"width"` property to type [`"dimension"`](https://design-tokens.github.io/community-group/format/#dimension) and `"style"` property to type [`"strokeStyle"`](https://design-tokens.github.io/community-group/format/#stroke-style).
`"width"` is more of a general property where we always want to map it to `"dimension"` but border `"style"` is more specific to the border composite type, therefore this `typesMap` makes sense:

```json title="config.json"
{
  "expand": {
    "typesMap": {
      "width": "dimension",
      "border": {
        "style": "strokeStyle"
      }
    }
  }
}
```

Resulting in the following expanded output:

```json title="tokens-output.json"
{
  "width": {
    "value": "2px",
    "type": "dimension"
  },
  "style": {
    "value": "solid",
    "type": "strokeStyle"
  },
  "color": {
    "value": "#000",
    "type": "color"
  }
}
```

#### Example

~ sd-playground

```json tokens
{
  "border": {
    "type": "border",
    "value": {
      "width": "2px",
      "style": "solid",
      "color": "#000"
    }
  },
  "typography": {
    "type": "typography",
    "value": {
      "fontWeight": "800",
      "fontSize": "16px",
      "fontFamily": "Arial Black"
    }
  }
}
```

```json config
{
  "expand": {
    "include": ["border"],
    "typesMap": {
      "border": {
        "style": "borderStyle"
      }
    }
  },
  "platforms": {
    "css": {
      "transformGroup": "css",
      "files": [
        {
          "destination": "vars.css",
          "format": "css/variables"
        }
      ],
      "expand": true
    },
    "js": {
      "transformGroup": "js",
      "files": [
        {
          "destination": "tokens.js",
          "format": "javascript/es6"
        }
      ]
    }
  }
}
```

#### DTCG Type Map

Below is the standard DTCG type map that the expand utility comes out of the box with:

```js
const DTCGTypesMap = {
  // https://design-tokens.github.io/community-group/format/#stroke-style
  strokeStyle: {
    // does not yet have its own type defined, but is an enum of: "round" | "butt" | "square"
    lineCap: 'other',
    // note that this is spec'd to be a dimension array, which is unspecified in the spec for dimension
    // generally speaking, transforms that match dimension type tokens do not account for this potentially being an array
    // therefore we map it to "other" for now...
    dashArray: 'other',
  },
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
};
```

This is useful in case you want to extend it:

```js
import StyleDictionary from 'style-dictionary';
import { DTCGTypesMap } from 'style-dictionary/utils';

const extensionMap = {
  ...DTCGTypesMap,
  sizing: 'dimension',
};

const sd = new StyleDictionary({
  expand: {
    typesMap: extensionMap,
  },
});
```
