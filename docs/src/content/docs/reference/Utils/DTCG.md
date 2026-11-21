---
title: Design Tokens Community Group
---

These utilities have to do with the [Design Tokens W3C Community Group specification](https://tr.designtokens.org/format/).

For converting a ZIP or JSON tokens file to the DTCG format, use the button below:

<sd-dtcg-convert></sd-dtcg-convert>

This button is a tiny Web Component using file input as a wrapper around the convert DTCG utils listed below.

## convertToDTCG

This function converts your dictionary object to DTCG formatted dictionary, meaning that your `value`, `type` and `description` properties are converted to be prefixed with `$`, and the `$type` property is moved from the token level to the topmost common ancestor token group.

```js
import { convertToDTCG } from 'style-dictionary/utils';

const outputDictionary = convertToDTCG(dictionary, { applyTypesToGroup: false });
```

`applyTypesToGroup` is `true` by default, but can be turned off by setting to `false`.

`dictionary` is the result of doing for example JSON.parse() on your tokens JSON string so it becomes a JavaScript object type.

:::note
Style Dictionary applies [`typeDtcgDelegate`](#typedtcgdelegate) after global preprocessors. If you call `convertToDTCG` in a platform preprocessor, set `applyTypesToGroup` to `false` to keep types on individual tokens for platform expansion and transforms.
:::

### convertJSONToDTCG

This function converts your JSON (either a JSON Blob or string that is an absolute filepath to your JSON file) to a JSON Blob which has been converted to DTCG format, see `convertToDTCG` function above.

```js
import { convertToDTCG } from 'style-dictionary/utils';

const outputBlob = convertJSONToDTCG(JSONBlobOrFilepath, { applyTypesToGroup: false });
```

`applyTypesToGroup` option can be passed, same as for `convertToDTCG` function.

Note that if you use a filepath instead of Blob as input, this filepath should preferably be an absolute path.
You can use a utility like [`node:path`](https://nodejs.org/api/path.html) or a browser-compatible copy like [`path-unified`](https://www.npmjs.com/package/path-unified)
to resolve path segments or relative paths to absolute ones.

### convertZIPToDTCG

This function converts your ZIP (either a ZIP Blob or string that is an absolute filepath to your ZIP file) to a ZIP Blob which has been converted to DTCG format, see `convertToDTCG` function above.

Basically the same as `convertJSONToDTCG` but for a ZIP file of JSON tokens.

```js
import { convertZIPToDTCG } from 'style-dictionary/utils';

const outputBlob = convertZIPToDTCG(ZIPBlobOrFilepath, { applyTypesToGroup: false });
```

## typeDtcgDelegate

This function applies `$type` inheritance to a [DTCG](https://tr.designtokens.org/format/) dictionary. An explicit token `$type` takes precedence. A token whose entire `$value` is an alias uses the referenced token's resolved type before its nearest group's type. Ordinary values and aliases whose target type cannot be resolved inherit the nearest group's type when available.

We built this utility because it's cheaper to apply the inheritance once, rather than on every access of a token's "$type" property, checking the ancestor tree to find it.

Style Dictionary runs this utility after global preprocessors and before global expansion and platform processing.

:::caution
Important to note is that the `$type` prop on the group level will be removed during this step, and will only exist on the token level.
If you want the `$type` to go back to the group level (highest possible common ancestor), then please use [`convertToDTCG`](#converttodtcg) for this.
:::

```js
import { typeDtcgDelegate } from 'style-dictionary/utils';

const output = typeDtcgDelegate(input);
```

Input:

```js
{
  dimensions: {
    $type: 'dimension',
    sm: {
      $value: '5',
    },
    md: {
      $value: '10',
    },
    nested: {
      deep: {
        lg: {
          $value: '15',
        },
      },
    },
    nope: {
      $value: '20',
      $type: 'spacing',
    },
  },
}
```

Output:

```js
{
  dimensions: {
    sm: {
      $value: '5',
      $type: 'dimension',
    },
    md: {
      $value: '10',
      $type: 'dimension',
    },
    nested: {
      deep: {
        lg: {
          $value: '15',
          $type: 'dimension',
        },
      },
    },
    nope: {
      $value: '20',
      $type: 'spacing',
    },
  },
}
```
