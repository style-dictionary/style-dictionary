import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { libreofficePalette } = formatsEnum;
const format = formats[libreofficePalette];

const tokens = {
  color: {
    red: {
      value: '#FF0000',
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
  const _file = { destination: 'brand.soc', format: libreofficePalette, ...file };
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
  describe(libreofficePalette, () => {
    it('should match snapshot', async () => {
      await expect(await run(tokens)).to.matchSnapshot();
    });

    it('should write only color tokens, as lowercase #rrggbb', async () => {
      const output = await run(tokens);
      const colorLines = output.split('\n').filter((line) => line.includes('<draw:color '));
      expect(colorLines).to.eql([
        '  <draw:color draw:name="color-red" draw:color="#ff0000"/>',
        '  <draw:color draw:name="color-blue" draw:color="#0080ff"/>',
        '  <draw:color draw:name="color-overlay" draw:color="#102040"/>',
      ]);
    });

    it('should be well-formed XML with the LibreOffice color-table root', async () => {
      const output = await run(tokens);
      expect(output.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).to.be.true;
      expect(output).to.contain('<ooo:color-table ');
      expect(output).to.contain('xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"');
      expect(output.endsWith('</ooo:color-table>\n')).to.be.true;
    });

    it('should escape token names for XML', async () => {
      const output = await run({
        color: {
          ink: { value: '#000', type: 'color', name: 'Ink & "Paper" <dark>', path: ['color'] },
        },
      });
      expect(output).to.contain('draw:name="Ink &amp; &quot;Paper&quot; &lt;dark&gt;"');
    });

    it('should leave out the file header when showFileHeader is false', async () => {
      const output = await run(tokens, { options: { showFileHeader: false } });
      expect(output).to.not.contain('<!--');
      expect(output.split('\n')[1]).to.match(/^<ooo:color-table /);
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
      expect(output).to.contain('<draw:color draw:name="color-green" draw:color="#008000"/>');
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
  });
});
