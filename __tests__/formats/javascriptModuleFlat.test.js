import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { javascriptModuleFlat } = fileFormats;

const file = {
  destination: 'output.js',
  format: javascriptModuleFlat,
};
const tokens = {
  color: {
    red: {
      value: '#EF5350',
      name: 'ColorRed',
      original: {
        value: '#EF5350',
      },
      path: ['color', 'red'],
    },
  },
};

const format = formats[javascriptModuleFlat];

describe('formats', () => {
  describe(javascriptModuleFlat, () => {
    it('should be a valid JS file and match snapshot', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
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
