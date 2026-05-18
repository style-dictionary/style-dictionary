---
title: References
---

These utilities have to do with token references/aliases.

## usesReferences

Whether or not a token value contains references

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { usesReferences } from 'style-dictionary/utils';

usesReferences('{foo.bar}'); // true
usesReferences('solid {border.width} {border.color}'); // true
usesReferences('5px'); // false
```

## resolveReferences

Takes a token value string value and resolves any reference inside it

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { resolveReferences } from 'style-dictionary/utils';

const sd = new StyleDictionary({
  tokens: {
    colors: {
      black: {
        value: '#000',
        type: 'color',
      },
    },
    spacing: {
      2: {
        value: '2px',
        type: 'dimension',
      },
    },
    border: {
      value: 'solid {spacing.2} {colors.black}',
    },
  },
});
resolveReferences(sd.tokens.border.value, sd.tokens); // "solid 2px #000"
resolveReferences('solid {spacing.2} {colors.black}', sd.tokens); // alternative way, yet identical to line above -> "solid 2px #000"
resolveReferences('solid {spacing.2} {colors.black}', sd.tokens, { usesDtcg: true }); // Assumes DTCG spec format, with $ prefix ($value, $type)
```

You can pass a third `options` argument where you can pass some configuration options for how references are resolved:

