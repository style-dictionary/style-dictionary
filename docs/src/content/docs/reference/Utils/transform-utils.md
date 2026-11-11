---
title: Transform utils
---

We provide some util methods we use internally in some of the built-in transforms.

They are accessible at `style-dictionary/utils` entrypoint.

## Default filters

The ones we expose, for now, are the default filters.

```javascript
import StyleDictionary from 'style-dictionary';
import { isColor, isDimension, isAsset, isContent, isFontSize } from 'style-dictionary/utils';

StyleDictionary.registerTransform({
  name: 'myCustomTransform',
  type: 'value',
  filter: isDimension,
  transform: (token) => {
    return token.$value;
  },
});
```
