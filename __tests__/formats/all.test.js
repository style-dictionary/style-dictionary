import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { deepmerge } from '../../lib/utils/deepmerge.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const file = {
  destination: 'output.txt',
  format: fileFormats.javascriptEs6,
  filter: {
    type: 'color',
  },
};

const tokens = {
  color: {
    red: {
      value: '#FF0000',
      type: 'color',
      original: { value: '#FF0000' },
      name: 'color_red',
      comment: 'comment',
      path: ['color', 'red'],
    },
  },
};

describe('formats', async () => {
  for (const key of Object.keys(formats)) {
    const format = formats[key].bind(file);

    describe('all', () => {
      it('should match ' + key + ' snapshot', async () => {
        const output = await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        );
        await expect(output).to.matchSnapshot();
      });

      it('should match ' + key + ' snapshot with fileHeaderTimestamp set', async () => {
        const _file = deepmerge(file, {
          options: {
            formatting: {
              fileHeaderTimestamp: true,
            },
          },
        });
        const output = await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file: _file,
            platform: {},
          }),
          {},
          _file,
        );
        await expect(output).to.matchSnapshot();
      });

      it('should return ' + key + ' as a string', async () => {
        const output = await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        );
        expect(typeof output).to.equal('string');
      });
    });
  }
});
