import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as fileFormats } from '../../lib/enums/index.js';

const { iosSwiftAnySwift } = fileFormats;

const originalFile = {
  destination: 'output.swift',
  format: iosSwiftAnySwift,
  options: {
    className: 'StyleDictionary',
  },
  filter: {
    type: 'color',
  },
};

let file = {};

const tokens = {
  color: {
    base: {
      red: {
        value: 'UIColor(red: 1.000, green: 0.000, blue: 0.000, alpha: 1)',
        filePath: 'tokens/color/base.json',
        original: { value: '#FF0000' },
        name: 'colorBaseRed',
        path: ['color', 'base', 'red'],
      },
    },
  },
};

const format = formats[iosSwiftAnySwift];

describe('formats', () => {
  describe(iosSwiftAnySwift, () => {
    beforeEach(() => {
      file = structuredClone(originalFile);
    });

    it('should match default snapshot', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        ),
      ).to.matchSnapshot();
    });

    it('with import override should match snapshot', async () => {
      file.options.import = ['UIKit', 'AnotherModule'];
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        ),
      ).to.matchSnapshot();
    });

    it('with objectType override should match snapshot', async () => {
      file.options.objectType = 'struct';
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        ),
      ).to.matchSnapshot();
    });

    it('with access control override should match snapshot', async () => {
      file.options.accessControl = 'internal';
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
          {},
          file,
        ),
      ).to.matchSnapshot();
    });
  });
});
