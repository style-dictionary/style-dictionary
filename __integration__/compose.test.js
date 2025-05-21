import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats } from '../lib/enums/index.js';

const { composeObject } = formats;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      platforms: {
        compose: {
          transformGroup: `compose`,
          buildPath,
          files: [
            {
              destination: 'StyleDictionary.kt',
              format: composeObject,
              options: {
                className: 'StyleDictionary',
                packageName: 'com.example.tokens',
              },
            },
            {
              destination: 'StyleDictionaryWithReferences.kt',
              format: composeObject,
              options: {
                outputReferences: true,
                className: 'StyleDictionary',
                packageName: 'com.example.tokens',
              },
            },
          ],
        },
      },
    });
    await sd.buildAllPlatforms();
  });

  afterEach(() => {
    clearOutput(buildPath);
  });

  describe('compose', async () => {
    describe(`compose/object`, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}StyleDictionary.kt`), {
          encoding: `UTF-8`,
        });
        await expect(output).to.matchSnapshot();
      });

      describe(`with references`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}StyleDictionaryWithReferences.kt`), {
            encoding: `UTF-8`,
          });
          await expect(output).to.matchSnapshot();
        });
      });
    });
  });
});
