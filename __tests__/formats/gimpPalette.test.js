import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { gimpPalette } = formatsEnum;
const format = formats[gimpPalette];

const tokens = {
  color: {
    red: {
      value: '#ff0000',
      type: 'color',
      name: 'color-red',
      path: ['color', 'red'],
    },
    blue: {
      value: 'rgb(0, 128, 255)',
      type: 'color',
      name: 'color-blue',
      path: ['color', 'blue'],
    },
    overlay: {
      value: 'rgba(16, 32, 64, 0.5)',
      type: 'color',
      name: 'color-overlay',
      path: ['color', 'overlay'],
    },
  },
  size: {
    small: {
      value: '4px',
      type: 'dimension',
      name: 'size-small',
      path: ['size', 'small'],
    },
  },
};

/**
 * @param {Record<string, any>} tokens
 * @param {Record<string, any>} [file]
 * @param {Record<string, any>} [options]
 */
function run(tokens, file = {}, options = {}) {
  const _file = { destination: 'brand.gpl', format: gimpPalette, ...file };
  return format(
    createFormatArgs({
      dictionary: {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array', usesDtcg: options.usesDtcg }),
      },
      file: _file,
      platform: {},
      options,
    }),
    {},
    _file,
  );
}

describe('formats', () => {
  describe(gimpPalette, () => {
    it('should match snapshot', async () => {
      await expect(await run(tokens)).to.matchSnapshot();
    });

    it('should write only color tokens, as 0-255 channels then a tab and the name', async () => {
      const output = await run(tokens);
      const colorLines = output.split('\n').filter((line) => /^[ \d]/.test(line));
      expect(colorLines).to.eql([
        '255   0   0\tcolor-red',
        '  0 128 255\tcolor-blue',
        ' 16  32  64\tcolor-overlay',
      ]);
    });

    it('should start with the GIMP Palette magic line and name the palette after the file', async () => {
      const output = await run(tokens, { destination: 'build/palettes/brand.gpl' });
      expect(output.split('\n').slice(0, 2)).to.eql(['GIMP Palette', 'Name: brand']);
    });

    it('should support the paletteName and columns options', async () => {
      const output = await run(tokens, { options: { paletteName: 'Brand colors', columns: 4 } });
      expect(output.split('\n').slice(0, 3)).to.eql([
        'GIMP Palette',
        'Name: Brand colors',
        'Columns: 4',
      ]);
    });

    it('should write the file header as # comments', async () => {
      const output = await run(tokens);
      expect(output).to.contain('#\n# Do not edit directly, this file was auto-generated.\n#\n');
      const withoutHeader = await run(tokens, { options: { showFileHeader: false } });
      expect(withoutHeader).to.not.contain('#');
    });

    it('should read DTCG color objects', async () => {
      const output = await run(
        {
          color: {
            green: {
              $value: { colorSpace: 'srgb', components: [0, 0.5, 0] },
              $type: 'color',
              name: 'color-green',
              path: ['color', 'green'],
            },
          },
        },
        {},
        { usesDtcg: true },
      );
      expect(output).to.contain('  0 128   0\tcolor-green');
    });

    it('should throw on a color it cannot read', async () => {
      await expect(
        run({
          color: {
            broken: { value: 'not-a-color', type: 'color', name: 'color-broken', path: ['color'] },
          },
        }),
      ).to.eventually.be.rejectedWith('could not read the color of token "color-broken"');
    });

    it('should throw on an invalid columns option', async () => {
      await expect(run(tokens, { options: { columns: 300 } })).to.eventually.be.rejectedWith(
        'whole number from 0 to 256',
      );
    });
  });
});
