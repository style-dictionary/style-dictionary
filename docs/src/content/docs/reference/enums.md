---
title: Enums
sidebar:
  order: 4
---

This page documents the enums introduced in Style-Dictionary. Enums provide a set of named constants that enhance code maintainability, readability, and type safety.

Although Style-Dictionary offers TypeScript type definition files, it cannot provide actual TypeScript enums because its code base is written in JavaScript using JSDocs type annotations, and real enums are a TypeScript-only feature. To still leverage the benefits of enums and reduce the use of hardcoded strings throughout the JavaScript codebase of Style-Dictionary itself, we have introduced enum-like JavaScript objects, which provide the same kind of type safety, but can also be used in JavaScript projects.

These enum-like objects are used internally within Style-Dictionary, and you can also use them in your own configurations, whether you are working with TypeScript or JavaScript.

## Enums Usage Example

The following shows how to use some of the provided enum-like objects in an exmaple Style-Dictionary configuration.

```javascript
import StyleDictionary from 'style-dictionary';
import {
  formats,
  logBrokenReferenceLevels,
  logWarningLevels,
  logVerbosityLevels,
  transformGroups,
  transforms,
} from 'style-dictionary/enums';

const sd = new StyleDictionary({
  source: ['tokens/*.json'],
  platforms: {
    scss: {
      transformGroup: transformGroups.scss,
      transforms: [transforms.nameKebab],
      buildPath: 'build/',
      files: [
        {
          destination: 'variables.scss',
          format: formats.scssVariables,
        },
      ],
    },
  },
  log: {
    warnings: logWarningLevels.warn,
    verbosity: logVerbosityLevels.verbose,
    errors: {
      brokenReferences: logBrokenReferenceLevels.throw,
    },
  },
});
```

### Read-Only Enums in Typescript

Optionally, if you want to ensure that the enums are completely read-only, you can use `as const`, like it is described in [the Typescript docs](https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums).
This means a type error will also be shown if the enum itself is being assigned to or if something attempts to introduce or delete a member.

```typescript
import { formats, transforms } from 'style-dictionary/enums';

const formatsReadOnly = formats as const;
```

## List of Enums

~ sd-enums

## Benefits of Using Enums

Enums, or enumerations, offer a robust way to define a set of named constants in your code. Unlike hardcoded string values, enums provide several key benefits:

1. **Consistency**: Enums centralize the definition of constants, making it easier to manage and update them across your codebase. This reduces the risk of typos and inconsistencies that can occur with hardcoded strings. This improves maintainability.
2. **Readability**: By using descriptive names for constants, enums make your code more readable and self-documenting. This helps other developers understand the purpose and usage of the constants without needing to refer to external documentation.
3. **Type Safety**: Enums can provide better type checking during development, catching errors at compile time rather than runtime. This ensures that only valid values are used, reducing the likelihood of bugs.
4. **Future-proofing**: Enums offer greater flexibility for future changes. When you need to add or modify values, you can do so in a single location without having to search and replace hardcoded strings throughout your code. This also means that on the consumer side, such a change is not a breaking change.
