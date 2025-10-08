# Changelog

## 5.1.1

### Patch Changes

- 65745da: Fix outputReferences for tokens with 'value' in their name. Previously, references to tokens like `object_type.value_chain` were incorrectly resolved because the code removed the first occurrence of `.value` instead of only the trailing suffix.

## 5.1.0

### Minor Changes

- 97a209a: Add new size/compose/{sp,dp} transforms

### Patch Changes

- dbcdae3: Fix fontName parsing to handle double quotes
- c47600d: Export expand DTCGTypesMap for extension use cases.

## 5.0.4

### Patch Changes

- 7a238af: Fix an issue with token collisions being way to eager about complaining when values that are identical are "colliding". This cuts collision warnings by 75% or more.

## 5.0.3

### Patch Changes

- 3d070f5: Move patch-package to devDependencies and run in prepare instead of postinstall, so it only runs when npm installing locally and not for consumers.
- 71614da: Wrap structuredClone in loadFile in a try catch, in case we have a JS/TS config file with dynamic content.

## 5.0.2

### Patch Changes

- 8e413a2: Fix vulnerable dependencies, patch-package and its transitive `tmp` dependency in particular.
- 9f84a81: Remove node-sass from create-react-app example, dart-sass is used now usually.
- da19c8f: Small patch to allow no-destination "files" to not cause errors when using clean methods.

## 5.0.1

### Patch Changes

- 463b456: Simplify internal `cleanFile(s)` utils, fix a bug that would still attempt to unlink non-existent files in verbosity `"silent"` mode.
- 8f7c522: Fix `loadFile` to deep clone ES module exports to avoid unintended mutations

## 5.0.0

### Major Changes

- 02300b1: No longer allow references to non-token leaf nodes. References only work when referencing a Design Token (its value).
  Non-token nodes will also not make it to the output, because they are filtered out during the flattening process to `tokenMap` and `tokenArray`.
  Remove allowing references with `.value` suffix.
- f19a0cb: BREAKING: no longer possible to pass options to change the reference syntax `{ref.foo}`. The opening, closing and separator characters are now set to be aligned with the DTCG spec.
- 02300b1: BREAKING: minimum NodeJS version required is now v22.0.0 (LTS, at time of writing this). This is to support `Set.prototype.union` which we utilize in our token reference resolution utility, and it's important to use the cheaper built-in versus doing a union manually.

### Minor Changes

- 02300b1: Support passing Token Map structure to `getReferences` and `resolveReferences` utils.
- b80e75b: When transform hooks throw errors, they will now be caught and error-handled by Style Dictionary.
  Instead of causing a fatal failure, the error is collected and logged as a warning at the end.
  With verbosity turned to `"verbose"`, information about which tokens in which files are causing an error in which transform, to help debugging the problem.
  Sensible fallbacks are used when a transform cannot complete.

### Patch Changes

- a23f353: SD will use posix style paths (`'/'`) as much as possible and rely on `node:fs` to translate to win32 paths whenever a call to the filesystem is done. The exception is for dynamic imports of JS files (SD config, token files).
- a23f353: Allow buildPaths without a trailing slash, by making use of `path.join()` utility.
- 9bbbc8a: Dynamically import prettier and plugins so that they can be chunked separately by bundlers, and only imported on demand. This will significantly improve bundle size for users of Style Dictionary.

## 4.4.0

### Minor Changes

- f2395f3: Add a 'flat' option to the javascriptEsm format
- 2f13dcb: Added support for using the selector option as a string or string array in the css/variables formatter. When an array is provided, the CSS variables will be nested within the specified selectors in order

### Patch Changes

- ee85609: fix misaligned comments in typescript/es6-declarations
- 6ff17ec: If several preprocessors are defined in the SD configuration, the execution of the preprocessors is now guaranteed in the exact order in which they were configured in the SD configuration.

## 4.3.3

### Patch Changes

- ea0ec73: Fix convertToDTCG for sets that are already (partially) DTCG.
- 1d4389a: - `'color/hex'` (`colorHex` enum) built-in transform can now handle alpha channels properly by outputting hex8 format if needed. This also affects the transformGroups `less` and `js` which apply this transform.
  - `'color/hex8'` (`colorHex8` enum) built-in transform is now deprecated, use `'color/hex'` (`colorHex` enum) instead.
- e77feb4: Move the tinycolor2 patch from a patch file to a 3-liner fix in our source code, so it gets correctly published and usable by consumers.
- 177c25e: Account for multiline comments in javascript/es6 format

## 4.3.2

### Patch Changes

- 7d60069: Hotfix for `'size/rem'` => `sizeRem` transform to not change values with `'px'` units to `'rem'`. Regression was added in `v4.3.1` (commit sha 1684a8e).

## 4.3.1

### Patch Changes

- 1684a8e: Fix sizeRem to allow negative values
- 803d1f8: Fix gradients with rgba values returning rgba(0, 0, 0, 0)
- 6cc1da3: Add and check types to CLI file, fix typo for --platform flag.

## 4.3.0

### Minor Changes

- 302b466: Introduce a new entrypoint: `style-dictionary/enums` for most of the library's hard-coded string values. Most of these are built-in hooks names. This provides better type-safety for consumers as well as various maintainability related benefits for this library. [See documentation for more info](https://styledictionary.com/reference/enums).
- 5aad797: Add tailwind preset example, remove unused .editorconfig file
- bd8be17: Add support for native .TS token & config file processing.
- 209085d: Add `tokenMap` properties to Dictionary, which is a JavaScript Map structure of the tokens, which makes it easy to iterate as well as access tokens. Also add `convertTokenData` utility that allows to seemlessly convert between Map, Object or Array of tokens, and deprecate the `flattenTokens` utility in favor of that one.

### Patch Changes

- 2966cfd: handle DTCG-format tokens in typescript/es6-declarations formatter
- 4a7bca7: add accessControl field to Android Compose template
- f694f67: Fix Prettier imports, see https://prettier.io/docs/en/api#custom-parser-api-removed for more info.
- fd8cdb4: handle DTCG-format tokens in javascript/es6 formatter
- 6a6a409: Move prettier to dependencies since style-dictionary isn't really a prettier plugin and a direct dependency seems more accurate here.
- 8a9cfa0: Fix `outputReferencesTransformed` util, would return `true` for tokens which original values were not strings.
- 7a661bb: Fix font-style and font-weight logic for fonts.css.template.js

## 4.2.0

### Minor Changes

- 0fcf229: Add a new built-in format javascript/esm that outputs an ES module JS default export.
- d7b5836: Mark javascript/esm as nested, use Prettier on all JavaScript/TypeScript formats, use 3.x.x peerDependency so the user's installation is used when possible.
- 4bf68a3: Apply stripMeta from "json" format to the new "javascript/esm" as well.
- 8f1b4f0: Add new utility in `style-dictionary/utils` -> `stripMeta` for stripping metadata from tokens.
  This utility is used now as an opt-in for the built-in `'json'` format by using `options.stripMeta`, which if set to `true` will strip Style Dictionary meta props.
  You can specify `keep`/`strip` (allow/blocklist) for granular control about which properties to keep or strip.

### Patch Changes

- 5e3a5af: Update .d.ts/js files type imports to use correct extensions rather than extensionless. This fixes some incompatibilities with latest TypeScript "NodeNext" moduleResolution.

## 4.1.4

### Patch Changes

- a67ed31: Pass PlatformConfig as options param to platform-applied preprocessors.
- 19aee32: Fix `convertToBase64` util to support converting binary files such as fonts, for both Browser and NodeJS.

## 4.1.3

### Patch Changes

