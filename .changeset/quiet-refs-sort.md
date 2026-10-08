---
'style-dictionary': patch
---

Fix `sortByReference` collecting "filtered out token references" warnings while sorting. With multiple levels of references, it reported references of tokens that are never output, and `outputReferencesFilter` could not clear those warnings.
