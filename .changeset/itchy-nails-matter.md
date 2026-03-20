---
'style-dictionary': minor
---

Add support for [DTCG v2025.10](https://www.designtokens.org/tr/2025.10/) dimension token type object value, while remaining backwards compatible for dimension tokens using string values.

All built-in transforms can now handle [dimension tokens](https://www.designtokens.org/tr/2025.10/format/#dimension).

This includes CSS shorthand transforms for composed token types such as typography, border and shadows, which can contain properties that are dimensions.

```json
{
  "spacing": {
    "$type": "dimension",
    "$value": { "value": 1, "unit": "px" }
  },
  "shadow": {
    "$type": "shadow",
    "$value": {
      "color": { "colorSpace": "srgb", "components": [0,0,0], "alpha": 0.4 },
      "offsetX": { "value": 2, "unit": "px" },
      "offsetY": { "value": 2, "unit": "px" },
      "blur": { "value": 4, "unit": "px" },
      "spread": { "value": 6, "unit": "px" }
    }
  }
}
```
