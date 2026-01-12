---
'style-dictionary': patch
---

Fix of a regression bug caused by sizeRem transform throwing an error for NaN values. Because a string was thrown instead of an Error, this wasn't handled correctly by the transforms wrapper utility. Now we handle this scenario, and we also changed it to throw an actual Error.
