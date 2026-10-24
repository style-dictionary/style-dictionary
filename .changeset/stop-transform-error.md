---
'style-dictionary': minor
---

Add `StopTransformError` to `style-dictionary/utils`. A transform can throw it to skip the remaining transforms for that token, which keeps the changes made by the transforms that ran before. It is still reported as a transform error.
