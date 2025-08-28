---
'style-dictionary': patch
---

Fix an issue with token collisions being way to eager about complaining when values that are identical are "colliding". This cuts collision warnings by 75% or more.
