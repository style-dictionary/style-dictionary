import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { typescriptModuleDeclarations } = fileFormats;

const file = {
  destination: 'output.d.ts',
  format: typescriptModuleDeclarations,
  filter: { type: 'color' },
};

const tokens = {
  color: {
    red: { value: '#FF0000' },
  },
};

const format = formats[typescriptModuleDeclarations].bind(file);

describe('formats', () => {
  describe(typescriptModuleDeclarations, () => {
    it('should be a valid TS file', async () => {
      const output = await format(
        createFormatArgs({
          dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
          file,
          platform: {},
        }),
        {},
        file,
      );

      // get all lines that have DesignToken
      const lines = output.split('\n').filter((l) => l.indexOf(': DesignToken') >= 0);

      // assert that any lines have a DesignToken type definition
      lines.forEach((l) => {
        expect(l.match(/^.*: DesignToken;$/g).length).to.equal(1);
      });
    });
  });
});
