import { expect } from 'chai';
import { compileString } from 'sass';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { scssIcons } = fileFormats;

const file = {
  destination: 'output.scss',
  format: scssIcons,
  name: 'foo',
};

const propertyName = 'content-icon-email';
const propertyValue = "'\\E001'";
const itemClass = 'three-d_rotation';

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

const format = formats[scssIcons];

describe('formats', () => {
  describe(scssIcons, () => {
    it('should have a valid scss syntax and match snapshot', async () => {
      const result = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform,
        }),
        platform,
        file,
      );
      const scssResult = compileString(result);
      await expect(result).to.matchSnapshot(1);
      await expect(scssResult.css).to.matchSnapshot(2);
    });
  });
});
