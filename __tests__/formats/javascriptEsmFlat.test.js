import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { javascriptEsm } = formatsEnum;

const file = {
  destination: '__output/',
  format: javascriptEsm,
  options: {
    flat: true,
  },
  filter: {
    type: 'color',
  },
};

const tokens = {
  colors: {
    red: {
      500: {
        value: '#ff0000',
        type: 'color',
        path: ['colors', 'red', '500'],
        filePath: 'tokens.json',
        attributes: {
          foo: 'bar',
        },
        name: 'ColorsRed500',
      },
    },
  },
  dimensions: {
    xs: {
      value: '15px',
      type: 'dimension',
      path: ['dimension', 'xs'],
      filePath: 'tokens.json',
      attributes: {
        foo: 'bar',
      },
      name: 'DimensionXs',
    },
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
