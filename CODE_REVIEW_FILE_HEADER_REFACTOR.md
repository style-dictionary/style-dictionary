# Code Review: File Header Formatting Refactor

**Reviewer:** GitHub Copilot  
**Date:** 2025-02-12  
**Scope:** Last 4 commits — refactoring `formatting.fileHeader` data structure and priority chain  
**Reference:** [FILE_HEADER_REFACTOR_PLAN.md](FILE_HEADER_REFACTOR_PLAN.md)

---

## Summary

The refactor introduces a dedicated `formatting.fileHeader` namespace for file header formatting options, separates `fileHeaderCommentStyles` from `commentStyles` enums, and implements a multi-level priority chain in `resolveFileHeaderFormatting()`. Overall, the refactor is well-structured with good backward compatibility. Below are findings ordered by severity.

---

## Critical Findings

### 1. Override Detection Bug in Comment Style Blocks — `file.options.formatting.fileHeader` values silently lost

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L178-L203)

The comment style override blocks (for `short`, `xml`, `long`) re-compute `fileHeaderOpts` using a `??`-based merge that differs from `resolveFileHeaderFormatting()`:

```js
// In resolveFileHeaderFormatting() — checks BOTH separately:
const fileHeaderOpts = formatting.fileHeader ?? {};       // source A
const fileFileHeaderOpts = fileFormatting.fileHeader ?? {}; // source B
const resolvedPrefix = fileHeaderOpts.prefix ?? fileFileHeaderOpts.prefix ?? ...;

// In comment style blocks — checks with short-circuit ??:
const fileHeaderOpts = formatting.fileHeader ?? file?.options?.formatting?.fileHeader ?? {};
if (fileHeaderOpts.prefix === undefined) { prefix = '// '; }
```

**The problem:** If `formatting.fileHeader` exists (e.g., `{ commentStyle: 'short' }`) but doesn't contain `prefix`, the `??` operator returns `formatting.fileHeader` and **never reaches** `file.options.formatting.fileHeader`. So even if `file.options.formatting.fileHeader.prefix = '## '` is set, the block sees `prefix === undefined` and overwrites it with the style default (`'// '`).

Meanwhile, `resolveFileHeaderFormatting()` correctly resolves prefix to `'## '` because it checks both objects independently. The resolved value is then **silently discarded** by the comment style block.

**Scenario:** User configures `formatting.fileHeader.commentStyle: 'short'` at platform level and `file.options.formatting.fileHeader.prefix: '## '` at file level — prefix resolves to `'## '` but gets overwritten to `'// '`.

**Fix:** The comment style blocks should check both sources separately, mirroring `resolveFileHeaderFormatting()`:

```js
const fhOpts = formatting.fileHeader ?? {};
const fileFhOpts = file?.options?.formatting?.fileHeader ?? {};
if (fhOpts.prefix === undefined && fileFhOpts.prefix === undefined) {
  prefix = '// ';
}
```

---

## Moderate Findings

### 2. Inconsistent Comment in `resolveFileHeaderFormatting()` — says "don't inherit" but code does inherit

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L82-L85)

The comment above `resolvedPrefix` says:

> "For prefix, header, footer: only use fileHeader-specific values or defaults. Don't inherit from general formatting as they have different meanings"

But the code **does** fall back to `formatting.prefix` for prefix, and `formatting.header` / `formatting.footer` + `fileFormatting.header` / `fileFormatting.footer` for header/footer. The comment is misleading and should be updated to reflect the actual behavior (backward-compatible inheritance from top-level formatting).

### 3. Asymmetric Fallback Chain for `prefix` vs. `header`/`footer`

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L82-L97)

The resolution chains differ:

| Property | Chain                                                                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| `prefix` | `fileHeaderOpts.prefix` → `fileFileHeaderOpts.prefix` → `formatting.prefix` → default                           |
| `header` | `fileHeaderOpts.header` → `fileFileHeaderOpts.header` → `formatting.header` → `fileFormatting.header` → default |
| `footer` | `fileHeaderOpts.footer` → `fileFileHeaderOpts.footer` → `formatting.footer` → `fileFormatting.footer` → default |

`prefix` is missing `fileFormatting.prefix` (i.e., `file.options.formatting.prefix`). This is intentionally avoided because `getFormattingCloneWithoutPrefix()` strips `prefix` from the formatting passed to `fileHeader()`, but the asymmetry between `prefix` vs `header`/`footer` is not documented and could confuse contributors.

