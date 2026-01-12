import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { transformGroups } from '../lib/enums/index.js';

describe(`integration`, async () => {
  it('should support name transforms to still work even if another transform errors (sizeRem for "auto" value)', async () => {
    const sd = new StyleDictionary({
      hooks: {
        formats: {
          'in-memory': ({ dictionary }) => dictionary.allTokens,
        },
      },
      tokens: {
        spacing: {
          breadcrumbs: {
            separator: {
              margin: { $value: 'auto', $type: 'dimension' },
            },
          },
        },
      },
      platforms: {
        css: {
          transformGroup: transformGroups.css,
          files: [
            {
              format: 'in-memory',
            },
          ],
        },
      },
    });
    const { css } = await sd.formatAllPlatforms();
    expect(css[0].output[0].name).to.equal('spacing-breadcrumbs-separator-margin');
  });
});
