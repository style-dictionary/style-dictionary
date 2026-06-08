---
'style-dictionary': patch
---

Fix prototype pollution vulnerability in the `convertTokenData` utility function, this was introduced in version `4.3.0`.
Any token key that includes `__proto__` will be ignored.
See [Security Advisory GHSA-vj5c-m527-mpff](https://github.com/style-dictionary/style-dictionary/security/advisories/GHSA-vj5c-m527-mpff).
