# Plan: Refactor File Header Settings into formatting.fileHeader

## Problem Statement

The current implementation has overlapping formatting properties that are consumed by both the fileHeader and the format itself. For example, `File.options.formatting.lineSeparator` is used by both contexts, leading to confusion. Additionally, `fileHeader.js` imports `commentStyles` instead of `fileHeaderCommentStyles`, forcing workarounds with string literals for XML comments.

**Key maintainer decision:** Do NOT rename `commentStyles` to `tokenCommentStyles`. The concept is the same (`commentStyle`), just the context differs. The solution is to configure it distinctly via `formatting.fileHeader.commentStyle`.

## Implemented Changes

### 1. ✅ Create new type structure in [types/File.ts](types/File.ts)

- Added `FileHeaderFormatting` interface with: `commentStyle`, `prefix`, `lineSeparator`, `header`, `footer`, `timestamp`
- Updated `FormattingOverrides` to include `fileHeader?: FileHeaderFormatting`
- Added JSDoc `@deprecated` to `fileHeaderTimestamp` (moved to `fileHeader.timestamp`)
- Added JSDoc note to `commentStyle` clarifying: "For token property comments. For file header comment style, use `formatting.fileHeader.commentStyle`"
- Imported `fileHeaderCommentStyles` enum type

### 2. ✅ Fix enum import and implement priority chain in [fileHeader.js](lib/common/formatHelpers/fileHeader.js)

- Changed import from `commentStyles` to `fileHeaderCommentStyles` - **fixes the bug**
- Updated string literal `'xml'` to use `fileHeaderCommentStyles.xml`
- Implemented new priority chain via `resolveFileHeaderFormatting()`:
  1. `formatting.fileHeader.*` (most specific)
  2. `file.options.formatting.fileHeader.*`
  3. `formatting.*` (general formatting, backward compat)
  4. `file.options.formatting.*` (legacy)
  5. `file.options.commentStyle` / `options.commentStyle` (legacy)
  6. `commentStyle` parameter (format's default)
  7. defaults
- Maintained backward compatibility for `fileHeaderTimestamp`

## Remaining Steps

### 3. Add JSDoc documentation to enums

**File:** [lib/enums/fileHeaderCommentStyles.js](lib/enums/fileHeaderCommentStyles.js)

- Add JSDoc clarifying: "Use for file header comments. Values: short, long, xml."

**File:** [lib/enums/commentStyles.js](lib/enums/commentStyles.js)

- Add JSDoc clarifying: "Use for token property comments. Values: short, long, none."

### 4. Update formats.js to pass formatting correctly

**File:** [lib/common/formats.js](lib/common/formats.js)

- Keep `getFormattingCloneWithoutPrefix()` but update to preserve `fileHeader` property
- Formats continue passing `commentStyle` as parameter (format's default)
- The `fileHeader()` function handles the priority chain internally
- No need to change all 37 formats - they already pass `formatting` and `options`

### 5. Update unit tests

**File:** [\_\_tests\_\_/common/formatHelpers/fileHeader.test.js](__tests__/common/formatHelpers/fileHeader.test.js)

Add tests for:

- New `formatting.fileHeader` API (commentStyle, timestamp, prefix, etc.)
- Priority chain (fileHeader-specific overrides general formatting)
- Backward compatibility (legacy `fileHeaderTimestamp` still works)
- Backward compatibility (legacy `commentStyle` parameter still works)
- All three comment styles: short, long, xml

### 6. Update integration tests

**Files:**

- [\_\_integration\_\_/customFileHeader.test.js](__integration__/customFileHeader.test.js)
- [\_\_integration\_\_/showFileHeader.test.js](__integration__/showFileHeader.test.js)

Add tests for:

- Platform-level `formatting.fileHeader` overrides
- File-level `formatting.fileHeader` overrides
- Both old and new API working together

### 7. Update documentation

**File:** [docs/src/content/docs/reference/Utils/format-helpers.md](docs/src/content/docs/reference/Utils/format-helpers.md)

- Document new `formatting.fileHeader` API with examples
- Show migration path from old to new API
- Clarify priority chain

**File:** [CHANGELOG.md](CHANGELOG.md)

Add entries:

- **Added:** `formatting.fileHeader` option for file-header-specific formatting
- **Deprecated:** `formatting.fileHeaderTimestamp` (use `formatting.fileHeader.timestamp`)
- Note: v6.0.0 will remove deprecated options

## API Design (per maintainer)

```javascript
{
  platforms: {
    css: {
      files: [{
        format: 'css/variables',
        options: {
          formatting: {
            commentStyle: 'long', // for tokens AND fileHeader (if fileHeader.commentStyle not set)
            fileHeader: {
              commentStyle: 'short', // override for fileHeader only
              timestamp: true,
              prefix: ' * ',
              header: '/*!\n',
              footer: '\n */\n\n',
            }
          }
        }
      }],
      options: {
        formatting: {
          commentStyle: 'short', // platform default for all files
          fileHeader: {
            commentStyle: 'long', // platform default for fileHeaders
          }
        }
      }
    }
  }
}
```

## Priority Chain Summary

For `commentStyle`:

1. `formatting.fileHeader.commentStyle` - most specific
2. `file.options.formatting.fileHeader.commentStyle`
3. `formatting.commentStyle` - general (tokens + fileHeader follow)
4. `file.options.formatting.commentStyle`
5. `file.options.commentStyle` - legacy direct option
6. `options.commentStyle` - legacy
7. `commentStyle` parameter - format's default
8. `'long'` - default

## Backward Compatibility

All existing configurations continue to work:

- `formatting.fileHeaderTimestamp: true` → works (mapped to `fileHeader.timestamp`)
- `file.options.commentStyle: 'short'` → works (legacy support)
- `fileHeader({ commentStyle: 'xml' })` → works (format default parameter)
