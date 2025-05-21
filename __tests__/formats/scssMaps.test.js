import { expect } from 'chai';
import { compileString } from 'sass';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { commentStyles, commentPositions, formats as fileFormats } from '../../lib/enums/index.js';

const tokens = {
  size: {
    font: {
      small: {
        value: '12rem',
        original: {
          value: '12px',
        },
        name: 'size-font-small',
        path: ['size', 'font', 'small'],
      },
      large: {
        value: '18rem',
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
      original: {
        value: '#ffffff',
      },
      name: 'color-white',
      path: ['color', 'white'],
    },
  },
  asset: {
    icon: {
      book: {
        value:
          'url("data:image/png;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItYm9vayI+PHBhdGggZD0iTTQgMTkuNUEyLjUgMi41IDAgMCAxIDYuNSAxN0gyMCI+PC9wYXRoPjxwYXRoIGQ9Ik02LjUgMkgyMHYyMEg2LjVBMi41IDIuNSAwIDAgMSA0IDE5LjV2LTE1QTIuNSAyLjUgMCAwIDEgNi41IDJ6Ij48L3BhdGg+PC9zdmc+")',
        type: 'asset',
        original: {
          value: '__tests__/__assets/icons/book.svg',
        },
        name: 'asset-icon-book',
        path: ['asset', 'icon', 'book'],
      },
    },
  },
};

describe('formats', () => {
  for (const key of [fileFormats.scssMapFlat, fileFormats.scssMapDeep]) {
    describe(key, async () => {
      const file = {
        destination: 'output.scss',
        format: key,
      };

      const format = formats[key].bind(file);
      const output = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );

      it('should return ' + key + ' as a string', () => {
        expect(typeof output).to.equal('string');
      });

      it('should have a valid scss syntax', () => {
        const result = compileString(output);
        expect(result.css).to.not.be.undefined;
      });

      it(key + ' snapshot', async () => {
        await expect(output).to.matchSnapshot();
      });

      it(`should respect formatting options for ${key}`, async () => {
        const file = {
          destination: '__output/',
          format: key,
          options: {
            formatting: {
              fileHeaderTimestamp: true,
              indentation: '    ',
              commentStyle: commentStyles.long,
              commentPosition: commentPositions.above,
            },
          },
        };
        const result = await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        );
        await expect(result).to.matchSnapshot();
      });
    });
  }
});
