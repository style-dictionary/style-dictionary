---
'style-dictionary': patch
---

When a token overrides another token and its value is an object or an array, such as a typography, shadow or cubicBezier value, that value now replaces the overridden value instead of being merged into it. For example, a shadow with one layer that overrides a shadow with two layers now has one layer, and a typography value no longer keeps a `fontWeight` that only the overridden value had. This applies within `include`, within `source`, and when a `source` token overrides an `include` token. The collision warning for such a token is now reported once for its value instead of once per changed sub-value.
