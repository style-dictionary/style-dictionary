---
'style-dictionary': patch
---

Fix the verbose token name collision warning listing the collisions of another file, and omitting its own, when platforms write files with the same destination to different build paths, e.g. `variables.css` per theme. These warnings were collected in a shared group keyed by destination only. The brief default warning was not affected. The warnings are now kept per file.
