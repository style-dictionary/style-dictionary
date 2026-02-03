# Plan: Refactor File Header Settings into formatting.fileHeader

The current implementation has a critical architectural bug: [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js) imports the wrong enum (`commentStyles` instead of `fileHeaderCommentStyles`), forcing workarounds with string literals. While the two enums serve conceptually distinct purposes (file headers vs token comments), they're incorrectly mixed. This plan separates concerns cleanly with dedicated `formatting.fileHeader` object, fixes enum usage, renames `commentStyles` to `tokenCommentStyles`, and provides full backward compatibility.

## Steps

### 1. Create new type structure in [types/File.ts](types/File.ts#L21-L32)

- Add `FileHeaderFormatting` interface with: `commentStyle?: 'short' | 'long' | 'xml'`, `prefix?`, `lineSeparator?`, `header?`, `footer?`, `timestamp?: boolean`
- Update `FormattingOverrides` to include `fileHeader?: FileHeaderFormatting`
- Add JSDoc `@deprecated` to `fileHeaderTimestamp` in `FormattingOverrides` (moved to `fileHeader.timestamp`)
- Keep existing `commentStyle?: commentStyles[keyof commentStyles]` for token comments with JSDoc note: "For token comments. For file header comment style, use `formatting.fileHeader.commentStyle`"
- Import and reference both enum types appropriately in TypeScript definitions

### 2. Rename commentStyles enum in [lib/enums/commentStyles.js](lib/enums/commentStyles.js)

- Rename primary export from `commentStyles` to `tokenCommentStyles` (values: `short`, `long`, `none`)
- Add backward compatible re-export: `export const commentStyles = tokenCommentStyles` with JSDoc `@deprecated Use tokenCommentStyles for token comments, or fileHeaderCommentStyles for file headers`
- Update [lib/enums/index.js](lib/enums/index.js#L1-L14) to export `tokenCommentStyles` as primary, `commentStyles` as deprecated alias
- Add documentation to [lib/enums/fileHeaderCommentStyles.js](lib/enums/fileHeaderCommentStyles.js) clarifying distinction: "Use for file header comments. Values: short, long, xml. For token property comments, use tokenCommentStyles"

### 3. Fix critical bug and add backward compatibility in [lib/common/formatHelpers/fileHeader.js](lib/common/formatHelpers/fileHeader.js#L1-L90)

- Change import from `commentStyles` to `fileHeaderCommentStyles` (line 1) - **fixes the existing bug**
- Update string literal `'xml'` check (line 82) to use `fileHeaderCommentStyles.xml`
- Implement backward compatibility layer: detect old patterns (`commentStyle` parameter, `formatting.fileHeaderTimestamp`, `file.options.commentStyle`) and map to `formatting.fileHeader`
- Add deprecation warning via `GroupMessages.add(FILE_HEADER_DEPRECATION, ...)` when old patterns detected
- New priority chain: `formatting?.fileHeader` > `file?.options?.formatting?.fileHeader` > legacy fallbacks (with warnings) > defaults
- Create `FILE_HEADER_DEPRECATION` constant in [lib/utils/groupMessages.js](lib/utils/groupMessages.js#L1-L19)

### 4. Refactor all format implementations in [lib/common/formats.js](lib/common/formats.js#L165-L1748)

- Replace `getFormattingCloneWithoutPrefix()` (line 165) with new `buildFileHeaderFormatting(commentStyle, formatting)` helper that constructs proper `fileHeader` object
- Update all 37 formats to use new helper: pass format-specific comment style ('short', 'long', or 'xml') and user's formatting to build merged config
- Remove all hardcoded `commentStyle` parameters from `fileHeader()` calls (lines 261, 295, 332, 365, 387, 419, 442, 667, 932, 967, 1002, 1037, 1074, 1110, 1210, and iOS formats)
- Update [lib/common/templates/android/resourceType.template.js](lib/common/templates/android/resourceType.template.js) and [lib/common/templates/ios/macros.template.js](lib/common/templates/ios/macros.template.js) similarly
- Ensure Android XML formats (lines 932, 967, 1002, 1037, 1074, 1110) use `commentStyle: 'xml'`, iOS plist (line 1210) uses `'xml'`, others use appropriate values

### 5. Update token comment usages to new enum in [lib/common/formatHelpers/formattedVariables.js](lib/common/formatHelpers/formattedVariables.js) and [lib/common/formatHelpers/createPropertyFormatter.js](lib/common/formatHelpers/createPropertyFormatter.js)

- Change imports from `commentStyles` to `tokenCommentStyles` (keep backward compatible alias working)
- Update destructuring: `const { short, long, none } = tokenCommentStyles`
- Update default value usage (line 247 in formattedVariables.js, line 31 in createPropertyFormatter.js)
- No breaking changes needed since values are identical, just clearer naming

### 6. Update tests with new API and comprehensive deprecation coverage

- Add backward compatibility tests in [\_\_tests\_\_/common/formatHelpers/fileHeader.test.js](\_\_tests\_\_/common/formatHelpers/fileHeader.test.js): verify old `commentStyle` parameter works, verify `formatting.fileHeaderTimestamp` works, verify deprecation warnings emitted using `stubMethod(console, 'log')` pattern
- Update [\_\_integration\_\_/customFileHeader.test.js](\_\_integration\_\_/customFileHeader.test.js) and [\_\_integration\_\_/showFileHeader.test.js](\_\_integration\_\_/showFileHeader.test.js) to include both old and new API examples
- Update [\_\_tests\_\_/common/formatHelpers/formattedVariables.test.js](\_\_tests\_\_/common/formatHelpers/formattedVariables.test.js) to use `tokenCommentStyles` enum (verify backward compatible `commentStyles` alias still works)
- Regenerate snapshots in `__integration__/__snapshots__/` where needed
- Add snapshot test for deprecation warning message format in logging tests

### 7. Update documentation with migration guide

- Add comprehensive section in [docs/src/content/docs/reference/Utils/format-helpers.md](docs/src/content/docs/reference/Utils/format-helpers.md) documenting new `formatting.fileHeader` API
- Create migration guide showing transformation examples: Old `formatting: { fileHeaderTimestamp: true }` → New `formatting: { fileHeader: { timestamp: true } }`
- Update enum documentation explaining `tokenCommentStyles` (for token property comments) vs `fileHeaderCommentStyles` (for file header comments)
- Add [CHANGELOG.md](CHANGELOG.md) entries: "Deprecated" section for old patterns, "Added" section for new `formatting.fileHeader` API, note v6.0.0 removal
- Prominently note in migration guide: custom formats passing `commentStyle` parameter to `fileHeader()` should migrate to `formatting.fileHeader.commentStyle`

## Further Considerations

1. **Deprecation warning verbosity** - Show at `default` level since this affects user configurations directly, or only at `verbose` to reduce noise? Recommend `default` with helpful migration message.
2. **Fix the xml string literal immediately** - Should we fix the bug in [fileHeader.js](lib/common/formatHelpers/fileHeader.js#L82) (using wrong enum) as a patch release before this refactor, or include it as part of this change? Recommend including in this refactor to avoid two breaking changes.
3. **Platform-level formatting.fileHeader** - The research shows formats define file header styles, but should platform `options.formatting.fileHeader` override format defaults? Recommend yes for consistency with current `formatting` override behavior.
