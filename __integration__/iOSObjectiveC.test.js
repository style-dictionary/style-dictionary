import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { iosColorsH, iosColorsM, iosMacros, iosSingletonH, iosSingletonM, iosStaticH, iosStaticM } =
  formats;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      platforms: {
        flutter: {
          transformGroup: transformGroups.ios,
          buildPath,
          files: [
            {
              destination: 'singleton.m',
              format: iosSingletonM,
              options: {
                className: 'StyleDictionary',
              },
            },
            {
              destination: 'singleton.h',
              format: iosSingletonH,
              options: {
                className: 'StyleDictionary',
              },
            },
            {
              destination: 'color.h',
              format: iosColorsH,
              options: {
                className: 'StyleDictionaryColor',
                type: 'StyleDictionaryColorName',
              },
              filter: (token) => token.type === 'color',
            },
            {
              destination: 'color.m',
              format: iosColorsM,
              options: {
                className: 'StyleDictionaryColor',
                type: 'StyleDictionaryColorName',
              },
              filter: (token) => token.type === 'color',
            },
            {
              destination: 'macros.h',
              format: iosMacros,
            },
            {
              destination: 'static.h',
              format: iosStaticH,
              options: {
                className: 'StyleDictionaryStatic',
                type: 'CGFloat',
              },
              filter: (token) => token.type === 'dimension' || token.type === 'fontSize',
            },
            {
              destination: 'static.m',
              format: iosStaticM,
              options: {
                className: 'StyleDictionaryStatic',
                type: 'CGFloat',
              },
              filter: (token) => token.type === 'dimension' || token.type === 'fontSize',
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

  describe('ios objective-c', async () => {
    it(`ios/singleton.m should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}singleton.m`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/singleton.h should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}singleton.h`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/color.m should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}color.m`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/color.h should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}color.h`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/macros.h should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}macros.h`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/static.h should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}static.h`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });

    it(`ios/static.m should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}static.m`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });
  });
});
