import { expect } from 'chai';
import { fixDate } from '../../__helpers.js';
import fileHeader from '../../../lib/common/formatHelpers/fileHeader.js';
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
    });
  });
});
