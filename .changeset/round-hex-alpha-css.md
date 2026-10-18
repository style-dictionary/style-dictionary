---
'style-dictionary': patch
---

Round alpha values that come from 8 or 4 digit hex colors in the `color/css` transform to the shortest value that maps back to the same hex alpha (two decimals, or three when two do not round-trip), the same as browsers do. For example `#00000014` becomes `rgba(0, 0, 0, 0.08)` again instead of `rgba(0, 0, 0, 0.0784313725490196)`. Alpha values written as decimals are still kept as they are.
