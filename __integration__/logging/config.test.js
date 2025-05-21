import { expect } from 'chai';
import { restore, stubMethod } from 'hanbi';
import StyleDictionary from 'style-dictionary';
import { buildPath, cleanConsoleOutput } from '../_constants.js';
import { clearOutput } from '../../__tests__/__helpers.js';
import { logWarningLevels, logVerbosityLevels } from '../../lib/enums/index.js';

const { error: errorLog, disabled } = logWarningLevels;

/**
 * These integration tests will verify the behavior and logging at the *config*
 * level. These messages happen when `.extend()` is called to verify
 * proper configuration such as source being an array. This will also check
 * for collisions in source files and any errors that happen when parsing
 * and merging tokens. This is the first of 3 phases of logging, the
 * next two are: platform and file.
 */
describe(`integration >`, () => {
  let stub;
  beforeEach(() => {
    stub = stubMethod(console, 'log');
  });
  afterEach(() => {
    restore();
    clearOutput(buildPath);
  });

  describe(`logging >`, () => {
    describe(`config >`, () => {
      describe(`property value collisions`, () => {
        it(`should not throw, but notify users by default`, async () => {
          const sd = new StyleDictionary({
            source: [
              // including a specific file twice will throw value collision warnings
              `__integration__/tokens/size/padding.json`,
              `__integration__/tokens/size/_padding.json`,
            ],
            platforms: {},
          });
          await sd.hasInitialized;
          const consoleOutput = stub.firstCall.args.map(cleanConsoleOutput).join('\n');
          await expect(consoleOutput).to.matchSnapshot();
        });

        it(`should not log anything if the log verbosity is set to silent`, async () => {
          const sd = new StyleDictionary({
            log: {
              verbosity: logVerbosityLevels.silent,
            },
            source: [
              // including a specific file twice will throw value collision warnings
              `__integration__/tokens/size/padding.json`,
              `__integration__/tokens/size/_padding.json`,
            ],
            platforms: {},
          });
          await sd.hasInitialized;
          await expect(stub.callCount).to.equal(0);
        });

        it(`should not log anything if the log warnings is set to disabled`, async () => {
          const sd = new StyleDictionary({
            log: {
              warnings: disabled,
            },
            source: [
              // including a specific file twice will throw value collision warnings
              `__integration__/tokens/size/padding.json`,
              `__integration__/tokens/size/_padding.json`,
            ],
            platforms: {},
          });
          await sd.hasInitialized;
          await expect(stub.callCount).to.equal(0);
        });

        it(`should not show warnings if given higher log level`, async () => {
          const sd = new StyleDictionary(
            {
              log: { warnings: errorLog },
              source: [
                // including a specific file twice will throw value collision warnings
                `__integration__/tokens/size/padding.json`,
                `__integration__/tokens/size/_padding.json`,
              ],
              platforms: {},
            },
            { init: false },
          );

          let error;
          try {
            await sd.init();
          } catch (e) {
            error = e;
          }

          await expect(error.message).to.matchSnapshot();
          expect(stub.called).to.be.false;
        });
      });
    });
  });
});
