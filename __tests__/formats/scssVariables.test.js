import { expect } from 'chai';
import { compileString } from 'sass';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { scssVariables } = fileFormats;

const file = {
  destination: 'output.scss',
  format: scssVariables,
  name: 'foo',
};

const propertyName = 'color-base-red-400';
const propertyValue = '#EF5350';

const tokens = {
  color: {
    base: {
      red: {
        400: {
          name: propertyName,
          value: propertyValue,
          original: {
            value: propertyValue,
          },
          path: ['color', 'base', 'red', '400'],
        },
      },
    },
  },
};

const format = formats[scssVariables];

describe('formats', () => {
  describe(scssVariables, () => {
    it('should have a valid scss syntax and match snapshot', async () => {
      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      const scssResult = compileString(result);
      await expect(result).to.matchSnapshot(1);
      await expect(scssResult.css).to.matchSnapshot(2);
    });

    it('should optionally use !default', async () => {
      const themeableDictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
      };
      const formattedScss = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );

      expect(formattedScss).not.to.match(new RegExp('!default;'));

      themeableDictionary.allTokens[0].themeable = true;
      const themeableScss = await format(
        createFormatArgs({
          dictionary: themeableDictionary,
          file,
          platform: {},
        }),
        {},
        file,
      );

      expect(themeableScss).to.match(new RegExp('#EF5350 !default;'));
    });
  });
});
