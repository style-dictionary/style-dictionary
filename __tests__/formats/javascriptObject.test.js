import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { javascriptObject } = fileFormats;

const file = {
  destination: 'output.js',
  format: javascriptObject,
  options: { name: 'foo' },
};

const tokens = {
  color: {
    red: { value: '#FF0000' },
  },
};

const format = formats[javascriptObject];

describe('formats', () => {
  describe(javascriptObject, () => {
    it('should be valid JS syntax and match snapshot', async () => {
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
