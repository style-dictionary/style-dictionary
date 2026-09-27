---
'style-dictionary': patch
---

Fix `outputReferences` leaking a raw `{group.$root}` placeholder into formatted output instead of resolving it, when a reference path segment (e.g. a DTCG `$root` token) contains a RegExp special character.
