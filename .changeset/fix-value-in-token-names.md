---
'style-dictionary': patch
---

Fix outputReferences for tokens with 'value' in their name. Previously, references to tokens like `object_type.value_chain` were incorrectly resolved because the code removed the first occurrence of `.value` instead of only the trailing suffix.
