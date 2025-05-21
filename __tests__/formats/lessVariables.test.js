import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { isNode } from '../../lib/utils/isNode.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { lessVariables } = fileFormats;

const file = {
  destination: 'output.less',
  format: lessVariables,
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

const format = formats[lessVariables];

describe('formats', () => {
  describe(lessVariables, () => {
    it('should have a valid less syntax and match snapshot', async () => {
      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      let _less;
      if (!isNode) {
        await import('less/dist/less.js');
        // eslint-disable-next-line no-undef
        _less = less;
      } else {
        _less = (await import('less')).default;
      }
      const lessResult = await _less.render(result);
      await expect(result).to.matchSnapshot(1);
      await expect(lessResult.css).to.matchSnapshot(2);
    });
  });
});