- `usesDtcg` boolean, if set to true, the `resolveReferences` utility will assume DTCG syntax (`$value` props)
- `warnImmediately` boolean, `true` by default. You should only set this to `false` if you know that this utility is used used inside of the Transform lifecycle hook of Style Dictionary, allowing the errors to be grouped and only thrown at the end of the transform step (end of [exportPlatform](/reference/api#exportplatform-) method).

> Also supports passing a Token Map() data structure. This is more performant, and will become the standard in the next major version.

## getReferences

Whether or not a token value contains references

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { getReferences } from 'style-dictionary/utils';

const sd = new StyleDictionary({
  tokens: {
    colors: {
      black: {
        value: '#000',
        type: 'color',
      },
    },
    spacing: {
      2: {
        value: '2px',
        type: 'dimension',
      },
    },
    border: {
      value: 'solid {spacing.2} {colors.black}',
    },
  },
});

getReferences(sd.tokens.border.value, sd.tokens);
getReferences('solid {spacing.2} {colors.black}', sd.tokens); // alternative way, yet identical to line above
getReferences('solid {spacing.2} {colors.black}', sd.tokens, { usesDtcg: true }); // Assumes DTCG spec format, with $ prefix ($value, $type)
/**
 * [
 *   { value: '2px', type: 'dimension', ref: ['spacing', '2'] },
 *   { value: '#000', type: 'color', ref: ['colors', 'black'] }
 * ]
 */
```

You can pass a third `options` argument where you can pass some configuration options for how references are resolved:

- `usesDtcg` boolean, if set to true, the `resolveReferences` utility will assume DTCG syntax (`$value` props)
- `unfilteredTokens`, assuming the second `tokens` argument is your filtered `tokens` object where [filters](/reference/hooks/filters) have already done its work, you'll likely want to pass the unfiltered set in case the reference you're trying to find no longer exist in the filtered set, but you still want to get the reference values. This is useful when you're writing your own custom format with an `outputReferences` feature and you want to prevent outputting refs that no longer exist in the filtered set.
- `warnImmediately` boolean, `true` by default. You should only set this to `false` if you know that this utility is used inside of the Format lifecycle hook of Style Dictionary, allowing the errors to be grouped and only thrown at the end of the format step.

> Also supports passing a Token Map() data structure. This is more performant, and will become the standard in the next major version.

### Complicated example

You can use the `getReferences` utility to create your own custom formats that have `outputReferences` capability.

```js title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { usesReferences, getReferences, fileHeader } from 'style-dictionary/utils';
import { transformGroups } from 'style-dictionary/enums';

const sd = new StyleDictionary({
  tokens: {
    colors: {
      black: {
        value: '#000',
        type: 'color',
      },
    },
    spacing: {
      2: {
        value: '2px',
        type: 'dimension',
      },
    },
    zIndex: {
      // number example.. which should stay a number in the output
      aboveFold: {
        value: 1,
        type: 'other',
      },
    },
    semantic: {
      bg: {
        primary: {
          value: '{colors.black}',
          type: 'color',
        },
      },
    },
    border: {
      value: 'solid {spacing.2} {semantic.bg.primary}',
    },
  },
  platforms: {
    es6: {
      transformGroup: transformGroups.js,
      files: [
        {
          format: 'es6',
          destination: 'output.js',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
});

// More complex case
// Note that this example format does not account for token values that are arrays or objects
StyleDictionary.registerFormat({
  name: 'es6',
  format: async (dictionary) => {
    const { allTokens, options, file } = dictionary;
    const isNumeric = (str) => {
      if (typeof str !== 'string') return false;
      return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
      );
    };

    const compileTokenValue = (token) => {
      let value = `${token.value}`;
      const original = `${token.original.value}`;
      const originalIsReferenceExclusively = original.match(/^\{.+\}$/g);

      const shouldOutputRef =
        usesReferencess(original) &&
        (typeof options.outputReferences === 'function'
          ? outputReferences(token, { dictionary })
          : options.outputReferences);

      if (shouldOutputRef) {
        value = original;
        if (!originalIsReferenceExclusively) {
          // since we're putting references back and value is not exclusively a reference, use template literals
          value = `\`${value}\``;
        }
        const refs = getReferences(dictionary, original);
        refs.forEach((ref) => {
          // check if the ref has a value, path and name property, meaning that a name transform
          // that creates the token name is mandatory for this format to function properly
          if (['value', 'name', 'path'].every((prop) => Object.hasOwn(ref, prop))) {
            value = value.replace(
              // e.g. `{foo.bar.qux}` or `{foo.bar.qux}`
              // replaced by `${fooBarQux}`
              new RegExp(`{${ref.path.join('.')}(.value)?}`, 'g'),
              originalIsReferenceExclusively ? ref.name : `\${${ref.name}}`,
            );
          }
        });
        return value;
      }
      return isNumeric(value) ? value : JSON.stringify(value);
    };

    const header = await fileHeader({ file });

    return `${header}${allTokens.reduce((acc, token) => {
      return (
        acc +
        `export const ${token.name} = ${compileTokenValue(token)}; ${
          token.comment ? `// ${token.comment}` : ''
        }\n`
      );
    }, '')}`;
  },
});

await sd.buildAllPlatforms();

// output below

/**
 * Do not edit directly
 * Generated on Thu, 07 Dec 2023 14:44:53 GMT
 */

export const ColorsBlack = '#000';
export const Spacing2 = '2px';
export const ZIndexAboveFold = 1;
export const SemanticBgPrimary = ColorsBlack;
export const Border = `solid ${Spacing2} ${SemanticBgPrimary}`;
```

:::note
The above example does not support DTCG syntax, but this could be quite easily added,
since you can query `sd.usesDtcg` or inside a format functions `dictionary.options.usesDtcg`.
:::

## outputReferencesFilter

An `OutputReferences` function that filters for tokens containing references to other tokens that are filtered out in the output.
Usually Style Dictionary will throw a warning when you're using `outputReferences: true` and are about to have a broken reference in your output because the token you're referencing is filtered out.
What that means is that you usually have to either adjust your filter or disable `outputReferences` altogether, but supplying a function instead [allows you to conditionally output references on a per token basis](/reference/hooks/formats#references-in-output-files).

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { outputReferencesFilter } from 'style-dictionary/utils';
import { formats, transformGroups } from 'style-dictionary/enums';

const sd = new StyleDictionary({
  tokens: {
    colors: {
      black: {
        value: '#000',
        type: 'color',
      },
      grey: {
        // filtering this one out
        value: '#ccc',
        type: 'color',
      },
    },
    spacing: {
      2: {
        value: '2px',
        type: 'dimension',
      },
    },
    border: {
      value: 'solid {spacing.2} {colors.black}',
    },
    shadow: {
      // danger: references a filtered out token!
      value: '0 4px 2px {colors.grey}',
    },
  },
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      files: [
        {
          destination: 'vars.css',
          format: formats.cssVariables,
          filter: (token) => token.name !== 'colors-grey',
          options: {
            // returns false for the shadow token because it refs color-grey which is filtered out
            outputReferences: outputReferencesFilter,
          },
        },
      ],
    },
  },
});
```

Output:

```css title="vars.css"
:root {
  --spacing-2: 2rem;
  --colors-black: #000000;
  --shadow: 0 4px 2px #cccccc;
  --border: solid var(--spacing-2) var(--colors-black);
}
```

Note that `--colors-grey` was filtered out and therefore the shadow does not contain a CSS custom property (reference) but rather the resolved value.

Live Demo:

~ sd-playground

```json tokens
{
  "colors": {
    "black": {
      "value": "#000",
      "type": "color"
    },
    "grey": {
      "value": "#ccc",
      "type": "color"
    }
  },
  "spacing": {
    "2": {
      "value": "2px",
      "type": "dimension"
    }
  },
  "border": {
    "value": "solid {spacing.2} {colors.black}"
  },
  "shadow": {
    "value": "0 4px 2px {colors.grey}"
  }
}
```

```js config
import { outputReferencesFilter } from 'style-dictionary/utils';
import { formats, transformGroups } from 'style-dictionary/enums';

export default {
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      files: [
        {
          destination: 'vars.css',
          format: formats.cssVariables,
          filter: (token) => token.name !== 'colors-grey',
          options: {
            // returns false for the shadow token because it refs color-grey which is filtered out
            outputReferences: outputReferencesFilter,
          },
        },
      ],
    },
  },
};
```

## outputReferencesTransformed

An [`outputReferences`](/reference/hooks/formats/#references-in-output-files) function that checks for each token whether
the value has changed through a transitive transform compared to the original value where references are resolved.

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { outputReferencesTransformed } from 'style-dictionary/utils';
import { formats, transformGroups } from 'style-dictionary/enums';

const sd = new StyleDictionary({
  tokens: {
    base: {
      value: '#000',
      type: 'color',
    },
    referred: {
      value: 'rgba({base}, 12%)',
      type: 'color',
    },
  },
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      // see https://github.com/tokens-studio/sd-transforms
      // this transform handles rgba(#000, 0.12) -> rgba(0, 0, 0, 0.12)
      // as a transitive transform
      transforms: ['ts/color/css/hexrgba'],
      files: [
        {
          destination: 'vars.css',
          format: formats.cssVariables,
          options: {
            outputReferences: outputReferencesTransformed,
          },
        },
      ],
    },
  },
});
```

Output:

```css title="vars.css"
:root {
  --base: #000;
  --referred: rgba(0, 0, 0, 12%);
}
```

Note that `--referred` is using the resolved value that is a transformed version of `--base` instead of `rgba(var(--base), 12%)` which would be invalid CSS.
This can be verified by setting `outputReferences` to `true` in the demo below.

Live Demo:

~ sd-playground

```json tokens
{
  "base": {
    "value": "#000",
    "type": "color"
  },
  "referred": {
    "value": "rgba({base}, 12%)",
    "type": "color"
  }
}
```

```js config
import { outputReferencesTransformed } from 'style-dictionary/utils';
import { formats, transformGroups } from 'style-dictionary/enums';

export default {
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      transforms: ['ts/color/css/hexrgba'],
      files: [
        {
          destination: 'vars.css',
          format: formats.cssVariables,
          options: {
            outputReferences: outputReferencesTransformed,
          },
        },
      ],
    },
  },
};
```

```js script
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

// registers 'ts/color/css/hexrgba'
register(StyleDictionary);
```

### Combining multiple outputReference utility functions

These utility functions can be quite easily combined together:

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';
import { outputReferencesFilter, outputReferencesTransformed } from 'style-dictionary/utils';
import { formats, transformGroups } from 'style-dictionary/enums';

const sd = new StyleDictionary({
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      files: [
        {
          destination: 'vars.css',
          format: formats.cssVariables,
          options: {
            outputReferences: (token, options) =>
              outputReferencesFilter(token, options) && outputReferencesTransformed(token, options),
          },
        },
      ],
    },
  },
});
```
