---
'style-dictionary': patch
---

Wrap structuredClone in loadFile in a try catch, in case we have a JS/TS config file with dynamic content.
