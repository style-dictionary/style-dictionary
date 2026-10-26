import { expect } from 'chai';
import { fs } from 'style-dictionary/fs';
import StyleDictionary from 'style-dictionary';
import { clearOutput, dirExists } from '../__helpers.js';

describe('common', () => {
  describe('actions', () => {
    describe('copy_assets', () => {
      beforeEach(() => {
        clearOutput();
      });

      afterEach(() => {
        clearOutput();
      });

      it('should remove the copied assets directory when cleaning', async () => {
        await fs.promises.mkdir('__tests__/__output/assets/fonts', { recursive: true });
        await fs.promises.writeFile('__tests__/__output/assets/fonts/font.woff2', 'font');
        const sd = new StyleDictionary({
          log: { verbosity: 'silent' },
          platforms: {
            web: {
              buildPath: '__tests__/__output/',
              actions: ['copy_assets'],
              files: [],
            },
          },
        });
        await sd.cleanPlatform('web');
        expect(dirExists('__tests__/__output/assets')).to.be.false;
      });
    });
  });
});
