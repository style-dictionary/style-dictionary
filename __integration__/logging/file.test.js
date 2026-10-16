import { expect } from 'chai';
import { restore, stubMethod } from 'hanbi';
import StyleDictionary from 'style-dictionary';
import { getReferences, usesReferences } from 'style-dictionary/utils';
import { buildPath, cleanConsoleOutput } from '../_constants.js';
import { clearOutput } from '../../__tests__/__helpers.js';
import GroupMessages from '../../lib/utils/groupMessages.js';
import {
  formats,
  logWarningLevels,
  logVerbosityLevels,
  transforms,
  transformGroups,
} from '../../lib/enums/index.js';

const { silent, verbose } = logVerbosityLevels;
const { error: errorLog, disabled } = logWarningLevels;
const { attributeCti } = transforms;
const { cssVariables } = formats;
const { css } = transformGroups;

/**
 * The last and final level of logging: file.
 * These logs happen when a file is being built and will notify the user
 * if there are issues generating a file. These issues might include
 * skipping building an empty file, property name collisions, or filtered
 * out references.
 */
describe(`integration`, () => {
  let stub;
  beforeEach(() => {
    stub = stubMethod(console, 'log');
  });
  afterEach(() => {
    restore();
    clearOutput(buildPath);
  });

  describe(`logging`, () => {
    describe(`file`, () => {
      describe('empty tokens', () => {
        it(`should warn user about empty tokens`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                files: [
                  {
                    destination: `empty.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `foo`,
                  },
                ],
              },
            },
          });

          await sd.buildAllPlatforms();
          const logs = Array.from(stub.calls).flatMap((call) => call.args);
          const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should not warn user about empty tokens with silent log verbosity`, async () => {
          const sd = new StyleDictionary({
            log: { verbosity: silent },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                files: [
                  {
                    destination: `empty.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `foo`,
                  },
                ],
              },
            },
          });

          await sd.buildAllPlatforms();
          expect(stub.callCount).to.equal(0);
        });

        it(`should not warn user about empty tokens with silent log verbosity`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: disabled },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                files: [
                  {
                    destination: `empty.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `foo`,
                  },
                ],
              },
            },
          });

          await sd.buildAllPlatforms();
          // 1 due to success log "css"
          expect(stub.callCount).to.equal(1);
        });

        it(`should not warn user about empty tokens with log level set to error`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: errorLog },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                files: [
                  {
                    destination: `empty.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `foo`,
                  },
                ],
              },
            },
          });

          await expect(sd.buildAllPlatforms()).to.eventually.rejectedWith(
            'No tokens for empty.css. File not created.',
          );
        });

        it(`should not warn user about empty tokens with log level set to error on platform level`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                log: { warnings: errorLog },
                transformGroup: css,
                files: [
                  {
                    destination: `empty.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `foo`,
                  },
                ],
              },
            },
          });

          await expect(sd.buildAllPlatforms()).to.eventually.rejectedWith(
            'No tokens for empty.css. File not created.',
          );
        });
      });

      describe('name collisions', () => {
        it(`should warn users briefly of name collisions by default`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          const logs = Array.from(stub.calls).flatMap((call) => call.args);
          const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should not warn user of name collisions with log verbosity silent`, async () => {
          const sd = new StyleDictionary({
            log: { verbosity: silent },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          expect(stub.callCount).to.equal(0);
        });

        it(`should not warn user of name collisions with log verbosity silent`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: disabled },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          // 1 due to success log "css"
          expect(stub.callCount).to.equal(1);
        });

        it(`should throw a brief error of name collisions with log level set to error`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: errorLog },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
        });

        it(`should throw a brief error of name collisions with log level set to error on platform level`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                log: { warnings: errorLog },
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
          // only log is the platform name at the start of the buildPlatform method
        });

        it(`should warn user of name collisions with a detailed message through "verbose" verbosity`, async () => {
          const sd = new StyleDictionary({
            log: { verbosity: verbose },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          const logs = Array.from(stub.calls).flatMap((call) => call.args);
          const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should throw detailed error of name collisions through "verbose" verbosity and log level set to error`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: errorLog, verbosity: verbose },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                // no name transform means there will be name collisions
                transforms: [attributeCti],
                buildPath,
                files: [
                  {
                    destination: `nameCollisions.css`,
                    format: cssVariables,
                    filter: (token) => token.type === `color`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
        });
      });

      describe('filtered references', () => {
        it(`should warn users briefly of filtered references by default`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          const logs = Array.from(stub.calls).flatMap((call) => call.args);
          const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should not warn user of filtered references with log verbosity silent`, async () => {
          const sd = new StyleDictionary({
            log: { verbosity: silent },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          expect(stub.callCount).to.equal(0);
        });

        it(`should not warn user of filtered references with log verbosity silent`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: disabled },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          // 1 due to success log "css"
          expect(stub.callCount).to.equal(1);
        });

        it(`should throw a brief error of filtered references with log level set to error`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: errorLog },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
          // only log is the platform name at the start of the buildPlatform method
        });

        it(`should throw a brief error of filtered references with log level set to error on platform level`, async () => {
          const sd = new StyleDictionary({
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                log: { warnings: errorLog },
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
          // only log is the platform name at the start of the buildPlatform method
        });

        it(`should warn user of filtered references with a detailed message through "verbose" verbosity`, async () => {
          const sd = new StyleDictionary({
            log: { verbosity: verbose },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          await sd.buildAllPlatforms();
          const logs = Array.from(stub.calls).flatMap((call) => call.args);
          const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should throw detailed error of filtered references through "verbose" verbosity and log level set to error`, async () => {
          const sd = new StyleDictionary({
            log: { warnings: errorLog, verbosity: verbose },
            source: [`__integration__/tokens/**/[!_]*.json?(c)`],
            platforms: {
              css: {
                transformGroup: css,
                buildPath,
                files: [
                  {
                    destination: `filteredReferences.css`,
                    format: cssVariables,
                    options: {
                      outputReferences: true,
                    },
                    // background colors have references, only including them
                    // should warn the user
                    filter: (token) => token.attributes.type === `background`,
                  },
                ],
              },
            },
          });
          let error;
          try {
            await sd.buildAllPlatforms();
          } catch (e) {
            error = e;
          }
          await expect(cleanConsoleOutput(error.message)).to.matchSnapshot();
        });

        describe('multiple files', () => {
          const tokens = {
            color: {
              red: { value: '#f00' },
              danger: { value: '{color.red}' },
            },
            size: {
              border: { value: '2px' },
            },
          };
          const fileWithFilteredReferences = {
            destination: `filteredReferences.css`,
            format: cssVariables,
            options: {
              outputReferences: true,
            },
            // color.danger references color.red, which is filtered out
            filter: (token) => token.name !== `color-red`,
          };
          const fileWithoutFilteredReferences = {
            destination: `noFilteredReferences.css`,
            format: cssVariables,
            options: {
              outputReferences: true,
            },
            // only filters out a token that nothing references
            filter: (token) => token.name !== `size-border`,
          };

          it(`should only warn about filtered references for the file that has them`, async () => {
            const sd = new StyleDictionary({
              log: { verbosity: verbose },
              tokens,
              platforms: {
                css: {
                  transformGroup: css,
                  buildPath,
                  files: [fileWithoutFilteredReferences, fileWithFilteredReferences],
                },
              },
            });
            await sd.buildAllPlatforms();
            const logs = Array.from(stub.calls).flatMap((call) => call.args);
            const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
            expect(consoleOutput).to.include(`✔︎ ${buildPath}noFilteredReferences.css`);
            expect(consoleOutput).to.include(`⚠️ ${buildPath}filteredReferences.css`);
            expect(consoleOutput).to.include(
              `While building filteredReferences.css, filtered out token references were found`,
            );
            expect(consoleOutput).to.not.include(`While building noFilteredReferences.css`);
          });

          it(`should only warn about filtered references for the platform that has them`, async () => {
            const sd = new StyleDictionary({
              log: { verbosity: verbose },
              tokens,
              platforms: {
                css: {
                  transformGroup: css,
                  buildPath,
                  files: [fileWithoutFilteredReferences],
                },
                cssFiltered: {
                  transformGroup: css,
                  buildPath,
                  files: [fileWithFilteredReferences],
                },
              },
            });
            await sd.buildAllPlatforms();
            const logs = Array.from(stub.calls).flatMap((call) => call.args);
            const consoleOutput = logs.map(cleanConsoleOutput).join('\n');
            expect(consoleOutput).to.include(`✔︎ ${buildPath}noFilteredReferences.css`);
            expect(consoleOutput).to.include(`⚠️ ${buildPath}filteredReferences.css`);
            expect(consoleOutput).to.include(
              `While building filteredReferences.css, filtered out token references were found`,
            );
            expect(consoleOutput).to.not.include(`While building noFilteredReferences.css`);
          });

          it(`should list only the file's own filtered references when using getReferences in a custom format`, async () => {
            const sd = new StyleDictionary({
              log: { verbosity: verbose },
              tokens: {
                ...tokens,
                size: {
                  border: { value: '2px' },
                  outline: { value: '{size.border}' },
                },
              },
              hooks: {
                formats: {
                  'custom/references': ({ dictionary }) => {
                    dictionary.allTokens.forEach((token) => {
                      if (usesReferences(token.original.value)) {
                        getReferences(token.original.value, dictionary.tokenMap, {
                          unfilteredTokens: dictionary.unfilteredTokenMap,
                          warnImmediately: false,
                        });
                      }
                    });
                    return '';
                  },
                },
              },
              platforms: {
                css: {
                  transformGroup: css,
                  buildPath,
                  files: [
                    {
                      destination: `withoutColor.css`,
                      format: 'custom/references',
                      filter: (token) => token.name !== `color-red`,
                    },
                    {
                      destination: `withoutSize.css`,
                      format: 'custom/references',
                      filter: (token) => token.name !== `size-border`,
                    },
                  ],
                },
              },
            });
            await sd.buildAllPlatforms();
            const logs = Array.from(stub.calls).flatMap((call) => call.args);
            const [withoutColor, withoutSize] = logs
              .map(cleanConsoleOutput)
              .filter((log) => log.startsWith('⚠️'));
            expect(withoutColor).to.include(`While building withoutColor.css`);
            expect(withoutColor).to.include(`color.red`);
            expect(withoutColor).to.not.include(`size.border`);
            expect(withoutSize).to.include(`While building withoutSize.css`);
            expect(withoutSize).to.include(`size.border`);
            expect(withoutSize).to.not.include(`color.red`);
          });

          it(`should not leave filtered references warnings behind when a format throws`, async () => {
            const sd = new StyleDictionary({
              tokens,
              hooks: {
                formats: {
                  'custom/throws': ({ dictionary }) => {
                    getReferences('{color.red}', dictionary.tokens, {
                      unfilteredTokens: dictionary.unfilteredTokens,
                      warnImmediately: false,
                    });
                    throw new Error('format failed');
                  },
                },
              },
              platforms: {
                css: {
                  transformGroup: css,
                  buildPath,
                  files: [{ ...fileWithFilteredReferences, format: 'custom/throws' }],
                },
              },
            });
            await expect(sd.buildAllPlatforms()).to.eventually.be.rejectedWith('format failed');
            expect(
              Object.keys(GroupMessages.groupedMessages).filter((group) =>
                group.startsWith(GroupMessages.GROUP.FilteredOutputReferences),
              ),
            ).to.eql([]);
          });
        });
      });
    });
  });
});
