import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';

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

const format = formats['compose/object'];
const file = {
  destination: 'output.xml',
  format: 'compose/object',
};

describe('formats', () => {
  describe(`compose/object`, () => {
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

    it('with options overrides should match snapshot', async () => {
      const file = {
        options: {
          import: [
            'androidx.compose.ui.graphics.Color',
            'androidx.compose.ui.graphics.Brush',
            'androidx.compose.ui.unit.*',
          ],
          className: 'MyObject',
          packageName: 'com.example.tokens',
          accessControl: 'public',
          objectType: 'data',
        },
      };
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
  });
});
