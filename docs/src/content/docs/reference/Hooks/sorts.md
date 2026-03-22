---
title: Sorts
---

Sorts is a hook that provides a way to register custom sorting functions for tokens. These registered sorts can then be used by name in format options, particularly with the `formattedVariables` helper and formats that use it (like `css/variables`, `scss/variables`, `less/variables`, and `stylus/variables`).

Common use cases for custom sorts are:

- Sorting tokens by value type (colors, dimensions, etc.)
- Sorting tokens by custom metadata or attributes
- Creating reusable sorting logic that can be referenced by name

---

## Sort structure

A sort is an object with two props:

- `name`: the name of the sort
- `sort`: a comparator function that receives two `TransformedToken` objects (`a` and `b`) and returns a number:
  - Negative number if `a` should come before `b`
  - Positive number if `a` should come after `b`
  - `0` if they are equal

The built-in sort name `name` is reserved and cannot be redefined in `registerSort()` or `hooks.sorts`.

The sort function follows the standard JavaScript `Array.sort` comparator pattern.

```javascript title="my-sort.js"
const mySort = {
  name: 'by-value-type',
  sort: (a, b) => {
    // Sort by token type first
    const typeCompare = (a.type || '').localeCompare(b.type || '');
    if (typeCompare !== 0) return typeCompare;
    // Then by name as tie-breaker
    return a.name.localeCompare(b.name);
  },
};
```

---

## Using sorts

First you will need to tell Style Dictionary about your sort. You can do this in two ways:

1. Using the [`.registerSort`](/reference/api#registersort) method
1. Inline in the [configuration](/reference/config#properties) `hooks.sorts` property

### .registerSort

```javascript
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerSort(mySort);
```

### Inline

```javascript
export default {
  hooks: {
    sorts: {
      'by-value-type': mySort.sort,
    },
  },
  // ... the rest of the configuration
};
```

### Using it in format options

Once registered, you can use the sort by name in format options:

```json
{
  "source": ["**/*.tokens.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "files": [
        {
          "format": "css/variables",
          "destination": "_variables.css",
          "options": {
            "sort": "by-value-type"
          }
        }
      ]
    }
  }
}
```

You can also chain multiple sorts using an array:

```json
{
  "options": {
    "sort": ["by-value-type", "name"]
  }
}
```

When using `outputReferences: true`, reference-safe ordering is automatically enforced first, and your registered sorts act as tie-breakers.

### Using in custom formats

When creating custom formats that use the `formattedVariables` helper, you need to pass the `hooks` object to enable registered sorts:

```javascript
import { formattedVariables } from 'style-dictionary/utils';
import { propertyFormatNames } from 'style-dictionary/enums';

StyleDictionary.registerFormat({
  name: 'myCustomFormat',
  format: function ({ dictionary, options }) {
    return formattedVariables({
      format: propertyFormatNames.css,
      dictionary,
      sort: options.sort, // can be 'name', registered sort name, function, or array
      hooks: options.hooks, // pass hooks to enable registered sorts
    });
  },
});
```

Note: Unlike `filters` which are automatically resolved by Style Dictionary at the file level, `sorts` are resolved within format functions. The `options` object passed to format functions already contains the `hooks` object, so you can simply pass `options.hooks` to `formattedVariables`.

---

### Example

~ sd-playground

```json tokens
{
  "color": {
    "red": {
      "type": "color",
      "value": "#ff0000"
    },
    "blue": {
      "type": "color",
      "value": "#0000ff"
    }
  },
  "spacing": {
    "small": {
      "type": "dimension",
      "value": "4px"
    },
    "large": {
      "type": "dimension",
      "value": "16px"
    }
  }
}
```

```js config
import { formats, transformGroups } from 'style-dictionary/enums';

export default {
  hooks: {
    sorts: {
      'by-type': (a, b) => {
        // Sort by type first
        const typeCompare = (a.type || '').localeCompare(b.type || '');
        if (typeCompare !== 0) return typeCompare;
        // Then by name
        return a.name.localeCompare(b.name);
      },
    },
  },
  platforms: {
    css: {
      transformGroup: transformGroups.css,
      files: [
        {
          format: formats.cssVariables,
          destination: '_variables.css',
          options: {
            sort: 'by-type', // Uses the registered sort from hooks.sorts
          },
        },
      ],
    },
  },
};
```

Note: Built-in formats like `css/variables`, `scss/variables`, `less/variables`, and `stylus/variables` automatically pass `options.hooks` to `formattedVariables`, so registered sorts work without any additional configuration.
