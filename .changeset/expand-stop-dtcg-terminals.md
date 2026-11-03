---
'style-dictionary': patch
---

Keep DTCG dimension, duration, and color values whole when expanding a composite token. `fontSize`, `letterSpacing`, border widths, shadow offsets, and transition delays stay one token with their `{value, unit}` object instead of being split into `-value` and `-unit` tokens, and color objects are no longer split into `colorSpace` and `components`. A `{value, unit}` line height, which the type map records as `number`, is emitted as a `dimension` token. Nested objects are now only expanded when the property has a composite type, which includes custom types added through `typesMap`.
