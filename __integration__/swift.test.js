import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { iosSwiftClassSwift } = formats;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      platforms: {
        flutter: {
          transformGroup: transformGroups.iosSwift,
          buildPath,
          files: [
            {
              destination: 'style_dictionary.swift',
              format: iosSwiftClassSwift,
              options: {
                className: 'StyleDictionary',
              },
            },
            {
              destination: 'style_dictionary_with_references.swift',
              format: iosSwiftClassSwift,
              options: {
                className: 'StyleDictionary',
                outputReferences: true,
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

  describe('swift', async () => {
    describe(`ios-swift/class.swift`, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}style_dictionary.swift`), {
          encoding: `UTF-8`,
        });
        await expect(output).to.matchSnapshot();
      });

      describe(`with references`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(
            resolve(`${buildPath}style_dictionary_with_references.swift`),
            {
              encoding: `UTF-8`,
            },
          );
          await expect(output).to.matchSnapshot();
        });
      });
    });
  });
});
