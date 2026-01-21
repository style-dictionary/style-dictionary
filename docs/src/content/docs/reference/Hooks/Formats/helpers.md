---
title: Custom format helpers
sidebar:
  label: Helpers
---

We provide some helper methods we use internally in some of the built-in formats to make building custom formats a bit easier.

They are accessible at `style-dictionary/utils` entrypoint, you can read more about them in the [Utils -> Format Helpers](/reference/utils/format-helpers) docs.

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
        sort, // SortOption - see types
      }) +
      '\n}\n'
    );
  },
});
```
