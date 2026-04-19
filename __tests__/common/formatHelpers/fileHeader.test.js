import { expect } from 'chai';
import { fixDate } from '../../__helpers.js';
import fileHeader from '../../../lib/common/formatHelpers/fileHeader.js';
import { _resetDeprecationWarnings } from '../../../lib/common/formatHelpers/fileHeader.js';
import { fileHeaderCommentStyles, commentStyles } from '../../../lib/enums/index.js';

const defaultLine1 = `Do not edit directly, this file was auto-generated.`;
const defaultLine2 = `Generated on Sat, 01 Jan 2000 00:00:00 GMT`;

describe('common', () => {
  describe('formatHelpers', () => {
    beforeEach(() => {
      // reset Date again, for some reasons these tests are flaky otherwise in the pipelines
      fixDate();
    });

    describe('fileHeader', () => {
      describe('default behavior', () => {
        it(`should default to /**/ comment style`, async () => {
          const comment = await fileHeader({});
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */

`,
          );
        });

        it(`should handle showFileHeader option`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                showFileHeader: false,
              },
            },
          });
          expect(comment).to.equal('');
        });
      });

      describe('comment styles', () => {
        it(`should handle commentStyle short via parameter`, async () => {
          const comment = await fileHeader({ commentStyle: fileHeaderCommentStyles.short });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });

        it(`should handle commentStyle long via parameter`, async () => {
          const comment = await fileHeader({ commentStyle: fileHeaderCommentStyles.long });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */

`,
          );
        });

        it(`should handle commentStyle xml via parameter`, async () => {
          const comment = await fileHeader({ commentStyle: fileHeaderCommentStyles.xml });
          expect(comment).to.equal(
            `<!--
  ${defaultLine1}
-->`,
          );
        });

        it(`should handle commentStyle xml as string literal (backward compat)`, async () => {
          const comment = await fileHeader({ commentStyle: 'xml' });
          expect(comment).to.equal(
            `<!--
  ${defaultLine1}
-->`,
          );
        });
      });

      describe('formatting.fileHeader API', () => {
        it(`should allow setting commentStyle via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'short',
              },
            },
          });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });

        it(`should allow setting timestamp via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                timestamp: true,
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 * ${defaultLine2}
 */

`,
          );
        });

        it(`should allow setting prefix via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                prefix: ' # ',
              },
            },
          });
          expect(comment).to.equal(
            `/**
 # ${defaultLine1}
 */

`,
          );
        });

        it(`should allow setting header via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                header: '/*!\n',
              },
            },
          });
          expect(comment).to.equal(
            `/*!
 * ${defaultLine1}
 */

`,
          );
        });

        it(`should allow setting footer via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                footer: '\n */\n',
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */
`,
          );
        });

        it(`should allow setting lineSeparator via formatting.fileHeader`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                lineSeparator: '\r\n',
                timestamp: true,
              },
            },
          });
          expect(comment).to.equal(
            `/**\r\n * ${defaultLine1}\r\n * ${defaultLine2}\r\n */\r\n\r\n`,
          );
        });

        it(`should allow combining multiple fileHeader options`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'short',
                timestamp: true,
                prefix: '## ',
                header: '# ---\n',
                footer: '\n# ---\n',
              },
            },
          });
          expect(comment).to.equal(
            `# ---
## ${defaultLine1}
## ${defaultLine2}
# ---
`,
          );
        });
      });

      describe('priority chain', () => {
        it(`formatting.fileHeader.commentStyle should override commentStyle parameter`, async () => {
          const comment = await fileHeader({
            commentStyle: 'short', // format's default
            formatting: {
              fileHeader: {
                commentStyle: 'long', // user override
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */

`,
          );
        });

        it(`formatting.fileHeader.commentStyle should override formatting.commentStyle`, async () => {
          const comment = await fileHeader({
            formatting: {
              commentStyle: 'short', // general formatting
              fileHeader: {
                commentStyle: 'long', // fileHeader-specific override
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */

`,
          );
        });

        it(`formatting.commentStyle should be used if fileHeader.commentStyle not set`, async () => {
          const comment = await fileHeader({
            commentStyle: 'long', // format's default
            formatting: {
              commentStyle: 'short', // general formatting should be used
            },
          });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });

        it(`file.options.commentStyle should override commentStyle parameter (legacy)`, async () => {
          const comment = await fileHeader({
            commentStyle: 'long', // format's default
            file: {
              options: {
                commentStyle: 'short', // legacy file-level override
              },
            },
          });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });

        it(`file.options.formatting.fileHeader should work`, async () => {
          const comment = await fileHeader({
            commentStyle: 'long',
            file: {
              options: {
                formatting: {
                  fileHeader: {
                    commentStyle: 'xml',
                  },
                },
              },
            },
          });
          expect(comment).to.equal(
            `<!--
  ${defaultLine1}
-->`,
          );
        });

        it(`formatting.fileHeader.timestamp should override formatting.fileHeaderTimestamp`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeaderTimestamp: false, // legacy
              fileHeader: {
                timestamp: true, // new API override
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 * ${defaultLine2}
 */

`,
          );
        });
      });

      describe('backward compatibility', () => {
        it(`should allow adding timestamp via legacy fileHeaderTimestamp`, async () => {
          const comment = await fileHeader({ formatting: { fileHeaderTimestamp: true } });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 * ${defaultLine2}
 */

`,
          );
        });

        it('should handle custom formatting via top-level properties (legacy)', async () => {
          const comment = await fileHeader({
            formatting: {
              prefix: `  `,
              header: `{#\n`,
              footer: `\n#}`,
            },
          });
          expect(comment).to.equal(
            `{#
  ${defaultLine1}
#}`,
          );
        });

        it(`should handle commentStyle short via string (backward compat)`, async () => {
          const comment = await fileHeader({ commentStyle: 'short' });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });
      });

      describe('custom fileHeader function', () => {
        it(`should handle custom fileHeader function`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                fileHeader: () => {
                  return [`Never gonna give you up`, `Never gonna let you down`];
                },
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * Never gonna give you up
 * Never gonna let you down
 */

`,
          );
        });

        it(`should handle custom fileHeader function with default`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                fileHeader: (defaultMessage) => {
                  return [...defaultMessage, `Never gonna give you up`, `Never gonna let you down`];
                },
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 * Never gonna give you up
 * Never gonna let you down
 */

`,
          );
        });

        it(`should work with custom fileHeader function and formatting.fileHeader options`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                fileHeader: (defaultMessage) => {
                  return [...defaultMessage, `Custom line`];
                },
              },
            },
            formatting: {
              fileHeader: {
                commentStyle: 'short',
                timestamp: true,
              },
            },
          });
          expect(comment).to.equal(
            `
// ${defaultLine1}
// ${defaultLine2}
// Custom line

`,
          );
        });
      });

      describe('comment style formatting overrides', () => {
        it(`short style should not override explicitly set prefix`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'short',
                prefix: '## ',
              },
            },
          });
          expect(comment).to.equal(
            `
## ${defaultLine1}

`,
          );
        });

        it(`xml style should not override explicitly set prefix`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'xml',
                prefix: '    ',
              },
            },
          });
          expect(comment).to.equal(
            `<!--
    ${defaultLine1}
-->`,
          );
        });

        it(`short style should not override explicitly set header/footer`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'short',
              },
              header: '# BEGIN\n',
              footer: '\n# END\n',
            },
          });
          expect(comment).to.equal(
            `# BEGIN
// ${defaultLine1}
# END
`,
          );
        });
      });

      it(`should handle commentStyle passed via formatting options`, async () => {
        const comment = await fileHeader({ formatting: { commentStyle: commentStyles.short } });
        expect(comment).to.equal(
          `
// ${defaultLine1}

`,
        );
      });

      describe('additional priority chain coverage', () => {
        it(`options.commentStyle (Config-level root) should override commentStyle parameter`, async () => {
          const comment = await fileHeader({
            commentStyle: 'long', // format's default
            options: {
              commentStyle: 'short', // Config-level root override
            },
          });
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });

        it(`file.options.formatting.fileHeader.prefix should be respected`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                formatting: {
                  fileHeader: {
                    prefix: '## ',
                  },
                },
              },
            },
          });
          expect(comment).to.equal(
            `/**
## ${defaultLine1}
 */

`,
          );
        });

        it(`file.options.formatting.fileHeaderTimestamp (file-level legacy) should work`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                formatting: {
                  fileHeaderTimestamp: true,
                },
              },
            },
          });
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 * ${defaultLine2}
 */

