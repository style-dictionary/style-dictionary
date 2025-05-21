import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { javascriptModule } = fileFormats;

const file = {
  destination: 'output.js',
  format: javascriptModule,
  filter: {
    type: 'color',
  },
};

const tokens = {
  color: {
    red: { value: '#FF0000' },
  },
};

const format = formats[javascriptModule];

describe('formats', () => {
  describe(javascriptModule, () => {
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
