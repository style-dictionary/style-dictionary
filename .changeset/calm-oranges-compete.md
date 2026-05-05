---
'style-dictionary': patch
---

Fix `size/rem` transform stripping the unit from zero-magnitude dimension values (e.g. `"0em"`), which caused downstream CSS variables to serialize as `undefined`. Unit preservation now runs before the unitless-zero short-circuit.