`,
          );
        });

        it(`file.options.formatting.fileHeader overrides should not be lost when formatting.fileHeader also exists`, async () => {
          // This tests that file-level prefix is preserved even when
          // formatting.fileHeader exists with a different property (commentStyle)
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'short', // platform-level commentStyle
              },
            },
            file: {
              options: {
                formatting: {
                  fileHeader: {
                    prefix: '## ', // file-level prefix should be kept
                  },
                },
              },
            },
          });
          expect(comment).to.equal(
            `
## ${defaultLine1}

`,
          );
        });

        it(`file-level fileHeader.header should not be overridden by comment style defaults`, async () => {
          const comment = await fileHeader({
            formatting: {
              fileHeader: {
                commentStyle: 'xml',
              },
            },
            file: {
              options: {
                formatting: {
                  fileHeader: {
                    header: '<!-- LICENSE\n',
                  },
                },
              },
            },
          });
          expect(comment).to.equal(
            `<!-- LICENSE
  ${defaultLine1}
-->`,
          );
        });
      });

      describe('commentStyle none filtering', () => {
        it(`should ignore commentStyle 'none' from formatting.commentStyle and fall back to default`, async () => {
          // 'none' is valid for token comments but not for file headers
          const comment = await fileHeader({
            formatting: {
              commentStyle: 'none',
            },
          });
          // Should fall back to 'long' (default) instead of using 'none'
          expect(comment).to.equal(
            `/**
 * ${defaultLine1}
 */

