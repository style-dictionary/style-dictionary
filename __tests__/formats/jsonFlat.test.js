import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const colorTokenName = 'color-base-red-400';
const colorTokenValue = '#EF5350';

const colorTokens = {
  color: {
    base: {
      red: {
        400: {
          name: colorTokenName,
          value: colorTokenValue,
          original: {
            value: colorTokenValue,
          },
          path: ['color', 'base', 'red', '400'],
        },
      },
    },
  },
};

const file = {
  destination: 'output.json',
  format: fileFormats.jsonFlat,
};

const format = formats[fileFormats.jsonFlat];

describe('formats', () => {
  describe(fileFormats.jsonFlat, () => {
    it('should be a valid JSON file and match snapshot', async () => {
      await expect(
        format(
          createFormatArgs({
            dictionary: {
              tokens: colorTokens,
              allTokens: convertTokenData(colorTokens, { output: 'array' }),
            },
            file,
            platform: {},
          }),
          {},
          file,
        ),
      ).to.matchSnapshot();
    });
  });
});
