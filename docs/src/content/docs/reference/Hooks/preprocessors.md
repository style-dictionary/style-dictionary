---
title: Preprocessors
---

Starting in version 4.0, you can define custom preprocessors to process the dictionary object as a whole, after all token files have been parsed and combined into one.
This is useful if you want to do more complex transformations on the dictionary as a whole, when all other ways are not powerful enough.

Preprocessors can be applied globally or per platform.
Applying them per platform means the tokens already have some more metadata on them such as "filePath" and "path",
and the options object resembles the `PlatformConfig` rather than the SD global config options.
It also allows you to preprocess on a per platform basis, while global means you won't have to repeat the same preprocessing because it will happen once on a global level, so essentially applies to all platforms.
See [lifecycle diagram](/info/architecture) for a visual diagram of the order of the lifecycle hooks.

:::caution
It should be clear that using this feature should be a last resort. Using custom parsers to parse per file or using transforms to do transformations on a per token basis,
gives more granular control and reduces the risks of making mistakes.
:::

That said, preprocessing the full dictionary gives ultimate flexibility when needed.

---

## Preprocessor structure

A preprocessor is an object with two props:

- `name`: the name of the preprocessor
- `preprocessor` a callback function that receives the dictionary and SD options or platform config as parameters, and returns the processed dictionary

```javascript title="my-preprocessor.js"
const myPreprocessor = {
  name: 'strip-third-party-meta',
  preprocessor: (dictionary, options) => {
    delete dictionary.thirdPartyMetadata;
    return dictionary;
  },
};
```

Asynchronous callback functions are also supported, giving even more flexibility.

```javascript title="my-preprocessor-async.js"
const myPreprocessor = {
  name: 'strip-props',
  preprocessor: async (dictionary, options) => {
    const propsToDelete = await someAPICall();

    propsToDelete.forEach((propName) => {
      delete dictionary[propName];
    });

    return dictionary;
  },
};
```

---

## Using preprocessors

First you will need to tell Style Dictionary about your parser. You can do this in two ways:

1. Using the [`.registerPreprocessor`](/reference/api#registerpreprocessor) method
1. Inline in the [configuration](/reference/config#properties)

### .registerPreprocessor

```javascript
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerPreprocessor(myPreprocessor);
```

### Inline

```javascript
export default {
  hooks: {
    preprocessors: {
      'strip-props': myPreprocessor,
    },
  },
  // ... the rest of the configuration
};
```

### Applying it in config

```json
{
  "source": ["**/*.tokens.json"],
  "preprocessors": ["strip-props"]
}
```

or platform-specific:

```json
{
  "source": ["**/*.tokens.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "preprocessors": ["strip-props"]
    }
  }
}
```

---

## Preprocessor examples

Stripping description property recursively in the entire dictionary object:

```js
StyleDictionary.registerPreprocessor({
  name: 'strip-descriptions',
  preprocessor: (dict, options) => {
    // recursively traverse token objects and delete description props
    function removeDescription(slice) {
      delete slice.description;
      Object.values(slice).forEach((value) => {
        if (typeof value === 'object') {
          removeDescription(value);
        }
      });
      return slice;
    }
    return removeDescription(dict);
  },
});
```

---

## Default preprocessors

There are two default preprocessors that are always applied and run after other custom preprocessors do:

- [`typeDtcgDelegate`](/reference/utils/dtcg#typedtcgdelegate) runs after global preprocessors. It preserves explicit DTCG token types, resolves types for aliases, and uses the nearest group's type when no explicit or referenced type is available.
- [`expandObjectTokens`](/reference/config#expand), a private preprocessor that will expand object-value (composite) tokens when user config has this enabled.
