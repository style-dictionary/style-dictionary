import { expect } from 'chai';
import formats from '../../lib/common/formats.js';
import createFormatArgs from '../../lib/utils/createFormatArgs.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';
import { formats as formatsEnum } from '../../lib/enums/formats.js';

const { javascriptEsm } = formatsEnum;

const file = {
  destination: 'output.js',
  format: javascriptEsm,
  filter: {
    type: 'color',
  },
};

const tokens = {
  colors: {
    red: {
      500: {
        value: '#ff0000',
        type: 'color',
        path: ['colors', 'red', '500'],
        filePath: 'tokens.json',
        attributes: {
          foo: 'bar',
        },
        name: 'colors-red-500',
      },
    },
  },
  dimensions: {
    xs: {
      value: '15px',
      type: 'dimension',
      path: ['dimension', 'xs'],
      filePath: 'tokens.json',
      attributes: {
        foo: 'bar',
      },
      name: 'dimension-xs',
    },
  },
};

const DTCGTokens = {
  colors: {
    red: {
      500: {
        $value: '#ff0000',
        $type: 'color',
        path: ['colors', 'red', '500'],
        filePath: 'tokens.json',
        attributes: {
          foo: 'bar',
        },
        name: 'colors-red-500',
      },
    },
  },
  dimensions: {
    xs: {
      $value: '15px',
      $type: 'dimension',
      path: ['dimension', 'xs'],
      filePath: 'tokens.json',
      attributes: {
        foo: 'bar',
      },
      name: 'dimension-xs',
    },
  },
};

const format = formats[javascriptEsm];

describe('formats', () => {
  describe(javascriptEsm, () => {
    it('should be a valid JS file and match snapshot', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
          }),
        ),
      ).to.matchSnapshot();
    });

    it('should optionally allow stripping StyleDictionary metadata', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
            options: {
              stripMeta: true,
            },
          }),
        ),
      ).to.matchSnapshot();
    });

    it('should optionally allow stripping everything but an allowlist of props', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
            options: {
              stripMeta: {
                keep: ['value', 'type'],
              },
            },
          }),
        ),
      ).to.matchSnapshot();
    });

    it('should optionally allow stripping custom list of metadata props', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: { tokens, allTokens: convertTokenData(tokens, { output: 'array' }) },
            file,
            platform: {},
            options: {
              stripMeta: {
                strip: ['attributes', 'filePath'],
              },
            },
          }),
        ),
      ).to.matchSnapshot();
    });

    it('should optionally allow stripping StyleDictionary metadata for DTCG formatted tokens', async () => {
      await expect(
        await format(
          createFormatArgs({
            dictionary: {
              tokens: DTCGTokens,
              allTokens: convertTokenData(DTCGTokens, { output: 'array', usesDtcg: true }),
            },
            file,
            platform: {},
            options: {
              usesDtcg: true,
              stripMeta: true,
            },
          }),
        ),
      ).to.matchSnapshot();
    });
  });
});
