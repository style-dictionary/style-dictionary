---
'style-dictionary': minor
---

`formattedVariables` now applies reference-safe ordering as a final pass after user sorting when `outputReferences` is true. Referencing tokens are only moved after the tokens they depend on; everything else keeps its sorted order. This changes the output order of the css/scss/less/stylus variables formats, also when no `sort` option is set.