### 4. Priority Chain Mismatch Between Code, Plan, and Documentation

The priority chain differs across three sources:

| Step | Code (`resolveFileHeaderFormatting`)   | Plan (FILE_HEADER_REFACTOR_PLAN.md)                  | Docs (format-helpers.md)               |
| ---- | -------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| 1    | `formatting.fileHeader.*`              | `formatting.fileHeader.*`                            | `formatting.fileHeader.*`              |
| 2    | `file.options.formatting.fileHeader.*` | `file.options.formatting.fileHeader.*`               | `file.options.formatting.fileHeader.*` |
| 3    | `formatting.commentStyle`              | `formatting.*`                                       | `formatting.commentStyle`              |
| 4    | `file.options.formatting.commentStyle` | `file.options.formatting.*`                          | `file.options.commentStyle`            |
| 5    | `file.options.commentStyle`            | `file.options.commentStyle` / `options.commentStyle` | `commentStyle` parameter               |
| 6    | `options.commentStyle`                 | `commentStyle` parameter                             | `'long'` default                       |
| 7    | `commentStyle` parameter               | defaults                                             | —                                      |
| 8    | `'long'` default                       | —                                                    | —                                      |

The documentation is missing two levels: `file.options.formatting.commentStyle` (step 4 in code) and `options.commentStyle` (step 6 in code — the Config-level root `commentStyle`). These omissions could cause confusion when users set these legacy options and observe unexpected behavior.

### 5. `FileHeaderFormatting` Type Not Exported from Barrel

**File:** [types/index.ts](types/index.ts)

Only `FormattingOptions` is exported from the types barrel. `FileHeaderFormatting` and `FormattingOverrides` are **not exported**. TypeScript users who want to type variables as `FileHeaderFormatting` must import directly from `types/File.js` instead of `style-dictionary/types`. Since `FileHeaderFormatting` is a key part of the new public API, it should be exported.

---

## Minor Findings

### 6. `@deprecated` JSDoc Wording is Ambiguous

