---
'style-dictionary': minor
---

Add support for DTCG v2025.10 `duration` token values, while remaining backwards compatible for Style Dictionary `time` tokens.

The `time/seconds` transform now also matches `duration` tokens and handles their object values, and `transition/css/shorthand` stringifies the `duration` and `delay` properties of a transition, including when those properties reference `duration` tokens.

```json
{
  "fast": {
    "$type": "duration",
    "$value": { "value": 200, "unit": "ms" }
  },
  "fade": {
    "$type": "transition",
    "$value": {
      "duration": "{fast}",
      "delay": { "value": 0, "unit": "ms" },
      "timingFunction": "ease-in-out"
    }
  }
}
```

`time/seconds` keeps the precision of the input through the conversion. Two decimals is still the minimum, so existing output is unchanged, but more decimals are used when the value needs them: a 1ms duration now resolves to `0.001s` instead of being rounded away to `0.00s`. A value that is already in seconds, e.g. `"0.36s"`, is no longer divided a second time into `"0.00s"`.
