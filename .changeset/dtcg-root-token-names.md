---
'style-dictionary': patch
---

Ignore a trailing DTCG v2025.10 `$root` path segment in the built-in name transforms, so a root token is named after its group (e.g. `--color-text-warning` instead of `--color-text-warning-root`). Also fix `outputReferences` not replacing references to `$root` tokens.
