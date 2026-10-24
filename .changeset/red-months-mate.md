---
"style-dictionary": patch
---

Protect convertTokenData to output 'object' from another [prototype pollution vulnerability (GHSA-m4pr-rgwp)](https://github.com/style-dictionary/style-dictionary/security/advisories/GHSA-m4pr-rgwp-x36r). In this case, the attack vector was by placing 2 tokens and letting the 2nd descend into the 1st one, and then polluting the object prototype in that descension.
