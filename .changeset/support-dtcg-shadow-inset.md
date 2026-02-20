---
'style-dictionary': patch
---

Support DTCG `inset` boolean property in shadow/css/shorthand transform, in addition to the existing `type: "inset"` format.
Don't put invalid inset values in shadow/css/shorthand box-shadow values, they are ignored now. E.g. if you put `type: "innerShadow"` or some other unrecognized string.
