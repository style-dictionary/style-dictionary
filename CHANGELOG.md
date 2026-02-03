# Changelog

## 5.2.0

### Minor Changes

- 752a50c: Add (wip) sort option to formattedVariables and formats css, scss, less, stylus. See format docs on how to use it.
- Add `formatting.fileHeader` option for file-header-specific formatting. This new API allows configuring file header options independently from token formatting:
  - `formatting.fileHeader.commentStyle` - Override the format's default comment style ('short', 'long', 'xml')
  - `formatting.fileHeader.timestamp` - Include a timestamp in the file header
  - `formatting.fileHeader.prefix` - Custom prefix for each line
  - `formatting.fileHeader.header` - Custom opening string (e.g., `'/*!\n'` for legal comments)
  - `formatting.fileHeader.footer` - Custom closing string
  - `formatting.fileHeader.lineSeparator` - Custom line separator

### Patch Changes

- Fix `fileHeader` helper to use `fileHeaderCommentStyles` enum instead of `commentStyles` enum, properly supporting the 'xml' comment style via enum value.
- Fix SCSS format default comment style from 'short' to 'long' for consistency.
- Support `formatting.commentStyle` for fileHeader comments (supersedes 6e9164e bugfix with more comprehensive solution).

### Deprecated

- `formatting.fileHeaderTimestamp` is deprecated. Use `formatting.fileHeader.timestamp` instead. Will be removed in v6.0.
- Direct `file.options.commentStyle` for file headers is deprecated. Use `formatting.fileHeader.commentStyle` instead.

## 5.1.4

### Patch Changes

- a9c11a2: Fix of a regression bug caused by sizeRem transform throwing an error for NaN values. Because a string was thrown instead of an Error, this wasn't handled correctly by the transforms wrapper utility. Now we handle this scenario, and we also changed it to throw an actual Error.

## 5.1.3

### Patch Changes

- 6e306bc: Upgrade glob@11.1.0 forked package to fix vulnerability in origin package.

## 5.1.2

### Patch Changes

- 51fe904: fix handle `NaN` token value in `size/rem` transformer and throw exception when a `NaN` value is provided.

## 5.1.1

### Patch Changes

- 65745da: Fix outputReferences for tokens with 'value' in their name. Previously, references to tokens like `object_type.value_chain` were incorrectly resolved because the code removed the first occurrence of `.value` instead of only the trailing suffix.

## 5.1.0

### Minor Changes

- 97a209a: Add new size/compose/{sp,dp} transforms

### Patch Changes

- dbcdae3: Fix fontName parsing to handle double quotes
- c47600d: Export expand DTCGTypesMap for extension use cases.

## 5.0.4

### Patch Changes

- 7a238af: Fix an issue with token collisions being way to eager about complaining when values that are identical are "colliding". This cuts collision warnings by 75% or more.

## 5.0.3

### Patch Changes

- 3d070f5: Move patch-package to devDependencies and run in prepare instead of postinstall, so it only runs when npm installing locally and not for consumers.
- 71614da: Wrap structuredClone in loadFile in a try catch, in case we have a JS/TS config file with dynamic content.

## 5.0.2

### Patch Changes

- 8e413a2: Fix vulnerable dependencies, patch-package and its transitive `tmp` dependency in particular.
- 9f84a81: Remove node-sass from create-react-app example, dart-sass is used now usually.
- da19c8f: Small patch to allow no-destination "files" to not cause errors when using clean methods.

## 5.0.1

### Patch Changes

- 463b456: Simplify internal `cleanFile(s)` utils, fix a bug that would still attempt to unlink non-existent files in verbosity `"silent"` mode.
- 8f7c522: Fix `loadFile` to deep clone ES module exports to avoid unintended mutations

## 5.0.0

### Major Changes

- 02300b1: No longer allow references to non-token leaf nodes. References only work when referencing a Design Token (its value).
  Non-token nodes will also not make it to the output, because they are filtered out during the flattening process to `tokenMap` and `tokenArray`.
  Remove allowing references with `.value` suffix.
- f19a0cb: BREAKING: no longer possible to pass options to change the reference syntax `{ref.foo}`. The opening, closing and separator characters are now set to be aligned with the DTCG spec.
- 02300b1: BREAKING: minimum NodeJS version required is now v22.0.0 (LTS, at time of writing this). This is to support `Set.prototype.union` which we utilize in our token reference resolution utility, and it's important to use the cheaper built-in versus doing a union manually.

### Minor Changes

- 02300b1: Support passing Token Map structure to `getReferences` and `resolveReferences` utils.
- b80e75b: When transform hooks throw errors, they will now be caught and error-handled by Style Dictionary.
  Instead of causing a fatal failure, the error is collected and logged as a warning at the end.
  With verbosity turned to `"verbose"`, information about which tokens in which files are causing an error in which transform, to help debugging the problem.
  Sensible fallbacks are used when a transform cannot complete.

### Patch Changes

- a23f353: SD will use posix style paths (`'/'`) as much as possible and rely on `node:fs` to translate to win32 paths whenever a call to the filesystem is done. The exception is for dynamic imports of JS files (SD config, token files).
- a23f353: Allow buildPaths without a trailing slash, by making use of `path.join()` utility.
- 9bbbc8a: Dynamically import prettier and plugins so that they can be chunked separately by bundlers, and only imported on demand. This will significantly improve bundle size for users of Style Dictionary.

## 4.4.0

### Minor Changes

- f2395f3: Add a 'flat' option to the javascriptEsm format
- 2f13dcb: Added support for using the selector option as a string or string array in the css/variables formatter. When an array is provided, the CSS variables will be nested within the specified selectors in order

### Patch Changes

- ee85609: fix misaligned comments in typescript/es6-declarations
- 6ff17ec: If several preprocessors are defined in the SD configuration, the execution of the preprocessors is now guaranteed in the exact order in which they were configured in the SD configuration.
