---
title: Transforms
sidebar:
  label: Overview
---

Transforms are functions that modify a [token](/info/tokens) so that it can be understood by a specific platform. It can modify the name, value, or attributes of a token - enabling each platform to use the design token in different ways. A simple example is changing pixel values to point values for iOS and `dp` or `sp` for Android.

Transforms are isolated per platform; each platform begins with the same design token and makes the modifications it needs without affecting other platforms. The order you use transforms matters because transforms are performed sequentially. Transforms are used in your [configuration](/reference/config), and can be either [pre-defined transforms](/reference/hooks/transforms/predefined) supplied by Style Dictionary or [custom transforms](#defining-custom-transforms).

Some platform configuration attributes apply a broader effect over the transforms applied. For example, the `size/remToDp` transform will scale a number by 16, or by the value of `options.basePxFontSize` if it is present. Check individual transform documentation to see where this is applicable.

## Using Transforms

You use transforms in your config file under `platforms` > `[platform]` > `transforms`.

```json title="config.json"
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "android": {
      "transforms": ["attribute/cti", "name/kebab", "color/hex", "size/rem"]
    }
  }
}
```

A transform consists of 4 parts: `type`, `name`, `filter`, and `transform`. Transforms are run on all design tokens where the filter returns true.

:::tip
If you don't provide a filter function, it will match all tokens.
:::

:::note
`transform` functions can be async as well.
:::

## Transform Types

There are 3 types of transforms: `attribute`, `name`, and `value`.

**Attribute:** An attribute transform adds to the attributes object on a design token. This is for including any meta-data about a design token such as it's CTI attributes or other information.

**Name:** A name transform transforms the name of a design token. You should really only be applying one name transform because they will override each other if you use more than one.

**Value:** The value transform is the most important as this is the one that modifies the value or changes the representation of the value. Colors can be turned into hex values, rgb, hsl, hsv, etc. Value transforms have a filter function that filter which tokens that transform runs on. This allows us to only run a color transform on only the colors and not every design token.

## Defining Custom Transforms

You can define custom transforms with the [`registerTransform`](/reference/api#registertransform). Style Dictionary adds some [default metadata](/info/tokens#default-design-token-metadata) to each design token to provide context that may be useful for some transforms.

## Transitive Transforms

You can define transitive transforms which allow you to transform a referenced value. Normally, value transforms only transform non-referenced values and because transforms happen before references are resolved, the transformed value is then used to resolve references.

```javascript title="build-tokens.js"
import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  type: `value`,
  transitive: true,
  name: `myTransitiveTransform`,
  filter: (token, options) => {},
  transform: (token) => {
    // token.value will be resolved and transformed at this point
  },
});
```

There is one thing to be mindful of with transitive transforms. The token's value will be resolved and _transformed_ already at the time the transitive transform. What happens is Style Dictionary will transform and resolve values iteratively. First it will transform any non-referenced values, then it will resolve any references to non-referenced values, then it will try to transform any non-referenced values, and so on. Let's take a look at an example:

```json title="tokens.json"
{
  "color": {
    "red": { "value": "#f00" },
    "danger": { "value": "{color.red}" },
    "error": { "value": "{color.danger}" }
  }
}
```

Style dictionary will first transform the value of `color.red`, then resolve `color.danger` to the transformed `color.red` value. Then it will transform `color.danger` and resolve `color.error` to the transformed `color.danger`. Finally, it will transform `color.error` and see that there is nothing left to transform or resolve.

This allows you to modify a reference that modifies another reference. For example:

```json title="tokens.json"
{
  "color": {
    "red": { "value": "#f00" },
    "danger": { "value": "{color.red}", "darken": 0.75 },
    "error": { "value": "{color.danger}", "darken": 0.5 }
  }
}
```

Using a custom transitive transform you could have `color.danger` darken `color.red` and `color.error` darken `color.danger`. The pre-defined transforms are _not transitive_ to be backwards compatible with Style Dictionary v2 - an upgrade should not cause breaking changes.

### Defer transitive transformation manually

It's also possible to control, inside a transitive transform's `transform` function, whether the transformation should be deferred until a later cycle of references resolution.
This is done by returning `undefined`, which basically means "I cannot currently do the transform due to a reference not yet being resolved".

Imagine the following transform:

```js title="build-tokens.js"
import { StyleDictionary } from 'style-dictionary';
import { usesReferences } from 'style-dictionary/utils';

StyleDictionary.registerTransform({
  name: '',
  type: transformTypes.value,
  transitive: true,
  transform: (token) => {
    const darkenModifier = token.darken;
    if (usesReferences(darkenModifier)) {
      // defer this transform, because our darken value is a reference
      return undefined;
    }
    return darken(token.value, darkenModifier);
  },
});
```

Combined with the following tokens:

```json title="tokens.json"
{
  "color": {
    "darken": { "value": 0.5 },
    "red": { "value": "#f00" },
    "danger": { "value": "{color.red}", "darken": "{darken}" }
  }
}
```

Due to `token.darken` being a property that uses a reference, we need the ability to defer its transformation from within the transform,
since the transform is the only place where we know which token properties the transformation is reliant upon.

If you want to learn more about transitive transforms, take a look at the [transitive transforms example](https://github.com/style-dictionary/style-dictionary/tree/main/examples/advanced/transitive-transforms).
