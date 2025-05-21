import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import Color from 'tinycolor2';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transforms, transformTypes } from '../lib/enums/index.js';

const { value } = transformTypes;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      tokens: {
        colors: {
          $type: 'color', // $type should be inherited by the children
          black: {
            500: {
              $value: '#000000', // $value should work
              value: {}, // should be allowed as $ prop takes precedence -> bad practice though
              type: 'dimension', // should be allowed as the inherited $type takes precedence -> bad practice though
            },
            dimension: {
              $value: '5',
              value: 'something else', // should be allowed as $ prop takes precedence -> bad practice though
              $type: 'dimension',
              type: 'color', // should be allowed as $ prop takes precedence -> bad practice though
              $description: 'Some description',
            },
          },
          foo: {
            $value: '{colors.black.500}',
          },
        },
      },
      hooks: {
        transforms: {
          'custom/css/color': {
            type: value,
            filter: (token) => token.$type === 'color',
            transform: (token) => {
              return Color(sd.usesDtcg ? token.$value : token.value).toRgbString();
            },
          },
          'custom/add/px': {
            type: value,
            filter: (token) => token.$type === 'dimension',
            transform: (token) => {
              return `${sd.usesDtcg ? token.$value : token.value}px`;
            },
          },
        },
      },
      platforms: {
        css: {
          transforms: [transforms.nameKebab, 'custom/css/color', 'custom/add/px'],
          buildPath,
          files: [
            {
              destination: 'vars.css',
              format: formats.cssVariables,
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

  /**
   * Integration test for forward compatibility with https://design-tokens.github.io/community-group/format/
   * - $value special property
   * - $type special property & inherits from ancestors
   * - $description special property
   */
  describe('DTCG draft spec forward compatibility', async () => {
    it(`should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}vars.css`), {
        encoding: `UTF-8`,
      });
      await expect(output).to.matchSnapshot();
    });
  });
});