`,
          );
        });

        it(`should ignore commentStyle 'none' and use commentStyle parameter as fallback`, async () => {
          const comment = await fileHeader({
            commentStyle: 'short',
            formatting: {
              commentStyle: 'none',
            },
          });
          // 'none' is filtered, so commentStyle parameter 'short' should be used
          expect(comment).to.equal(
            `
// ${defaultLine1}

`,
          );
        });
      });

      describe('showFileHeader interaction with formatting.fileHeader', () => {
        it(`showFileHeader false should return empty string even with formatting.fileHeader set`, async () => {
          const comment = await fileHeader({
            file: {
              options: {
                showFileHeader: false,
              },
            },
            formatting: {
              fileHeader: {
                commentStyle: 'short',
                timestamp: true,
                prefix: '## ',
              },
            },
          });
          expect(comment).to.equal('');
        });
      });

      describe('runtime deprecation warnings', () => {
        let warnings;
        let originalWarn;

        beforeEach(() => {
          warnings = [];
          originalWarn = console.warn;
          console.warn = (msg) => warnings.push(msg);
          // Reset the "warn once" tracker so each test can observe its own warnings
          _resetDeprecationWarnings();
        });

        afterEach(() => {
          console.warn = originalWarn;
        });

        it(`should warn when using legacy fileHeaderTimestamp`, async () => {
          await fileHeader({ formatting: { fileHeaderTimestamp: true } });
          expect(
            warnings.some((w) => w.includes('fileHeaderTimestamp') && w.includes('deprecated')),
          ).to.be.true;
        });

        it(`should warn when using legacy file.options.commentStyle`, async () => {
          await fileHeader({
            file: { options: { commentStyle: 'short' } },
          });
          expect(
            warnings.some(
              (w) => w.includes('file.options.commentStyle') && w.includes('deprecated'),
            ),
          ).to.be.true;
        });

        it(`should warn about unknown keys in formatting.fileHeader`, async () => {
          await fileHeader({
            formatting: {
              fileHeader: {
                commentStlye: 'short', // typo
              },
            },
          });
          expect(warnings.some((w) => w.includes('commentStlye') && w.includes('Unknown'))).to.be
            .true;
        });
      });
    });
  });
});
