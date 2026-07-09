import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transforms } from 'style-dictionary/enums';

const { xamlResourceDictionary } = formats;
const { attributeCti, colorHex8android, namePascal, sizeRemToFloat } = transforms;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      platforms: {
        xaml: {
          transforms: [attributeCti, namePascal, colorHex8android, sizeRemToFloat],
          buildPath,
          files: [
            {
              destination: 'Tokens.xaml',
              format: xamlResourceDictionary,
              options: {
                outputColorBrushes: true,
              },
            },
            {
              destination: 'TokensWithReferences.xaml',
              format: xamlResourceDictionary,
              options: {
                outputColorBrushes: true,
                outputReferences: true,
              },
            },
            {
              destination: 'Colors.xaml',
              format: xamlResourceDictionary,
              filter: {
                type: 'color',
              },
              options: {
                outputColorBrushes: true,
                resourceType: 'Color',
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

  describe('xaml', async () => {
    describe(xamlResourceDictionary, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}Tokens.xaml`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      describe(`with references`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}TokensWithReferences.xaml`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });

      describe(`with filter`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}Colors.xaml`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });
    });
  });
});
