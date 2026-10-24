---
'style-dictionary': patch
---

Include the token path, and the token's `filePath` when it has one, in the "Token name must be a string" error, so a token with an empty name (e.g. an empty `""` key) is easier to find.