**File:** [types/File.ts](types/File.ts#L55-L57)

```typescript
/** @deprecated Use `fileHeader.timestamp` instead. Will be removed in v6.0. */
fileHeaderTimestamp?: boolean;
```

Should say `formatting.fileHeader.timestamp` instead of `fileHeader.timestamp` to distinguish from the `file.options.fileHeader` function. By contrast, `Config.commentStyle` correctly says `formatting.fileHeader.commentStyle` — making the inconsistency between the two deprecation messages confusing.

### 7. Stray Backtick in `commentStyles.js` JSDoc

**File:** [lib/enums/commentStyles.js](lib/enums/commentStyles.js) — line 24

```js
 * @property {string} long - Block comment style`
```

Trailing backtick should be removed.

### 8. Example Files Not Updated to Use New API

**Files:**

- [examples/advanced/format-helpers/sd.config.js](examples/advanced/format-helpers/sd.config.js#L7) — imports `commentStyles` and passes `commentStyles.short` to `fileHeader()`
- [examples/advanced/tokens-deprecation/build.js](examples/advanced/tokens-deprecation/build.js#L3) — imports `commentStyles` and passes `commentStyles.long` to `fileHeader()`

Both work via backward compatibility (string values match), but they demonstrate the **old** API rather than the recommended `fileHeaderCommentStyles`. Since examples serve as implicit documentation, they should be updated or at minimum annotated to show the new approach alongside the old.

### 9. `resolveFileHeaderFormatting` Returns Dead Defaults for `short`/`xml` Styles

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L48-L100)

`defaultFileHeaderFormatting` contains defaults for the `long` style (`prefix: ' * '`, `header: '/**\n'`, `footer: '\n */\n\n'`). When the resolved comment style is `short` or `xml`, these defaults are returned from `resolveFileHeaderFormatting()` but immediately overridden by the comment style blocks in `fileHeader()`.

This isn't a bug but is a design inefficiency — the defaults should arguably be computed per-comment-style inside `resolveFileHeaderFormatting()`, consolidating all resolution logic in one place and eliminating the post-resolution override blocks entirely.

---

## Test Coverage Gaps

### 10. Missing Unit Tests

**File:** [\_\_tests\_\_/common/formatHelpers/fileHeader.test.js](__tests__/common/formatHelpers/fileHeader.test.js)

| Missing Scenario                                                                                           | Why It Matters                                                                                                              |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `file.options.formatting.fileHeader.prefix` (file-level prefix via file config)                            | The prefix resolution chain is asymmetric and uses a different fallback than header/footer — this specific path is untested |
| `options.commentStyle` (Config-level root `commentStyle`)                                                  | Step 6 in the priority chain is untested; only `file.options.commentStyle` (step 5) is tested                               |
| Combination: `formatting.fileHeader` exists + `file.options.formatting.fileHeader` has different overrides | Would expose Finding #1 (the `??` short-circuit bug in comment style blocks)                                                |
| `file.options.formatting.fileHeaderTimestamp` (file-level legacy timestamp)                                | Step 4 in the timestamp chain — only `formatting.fileHeaderTimestamp` is tested                                             |

### 11. No Config-File-Based Integration Tests for Legacy Paths

All backward compatibility testing uses inline config objects in test code. There are no JSON/JS config files in `__integration__/` or `__tests__/__configs/` that exercise the legacy `commentStyle` / `fileHeaderTimestamp` settings through the full SD pipeline. While inline tests are valid, config-file-based tests better simulate real user scenarios.

---

## Positive Observations

- **Enum separation is clean:** `fileHeaderCommentStyles` (`short`, `long`, `xml`) vs. `commentStyles` (`short`, `long`, `none`) with proper JSDoc cross-references
- **Backward compatibility is thorough:** Legacy `fileHeaderTimestamp`, `commentStyle` parameter strings, `file.options.commentStyle` all continue to work
- **Documentation is comprehensive:** New API table, priority chain, examples, and deprecation notes in format-helpers.md; CHANGELOG entry under 5.2.0
- **Package exports are correct:** `style-dictionary/enums` exposes `fileHeaderCommentStyles`, `style-dictionary/utils` exposes `fileHeader`
- **All 37 built-in formats** consistently use the new `fileHeaderCommentStyles` destructuring in formats.js
- **`getFormattingCloneWithoutPrefix` correctly preserves** the `fileHeader` sub-object via `structuredClone`
- **`showFileHeader: false`** continues to work and is tested

---

## Recommended Action Items

| Priority | Item                                                                                  | Effort                  |
| -------- | ------------------------------------------------------------------------------------- | ----------------------- |
| **P0**   | Fix Finding #1 — comment style override detection bug in fileHeader.js                | Small (change 3 blocks) |
| **P1**   | Fix Finding #4 — sync docs priority chain with code (2 missing levels)                | Small                   |
| **P1**   | Fix Finding #5 — export `FileHeaderFormatting` from types/index.ts                    | Trivial                 |
| **P1**   | Add unit tests for Finding #10 gaps (4 missing scenarios)                             | Medium                  |
| **P2**   | Fix Finding #2 — update misleading comment in resolveFileHeaderFormatting             | Trivial                 |
| **P2**   | Fix Finding #6 — clarify `@deprecated` wording to `formatting.fileHeader.timestamp`   | Trivial                 |
| **P2**   | Fix Finding #7 — remove stray backtick in commentStyles.js                            | Trivial                 |
| **P3**   | Fix Finding #8 — update example files to showcase new API                             | Small                   |
| **P3**   | Consider Finding #9 — consolidate per-style defaults into resolveFileHeaderFormatting | Medium (design change)  |

---

## Progress Update

**Date:** 2025-02-12 (follow-up)  
**All 943 tests pass** after the fixes below. 0 failures, 2 pending (pre-existing).

### Fixes Applied

| Finding           | Fix                                                                                                                                                                                                                                                                                                                                                               | Files Changed                                                                                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#1 (Critical)** | Replaced `??`-based `fileHeaderOpts` with separate `fhOpts` / `fileFhOpts` variables, checking both independently for `prefix`, `header`, `footer` in all 3 comment style blocks                                                                                                                                                                                  | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L186-L230)                                                                                                     |
| **#2 (Moderate)** | Updated comment to: "fileHeader-specific values take priority, but we fall back to general formatting for backward compatibility. Note: prefix does not fall back to fileFormatting.prefix because getFormattingCloneWithoutPrefix() strips it before reaching here."                                                                                             | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L82-L85)                                                                                                       |
| **#4 (Moderate)** | Added 2 missing levels to docs priority chain: `file.options.formatting.commentStyle` (step 4) and `options.commentStyle` / Config-level root (step 6). Chain now has 8 levels matching the code.                                                                                                                                                                 | [docs/src/content/docs/reference/Utils/format-helpers.md](docs/src/content/docs/reference/Utils/format-helpers.md#L108-L115)                                                                   |
| **#5 (Moderate)** | Exported `FileHeaderFormatting` and `FormattingOverrides` from the types barrel                                                                                                                                                                                                                                                                                   | [types/index.ts](types/index.ts#L23-L28)                                                                                                                                                       |
| **#6 (Minor)**    | Changed `@deprecated` message from `fileHeader.timestamp` to `formatting.fileHeader.timestamp`                                                                                                                                                                                                                                                                    | [types/File.ts](types/File.ts#L58-L60)                                                                                                                                                         |
| **#7 (Minor)**    | Removed stray backtick from `@property {string} long` JSDoc                                                                                                                                                                                                                                                                                                       | [lib/enums/commentStyles.js](lib/enums/commentStyles.js#L24)                                                                                                                                   |
| **#8 (Minor)**    | Updated both example files to import and use `fileHeaderCommentStyles` instead of `commentStyles`. Updated `myOtherFormat` to use the new `formatting.fileHeader` API.                                                                                                                                                                                            | [examples/advanced/format-helpers/sd.config.js](examples/advanced/format-helpers/sd.config.js), [examples/advanced/tokens-deprecation/build.js](examples/advanced/tokens-deprecation/build.js) |
| **#10 (Tests)**   | Added 5 new unit tests: `options.commentStyle` Config-level root, `file.options.formatting.fileHeader.prefix`, `file.options.formatting.fileHeaderTimestamp` legacy, cross-level override preservation (`formatting.fileHeader` + `file.options.formatting.fileHeader` with different properties), and file-level header not overridden by comment style defaults | [\_\_tests\_\_/common/formatHelpers/fileHeader.test.js](__tests__/common/formatHelpers/fileHeader.test.js)                                                                                     |

### New Findings Discovered During Fixes

The following additional weak spots were identified during deeper analysis of the codebase. These are not regressions from the refactor but are pre-existing design concerns that the refactor makes more visible.

#### 12. (Medium) Token `commentStyle: 'none'` Leaks Into File Header Resolution

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L55-L60)

The `resolveFileHeaderFormatting` fallback chain includes `formatting.commentStyle` (priority 3) — which is the **token property** comment style accepting `'short' | 'long' | 'none'`. If a user sets `formatting: { commentStyle: 'none' }` (valid for tokens, meaning "no inline comments"), this value propagates into the file header resolution as an unrecognized comment style. The `'none'` value won't match any of the `if/else if (effectiveCommentStyle === ...)` blocks, so the `long`-style defaults from `resolveFileHeaderFormatting` are used — which happens to work but is accidental and could produce confusing output.

**More subtly:** Setting `formatting: { commentStyle: 'short' }` to get short-style token comments **also** switches the file header from `/** */` to `// ...`, which is the exact cross-contamination the refactor was designed to solve. The fallback chain preserves it for backward compatibility, but it should at minimum be documented as a known behavior.

**Recommendation:** Consider filtering out `'none'` when reading `formatting.commentStyle` for the file header, or document clearly that `formatting.commentStyle` affects both tokens and file headers unless `formatting.fileHeader.commentStyle` is explicitly set.

#### 13. (Medium) Return Type Mismatch — `resolveFileHeaderFormatting` Claims `'short' | 'xml' | 'long'` But Can Return `'none'`

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L42)

