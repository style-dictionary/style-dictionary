import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { androidResources } = fileFormats;

const tokens = {
  size: {
    font: {
      small: {
        value: '12rem',
        type: 'fontSize',
        original: {
          value: '12px',
        },
        name: 'size-font-small',
        path: ['size', 'font', 'small'],
      },
      large: {
        value: '18rem',
        type: 'fontSize',
        original: {
          value: '18px',
        },
        name: 'size-font-large',
        path: ['size', 'font', 'large'],
      },
    },
  },
  color: {
    base: {
      red: {
        value: '#ff0000',
        type: 'color',
        comment: 'comment',
        original: {
          value: '#FF0000',
          comment: 'comment',
        },
        name: 'color-base-red',
        path: ['color', 'base', 'red'],
      },
    },
    white: {
      value: '#ffffff',
      type: 'color',
      original: {
        value: '#ffffff',
      },
      name: 'color-white',
      path: ['color', 'white'],
    },
  },
};

const customTokens = {
  backgroundColor: {
    secondary: {
      name: 'backgroundColorSecondary',
      value: '#F2F3F4',
      type: 'color',
      original: {
        value: '#F2F3F4',
        type: 'color',
      },
    },
  },
  fontColor: {
    primary: {
      name: 'fontColorPrimary',
      value: '#000000',
      type: 'color',
      original: {
        value: '#000000',
        type: 'color',
      },
    },
  },
};

const format = formats[androidResources];
const file = {
  destination: 'output.xml',
  format: androidResources,
};

describe('formats', () => {
  describe(`android/resources`, () => {
    it('should match default snapshot', async () => {
      const f = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      await expect(f).to.matchSnapshot();
    });

    it('with resourceType override should match snapshot', async () => {
      const file = { options: { resourceType: 'dimen' } };
      const f = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );
      await expect(f).to.matchSnapshot();
    });

    it('with resourceMap override should match snapshot', async () => {
      const file = {
        options: {
          resourceMap: {
            color: 'color',
            fontColor: 'color',
            backgroundColor: 'color',
          },
        },
      };
      const f = await format(
        createFormatArgs({
          dictionary: {
            tokens: customTokens,
            allTokens: convertTokenData(customTokens, { output: 'array' }),
          },
          file,
          platform: {},
        }),
        {},
        file,
      );
      await expect(f).to.matchSnapshot();
    });
  });
});
