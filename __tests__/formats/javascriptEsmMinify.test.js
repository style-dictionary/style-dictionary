import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { javascriptEsm } = formatsEnum;

const file = {
  destination: 'output.js',
  format: javascriptEsm,
  options: {
    minify: true,
  },
  filter: {
    type: 'color',
  },
};

const tokens = {
  color: {
    red: { value: '#FF0000' },
  },
};

const format = formats[javascriptEsm];

describe('formats', () => {
  describe(javascriptEsm, () => {
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
