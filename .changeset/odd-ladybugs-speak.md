---
'style-dictionary': patch
---

Fix very old bug where size/remToPt wasn't converting to `pt` unit, but rather to `f` (iOS float). Fixed this, added `size/remToFloat` to use the old behavior, and updated the ios transformGroup to use this instead. This is technically potentially "breaking" but because it is a bugfix, this is a patch.
