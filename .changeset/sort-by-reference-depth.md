---
'style-dictionary': patch
---

Fix `outputReferences` sometimes writing a token before a token it references, when references go several levels deep. `sortByReference` now orders tokens by how many levels of references they sit on, which `Array.sort` can rely on, and keeps the existing order otherwise.
