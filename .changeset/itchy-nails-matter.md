---
'style-dictionary': minor
---

the `size/compose/dp` transformer can now handle dimension tokens according to the [design tokens specification for dimensions](https://www.designtokens.org/tr/drafts/format/#dimension) as well as the previous versions with a single number value.


```json
{
 "spacing-stack-0": {
    "$type": "dimension",
    "$value": { "value": 1, "unit": "px" }
 },
 "spacing-stack-1": {
    "$type": "dimension",
    "$value": 4
 }
}
```

