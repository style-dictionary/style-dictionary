---
'style-dictionary': patch
---

The `color/rgb`, `color/hsl` and `color/hsl-4` transforms now serialize alpha the same way as `color/css`: an alpha written as a decimal is kept as it is, and an alpha from an 8 or 4 digit hex color is rounded to the shortest value that maps back to the same hex alpha. Previously `color/rgb` and `color/hsl` rounded every alpha to two decimals, so `#00000001` became fully transparent, and `color/hsl-4` printed it as `0.00392156862745098`.
