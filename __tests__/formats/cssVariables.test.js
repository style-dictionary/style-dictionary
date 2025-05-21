import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { expect } from 'chai';
import { formats as fileFormats } from '../../lib/enums/index.js';
import formats from '../../lib/common/formats.js';

const { cssVariables } = fileFormats;

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

const format = formats[cssVariables];

describe('formats', () => {
  describe(cssVariables, () => {
    it('should have a valid CSS syntax and match snapshot', async () => {
      const file = {
        destination: '__output/',
        format: cssVariables,
        name: 'foo',
        options: {
          selector: '.selector',
        },
      };
      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      await expect(result).to.matchSnapshot(1);
    });

    it('should have a valid CSS syntax and match snapshot when selector is an array', async () => {
      const file = {
        destination: '__output/',
        format: cssVariables,
        name: 'foo',
        options: {
          selector: ['@media screen and (min-width: 768px)', '.selector1', '.selector2'],
        },
      };

      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      await expect(result).to.matchSnapshot(2);
    });
  });
});
