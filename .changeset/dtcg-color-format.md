---
"style-dictionary": minor
---

Add support for DTCG v2025.10 structured color format in color transformers.

**New features:**
- All color transformers now support both legacy string format and DTCG object format with `colorSpace`, `components`, `alpha`, and optional `hex` fallback properties
- Support for all 14 DTCG color spaces: `srgb`, `srgb-linear`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz-d50`, `xyz-d65`, `lab`, `lch`, `oklab`, `oklch`, `hsl`, `hwb`
- New `color/oklch` transformer - outputs modern CSS `oklch()` function
- New `color/oklab` transformer - outputs modern CSS `oklab()` function
- New `color/p3` transformer - outputs CSS `color(display-p3 ...)` function
- New `color/lch` transformer - outputs modern CSS `lch()` function

**Types:**
- Added `DTCGColorSpace` and `DTCGColorValue` TypeScript types

**Hex fallback support:**
When a DTCG color object includes a `hex` property, it will be used as a fallback when the color is out-of-gamut for sRGB, allowing designers to provide pre-computed sRGB approximations.