The JSDoc return type declares:

```js
@returns {FileHeaderFormatting & { commentStyle: 'short' | 'xml' | 'long' }}
```

But the actual resolved value can be `'none'` (from `formatting.commentStyle`) or any arbitrary string (from `fileOpts.commentStyle` which is typed as `any` via the `[key: string]: any` index signature). TypeScript consumers relying on this return type for exhaustive switch/case handling would miss the `'none'` case.

#### 14. (Medium) Ambiguous Dual Path: `formatting.header`/`footer` vs. `formatting.fileHeader.header`/`footer`

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L88-L99)

`FormattingOverrides.header` and `FormattingOverrides.footer` are used as fallbacks in the file header resolution chain. A user setting `formatting: { header: '/*!\n' }` might intend this for something format-specific, but it silently changes the file header comment opening. Neither `FormattingOverrides.header` nor `FormattingOverrides.footer` have JSDoc explaining this dual role. The backward-compatibility docs mention this, but the TypeScript interface itself provides no hint.

**Recommendation:** Add JSDoc to `FormattingOverrides.header` and `FormattingOverrides.footer` explaining they affect both the format output and the file header (as fallback for `formatting.fileHeader.header`/`footer`).

#### 15. (Low) No Runtime Deprecation Warnings for JS Users

**Files:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L64-L68), [types/File.ts](types/File.ts#L58-L60), [types/Config.ts](types/Config.ts#L118)

`fileHeaderTimestamp` and `Config.commentStyle` are marked `@deprecated` in JSDoc/TypeScript, but there are no `console.warn()` calls when these properties are actually used at runtime. Pure JavaScript users will never see deprecation notices. Since v6.0 plans to remove these properties, a runtime warning would help users migrate.

#### 16. (Low) `fileHeader` Sub-Object Leaks Into `createPropertyFormatter`

**File:** [lib/common/formats.js](lib/common/formats.js) (multiple locations)

Formats that spread `formatting` into `createPropertyFormatter` (e.g., `{ suffix: '', ...formatting }`) include the `fileHeader` sub-object as noise in the merged options. While harmless at runtime, a future change to `createPropertyFormatter` that iterates over properties or validates them could break.

#### 17. (Low) Stale JSDoc on `createPropertyFormatter` Lists File Header Properties

**File:** [lib/common/formatHelpers/createPropertyFormatter.js](lib/common/formatHelpers/createPropertyFormatter.js#L111)

The JSDoc lists `fileHeaderTimestamp`, `header`, and `footer` as configurable formatting strings for the property formatter. Post-refactor, these are file-header concerns, not property-formatter concerns. The JSDoc is misleading.

#### 18. (Info) `showFileHeader: false` Silently Discards All `formatting.fileHeader` Settings

**File:** [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L153-L157)

When `showFileHeader: false`, the function returns `''` immediately, ignoring all `formatting.fileHeader` settings including `timestamp`. This is correct behavior, but the combination is untested and undocumented. A user setting both may wonder why their timestamp doesn't appear.

#### 19. (Info) No Config Validation — Typos in `formatting.fileHeader` Are Silently Ignored

The `LocalOptions` interface in [types/Config.ts](types/Config.ts#L39-L44) has `[key: string]: any`, so any arbitrary formatting properties pass TypeScript checking. A typo like `formatting: { fileHeadr: { commentStyle: 'short' } }` is silently accepted with no error, and the user gets default behavior with no indication their config is being ignored. This is a pre-existing concern but becomes more likely with the new nested API.

### Updated Action Items (New Findings)

| Priority | Item                                                                                                                                 | Effort  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| **P1**   | Finding #12 — filter `'none'` from `formatting.commentStyle` in file header resolution, or document the cross-contamination behavior | Small   |
| **P2**   | Finding #13 — fix JSDoc return type to include `'none'` or add runtime guard                                                         | Trivial |
| **P2**   | Finding #14 — add JSDoc to `FormattingOverrides.header`/`footer` clarifying dual role                                                | Trivial |
| **P2**   | Finding #15 — add runtime `console.warn()` for deprecated `fileHeaderTimestamp` and `Config.commentStyle`                            | Small   |
| **P3**   | Finding #16 — consider destructuring out `fileHeader` before spreading into `createPropertyFormatter`                                | Small   |
| **P3**   | Finding #17 — update stale JSDoc on `createPropertyFormatter`                                                                        | Trivial |
| **P3**   | Finding #18 — add test for `showFileHeader: false` + `formatting.fileHeader` combination                                             | Trivial |
| **P3**   | Finding #19 — consider adding runtime config validation for `formatting` shape                                                       | Medium  |

---

## Progress Update 2 — Findings #12–#19 Fixed

**Date:** 2025-02-12 (second follow-up)  
**All 949 tests pass** (6 new tests added). TypeScript compiles cleanly (`tsc --noEmit` — 0 errors).

### Fixes Applied

| Finding          | Fix                                                                                                                                                                                                                                                                                                                                                                                       | Files Changed                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **#12 (Medium)** | Added `validFileHeaderCommentStyles` Set. `formatting.commentStyle` and `fileFormatting.commentStyle` are now validated against valid file header styles before entering the priority chain. A value of `'none'` (valid for token comments, invalid for file headers) is filtered out and the chain falls through to the next level.                                                      | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L14)                                 |
| **#13 (Medium)** | Resolved implicitly by #12 — the `resolvedCommentStyle` can no longer receive `'none'` from the token `commentStyle` fallback, so the return type `'short' \| 'xml' \| 'long'` is now accurate. Added proper JSDoc type casts to satisfy TypeScript.                                                                                                                                      | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L110-L118)                           |
| **#14 (Medium)** | Added JSDoc to `FormattingOverrides.header` and `FormattingOverrides.footer` explaining their dual role: they affect both the output format and act as a fallback for the file header opening/closing comment when `formatting.fileHeader.header`/`footer` is not set.                                                                                                                    | [types/File.ts](types/File.ts#L56-L63)                                                                               |
| **#15 (Low)**    | Added `warnDeprecatedOnce()` helper that emits `console.warn()` once per unique message. Deprecation warnings are now emitted at runtime for: `formatting.fileHeaderTimestamp`, `file.options.formatting.fileHeaderTimestamp`, `file.options.commentStyle`, and `options.commentStyle` (Config-level root). All warnings include the recommended replacement and note about v6.0 removal. | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L28-L40)                             |
| **#16 (Low)**    | Added `{ fileHeader: _fh, ...cleanFormatting } = formatting` destructuring inside `createPropertyFormatter` to strip the `fileHeader` sub-object before merging into `mergedOptions`. This covers all callers (including custom formats using the public `createPropertyFormatter` API) without requiring changes to individual format call sites.                                        | [lib/common/formatHelpers/createPropertyFormatter.js](lib/common/formatHelpers/createPropertyFormatter.js#L120-L123) |
| **#17 (Low)**    | Updated the JSDoc to list only the properties actually consumed by `createPropertyFormatter`: `prefix`, `indentation`, `separator`, `suffix`, `lineSeparator`, `commentStyle`, `commentPosition`. Removed `fileHeaderTimestamp`, `header`, `footer` and added a note that those are consumed by the `fileHeader()` helper instead.                                                        | [lib/common/formatHelpers/createPropertyFormatter.js](lib/common/formatHelpers/createPropertyFormatter.js#L113)      |
| **#18 (Info)**   | Added unit test: `showFileHeader: false` returns `''` even when `formatting.fileHeader` is set with `commentStyle`, `timestamp`, and `prefix`. Confirms the correct behavior is tested.                                                                                                                                                                                                   | [\_\_tests\_\_/common/formatHelpers/fileHeader.test.js](__tests__/common/formatHelpers/fileHeader.test.js)           |
| **#19 (Info)**   | Added `knownFileHeaderKeys` Set and `warnUnknownFileHeaderKeys()` helper. Both `formatting.fileHeader` and `file.options.formatting.fileHeader` are now validated on each `resolveFileHeaderFormatting()` call. Unknown keys (e.g., typo `commentStlye`) trigger a `console.warn()` listing the valid property names. Added test covering the typo scenario.                              | [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L17-L50)                             |

### New Tests Added (6 total)

| Test                                                                                      | Validates                                                      |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `should ignore commentStyle 'none' from formatting.commentStyle and fall back to default` | Finding #12 — `'none'` is filtered out, falls back to `'long'` |
| `should ignore commentStyle 'none' and use commentStyle parameter as fallback`            | Finding #12 — `'none'` filtered, `commentStyle` param used     |
| `showFileHeader false should return empty string even with formatting.fileHeader set`     | Finding #18 — `showFileHeader` takes precedence                |
| `should warn when using legacy fileHeaderTimestamp`                                       | Finding #15 — runtime deprecation warning emitted              |
| `should warn when using legacy file.options.commentStyle`                                 | Finding #15 — runtime deprecation warning emitted              |
| `should warn about unknown keys in formatting.fileHeader`                                 | Finding #19 — typo detection warning emitted                   |

### Implementation Notes

- **`_resetDeprecationWarnings()`** — A private test-only export was added to `fileHeader.js` to allow the `warnDeprecatedOnce()` deduplication set to be cleared between test cases. Without this, the "warn once" behavior means earlier tests consuming legacy APIs would prevent later deprecation-specific tests from observing warnings.
- **`createPropertyFormatter` stripping** — The `fileHeader` sub-object is stripped via destructuring inside `createPropertyFormatter` rather than at each of the 37+ call sites in `formats.js`. This means custom format authors using the public `createPropertyFormatter` API also benefit automatically.
