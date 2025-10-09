---
title: Using the NPM Module
sidebar:
  order: 3
---

The Style Dictionary [NPM](https://www.npmjs.com/) module exposes an [API](/reference/api) to interact with Style Dictionary.

## Installation

To use the NPM module, install it like a normal NPM dependency. You are most likely going to want to save it as a dev dependency (The -D option) because it's a build-tool:

```bash
npm install -D style-dictionary
```

## NPM Module Quick Start

To use the style dictionary build system in node, there are generally three steps:

1. Import the StyleDictionary module
2. Construct an instance with a configuration, creating the fully defined dictionary (importing all tokens and intended outputs)
3. Call one or more build calls for various platforms

To use the NPM module you will need to update your NPM script that runs Style Dictionary from using the CLI command to running Node on the file you are using.
Alternatively, you can also use [`npx`](https://docs.npmjs.com/cli/v8/commands/npm-exec).

```json
// package.json
{
  "scripts": {
    "build": "style-dictionary build"
  }
}
```

becomes

```json
// package.json
{
  "scripts": {
    "build": "node build.js"
  }
}
```

Update `build.js` to the name of the file you created.

Using a JSON [configuration](/reference/config) file, that looks like this:

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary('config.json');
await sd.buildAllPlatforms();
```

You can also `extend` Style Dictionary multiple times and call `buildAllPlatforms` as many times as you need. This can be useful if you are creating nested (parent-child) themes with Style Dictionary.

```javascript
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  // add custom formats/transforms
});

await (
  await sd.extend({
    // ...
  })
).buildAllPlatforms();

await (
  await sd.extend({
    // ...
  })
).buildAllPlatforms();
```

Another way to do this is to loop over an array and apply different configurations to Style Dictionary:

```javascript
import StyleDictionary from 'style-dictionary';

const brands = [`brand-1`, `brand-2`, `brand-3`];

await Promise.all(
  brands.map((brand) => {
    const sd = new StyleDictionary({
      include: [`tokens/default/**/*.json`],
      source: [`tokens/${brand}/**/*.json`],
      // ...
    });
    return sd.buildAllPlatforms();
  }),
);
```

The [multi-brand-multi-platform example](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/multi-brand-multi-platform) uses this method.

---

## Utils

There is also a utils entrypoint on the NPM module that contains helper utils.

```js title="import-utils.js"
import { convertTokenData } from 'style-dictionary/utils';
```

For more details, [read the utils docs](/reference/utils)

## Types

There is also a types entrypoint on the NPM module that contains additional type interfaces
that may be useful when using TypeScript and creating your own hooks or needing to type your design token objects.

Any import from style-dictionary comes with first-class TypeScript annotations already attached, so you won't need this too often.

```ts title="import-types.ts"
import type { DesignTokens, Parser } from 'style-dictionary/types';
```

For more details, [read the types docs](/reference/types)

## NPM Module API

The [complete npm module API is documented here](/reference/api).
