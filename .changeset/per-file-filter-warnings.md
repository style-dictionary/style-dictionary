---
'style-dictionary': patch
---

Fix "filtered out token references" warnings being reported for the wrong file. Files and platforms are formatted concurrently, and these warnings were collected in one shared group, so whichever file finished formatting first reported (and cleared) the warnings of the other files. The warnings are now collected per file.
