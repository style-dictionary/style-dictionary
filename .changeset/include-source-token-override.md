---
'style-dictionary': patch
---

When a token in `source` overrides a token from `include` (or from the inline `tokens` option), it now replaces that token instead of being merged into it, the same as when two `source` files or two `include` files define the same token. Properties that only the overridden token had, such as `$extensions` or `comment`, are no longer carried over.
