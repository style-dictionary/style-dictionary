---
'style-dictionary': patch
---

Fix cleaning the `copy_assets` action on Node.js 25 and later. It removed the assets directory with `fs.rmdir()` and its `recursive` option, which Node.js 25 removed, so cleaning threw `ERR_INVALID_ARG_VALUE`. It now uses `fs.rm()`.
