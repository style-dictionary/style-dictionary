import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { typstVariables } = formatsEnum;
const format = formats[typstVariables];

const tokens = {
  color: {
    primary: {
      value: '#3B82F6',
      type: 'color',
      comment: 'The main brand color',
      name: 'color-primary',
      path: ['color', 'primary'],
    },
    overlay: {
      value: 'rgba(0, 0, 0, 0.5)',
      type: 'color',
      name: 'color-overlay',
      path: ['color', 'overlay'],
    },
  },
  size: {
    small: { value: '4pt', type: 'dimension', name: 'size-small', path: ['size', 'small'] },
    web: { value: '16px', type: 'dimension', name: 'size-web', path: ['size', 'web'] },
  },
  font: {
    weight: { value: 700, type: 'fontWeight', name: 'font-weight', path: ['font', 'weight'] },
    family: {
      value: ['Inter', 'sans-serif'],
      type: 'fontFamily',
      name: 'font-family',
      path: ['font', 'family'],
    },
  },
  content: {
    greeting: {
      value: 'Hello, world',
      type: 'content',
      name: 'content-greeting',
      path: ['content', 'greeting'],
    },
  },
  typography: {
    heading: {
      value: { fontFamily: 'Inter', fontSize: '24pt', 'line-height': 1.2, 'letter spacing': '0em' },
      type: 'typography',
      name: 'typography-heading',
      path: ['typography', 'heading'],
    },
  },
};

/**
 * @param {Record<string, any>} tokens
 * @param {Record<string, any>} [file]
 * @param {Record<string, any>} [options]
 */
function run(tokens, file = {}, options = {}) {
  const _file = { destination: 'tokens.typ', format: typstVariables, ...file };
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

/**
 * @param {Record<string, any>} value
 */
function single(value) {
  return run({ token: { name: 'token', path: ['token'], ...value } });
}

describe('formats', () => {
  describe(typstVariables, () => {
    it('should match snapshot', async () => {
      await expect(await run(tokens)).to.matchSnapshot();
    });

    it('should write colors as rgb() with a hex string, keeping translucency', async () => {
      const output = await run(tokens);
      expect(output).to.contain('#let color-primary = rgb("#3b82f6")\n');
      expect(output).to.contain('#let color-overlay = rgb("#00000080")\n');
    });

    it('should write numbers and Typst lengths as they are and other strings as strings', async () => {
      const output = await run(tokens);
      expect(output).to.contain('#let size-small = 4pt\n');
      expect(output).to.contain('#let size-web = "16px"\n');
      expect(output).to.contain('#let font-weight = 700\n');
      expect(await single({ value: '-.5em', type: 'dimension' })).to.contain('= -.5em\n');
      expect(await single({ value: '1.5e2%', type: 'other' })).to.contain('= 1.5e2%\n');
      expect(await single({ value: '400', type: 'fontWeight' })).to.contain('= 400\n');
    });

    it('should escape strings for Typst', async () => {
      expect(await run(tokens)).to.contain('#let content-greeting = "Hello, world"\n');
      expect(await single({ value: 'Say "hi"\\now\nplease', type: 'content' })).to.contain(
        '= "Say \\"hi\\"\\\\now\\nplease"\n',
      );
      expect(await single({ value: 'a\u0007b', type: 'content' })).to.contain('= "a\\u{7}b"\n');
    });

    it('should write arrays as arrays, with a trailing comma for one item', async () => {
      const output = await run(tokens);
      expect(output).to.contain('#let font-family = ("Inter", "sans-serif")\n');
      expect(await single({ value: ['Inter'], type: 'fontFamily' })).to.contain('= ("Inter",)\n');
      expect(await single({ value: [], type: 'other' })).to.contain('= ()\n');
    });

    it('should write objects as dictionaries, quoting keys that are not identifiers', async () => {
      const output = await run(tokens);
      expect(output).to.contain(
        '#let typography-heading = (fontFamily: "Inter", fontSize: 24pt, line-height: 1.2, "letter spacing": 0em)\n',
      );
      expect(await single({ value: {}, type: 'other' })).to.contain('= (:)\n');
      expect(await single({ value: { in: 1 }, type: 'other' })).to.contain('= ("in": 1)\n');
    });

    it('should write booleans and empty values', async () => {
      expect(await single({ value: true, type: 'other' })).to.contain('= true\n');
      expect(await single({ value: null, type: 'other' })).to.contain('= none\n');
    });

    it('should write comments above the variable, unless commentStyle is none', async () => {
      const output = await run(tokens);
      expect(output).to.contain('// The main brand color\n#let color-primary');
      const multi = await single({ value: 1, type: 'other', comment: 'one\ntwo' });
      expect(multi).to.contain('// one\n// two\n#let token = 1\n');
      const none = await run(tokens, { options: { formatting: { commentStyle: 'none' } } });
      expect(none).to.not.contain('The main brand color');
    });

    it('should read DTCG tokens', async () => {
      const output = await run(
        {
          color: {
            green: {
              $value: { colorSpace: 'srgb', components: [0, 0.5, 0] },
              $type: 'color',
              $description: 'Go',
              name: 'color-green',
              path: ['color', 'green'],
            },
          },
          space: {
            small: { $value: '2mm', $type: 'dimension', name: 'space-small', path: ['space'] },
          },
        },
        {},
        { usesDtcg: true },
      );
      expect(output).to.contain('// Go\n#let color-green = rgb("#008000")\n');
      expect(output).to.contain('#let space-small = 2mm\n');
    });

    it('should throw on token names that are not Typst identifiers', async () => {
      for (const name of ['color.red', '2xl', 'color red', 'none']) {
        await expect(single({ value: 1, type: 'other', name })).to.eventually.be.rejectedWith(
          `got "${name}"`,
        );
      }
    });

    it('should throw on a color it cannot read', async () => {
      await expect(single({ value: 'not-a-color', type: 'color' })).to.eventually.be.rejectedWith(
        'could not read the color of token "token"',
      );
    });
  });
});
