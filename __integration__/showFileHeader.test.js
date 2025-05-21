import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { cssVariables } = formats;
const { css } = transformGroups;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      // we are only testing showFileHeader options so we don't need
      // the full source.
      source: [`__integration__/tokens/size/padding.json`],
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'platform-none-file-none.css',
              format: cssVariables,
            },
            {
              destination: 'platform-none-file-false.css',
              format: cssVariables,
              options: {
                showFileHeader: false,
              },
            },
          ],
        },
        fileHeader: {
          transformGroup: css,
          buildPath,
          options: {
            showFileHeader: false,
          },
          files: [
            {
              destination: 'platform-false-file-none.css',
              format: cssVariables,
            },
            {
              destination: 'platform-false-file-true.css',
              format: cssVariables,
              options: {
                showFileHeader: true,
              },
            },
          ],
        },
      },
    });
    await sd.buildAllPlatforms();
  });

  afterEach(() => {
    clearOutput(buildPath);
  });

  describe('showFileHeader', async () => {
    describe(`without platform options`, async () => {
      it(`should show file header if no file options set`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}platform-none-file-none.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`should not show file header if file options set to false`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}platform-none-file-false.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
    });

    describe(`with platform options set to false`, async () => {
      it(`should not show file header if no file options set`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}platform-false-file-none.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`should show file header if file options set to true`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}platform-false-file-true.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
    });
  });
});
