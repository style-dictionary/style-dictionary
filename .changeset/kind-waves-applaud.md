---
'style-dictionary': patch
---

Move patch-package to devDependencies and run in prepare instead of postinstall, so it only runs when npm installing locally and not for consumers.
