import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { isNode } from '../../lib/utils/isNode.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { lessIcons } = fileFormats;

const file = {
  destination: 'output.less',
  format: lessIcons,
  name: 'foo',
};

const propertyName = 'content-icon-email';
const propertyValue = "'\\E001'";
const itemClass = '3d_rotation';

const tokens = {
  content: {
    icon: {
      email: {
        name: propertyName,
        value: propertyValue,
        type: 'icon',
        original: {
          value: propertyValue,
        },
        attributes: {
          item: itemClass,
        },
        path: ['content', 'icon', 'email'],
      },
    },
  },
};

const platform = {
  prefix: 'sd', // Style Dictionary Prefix
  // FIXME: check why createFormatArgs requires this prefix to be wrapped inside
  // an options object for it to be properly set as option?
  options: {
    prefix: 'sd',
  },
};

const format = formats[lessIcons];

describe('formats', () => {
  describe(lessIcons, () => {
    it('should have a valid less syntax and match snapshot', async () => {
      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform,
        }),
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
