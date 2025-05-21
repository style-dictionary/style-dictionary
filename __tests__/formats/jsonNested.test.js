import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { jsonNested } = fileFormats;

const file = {
  destination: 'output.json',
  format: jsonNested,
};

const tokens = {
  color: {
    base: {
      comment: 'This is a comment',
      metadata: [1, 2, 3],
      red: {
        primary: { value: '#611D1C' },
        secondary: {
          inverse: { value: '#000000' },
        },
      },
    },
  },
};

const format = formats[jsonNested];

describe('formats', function () {
  describe(jsonNested, function () {
    it('should be a valid JSON file and match snapshot', async () => {
      await expect(
        format(
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