- 9376247: Make `defaultMessage` param in FileHeader type optional.
- 43ccb42: (#1305): fix reference sorting in `sortByReference` function for DTCG token format, ensuring token references are declared after their targets
- 26728b9: Fix `filterTokens` utility to deal with random metadata properties throughout token groups, without throwing errors.

## 4.1.2

### Patch Changes

- e9cce6a: Reuse static hooks in the constructor to set instance hooks prop, to avoid discarding built-in hooks overwrites by consumers.
- b48d0e9: Add missing type interfaces, most notably the ExpandConfig types.

## 4.1.1

### Patch Changes

- 5db3521: Add `iosSwiftEnumOpts.className` and `iosSwiftAnyOpts.className` formats property documentation
- 23f8a25: Use cp and rmdir commands for `copy_assets` do and undo methods, since they affect directories, not files.

## 4.1.0

### Minor Changes

- ccf27b7: Prevent duplicate redundant calls to StyleDictionary class methods by caching platform specific config & tokens results.

  Added reusable methods:

  - `getPlatformTokens()` -> grabs the `tokens`/`allTokens`(new! `exportPlatform` does not return this) for a specific platform, after running platform specific preprocessors and transforms. This replaces the old `exportPlatform` method which is now deprecated and will be removed in v6.
  - `getPlatformConfig()` -> grabs the processed/transformed `PlatformConfig` for a specific platform, replaces the now deprecated `getPlatform` method which will be removed in v6.

  The reasons for deprecating those methods and replacing them with new ones is to reduce method ambiguity and make them more pure.

  Add new options object to methods:

  - `getPlatformTokens`
  - `getPlatformConfig`
  - `exportPlatform` (deprecated, see above)
  - `getPlatform` (deprecated, see above)
  - `formatPlatform`
  - `formatAllPlatforms`
  - `buildPlatform`
  - `buildAllPlatforms`
  - `cleanPlatform`
  - `cleanAllPlatforms`

  with property `cache`, which if set to `false`, will disable this caching of generating the platform specific config / tokens, e.g.:

  ```js
  await sd.exportPlatform('css', { cache: false });
  await sd.buildAllPlatforms('css', { cache: false });
  ```

  Expectation is that this is usually not useful for majority of users, unless for example you're testing multiple runs of StyleDictionary while changing tokens or platform configs in between those runs.

### Patch Changes

- 2ec9a44: `size/rem` transform to leave 0 (string or number) values as is, since 0 doesn't need a unit.
- f317430: Added link to logging documentation inside all of the warnings and errors that refer to verbosity.
- 6275983: Respect `formatting` options in scss map-deep/map-flat formats, those that make sense:

  - `commentPosition`
  - `commentStyle`
  - `indentation`

  Also export a new type interface `FormattingOverrides`, which is a limited version of `FormattingOptions`.
  These contain the formatting options that can be overridden by users, whereas the full version is meant for the format helper utilities such as `createPropertyFormatter`/`formattedVariables`.

## 4.0.1

### Patch Changes

- e6cbf73: Fix type information for Config.parser
- e8aea2f: Fix transitive color transform advanced example, migrate chroma-js to colorjs.io
- 7afcffd: Fix bugs with expand tokens where they would run before instead of after user-configured preprocessors, and would fatally error on broken references. Broken refs should be tolerated at the expand stage, and errors will be thrown after preprocessor lifecycle if the refs are still broken at that point.
- 922b6aa: Update memfs esm-fork dependency to allow named import Volume.
- 61b6984: Fix 'filePath' missing from falsy token values
- 3ae67e3: Upgrade memfs esm fork to publish types and bumping stream to fix unclear licensing issue with transitive dependency.

## 4.0.0

> For a more comprehensive migration guide from version 3.x.x to version 4.0.0,
> [visit the migration guide page](https://styledictionary.com/version-4/migration/)

### Major Changes

- 6cc7f31: BREAKING:

  - `usesReference` util function is now `usesReferences` to be consistent plural form like the other reference util functions.
  - `getReferences` first and second parameters have been swapped to be consistent with `resolveReferences`, so value first, then the full token object (instead of the entire dictionary instance).
  - `getReferences` accepts a third options parameter which can be used to set reference Regex options as well as an unfilteredTokens object which can be used as a fallback when references are made to tokens that have been filtered out. There will be warnings logged for this.
  - `format.formatter` removed old function signature of `(dictionary, platform, file)` in favor of `({ dictionary, platform, options, file })`.
  - Types changes:

    - Style Dictionary is entirely strictly typed now, and there will be `.d.ts` files published next to every file, this means that if you import from one of Style Dictionary's entrypoints, you automatically get the types implicitly with it. This is a big win for people using TypeScript, as the majority of the codebase now has much better types, with much fewer `any`s.
    - There is no more hand-written Style Dictionary module `index.d.ts` anymore that exposes all type interfaces on itself. This means that you can no longer grab types that aren't members of the Style Dictionary class directly from the default export of the main entrypoint. External types such as `Parser`, `Transform`, `DesignTokens`, etc. can be imported from the newly added types entrypoint:

    ```ts
    import type { DesignTokens, Transform, Parser } from 'style-dictionary/types';
    ```

    Please raise an issue if you find anything missing or suddenly broken.

    - `Matcher`, `Transformer`, `Formatter`, etc. are still available, although no longer directly but rather as properties on their parents, so `Filter['matcher']`, `Transform['transformer']`, `Format['formatter']`

- dcbe2fb: - The project has been fully converted to [ESM format](https://nodejs.org/api/esm.html), which is also the format that the browser uses.
  For users, this means you'll have to either use Style Dictionary in ESM JavaScript code, or dynamically import it into your CommonJS code.
  - `StyleDictionary.extend()` method is now asynchronous, which means it returns `Promise<StyleDictionary.Core>` instead of `StyleDictionary.Core`.
  - `allProperties` / `properties` was deprecated in v3, and is now removed from `StyleDictionary.Core`, use `allTokens` and `tokens` instead.
  - Templates and the method `registerTemplate` were deprecated in v3, now removed. Use Formats instead.
  - The package now uses [package entrypoints](https://nodejs.org/api/packages.html), which means that what is importable from the package is locked down to just the specified entrypoints: `style-dictionary` & `style-dictionary/fs`. If more is needed, please raise an issue explaining which file you were importing and why you need it to be public API.
- f2ed88b: BREAKING: File headers, when registered, are put inside the `hooks.fileHeaders` property now, as opposed to `fileHeader`.
  Note the change from singular to plural form here.

  Before:

  ```js
  export default {
    fileHeader: {
      foo: (defaultMessages = []) => ['Ola, planet!', ...defaultMessages, 'Hello, World!'],
    },
  };
  ```

  After:

  ```js
  export default {
    hooks: {
      fileHeaders: {
        foo: (defaultMessages = []) => ['Ola, planet!', ...defaultMessages, 'Hello, World!'],
      },
    },
  };
  ```

- 79bb201: BREAKING: Logging has been redesigned a fair bit and is more configurable now.

  Before:

  ```json
  {
    "log": "error" // 'error' | 'warn'  -> 'warn' is the default value
  }
  ```

  After:

  ```json
  {
    "log": {
      "warnings": "error", // 'error' | 'warn'  -> 'warn' is the default value
      "verbosity": "verbose", // 'default' | 'verbose' | 'silent'  -> 'default' is the default value
      "errors": {
        "brokenReferences": "console" // 'console' | 'throw' -> 'throw' is the default value
      }
    }
  }
  ```

  Log is now and object and the old "log" option is now "warnings".

  This configures whether the following five warnings will be thrown as errors instead of being logged as warnings:

  - Token value collisions (in the source)
  - Token name collisions (when exporting)
  - Missing "undo" function for Actions
  - File not created because no tokens found, or all of them filtered out
  - Broken references in file when using outputReferences, but referring to a token that's been filtered out

  Verbosity configures whether the following warnings/errors should display in a verbose manner:

  - Token collisions of both types (value & name)
  - Broken references due to outputReferences & filters
  - Token reference errors

  And it also configures whether success/neutral logs should be logged at all.
  Using "silent" (or --silent in the CLI) means no logs are shown apart from fatal errors.

- f2ed88b: BREAKING: Actions, when registered, are put inside the `hooks.actions` property now, as opposed to `action`.
  Note the change from singular to plural form here.

  Before:

  ```js
  export default {
    action: {
      'copy-assets': {
        do: () => {}
        undo: () => {}
      }
    },
  };
  ```

  After:

  ```js
  export default {
    hooks: {
      actions: {
        'copy-assets': {
          do: () => {}
          undo: () => {}
        }
      },
    },
  };
  ```

- a4542f4: BREAKING: StyleDictionaryInstance.properties & .allProperties have been removed. They were deprecated in v3 in favor of .tokens and .allTokens.
- 5e167de: BREAKING: moved `formatHelpers` away from the StyleDictionary class and export them in `'style-dictionary/utils'` entrypoint instead.

  Before

  ```js
  import StyleDictionary from 'style-dictionary';

  const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;
  ```

  After

  ```js
  import { fileHeader, formattedVariables } from 'style-dictionary/utils';
  ```

- f2ed88b: Filters, when registered, are put inside the `hooks.filters` property now, as opposed to `filter`.
  Note the change from singular to plural form here.

  Before:

  ```js
  export default {
    filter: {
      'colors-only': (token) => token.type === 'color,
    },
    platforms: {
      css: {
        files: [{
          format: 'css/variables',
          destination: '_variables.css',
          filter: 'colors-only',
        }],
      },
    },
  };
  ```

  After:

  ```js
  export default {
    hooks: {
      filters: {
        'colors-only': (token) => token.type === 'color,
      },
    },
    platforms: {
      css: {
        files: [{
          format: 'css/variables',
          destination: '_variables.css',
          filter: 'colors-only',
        }],
      },
    },
  };
  ```

  In addition, when using [`registerFilter`](/reference/api#registerfilter) method, the name of the filter function is now `filter` instead of `matcher`.

  Before:

  ```js title="build-tokens.js" del={5} ins={6}
  import StyleDictionary from 'style-dictionary';

  StyleDictionary.registerFilter({
    name: 'colors-only',
    matcher: (token) => token.type === 'color',
  });
  ```

  After:

  ```js title="build-tokens.js" del={5} ins={6}
  import StyleDictionary from 'style-dictionary';

  StyleDictionary.registerFilter({
    name: 'colors-only',
    filter: (token) => token.type === 'color',
  });
  ```

  > These changes also apply for the `filter` function (previously `matcher`) inside `transforms`.

- f2ed88b: BREAKING: Transform groups, when registered, are put inside the `hooks.transformGroups` property now, as opposed to `transformGroup`.

  Before:

  ```js
  export default {
    // register it inline or by SD.registerTransformGroup
    transformGroup: {
      foo: ['foo-transform'],
    },
  };
  ```

  After:

  ```js
  export default {
    hooks: {
      transformGroups: {
        foo: ['foo-transform'],
      },
    },
  };
  ```

- 502dbd1: BREAKING: All of our hooks, parsers, preprocessors, transforms, formats, actions, fileHeaders and filters, support async functions as well now. This means that the formatHelpers -> fileHeader helper method is now asynchronous, to support async fileheader functions.

  ```js
  import StyleDictionary from 'style-dictionary';

  const { fileHeader } = StyleDictionary.formatHelpers;

  StyleDictionary.registerFormat({
    name: 'custom/css',
    // this can be async now, usually it is if you use fileHeader format helper, since that now always returns a Promise
    formatter: async function ({ dictionary, file, options }) {
      const { outputReferences } = options;
      return (
        // this helper is now async! because the user-passed file.fileHeader might be an async function
        (await fileHeader({ file })) +
        ':root {\n' +
        formattedVariables({ format: 'css', dictionary, outputReferences }) +
        '\n}\n'
      );
    },
  });
  ```

- f2ed88b: BREAKING: Formats, when registered, are put inside the `hooks.formats` property now, as opposed to `format`.
  The `formatter` handler function has been renamed to `format` for consistency.

  The importable type interfaces have also been renamed, `Formatter` is now `FormatFn` and `FormatterArguments` is now `FormatFnArguments`.
  Note that you can also use `Format['format']` instead of `FormatFn`, or `Parameters<Format['format']>` instead of `FormatFnArguments`, so these renames may not matter.

  Before:

  ```ts
  import StyleDictionary from 'style-dictionary';
  import type { Formatter, FormatterArguments } from 'style-dictionary/types';

  // register it with register method
  StyleDictionary.registerFormat({
    name: 'custom/json',
    formatter: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
  });

  export default {
    // OR define it inline
    format: {
      'custom/json': ({ dictionary }) => JSON.stringify(dictionary, null, 2),
    },
    platforms: {
      json: {
        files: [
          {
            destination: 'output.json',
            format: 'custom/json',
          },
        ],
      },
    },
  };
  ```

  After:

  ```ts
  import StyleDictionary from 'style-dictionary';
  import type { FormatFn, FormatFnArguments } from 'style-dictionary/types';

  // register it with register method
  StyleDictionary.registerFormat({
    name: 'custom/json',
    format: ({ dictionary }) => JSON.stringify(dictionary, null, 2),
  });

  export default {
    // OR define it inline
    hooks: {
      formats: {
        'custom/json': ({ dictionary }) => JSON.stringify(dictionary, null, 2),
      },
    },
    platforms: {
      json: {
        files: [
          {
            destination: 'output.json',
            format: 'custom/json',
          },
        ],
      },
    },
  };
  ```

- e83886c: BREAKING: preprocessors must now also be explicitly applied on global or platform level, rather than only registering it. This is more consistent with how the other hooks work and allows applying it on a platform level rather than only on the global level.

  `preprocessors` property that contains the registered preprocessors has been moved under a wrapping property called `hooks`.

  Before:

  ```js
  export default {
    // register it inline or by SD.registerPreprocessor
    // applies automatically, globally
    preprocessors: {
      foo: (dictionary) => {
        // preprocess it
        return dictionary;
      },
    },
  };
  ```

  After:

  ```js
  export default {
    // register it inline or by SD.registerPreprocessor
    hooks: {
      preprocessors: {
        foo: (dictionary) => {
          // preprocess it
          return dictionary;
        },
      },
    },
    // apply it globally
    preprocessors: ['foo'],
    platforms: {
      css: {
        // or apply is per platform
        preprocessors: ['foo'],
      },
    },
  };
  ```

- 2f80da2: BREAKING: `className`, `packageName`, `mapName`, `type`, `name`, `resourceType` and `resourceMap` options for a bunch of built-in formats have been moved from `file` to go inside the `file.options` object, for API consistency reasons.

  Before:

  ```json
  {
    "files": [
      {
        "destination": "tokenmap.scss",
        "format": "scss/map-deep",
        "mapName": "tokens"
      }
    ]
  }
  ```

  After:

  ```json
  {
    "files": [
      {
        "destination": "tokenmap.scss",
        "format": "scss/map-deep",
        "options": {
          "mapName": "tokens"
        }
      }
    ]
  }
  ```

- f2ed88b: BREAKING: Transforms, when registered, are put inside the `hooks.transforms` property now, as opposed to `transform`.
  The `matcher` property has been renamed to `filter` (to align with the Filter hook change), and the `transformer` handler function has been renamed to `transform` for consistency.

  Before:

  ```js
  export default {
    // register it inline or by SD.registerTransform
    transform: {
      'color-transform': {
        type: 'value',
        matcher: (token) => token.type === 'color',
        transformer: (token) => token.value,
      },
    },
    platforms: {
      css: {
        // apply it per platform
        transforms: ['color-transform'],
      },
    },
  };
  ```

  After

  ```js
  export default {
    // register it inline or by SD.registerTransform
    hooks: {
      transforms: {
        'color-transform': {
          type: 'value',
          filter: (token) => token.type === 'color',
          transform: (token) => token.value,
        },
      },
    },
    platforms: {
      css: {
        // apply it per platform
        transforms: ['color-transform'],
      },
    },
  };
  ```

- 90095a6: BREAKING: Allow specifying a `function` for `outputReferences`, conditionally outputting a ref or not per token. Also exposes `outputReferencesFilter` utility function which will determine whether a token should be outputting refs based on whether those referenced tokens were filtered out or not.

  If you are maintaining a custom format that allows `outputReferences` option, you'll need to take into account that it can be a function, and pass the correct options to it.

  Before:

  ```js
  StyleDictionary.registerFormat({
    name: 'custom/es6',
    formatter: async (dictionary) => {
      const { allTokens, options, file } = dictionary;
      const { usesDtcg } = options;

      const compileTokenValue = (token) => {
        let value = usesDtcg ? token.$value : token.value;
        const originalValue = usesDtcg ? token.original.$value : token.original.value;

        // Look here 👇
        const shouldOutputRefs = outputReferences && usesReferences(originalValue);

        if (shouldOutputRefs) {
          // ... your code for putting back the reference in the output
          value = ...
        }
        return value;
      }
      return `${allTokens.reduce((acc, token) => `${acc}export const ${token.name} = ${compileTokenValue(token)};\n`, '')}`;
    },
  });
  ```

  After

  ```js
  StyleDictionary.registerFormat({
    name: 'custom/es6',
    formatter: async (dictionary) => {
      const { allTokens, options, file } = dictionary;
      const { usesDtcg } = options;

      const compileTokenValue = (token) => {
        let value = usesDtcg ? token.$value : token.value;
        const originalValue = usesDtcg ? token.original.$value : token.original.value;

        // Look here 👇
        const shouldOutputRefs =
          usesReferences(original) &&
          (typeof options.outputReferences === 'function'
            ? outputReferences(token, { dictionary, usesDtcg })
            : options.outputReferences);

        if (shouldOutputRefs) {
          // ... your code for putting back the reference in the output
          value = ...
        }
        return value;
      }
      return `${allTokens.reduce((acc, token) => `${acc}export const ${token.name} = ${compileTokenValue(token)};\n`, '')}`;
    },
  });
  ```

- 122c8f6: BREAKING: expose getReferences and usesReference utilities as standalone utils rather than requiring them to be bound to dictionary object. This makes it easier to use.
- 0b81a08: BREAKING: no longer wraps tokens of type asset in double quotes. Rather, we added a transform `asset/url` that will wrap such tokens inside `url("")` statements, this transform is applied to transformGroups scss, css and less.
- a4542f4: BREAKING: StyleDictionary to be initialized with a new API and have async methods. Use:

  ```js
  import StyleDictionary from 'style-dictionary';

  /**
   * old:
   *   const sd = StyleDictionary.extend({ source: ['tokens.json'], platforms: {} });
   *   sd.buildAllPlatforms();
   */
  const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
  await sd.buildAllPlatforms();
  ```

  You can still extend a dictionary instance with an extended config, but `.extend()` is only used for this, it is no longer used to initialize the first instance:

  ```js
  import StyleDictionary from 'style-dictionary';

  const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
  const extended = await sd.extend({
    fileHeader: {
      myFileHeader: (defaultMessage) => {
        return [...defaultMessage, 'hello, world!'];
      },
    },
  });
  ```

  To ensure your initialized StyleDictionary instance is fully ready and has imported all your tokens, you can await `hasInitialized`:

  ```js
  import StyleDictionary from 'style-dictionary';

  const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
  await sd.hasInitialized;
  console.log(sd.allTokens);
  ```

  For error handling and testing purposes, you can also manually initialize the style-dictionary config:

  ```js
  import StyleDictionary from 'style-dictionary';

  const sd = new StyleDictionary({ source: ['tokens.js'], platforms: {} }, { init: false });
  try {
    await sd.init();
  } catch (e) {
    // handle error, e.g. when tokens.js file has syntax errors and cannot be imported
  }
  console.log(sd.allTokens);
  ```

  The main reason for an initialize step after class instantiation is that async constructors are not a thing in JavaScript, and if you return a promise from a constructor to "hack it", TypeScript will eventually trip over it.

  Due to being able to dynamically (asynchronously) import ES Modules rather than synchronously require CommonJS modules, we had to make the APIs asynchronous, so the following methods are now async:

  - extend
  - exportPlatform
  - buildAllPlatforms & buildPlatform
  - cleanAllPlatforms & cleanPlatform

  In a future release, most other methods will be made async or support async as well, such as parsers, transforms, formats etc.

- f2ed88b: BREAKING: Parsers, when registered, are put inside the `hooks.parsers` property now, as opposed to `parsers`.
  `parsers` property has been repurposed: you will now also need to explicitly apply registered parsers by name in the `parsers` property, they no longer apply by default.
  When registering a parser, you must also supply a `name` property just like with all other hooks, and the `parse` function has been renamed to `parser` for consistency.

  Before:

  ```js
  export default {
    // register it inline or by SD.registerPreprocessor
    parsers: [
      {
        pattern: /\.json5$/,
        parse: ({ contents, filePath }) => {
          return JSON5.parse(contents);
        },
      },
    ],
  };
  ```

  After:

  ```js
  export default {
    hooks: {
      parsers: {
        name: 'json5-parser',
        pattern: /\.json5$/,
        parser: ({ contents, filePath }) => {
          return JSON5.parse(contents);
        },
      },
    },
    // apply it globally by name reference
    parsers: ['json5-parser'],
  };
  ```

- bcb5ef3: Remove reliance on CTI token structure across transforms, actions and formats.

  Breaking changes:

  - Token type will now be determined by "type" (or "$type") property on the token, rather than by checking its CTI attributes. This change has been reflected in all of the format templates as well as transform "matcher" functions that were previously checking `attributes.category` as the token type indicator.
  - Types are mostly aligned with [DTCG spec types](https://design-tokens.github.io/community-group/format/#types), although a few additional ones have been added for compatibility reasons:
    - asset -> string type tokens where the value is a filepath to an asset
    - icon -> content type string tokens where the content resembles an icon, e.g. for icon fonts like [Microsoft codicons](https://github.com/microsoft/vscode-codicons)
    - html -> HTML entity strings for unicode characters
    - content -> regular string content e.g. text content which sometimes needs to be wrapped in quotes
  - Built-in name transforms are now reliant only on the token path, and are renamed from `name/cti/casing` to just `name/casing`. `name/ti/camel` and `name/ti/constant` have been removed. For example `name/cti/kebab` transform is now `name/kebab`.
  - Transform `content/icon` has been renamed to `html/icon` since it targets HTML entity strings, not just any icon content.
  - `font/objC/literal`, `font/swift/literal` and `font/flutter/literal` have been removed in favor of `font/objC/literal`, `font/swift/literal` and `font/flutter/literal`, as they do he exact same transformations.
  - `typescript/module-declarations` format to be updated with current DesignToken type interface.

  Before:

  ```json
  {
    "color": {
      "red": {
        "value": "#FF0000"
      }
    }
  }
  ```

  After:

  ```json
  {
    "color": {
      // <-- this no longer needs to be "color" in order for the tokens inside this group to be considered of type "color"
      "red": {
        "value": "#FF0000",
        "type": "color"
      }
    }
  }
  ```

- 7b82150: BREAKING: For formats using the `fileHeader` `formatHelpers` utility, it will no longer display a timestamp in the fileHeader output by default. This is now an opt-in by setting `file.formatting.fileHeaderTimestamp` to `true`. The reason for making this opt-in now is that using Style Dictionary in the context of a CI (continuous integration) pipeline is a common use-case, and when running on pull request event, output files always show a diff in git due to the timestamp changing, which often just means that the diff is bloated by redundancy.

  New:

  ```json
  {
    "platforms": {
      "css": {
        "files": [
          {
            "destination": "variables.css",
            "format": "css/variables",
            "options": {
              "formatting": {
                "fileHeaderTimestamp": true
              }
            }
          }
        ]
      }
    }
  }
  ```

  or:

  ```js
  import { fileHeader } from 'style-dictionary/utils';

  const headerContent = await fileHeader({
    formatting: { fileHeaderTimestamp: true },
  });
  ```

### Minor Changes

- 39f0220: Allow not throwing fatal errors on broken token references/aliases, but `console.error` instead.

  You can also configure this on global/platform `log` property:

  ```json
  {
    "log": {
      "errors": {
        "brokenReferences": "console"
      }
    }
  }
  ```

  This setting defaults to `"error"` when not configured.

  `resolveReferences` and `getReferences` `warnImmediately` option is set to `true` which causes an error to be thrown/warned immediately by default, which can be configured to `false` if you know those utils are running in the transform/format hooks respectively, where the errors are collected and grouped, then thrown as 1 error/warning instead of multiple.

  Some minor grammatical improvements to some of the error logs were also done.

- 8450a45: Some fixes for Expand utility:

  - Array values such as `dashArray` property of `strokeStyle` tokens no longer get expanded unintentionally, `typeof 'object'` check changed to `isPlainObject` check.
  - Nested object-value tokens (such as `style` property inside `border` tokens) will now also be expanded.
  - When references are involved during expansion, the resolved value is used when the property is an object, if not, then we keep the reference as is.
    This is because if the reference is to an object value, the expansion might break the reference.

- c06661d: Re-add and update example basic, fix copySync command in CLI, fix android templates to use $type for DTCG tokens.
- dcbe2fb: FileSystem that is used by Style Dictionary can now be customized:

  ```js
  import { setFs } from 'style-dictionary/fs';
  setFs(myFileSystemShim);
  ```

  By default, it uses an in-memory filesystem shim `@bundled-es-modules/memfs` in browser context, `node:fs` built-in module in Node context.

- 3485467: Fix some inconsistencies in some of the templates, usually with regards to spaces/newlines
- 606af51: Rename `typeW3CDelegate` utility function to `typeDtcgDelegate`, as using "W3C" is highly discouraged when the standard isn't a W3C standard yet.
- 4225d78: Added the following transforms for CSS, and added them to the `scss`, `css` and `less` transformGroups:

  - `fontFamily/css` -> wraps font names with spaces in `'` quotes
  - `cubicBezier/css` -> array value, put inside `cubic-bezier()` CSS function
  - `strokeStyle/css/shorthand` -> object value, transform to CSS shorthand
  - `border/css/shorthand` -> object value, transform to CSS shorthand
  - `typography/css/shorthand` -> object value, transform to CSS shorthand
  - `transition/css/shorthand` -> object value, transform to CSS shorthand
  - `shadow/css/shorthand` -> object value (or array of objects), transform to CSS shorthand

  The main intention here is to ensure that Style Dictionary is compliant with [DTCG draft specification](https://design-tokens.github.io/community-group/format/) out of the box with regards to exporting to CSS, where object-value tokens are not supported without transforming them to shorthands (or expanding them, which is a different feature that was added in `4.0.0-prerelease.27`).

- cedf8a0: Preprocessors are a new feature added to style-dictionary, which allows you to do any type of processing of the token dictionary **after** parsing, **before** resolving and transforming.
  See [preprocessor docs](https://styledictionary.com/reference/hooks/preprocessors/) for more information.
- cb94554: 'size/rem' transform to not transform tokens that already have a unit, such as `"4px"`, this should not be transformed to `"4rem"`.
- a4542f4: options.log to be respected in all error logging, including platform specific logs.
- 122c8f6: Expose a new utility called resolveReferences which takes a value containing references, the dictionary object, and resolves the value's references for you.

  ```js
  import StyleDictionary from 'style-dictionary';
  import { resolveReferences } from 'style-dictionary/utils';

  const sd = new StyleDictionary({
    tokens: {
      foo: { value: 'foo' },
      bar: { value: '{foo}' },
      qux: { value: '{bar}' },
    },
  });

  console.log(resolveReferences(sd.tokens.qux.value, sd.tokens)); // 'foo'
  ```

- 0410295: Improve and test the error handling of standalone usage of reference utilities.
- 8b6fff3: Fixes some noisy warnings still being outputted even when verbosity is set to default.

  We also added log.warning "disabled" option for turning off warnings altogether, meaning you only get success logs and fatal errors.
  This option can be used from the CLI as well using the `--no-warn` flag.

- 2da5130: Added `outputReferencesTransformed` utility function to pass into outputReferences option, which will not output references for values that have been transitively transformed.
- 606af51: Support the use of "value"/"type"/"description" as token names or token group names, at the sacrifice of now no longer being able to combine non-DTCG and DTCG syntax within the same token dictionary.
- 7418c97: Add a couple of utilities for converting a regular Style Dictionary tokens object/file(s) to DTCG formatted tokens:

  - `convertToDTCG`
  - `convertJSONToDTCG`
  - `convertZIPToDTCG`

  [Documentation of these utilities](https://styledictionary.com/reference/utils/dtcg/)

- 294fd0e: Support Design Token Community Group Draft specification for Design Tokens, by adding support for $value, $type and $description properties.
- aff6646: Allow passing a custom FileSystem Volume to your Style Dictionary instances, to ensure input/output files are read/written from/to that specific volume.
  Useful in case you want multiple Style Dictionary instances that are isolated from one another in terms of inputs/outputs.

  ```js
  import { Volume } from 'memfs';
  // You will need a bundler for memfs in browser...
  // Or use as a prebundled fork:
  import memfs from '@bundled-es-modules/memfs';
  const { Volume } = memfs;

  const vol = new Volume();

  const sd = new StyleDictionary(
    {
      tokens: {
        colors: {
          red: {
            value: '#FF0000',
            type: 'color',
          },
        },
      },
      platforms: {
        css: {
          transformGroup: 'css',
          files: [
            {
              destination: 'variables.css',
              format: 'css/variables',
            },
          ],
        },
      },
    },
    { volume: vol },
  );

  await sd.buildAllPlatforms();

  vol.readFileSync('/variables.css');
  /**
   * :root {
   *   --colors-red: #FF0000;
   * }
   */
  ```

  This also works when using extend:

  ```js
  const extendedSd = await sd.extend(cfg, { volume: vol });
  ```

- 261a2cb: Handle transition timingFunction prop in cubicBezier/css transform. Handle typography fontFamily prop in fontFamily/css transform.
- e83886c: Allow expanding tokens on a global or platform-specific level. Supports conditionally expanding per token type, or using a function to determine this per individual token.
- af5cc94: Create `formatPlatform` and `formatAllPlatforms` methods.
  This will return the outputs and destinations from the format hook for your dictionary, without building these outputs and persisting them to the filesystem.
  Additionally, formats can now return any data type instead of requiring it to be a `string` and `destination` property in `files` is now optional.
  This allows users to create formats intended for only formatting tokens and letting users do stuff with it during runtime rather than writing to files.
- c06661d: Re-add and update example basic, fix copySync command in CLI, fix android templates to use $type for DTCG tokens.
- 4556712: Make css transforms for strokeStyle, cubicBezier and fontFamily transitive, to deal with the use case where they are used within border, transition and typography tokens and those tokens have **other** properties that contain references.

### Patch Changes

- 894f37c: Update glob esm browser fork to latest, resolve unclear licensing issue.
- cb78c3d: Update `typeDtcgDelegate` utility to remove the $type on token group level between parsing/preprocessing step.
- 5079154: Fix deepExtend util bug with overriding behavior for tokens.
- c1dd5ec: Allow overriding CSS formatting with commentStyle and commentPosition props.
  For commentStyle, options are 'short' or 'long'.
  For commentPosition, options are 'above' or 'inline'.

  We also ensure that the right defaults are picked for CSS, SASS/SCSS, Stylus and Less.

  This also contains a fix for ensuring that multi-line comments are automatically put "above" rather than "inline".

- 2f80da2: All formats using `createPropertyFormatter` or `formattedVariables` helpers now respect the `file.options.formatting` option passed by users to customize formatting.

  Example:

  ```js
  {
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath,
        files: [
          {
            destination: 'variables.css',
            format: 'css/variables',
            options: {
              formatting: { indentation: '    ' },
            },
          },
        ]
      }
    }
  }
  ```

- 24584b4: Conditionally only run dev scripts when CWD is style-dictionary, so our consumers don't run it by accident
- 044123c: Patch StyleDictionary main type file to export default instead of "export =" which does not work in ESM.
- cb94554: Fix typeDtcgDelegate util $type property position to be allowed anywhere in the object, not just at the top.
- 8e297d6: Fix outputReferences for DTCG spec tokens, by using token.original.$value instead of token.original.value.
- 59f3eb0: Expose flattenTokens utility.
- 72f020d: Pass outputReferenceFallbacks option to the relevant utilities, so the option actually works.
- 39547fb: Fix parsers async support, use resolved filePath instead of raw.
- 3138313: Allow transitive transforms to return undefined, by doing this the transformer can mark itself as "deferred" for that specific token. This is useful when references in properties other than "value" need to be resolved first.
- cd9f484: Escape double quotes for ts outputStringLiterals
- 0c1a36f: Fix small issue in type DTCG delegate utility type tracking.
- d008c67: Fix a couple of spots where DTCG option wasn't properly taken into account, more tests added.
- 6cfce97: Fix logging to be ordered by platform when building or cleaning platforms. This now happens in parallel, resulting in the logs being ordered randomly which was a small regression to the logging experience.
- 6fb81ad: Allow falsy token values for outputReferences, e.g. `0`.
- 0972b26: Pass SD options to fileheaders and filters, to make it easier to use and adjust according to config or options like usesDTCG.
- 2335f13: Allow using registerHook methods to override hooks that are already registered with the same name.
- 24d41c3: Allow outputReferences to work on non-string values.
- 0c1a36f: Expose `typeDtcgDelegate` utility. Don't take `value` into account anymore to determine that it's a design token, use `$value`.
- 061c67e: Hotfix to address outputReferencesTransformed util not handling object-value tokens properly.
- 8d2f6d8: Make sure fs-node.js file is published to NPM.
- 738686b: Allow transformGroup to be combined with transforms, where standalone transforms will be added after the group's transforms.
- c708325: Moving the @zip.js/zip.js dependency from a devDependency to a normal dependency.
- cd48aac: Only run postinstall scripts when NODE_ENV isn't production (e.g. npm install --production or --omit=dev). To avoid errors running husky/patch-package.
- a5bafac: Colors that are not recognized by tinycolor2 as valid color formats (e.g. `linear-gradient(...)`) are now ignored by the builtin color transforms filter functions.
- 4ec34fd: Pass options to all of the filter functions in our built-in transforms, to check for `usesDTCG` and `$type` property.
- daa78e1: fix(types): Added missing type exports
- e859036: Fix Windows support by using a Linux/Windows + Node/Browser compatible path utility. Upgrade to latest Glob version. Apply posix: true to prevent breaking change glob update.
- 6e226aa: Pass the original ref path to the `getReferences` util result tokens.
- 1dd828c: Fix issue in browser-bundled glob, bump.
- 3f09277: Pass dictionary options to preprocessor functions.
- c2cbd1b: Publish the postinstall-dev script to NPM.
- 0972b26: Add unfilteredAllTokens property in dictionary object for formats, which is an unfiltered version of allTokens property, or a flattened version of the unfilteredTokens property.
- 47face0: Token merging behavior changed so that upon token collisions, metadata props aren't accidentally merged together.
- f8c40f7: fix(types): add missing type keyword for type export from index.d.ts
- 77ae35f: Fix scenario of passing absolute paths in Node env, do not remove leading slash in absolute paths.
- 63681a6: Fix a couple of type imports issues in .d.ts files
- 261a2cb: Allow border type tokens to be empty, every property is optional.
- ba03ee9: Fix for expand utility on platform level to adjust the token's path property.

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.9.2](https://github.com/amzn/style-dictionary/compare/v3.9.1...v3.9.2) (2024-01-17)

### Bug Fixes

- regression, glob to return posix style paths ([#1085](https://github.com/amzn/style-dictionary/issues/1085)) ([473ca82](https://github.com/amzn/style-dictionary/commit/473ca82f94993ef9a522680bf06ab15b972e7af4))

### [3.9.1](https://github.com/amzn/style-dictionary/compare/v3.9.0...v3.9.1) (2023-12-07)

### Bug Fixes

- allow falsy token values for outputReferences, e.g. 0 ([83a9934](https://github.com/amzn/style-dictionary/commit/83a9934c4bda0bfe6ba711b92ddee6a064dfb0e5))
- types for FormatHelpers.LineFormatting to add commentPosition ([fcce1d4](https://github.com/amzn/style-dictionary/commit/fcce1d45e9f879703b26db0dd281a338bb6db988))

## [3.9.0](https://github.com/amzn/style-dictionary/compare/v3.8.0...v3.9.0) (2023-10-23)

### Features

- allow overriding formatting, add commentStyle long-above, short-above ([b627ff1](https://github.com/amzn/style-dictionary/commit/b627ff1e2b9ec0b9d72ba7181f2e66f73c08b04b))

### Bug Fixes

- account for multi-line comments in tokens, improve comment style ([b5d4cc2](https://github.com/amzn/style-dictionary/commit/b5d4cc2384202e8a2f69e0439dbbeab136364911))
- allow outputReferences to work on non-string values ([8021ec0](https://github.com/amzn/style-dictionary/commit/8021ec0c914d904333cdcc063a4e34c49d2db418))
- outputReferences to use original.value when possible ([#1002](https://github.com/amzn/style-dictionary/issues/1002)) ([bd73b62](https://github.com/amzn/style-dictionary/commit/bd73b622b01839325faf2f0129b57e5e58716588))

## [3.8.0](https://github.com/amzn/style-dictionary/compare/v3.7.2...v3.8.0) (2023-04-25)

### Features

- **formats:** add options.outputStringLiterals to typescript/es6-declarations ([#857](https://github.com/amzn/style-dictionary/issues/857)) ([0c31718](https://github.com/amzn/style-dictionary/commit/0c31718eb09e89216fb2446a94d9b505635b9f18)), closes [#905](https://github.com/amzn/style-dictionary/issues/905)
- **formats:** compose object imports ([#874](https://github.com/amzn/style-dictionary/issues/874)) ([8373721](https://github.com/amzn/style-dictionary/commit/83737211d2da2e004ddfb09ede912175f5b4b1bd))
- **types:** loosening the Platform type to allow for extension ([#926](https://github.com/amzn/style-dictionary/issues/926)) ([c43263b](https://github.com/amzn/style-dictionary/commit/c43263bfd5223a7f24525f20aa87958aeedab812))

### Bug Fixes

- **formats:** added missing EOL before EOF for some formats ([#963](https://github.com/amzn/style-dictionary/issues/963)) ([dd60479](https://github.com/amzn/style-dictionary/commit/dd60479d9a5dbc707476259b03f27c719f17e17d))
- **types:** add correct return types for sortByReference ([#919](https://github.com/amzn/style-dictionary/issues/919)) ([2eff17d](https://github.com/amzn/style-dictionary/commit/2eff17d50c518cd86d68970f904413908e848fa7)), closes [#918](https://github.com/amzn/style-dictionary/issues/918)

### [3.7.2](https://github.com/amzn/style-dictionary/compare/v3.7.0...v3.7.2) (2023-01-03)

### Bug Fixes

- **docs:** Correct custom-file-header example link ([#869](https://github.com/amzn/style-dictionary/issues/869)) ([4e156b1](https://github.com/amzn/style-dictionary/commit/4e156b103a35dfb6e70d48db4d04892cc6fb2d43))
- **docs:** removed the duplicate wording ([#870](https://github.com/amzn/style-dictionary/issues/870)) ([dbb89e5](https://github.com/amzn/style-dictionary/commit/dbb89e59c656c2951ee36ed11ab65edb4d60ee05))
- **formats:** scss/map-deep type error when values are strings or null ([#838](https://github.com/amzn/style-dictionary/issues/838)) ([d338633](https://github.com/amzn/style-dictionary/commit/d338633fd8c864470e44ff902ed0ed45dc4a3958)), closes [#837](https://github.com/amzn/style-dictionary/issues/837)
- **references:** getReferences now searches the entire object ([#812](https://github.com/amzn/style-dictionary/issues/812)) ([884b1b8](https://github.com/amzn/style-dictionary/commit/884b1b896852d9e0b75066207d06619d500d1d3f))
- **references:** tokens with a number value should be interpolated correctly ([#825](https://github.com/amzn/style-dictionary/issues/825)) ([a2f7784](https://github.com/amzn/style-dictionary/commit/a2f7784d719f3f416f32a8346cb33f83266f288a))
- **transforms:** transitive transforms now work without .value in refs ([#808](https://github.com/amzn/style-dictionary/issues/808)) ([41bc893](https://github.com/amzn/style-dictionary/commit/41bc893ffb49ed241c8affe9098672d558966472))
- **types:** add matcher type to export ([#878](https://github.com/amzn/style-dictionary/issues/878)) ([2617a0d](https://github.com/amzn/style-dictionary/commit/2617a0d42d9c0c017e2a54ad9ea5e8667ece9c92)), closes [#875](https://github.com/amzn/style-dictionary/issues/875)
- **types:** added packageName as optional property on interface File ([#829](https://github.com/amzn/style-dictionary/issues/829)) ([0996cc4](https://github.com/amzn/style-dictionary/commit/0996cc473fe97aaff3298cdfeb20b159e8329ce1))
- **types:** adding missing format helpers ([#834](https://github.com/amzn/style-dictionary/issues/834)) ([a6f4b34](https://github.com/amzn/style-dictionary/commit/a6f4b3487cf5ef9230417108b07ad73a74d9fa0e))
- **types:** fix filter config key expected matcher value ([#883](https://github.com/amzn/style-dictionary/issues/883)) ([c77c3db](https://github.com/amzn/style-dictionary/commit/c77c3db2244ccb736b4752591f0494c31b9a1184))
- **types:** fixing transform group property type of Config ([#833](https://github.com/amzn/style-dictionary/issues/833)) ([0f0ad10](https://github.com/amzn/style-dictionary/commit/0f0ad10564df93813df1261a8ddc55e70f261ad5))

### [3.7.1](https://github.com/amzn/style-dictionary/compare/v3.7.0...v3.7.1) (2022-06-07)

### Bug Fixes

- **references:** getReferences now searches the entire object ([#812](https://github.com/amzn/style-dictionary/issues/812)) ([884b1b8](https://github.com/amzn/style-dictionary/commit/884b1b896852d9e0b75066207d06619d500d1d3f))
- **references:** tokens with a number value should be interpolated correctly ([#825](https://github.com/amzn/style-dictionary/issues/825)) ([a2f7784](https://github.com/amzn/style-dictionary/commit/a2f7784d719f3f416f32a8346cb33f83266f288a))
- **transforms:** transitive transforms now work without .value in refs ([#808](https://github.com/amzn/style-dictionary/issues/808)) ([41bc893](https://github.com/amzn/style-dictionary/commit/41bc893ffb49ed241c8affe9098672d558966472))

## [3.7.0](https://github.com/amzn/style-dictionary/compare/v3.1.1...v3.7.0) (2022-02-22)

### Features

- **filter:** Added new filter `removePrivate` ([#770](https://github.com/amzn/style-dictionary/issues/770)) ([3217ba3](https://github.com/amzn/style-dictionary/commit/3217ba365770ea18b9bdf6e5abfcb205268ac936)), closes [#704](https://github.com/amzn/style-dictionary/issues/704)
- **formats:** any swift format ([#734](https://github.com/amzn/style-dictionary/issues/734)) ([9859a8d](https://github.com/amzn/style-dictionary/commit/9859a8dc852a4db1e217880d778c7bed29dd5e40))

### Bug Fixes

- **examples:** complete example style dictionary version to latest ([#755](https://github.com/amzn/style-dictionary/issues/755)) ([c3aae93](https://github.com/amzn/style-dictionary/commit/c3aae93c2dc35eeafdd8dbc2072daebb9c37fb86))
- **types:** Correct type of `Core.format` ([#780](https://github.com/amzn/style-dictionary/issues/780)) ([9868b7e](https://github.com/amzn/style-dictionary/commit/9868b7e1ff4768c84a0f632db500dba6e18a6f44)), closes [#779](https://github.com/amzn/style-dictionary/issues/779)

### [3.1.1](https://github.com/amzn/style-dictionary/compare/v3.1.0...v3.1.1) (2021-12-17)

### Bug Fixes

- **deps:** adding jsonc-parser to regular dependencies ([#750](https://github.com/amzn/style-dictionary/issues/750)) ([43ff607](https://github.com/amzn/style-dictionary/commit/43ff607c74de7d796fe9e68ca7e26d9bd434498e))

## [3.1.0](https://github.com/amzn/style-dictionary/compare/v3.0.3...v3.1.0) (2021-12-16)

### Features

- **formats:** Add `outputReferences` support to `scss/map-deep` ([#720](https://github.com/amzn/style-dictionary/issues/720)) ([65453e0](https://github.com/amzn/style-dictionary/commit/65453e0d980273aeeb1a201a1996c4ad3a5719a5)), closes [#712](https://github.com/amzn/style-dictionary/issues/712)
- **formats:** add support for Microsoft's JSONC format ([#732](https://github.com/amzn/style-dictionary/issues/732)) ([cfa83cb](https://github.com/amzn/style-dictionary/commit/cfa83cb65b7ec7b3e5a9def7f0ceb6ac3b2898df)), closes [#698](https://github.com/amzn/style-dictionary/issues/698)
- **formats:** object handling for typescript/es6-declarations ([#718](https://github.com/amzn/style-dictionary/issues/718)) ([4e3905a](https://github.com/amzn/style-dictionary/commit/4e3905a7a3525f872615adaf0cae0b5553309bb6))
- **references:** ability to reference other tokens without 'value' ([#746](https://github.com/amzn/style-dictionary/issues/746)) ([c6f482e](https://github.com/amzn/style-dictionary/commit/c6f482e2845f8e13e579ffc858b0e53b9155a47e))
- **transforms:** add transformer for Color class from SwiftUI ([#733](https://github.com/amzn/style-dictionary/issues/733)) ([439e474](https://github.com/amzn/style-dictionary/commit/439e474aee9da8390f447f31d412e496c45b4605))

### Bug Fixes

- **cli:** fixing unknown commands message ([#747](https://github.com/amzn/style-dictionary/issues/747)) ([8a5f047](https://github.com/amzn/style-dictionary/commit/8a5f047af4a97a51894d4dfe4c917bf91686db8e))
- **examples:** Watch correct directory ([#739](https://github.com/amzn/style-dictionary/issues/739)) ([56574a4](https://github.com/amzn/style-dictionary/commit/56574a4247eafc79a843e80f433feaf025142ff8)), closes [#705](https://github.com/amzn/style-dictionary/issues/705)
- **types:** adding registerFileHeader type ([#722](https://github.com/amzn/style-dictionary/issues/722)) ([54332b3](https://github.com/amzn/style-dictionary/commit/54332b3e4ee77a0b0e8f84836413949f8e64ccd5)), closes [#665](https://github.com/amzn/style-dictionary/issues/665)
- **types:** fixing transform group types ([#729](https://github.com/amzn/style-dictionary/issues/729)) ([ad7f6ea](https://github.com/amzn/style-dictionary/commit/ad7f6ea555ec77defd264c9ade9628aefd108959))
- **types:** make FileHeaderArgs.commentStyle optional ([#743](https://github.com/amzn/style-dictionary/issues/743)) ([401d93b](https://github.com/amzn/style-dictionary/commit/401d93b72caf02cec34fba3c214edfdd5d52b362))

### [3.0.3](https://github.com/amzn/style-dictionary/compare/v3.0.2...v3.0.3) (2021-10-15)

### Bug Fixes

- **types:** `className` optional parameter ([#683](https://github.com/amzn/style-dictionary/issues/683)) ([639d7da](https://github.com/amzn/style-dictionary/commit/639d7daa49fccdf569ec39a14953e366df1d7908)), closes [/github.com/amzn/style-dictionary/blob/main/examples/basic/config.json#L100](https://github.com/amzn//github.com/amzn/style-dictionary/blob/main/examples/basic/config.json/issues/L100)
- **types:** added `name` to format, and export `Named` ([#714](https://github.com/amzn/style-dictionary/issues/714)) ([9ca0f6f](https://github.com/amzn/style-dictionary/commit/9ca0f6fc5d01706bf6864a2ea0fababb191f30f4))

### [3.0.2](https://github.com/amzn/style-dictionary/compare/v3.0.1...v3.0.2) (2021-08-19)

### Bug Fixes

- **format:** 'typescript/es6-declarations' return type ([#681](https://github.com/amzn/style-dictionary/issues/681)) ([0cf6c52](https://github.com/amzn/style-dictionary/commit/0cf6c52a3f85a91e5763dc31e0fb6efe2a531e25))
- **lib:** fix `createFormatArgs` positional args ([#655](https://github.com/amzn/style-dictionary/issues/655)) ([29e511d](https://github.com/amzn/style-dictionary/commit/29e511d07e7991430f6f892879aeb0ade0c6a289)), closes [#652](https://github.com/amzn/style-dictionary/issues/652)
- **references:** check if object value is a string before replacement ([#682](https://github.com/amzn/style-dictionary/issues/682)) ([bfc204c](https://github.com/amzn/style-dictionary/commit/bfc204c50e7addde2b98dc5703b9be31b5b44823))
- **types:** format config expects formatter function ([#650](https://github.com/amzn/style-dictionary/issues/650)) ([b12c4b1](https://github.com/amzn/style-dictionary/commit/b12c4b1c6a94c62c757cd1675d216d9638f8d6e0))

### [3.0.1](https://github.com/amzn/style-dictionary/compare/v3.0.0...v3.0.1) (2021-06-07)

### Bug Fixes

- **swift:** add missing space after UIColor's alpha property ([#648](https://github.com/amzn/style-dictionary/issues/648)) ([7c65733](https://github.com/amzn/style-dictionary/commit/7c65733c05a82b99960e6dca25124fce91fbda32))
- **types:** directly export Named type to avoid ambiguity with TS --isolatedModules option ([8295b0d](https://github.com/amzn/style-dictionary/commit/8295b0dffc28a5dda934fb32a26f32ffcc241ffb))
- **types:** directly export Named type to avoid ambiguity with TS --isolatedModules option ([3ed31be](https://github.com/amzn/style-dictionary/commit/3ed31be5b09312df88c66e9274672303a8609acc))

## [3.0.0](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.10...v3.0.0) (2021-05-25)

## [3.0.0-rc.10](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.9...v3.0.0-rc.10) (2021-05-24)

### Features

- **formats:** add typescript declarations formats ([#557](https://github.com/amzn/style-dictionary/issues/557)) ([f517bcf](https://github.com/amzn/style-dictionary/commit/f517bcfa219bddc5a10b5443ccb85c4869711064)), closes [#425](https://github.com/amzn/style-dictionary/issues/425)
- **types:** cleaning up our type definitions ([#632](https://github.com/amzn/style-dictionary/issues/632)) ([db6269b](https://github.com/amzn/style-dictionary/commit/db6269b636264cc0849f595c0f15a34c977c1398))

### Bug Fixes

- **references:** value object references now work ([#623](https://github.com/amzn/style-dictionary/issues/623)) ([23de306](https://github.com/amzn/style-dictionary/commit/23de3062c464a70d9e6492a380e1052e9500ea2d)), closes [#615](https://github.com/amzn/style-dictionary/issues/615)
- **template:** remove blank lines in scss/map-deep and scss/map-flat templates ([#588](https://github.com/amzn/style-dictionary/issues/588)) ([a88e622](https://github.com/amzn/style-dictionary/commit/a88e622bcc06a98972dddb2b11903828ba3dab2b))

### [2.10.3](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.5...v2.10.3) (2021-03-09)

### Bug Fixes

- **extend:** remove prototype pollution ([#560](https://github.com/amzn/style-dictionary/issues/560)) ([89ee39a](https://github.com/amzn/style-dictionary/commit/89ee39a7953c1825ea4578d43f129e23b4ed5da8))

## [3.0.0-rc.9](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.8...v3.0.0-rc.9) (2021-05-04)

### Features

- **compose:** Add Jetpack Compose format ([#599](https://github.com/amzn/style-dictionary/issues/599)) ([8a53858](https://github.com/amzn/style-dictionary/commit/8a53858dc35f4b4565abe9a6500c78814e3e6eae)), closes [#478](https://github.com/amzn/style-dictionary/issues/478)

### Bug Fixes

- **formats:** bringing mapName back to scss formats ([#611](https://github.com/amzn/style-dictionary/issues/611)) ([7a28f40](https://github.com/amzn/style-dictionary/commit/7a28f40b7f44b37e565b1360683b60268d044e9e))
- **formats:** fixing formatting options in fileHeader ([#614](https://github.com/amzn/style-dictionary/issues/614)) ([3f7fe96](https://github.com/amzn/style-dictionary/commit/3f7fe9674c0cb1f228e0415ce468d18a48e4a7f0)), closes [#612](https://github.com/amzn/style-dictionary/issues/612)
- **references:** fixing circular reference errors ([#607](https://github.com/amzn/style-dictionary/issues/607)) ([9af17f4](https://github.com/amzn/style-dictionary/commit/9af17f420c2a11c64f77041f5c2439c093f9c035)), closes [#608](https://github.com/amzn/style-dictionary/issues/608)
- **references:** flushing the filtered reference warnings ([#598](https://github.com/amzn/style-dictionary/issues/598)) ([d3b5135](https://github.com/amzn/style-dictionary/commit/d3b51352f33cb15765cb152605acd3c44e6fbf69))

## [3.0.0-rc.8](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.7...v3.0.0-rc.8) (2021-04-05)

### Features

- **formats:** add an optional selector to css/variables format ([#582](https://github.com/amzn/style-dictionary/issues/582)) ([34922a8](https://github.com/amzn/style-dictionary/commit/34922a8572b7cefc6ca579cca9f73b16bfc4efc0))
- **formats:** output references handles interpoloated references ([#590](https://github.com/amzn/style-dictionary/issues/590)) ([cc595ca](https://github.com/amzn/style-dictionary/commit/cc595ca0683cc757dfae562a8688eb0b8d121cbe)), closes [#589](https://github.com/amzn/style-dictionary/issues/589)

### Bug Fixes

- **combine:** filePath was missing for falsey values ([#583](https://github.com/amzn/style-dictionary/issues/583)) ([8c405e6](https://github.com/amzn/style-dictionary/commit/8c405e6765367aff7eb94fda1a0a235f1c422c9c))
- **formats:** update output references in formats to handle nested references ([#587](https://github.com/amzn/style-dictionary/issues/587)) ([9ce0311](https://github.com/amzn/style-dictionary/commit/9ce031108979493c7f5d0df34e3546322694feb6))

## [3.0.0-rc.7](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.6...v3.0.0-rc.7) (2021-03-24)

### Features

- **formats:** adding custom file headers ([#572](https://github.com/amzn/style-dictionary/issues/572)) ([2a29502](https://github.com/amzn/style-dictionary/commit/2a29502f762c8694dd541dc9c0a0e0aa32e4dec9)), closes [#566](https://github.com/amzn/style-dictionary/issues/566)

### Bug Fixes

- **references:** use unfiltered dictionary for reference resolution in formats ([#553](https://github.com/amzn/style-dictionary/issues/553)) ([62c8fb8](https://github.com/amzn/style-dictionary/commit/62c8fb8ddaccb94dc2eee3b4504f38c264689b77))

## [3.0.0-rc.6](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.5...v3.0.0-rc.6) (2021-03-09)

### Bug Fixes

- **extend:** remove prototype pollution ([#554](https://github.com/amzn/style-dictionary/issues/554)) ([b99710a](https://github.com/amzn/style-dictionary/commit/b99710a23abf7d49be28f4ce33dbe99a8af5923f))

## [3.0.0-rc.5](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.4...v3.0.0-rc.5) (2021-02-27)

### Bug Fixes

- **types:** introduce parser, update config, optional transform options ([#546](https://github.com/amzn/style-dictionary/issues/546)) ([0042354](https://github.com/amzn/style-dictionary/commit/0042354b4ccb43ef26ddb13adab82b73f25dbf4f)), closes [#545](https://github.com/amzn/style-dictionary/issues/545)

## [3.0.0-rc.4](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.3...v3.0.0-rc.4) (2021-02-16)

### Features

- **formats:** add stylus/variables format ([#527](https://github.com/amzn/style-dictionary/issues/527)) ([8c56752](https://github.com/amzn/style-dictionary/commit/8c56752d43616884fe6b1f4f7a77994396ce2c3f)), closes [#526](https://github.com/amzn/style-dictionary/issues/526)

## [3.0.0-rc.3](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.2...v3.0.0-rc.3) (2021-02-06)

### Features

- **build-file:** do not generate file if properties is empty ([#494](https://github.com/amzn/style-dictionary/issues/494)) ([8945c46](https://github.com/amzn/style-dictionary/commit/8945c46f26a08ff6ffac3a5aa0e84a0f330efdb4))
- **format:** output references ([#504](https://github.com/amzn/style-dictionary/issues/504)) ([7e7889a](https://github.com/amzn/style-dictionary/commit/7e7889a41c79c58a04297762a31550c9bd7c2ee0))
- **format:** use named parameters in formatter functions ([#533](https://github.com/amzn/style-dictionary/issues/533)) ([32bd40d](https://github.com/amzn/style-dictionary/commit/32bd40d3a94dd3be49ea795e3dbcc70e149bd6eb))
- react-native support ([#512](https://github.com/amzn/style-dictionary/issues/512)) ([bd61cd2](https://github.com/amzn/style-dictionary/commit/bd61cd294afccd5299a7103fd2ea6177203e9994))

### Bug Fixes

- **examples:** little typo ([#518](https://github.com/amzn/style-dictionary/issues/518)) ([33271b6](https://github.com/amzn/style-dictionary/commit/33271b62b2a0c100a2be8c08f7cd89815e287327))
- **export platform:** fixing infinite loop when there are reference errors ([#531](https://github.com/amzn/style-dictionary/issues/531)) ([6078c80](https://github.com/amzn/style-dictionary/commit/6078c8041286589eef7515945f771240bf73c8ef))
- **property setup:** original property being mutated if the value is an object ([#534](https://github.com/amzn/style-dictionary/issues/534)) ([0b13ae2](https://github.com/amzn/style-dictionary/commit/0b13ae212023ba003ab71cc30eadb20ad10ebc0c))
- **types:** add transitive to value transform type ([#536](https://github.com/amzn/style-dictionary/issues/536)) ([695eed6](https://github.com/amzn/style-dictionary/commit/695eed60f9f56c30542bbec8d0c1622a6a6959df))
- **types:** Change transforms to transform in Core ([#530](https://github.com/amzn/style-dictionary/issues/530)) ([40a2601](https://github.com/amzn/style-dictionary/commit/40a2601724ed947aa141ff53e874c14c317992df))

## [3.0.0-rc.2](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.1...v3.0.0-rc.2) (2021-01-12)

### Features

- **format:** adding android/resources format ([e43aafd](https://github.com/amzn/style-dictionary/commit/e43aafd0e4c5f34158ea0cdc222833b79b35ab16))
- **transforms:** add 'px to rem' transform ([#491](https://github.com/amzn/style-dictionary/issues/491)) ([75f0ba3](https://github.com/amzn/style-dictionary/commit/75f0ba36e1211edf955c7b6bd6c58cbd9fc6524c))

### Bug Fixes

- **extend:** use given file path for token data ([#499](https://github.com/amzn/style-dictionary/issues/499)) ([0b23c9d](https://github.com/amzn/style-dictionary/commit/0b23c9d77e367b2080e4b624fcb294773b2aefcb))
- **parsers:** fixed an error where parsers weren't running ([#511](https://github.com/amzn/style-dictionary/issues/511)) ([b0077c3](https://github.com/amzn/style-dictionary/commit/b0077c3d06caf5b7fcacd7378aab7827cdaa3961))
- **types:** fix transform options type [#502](https://github.com/amzn/style-dictionary/issues/502) ([32787f8](https://github.com/amzn/style-dictionary/commit/32787f8a133a61f6132cef4bb88922f72951b804))

## [3.0.0-rc.1](https://github.com/amzn/style-dictionary/compare/v3.0.0-rc.0...v3.0.0-rc.1) (2020-12-04)

## [3.0.0-rc.0](https://github.com/amzn/style-dictionary/compare/v2.10.2...v3.0.0-rc.0) (2020-12-03)

### Features

- **examples:** add custom filters example ([c9bfcbc](https://github.com/amzn/style-dictionary/commit/c9bfcbcb07fec4435f2368c66d0db793d676a06e))
- **examples:** add custom filters example ([f95c420](https://github.com/amzn/style-dictionary/commit/f95c4202e93dcc00b47e595c4910f435a57d1987))
- **examples:** add matching build files example ([#481](https://github.com/amzn/style-dictionary/issues/481)) ([5a80ef6](https://github.com/amzn/style-dictionary/commit/5a80ef626bacb6b487f2543793e7ed6451e81498)), closes [#251](https://github.com/amzn/style-dictionary/issues/251)
- add support for !default in SCSS variables format ([#359](https://github.com/amzn/style-dictionary/issues/359)) ([fa82002](https://github.com/amzn/style-dictionary/commit/fa8200221477a7bf0d9fcb031a54dc61ba2e3f72)), closes [#307](https://github.com/amzn/style-dictionary/issues/307)
- add TypeScript typings ([#410](https://github.com/amzn/style-dictionary/issues/410)) ([a8bb832](https://github.com/amzn/style-dictionary/commit/a8bb83278fa5bf7b1796d7f466f21a7beef0da84))
- **core:** add new entries on property object ([#356](https://github.com/amzn/style-dictionary/issues/356)) ([fd254a5](https://github.com/amzn/style-dictionary/commit/fd254a5e9f78b9888cf59770e61800357421d934))
- **formats:** add file object to formatter method ([#439](https://github.com/amzn/style-dictionary/issues/439)) ([1481c46](https://github.com/amzn/style-dictionary/commit/1481c46647808d95dc26ff6c08a0906df09d0316))
- **formats:** javascript/module-flat format ([#457](https://github.com/amzn/style-dictionary/issues/457)) ([37b06e8](https://github.com/amzn/style-dictionary/commit/37b06e86ba77576fb0619372fd73e16673c6440d))
- **parser:** adding custom parser support ([#429](https://github.com/amzn/style-dictionary/issues/429)) ([887a837](https://github.com/amzn/style-dictionary/commit/887a837a72f15cb4e2550f883e6d4479e1fa9d42))
- **transforms:** Make transitive transforms & resolves possible ([#371](https://github.com/amzn/style-dictionary/issues/371)) ([3edbb17](https://github.com/amzn/style-dictionary/commit/3edbb178d53f9e5af2328b7c26271fe436af86d3)), closes [#208](https://github.com/amzn/style-dictionary/issues/208)

### Bug Fixes

- **cli:** update clean config path logic ([#454](https://github.com/amzn/style-dictionary/issues/454)) ([dc3cfa5](https://github.com/amzn/style-dictionary/commit/dc3cfa58aa7cc78a6359a8bb269e6f32ba50b110))
- **formats:** fix max call stack issue on json/nested format ([#465](https://github.com/amzn/style-dictionary/issues/465)) ([67fb361](https://github.com/amzn/style-dictionary/commit/67fb361fb2448f9b91a1a125ee61d6bbe2f77732))
- **transforms:** fix transitive transforms ([#476](https://github.com/amzn/style-dictionary/issues/476)) ([ac0c515](https://github.com/amzn/style-dictionary/commit/ac0c515c8b4593b91eb352b1f744895796e3ab49))

### [2.10.3](https://github.com/amzn/style-dictionary/compare/v2.10.2...v2.10.3) (2021-03-09)

### Bug Fixes

- **extend:** remove prototype pollution ([#560](https://github.com/amzn/style-dictionary/issues/560)) ([89ee39a](https://github.com/amzn/style-dictionary/commit/89ee39a7953c1825ea4578d43f129e23b4ed5da8))

### [2.10.2](https://github.com/amzn/style-dictionary/compare/v2.10.1...v2.10.2) (2020-10-08)

### Bug Fixes

- **cli:** update clean config path logic ([#454](https://github.com/amzn/style-dictionary/issues/454)) ([3cc3d4e](https://github.com/amzn/style-dictionary/commit/3cc3d4e04f2ee4d0ac8b1f90b725e80f6b53beb4))
- **formats:** fix max call stack issue on json/nested format ([#465](https://github.com/amzn/style-dictionary/issues/465)) ([4064e6a](https://github.com/amzn/style-dictionary/commit/4064e6add00ca3380d9a2c9ef9862f73ef051de9))

### [2.10.1](https://github.com/amzn/style-dictionary/compare/v2.10.0...v2.10.1) (2020-07-09)

### Bug Fixes

- **filter:** fix conditional to ensure we catch properties with a falsy value ([#423](https://github.com/amzn/style-dictionary/issues/423)) ([1ec4e74](https://github.com/amzn/style-dictionary/commit/1ec4e74b9b717208f7d64aa33d43774ae8023a23)), closes [#406](https://github.com/amzn/style-dictionary/issues/406)
- **formats:** align scss/map-\* with scss/variables on asset category ([9d867ef](https://github.com/amzn/style-dictionary/commit/9d867ef3ad72cf68557434ce1a28ba996a5ac467))

## [2.10.0](https://github.com/amzn/style-dictionary/compare/v2.9.0...v2.10.0) (2020-05-05)

### Features

- adding color/hsl and color/hsl-4 transforms ([#383](https://github.com/amzn/style-dictionary/issues/383)) ([b777cfb](https://github.com/amzn/style-dictionary/commit/b777cfb11e5edc32e61df2dd33909c37a7efe2e5))
- flutter support ([#320](https://github.com/amzn/style-dictionary/issues/320)) ([8a5f645](https://github.com/amzn/style-dictionary/commit/8a5f645cc9e73fea9bbb8b6b38c5baa1d23149c8)), closes [#255](https://github.com/amzn/style-dictionary/issues/255) [#288](https://github.com/amzn/style-dictionary/issues/288)

<a name="2.9.0"></a>

# [2.9.0](https://github.com/amzn/style-dictionary/compare/v2.8.3...v2.9.0) (2020-04-21)

### Bug Fixes

- **transforms:** add NaN check to all size transforms ([#413](https://github.com/amzn/style-dictionary/issues/413)) ([d353795](https://github.com/amzn/style-dictionary/commit/d353795))
- **transforms:** add specificity so color for hex values is correct ([#412](https://github.com/amzn/style-dictionary/issues/412)) ([01cc11c](https://github.com/amzn/style-dictionary/commit/01cc11c)), closes [#407](https://github.com/amzn/style-dictionary/issues/407)
- clean require cache before loading file content ([#405](https://github.com/amzn/style-dictionary/issues/405)) ([18a50d0](https://github.com/amzn/style-dictionary/commit/18a50d0)), closes [#404](https://github.com/amzn/style-dictionary/issues/404)
- parseFloat() has only one argument ([#417](https://github.com/amzn/style-dictionary/issues/417)) ([16c3040](https://github.com/amzn/style-dictionary/commit/16c3040)), closes [#416](https://github.com/amzn/style-dictionary/issues/416)

### Features

- **attribute/cti:** attribute/cti should respect manually set attributes ([#415](https://github.com/amzn/style-dictionary/issues/415)) ([fb3e393](https://github.com/amzn/style-dictionary/commit/fb3e393)), closes [#414](https://github.com/amzn/style-dictionary/issues/414)

<a name="2.8.3"></a>

## [2.8.3](https://github.com/amzn/style-dictionary/compare/v2.8.2...v2.8.3) (2019-10-30)

### Bug Fixes

- **format:** minor css format output fix ([#323](https://github.com/amzn/style-dictionary/issues/323)) ([adb94e1](https://github.com/amzn/style-dictionary/commit/adb94e1)), closes [#322](https://github.com/amzn/style-dictionary/issues/322)
- **utils:** handle 0 values ([#325](https://github.com/amzn/style-dictionary/issues/325)) ([189d61b](https://github.com/amzn/style-dictionary/commit/189d61b)), closes [#324](https://github.com/amzn/style-dictionary/issues/324)

<a name="2.8.2"></a>

## [2.8.2](https://github.com/amzn/style-dictionary/compare/v2.8.1...v2.8.2) (2019-09-04)

### Bug Fixes

- **format:** issue [#295](https://github.com/amzn/style-dictionary/issues/295) ([c654648](https://github.com/amzn/style-dictionary/commit/c654648))
- **format:** issue [#295](https://github.com/amzn/style-dictionary/issues/295) ([#316](https://github.com/amzn/style-dictionary/issues/316)) ([030175e](https://github.com/amzn/style-dictionary/commit/030175e))
- **formats:** change less and scss comments to short version ([#306](https://github.com/amzn/style-dictionary/issues/306)) ([4f13f57](https://github.com/amzn/style-dictionary/commit/4f13f57)), closes [#305](https://github.com/amzn/style-dictionary/issues/305)
- **transform:** increase uicolor to 3 decimals to retain 8bit precision ([#314](https://github.com/amzn/style-dictionary/issues/314)) ([a3bde96](https://github.com/amzn/style-dictionary/commit/a3bde96))

<a name="2.8.1"></a>

## [2.8.1](https://github.com/amzn/style-dictionary/compare/v2.8.0...v2.8.1) (2019-07-02)

### Bug Fixes

- **format:** adding configurable name to sass map name ([#291](https://github.com/amzn/style-dictionary/issues/291)) ([cfa2422](https://github.com/amzn/style-dictionary/commit/cfa2422)), closes [#290](https://github.com/amzn/style-dictionary/issues/290)
- **sketch:** fix sketch palette format to use new filters ([#287](https://github.com/amzn/style-dictionary/issues/287)) ([374012c](https://github.com/amzn/style-dictionary/commit/374012c)), closes [#285](https://github.com/amzn/style-dictionary/issues/285)

<a name="2.8.0"></a>

# [2.8.0](https://github.com/amzn/style-dictionary/compare/v2.7.0...v2.8.0) (2019-05-28)

### Bug Fixes

- **cleanfile:** add file check and log for non-existent file ([#277](https://github.com/amzn/style-dictionary/issues/277)) ([6375133](https://github.com/amzn/style-dictionary/commit/6375133))
- **docs/examples:** 404 errors and typos ([#269](https://github.com/amzn/style-dictionary/issues/269)) ([da369da](https://github.com/amzn/style-dictionary/commit/da369da))
- **error-messaging:** add better error messaging when a transform or transformGroup does not exist ([#264](https://github.com/amzn/style-dictionary/issues/264)) ([d5c0583](https://github.com/amzn/style-dictionary/commit/d5c0583))
- **extend:** multiple extensions properly deep merge ([#276](https://github.com/amzn/style-dictionary/issues/276)) ([f1d6bb0](https://github.com/amzn/style-dictionary/commit/f1d6bb0)), closes [#274](https://github.com/amzn/style-dictionary/issues/274)
- accidentally generating test output in root directory ([4994553](https://github.com/amzn/style-dictionary/commit/4994553))

### Features

- **config:** use config.js if config.json is not found ([#249](https://github.com/amzn/style-dictionary/issues/249)) ([09fc43f](https://github.com/amzn/style-dictionary/commit/09fc43f)), closes [#238](https://github.com/amzn/style-dictionary/issues/238) [#238](https://github.com/amzn/style-dictionary/issues/238) [#247](https://github.com/amzn/style-dictionary/issues/247)
- add automatic changelog generation ([#225](https://github.com/amzn/style-dictionary/issues/225)) ([b062008](https://github.com/amzn/style-dictionary/commit/b062008))
- **docs:** adding PR and download badges; fixing code coverage badge ([#270](https://github.com/amzn/style-dictionary/issues/270)) ([2307a44](https://github.com/amzn/style-dictionary/commit/2307a44)), closes [#265](https://github.com/amzn/style-dictionary/issues/265)
- **ios-swift:** adding common transforms for Swift in iOS ([#255](https://github.com/amzn/style-dictionary/issues/255)) ([749db69](https://github.com/amzn/style-dictionary/commit/749db69)), closes [#161](https://github.com/amzn/style-dictionary/issues/161)
- **transforms:** Add UIColor transform for swift ([#250](https://github.com/amzn/style-dictionary/issues/250)) ([a62d880](https://github.com/amzn/style-dictionary/commit/a62d880)), closes [#161](https://github.com/amzn/style-dictionary/issues/161)
- **warning:** catch property name collisions during file output ([#273](https://github.com/amzn/style-dictionary/issues/273)) ([9a40407](https://github.com/amzn/style-dictionary/commit/9a40407))
