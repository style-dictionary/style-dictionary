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

`duration` tokens keep the unit they were authored with, since converting them to seconds loses precision for sub-10ms durations. `time` tokens are still converted from milliseconds to seconds, except that a `time` token which already declares seconds, e.g. `"0.36s"`, is no longer divided a second time into `"0.00s"`.
