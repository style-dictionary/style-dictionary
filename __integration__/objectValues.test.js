import { expect } from 'chai';
import Color from 'tinycolor2';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformTypes } from '../lib/enums/index.js';

const { cssVariables, scssVariables } = formats;
const { value: transformTypeValue } = transformTypes;

describe('integration', async () => {
  before(async () => {
    const options = {
      outputReferences: true,
    };
    const sd = new StyleDictionary({
      log: { verbosity: 'verbose' },
      tokens: {
        hue: { value: `120` },
        saturation: { value: `50%` },
        lightness: { value: `50%` },
        color: {
          red: { value: '#f00', type: 'color' },
          green: {
            value: {
              h: '{hue}',
              s: '{saturation}',
              l: '{lightness}',
            },
            type: 'color',
          },
        },
        size: {
          border: { value: 0.125, type: 'dimension' },
        },
        border: {
          primary: {
            // getReferences should work on objects like this:
            value: {
              color: '{color.red}',
              width: '{size.border}',
              style: 'solid',
            },
            type: 'border',
          },
        },
        shadow: {
          light: {
            value: [
              {
                color: '{color.red}',
              },
              {
                color: '{color.green}',
              },
            ],
            type: 'shadow',
          },
          dark: {
            value: [
              {
                color: '{color.green}',
              },
              {
                color: '{color.red}',
              },
            ],
            type: 'shadow',
          },
        },
      },
      hooks: {
        transforms: {
          hsl: {
            type: transformTypeValue,
            transitive: true,
            filter: (token) => token.original.value.h,
            transform: (token) => {
              return `hsl(${token.value.h}, ${token.value.s}, ${token.value.l})`;
            },
          },
          hslToHex: {
            type: transformTypeValue,
            transitive: true,
            filter: (token) => token.original.value.h,
            transform: (token) => {
              return Color(
                `hsl(${token.value.h}, ${token.value.s}, ${token.value.l})`,
              ).toHexString();
            },
          },
        },
      },
      platforms: {
        // This will test to see if a value object for an hsl color works
        // with and without `outputReferences`
        cssHsl: {
          buildPath,
          transforms: StyleDictionary.hooks.transformGroups.css.concat([`hsl`]),
          files: [
            {
              destination: `hsl.css`,
              format: cssVariables,
              filter: (token) => token.type === `color`,
            },
            {
              destination: `hslWithReferences.css`,
              format: cssVariables,
              filter: (token) => token.type === `color`,
              options,
            },
          ],
        },

        // This will test to see if a value object for an hsl that has been
        // transformed to a hex color works with and without `outputReferences`
        cssHex: {
          buildPath,
          transforms: StyleDictionary.hooks.transformGroups.css.concat([`hslToHex`]),
          files: [
            {
              destination: 'hex.css',
              format: cssVariables,
              filter: (token) => token.type === `color`,
            },
            {
              destination: 'hexWithReferences.css',
              format: cssVariables,
              filter: (token) => token.type === `color`,
              options,
            },
          ],
        },

        // This will test to see if a value object for a border
        // works with and without `outputReferences`
        cssBorder: {
          buildPath,
          transforms: StyleDictionary.hooks.transformGroups.css,
          files: [
            {
              destination: 'border.css',
              format: cssVariables,
              filter: (token) => token.type === `border`,
            },
            {
              destination: 'borderWithReferences.css',
              format: cssVariables,
              filter: (token) => token.type === `border`,
              options,
            },
          ],
        },
        cssShadow: {
          buildPath,
          transforms: StyleDictionary.hooks.transformGroups.css.concat([`hslToHex`]),
          files: [
            {
              destination: 'shadow.css',
              format: cssVariables,
              filter: (token) => token.type === `shadow`,
            },
            {
              destination: 'shadowWithReferences.css',
              format: cssVariables,
              filter: (token) => token.type === `shadow`,
              options,
            },
          ],
        },

        scss: {
          buildPath,
          transforms: StyleDictionary.hooks.transformGroups.css.concat([`hslToHex`]),
          files: [
            {
              destination: 'border.scss',
              format: scssVariables,
              filter: (token) => token.type === `border`,
            },
            {
              destination: 'borderWithReferences.scss',
              format: scssVariables,
              filter: (token) => token.type === `border`,
              options,
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

  describe('object values', async () => {
    describe(cssVariables, async () => {
      describe(`hsl syntax`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}hsl.css`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });

        describe(`with references`, async () => {
          it(`should match snapshot`, async () => {
            const output = fs.readFileSync(resolve(`${buildPath}hslWithReferences.css`), {
              encoding: 'UTF-8',
            });
            await expect(output).to.matchSnapshot();
          });
        });
      });

      describe(`hex syntax`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}hex.css`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });

        describe(`with references`, async () => {
          it(`should match snapshot`, async () => {
            const output = fs.readFileSync(resolve(`${buildPath}hexWithReferences.css`), {
              encoding: 'UTF-8',
            });
            await expect(output).to.matchSnapshot();
          });
        });
      });

      describe(`border`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}border.css`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });

        describe(`with references`, async () => {
          it(`should match snapshot`, async () => {
            const output = fs.readFileSync(resolve(`${buildPath}borderWithReferences.css`), {
              encoding: 'UTF-8',
            });
            await expect(output).to.matchSnapshot();
          });
        });
      });

      describe('shadow', async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}shadow.css`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });

        it(`should match snapshot with references`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}shadowWithReferences.css`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });
    });

    describe(scssVariables, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}border.scss`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
      describe(`with references`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}borderWithReferences.scss`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });
    });
  });
});
