import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { transformTypes } from '../lib/enums/index.js';

describe('integration', () => {
  it('should expose the referenced DTCG token type to platform transforms', async () => {
    const sd = new StyleDictionary({
      tokens: {
        alias: { $value: '{palette.red}' },
        palette: {
          $type: 'color',
          red: { $value: { colorSpace: 'srgb', components: [1, 0, 0] } },
        },
      },
      hooks: {
        transforms: {
          'test/color-attribute': {
            type: transformTypes.attribute,
            filter: (token) => token.$type === 'color',
            transform: () => ({ matchedColorType: true }),
          },
        },
      },
      platforms: {
        test: { transforms: ['test/color-attribute'] },
      },
    });

    const { allTokens } = await sd.getPlatformTokens('test');
    const alias = allTokens.find((token) => token.path.join('.') === 'alias');
    expect(alias?.$type).to.equal('color');
    expect(alias?.attributes).to.include({ matchedColorType: true });
  });

  for (const scope of ['global', 'platform']) {
    it(`should expand a composite alias selected by its inferred type at ${scope} scope`, async () => {
      const expand = { include: ['border'] };
      const width = { value: 1, unit: 'px' };
      const sd = new StyleDictionary({
        tokens: {
          alias: { $value: '{base}' },
          base: {
            $type: 'border',
            $value: {
              width,
              style: 'solid',
              color: { colorSpace: 'srgb', components: [1, 0, 0] },
            },
          },
        },
        ...(scope === 'global' ? { expand } : {}),
        platforms: { test: scope === 'platform' ? { expand } : {} },
      });

      const { allTokens } = await sd.getPlatformTokens('test');
      const aliasWidth = allTokens.find((token) => token.path.join('.') === 'alias.width');
      expect(aliasWidth).to.include({ $type: 'dimension' });
      expect(aliasWidth?.$value).to.eql(width);
    });
  }
});
