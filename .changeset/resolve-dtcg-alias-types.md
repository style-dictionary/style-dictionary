---
'style-dictionary': patch
---

DTCG aliases without an explicit `$type` now use the referenced token's type ahead of their own group's type. If the target type cannot be resolved, the alias still inherits its nearest group's type.
