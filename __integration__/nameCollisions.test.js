import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { stubMethod, restore } from 'hanbi';
import { buildPath, cleanConsoleOutput } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, logVerbosityLevels } from '../lib/enums/index.js';

const { cssVariables, jsonNested } = formats;

const tokens = {
  color: {
    red: { value: '#f00' },
    background: {
      red: { value: '{color.red}' },
    },
  },
};

describe('integration', async () => {
  let stub;
  beforeEach(() => {
    stub = stubMethod(console, 'log');
  });

  afterEach(() => {
    clearOutput(buildPath);
    restore();
  });

  describe('name collisions', async () => {
    it(`should warn users of name collisions for flat files, brief version`, async () => {
      const sd = new StyleDictionary({
        // we are only testing name collision warnings options so we don't need
        // the full source.
        tokens,
        platforms: {
          web: {
            buildPath,
            files: [
              {
                destination: 'variables.css',
                format: cssVariables,
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      await expect(stub.lastCall.args.map(cleanConsoleOutput).join('\n')).to.matchSnapshot();
    });

    it(`should warn users of name collisions for flat files`, async () => {
      const sd = new StyleDictionary({
        // we are only testing name collision warnings options so we don't need
        // the full source.
        tokens,
        log: { verbosity: logVerbosityLevels.verbose },
        platforms: {
          web: {
            buildPath,
            files: [
              {
                destination: 'variables.css',
                format: cssVariables,
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      await expect(stub.lastCall.args.map(cleanConsoleOutput).join('\n')).to.matchSnapshot();
    });

    it(`should not warn users of name collisions for nested files`, async () => {
      const sd = new StyleDictionary({
        // we are only testing name collision warnings options so we don't need
        // the full source.
        tokens,
        platforms: {
          web: {
            buildPath,
            files: [
              {
                destination: 'tokens.json',
                format: jsonNested,
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      expect(stub.lastCall.args.map(cleanConsoleOutput).join('\n')).to.equal(
        `✔︎ ${buildPath}tokens.json`,
      );
    });
  });
});
