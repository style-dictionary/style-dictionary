import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { transformGroups } from '../lib/enums/index.js';

const { js } = transformGroups;

describe('integration', async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/size/padding.json`],
      // Adding formats directly to SD
      hooks: {
        formats: {
          inlineCustomFormatWithOldArgs: (dictionary, platform, file) => {
            return JSON.stringify({ dictionary, platform, file }, null, 2);
          },
          inlineCustomFormatWithNewArgs: (opts) => {
            return JSON.stringify(opts, null, 2);
          },
        },
      },
      platforms: {
        inlineCustomFormats: {
          transformGroup: js,
          buildPath,
          options: {
            otherOption: `platform option`,
          },
          files: [
            {
              destination: 'inlineCustomFormatWithOldArgs.json',
              format: 'inlineCustomFormatWithOldArgs',
              options: {
                showFileHeader: true,
                otherOption: 'Test',
              },
            },
            {
              destination: 'inlineCustomFormatWithNewArgs.json',
              format: 'inlineCustomFormatWithNewArgs',
              options: {
                showFileHeader: true,
                otherOption: 'Test',
              },
            },
          ],
        },
        customFormats: {
          transformGroup: js,
          buildPath,
          options: {
            otherOption: `platform option`,
          },
          files: [
            {
              destination: 'registerCustomFormatWithNewArgs.json',
              format: 'registerCustomFormatWithNewArgs',
              options: {
                showFileHeader: true,
                otherOption: 'Test',
              },
            },
          ],
        },
      },
    });

    sd.registerFormat({
      name: 'registerCustomFormatWithNewArgs',
      format: (opts) => {
        return JSON.stringify(opts, null, 2);
      },
    });

    await sd.buildAllPlatforms();
  });

  afterEach(() => {
    clearOutput(buildPath);
  });

  describe('custom formats', async () => {
    describe(`inline custom with new args`, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}inlineCustomFormatWithNewArgs.json`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`should receive proper arguments`, () => {
        const output = fs.readFileSync(resolve(`${buildPath}inlineCustomFormatWithNewArgs.json`), {
          encoding: 'UTF-8',
        });
        const { dictionary, platform, file, options } = JSON.parse(output);
        expect(dictionary).to.have.property(`tokens`);
        expect(dictionary).to.have.property(`allTokens`);
        expect(platform).to.have.nested.property(`options.otherOption`, `platform option`);
        expect(file).to.have.nested.property(`options.otherOption`, `Test`);
        expect(options).to.have.property(`otherOption`, `Test`);
      });
    });

    describe(`register custom format with new args`, async () => {
      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(
          resolve(`${buildPath}registerCustomFormatWithNewArgs.json`),
          {
            encoding: 'UTF-8',
          },
        );
        await expect(output).to.matchSnapshot();
      });

      it(`should receive proper arguments`, () => {
        const output = fs.readFileSync(
          resolve(`${buildPath}registerCustomFormatWithNewArgs.json`),
          {
            encoding: 'UTF-8',
          },
        );
        const { dictionary, platform, file, options } = JSON.parse(output);
        expect(dictionary).to.have.property(`tokens`);
        expect(dictionary).to.have.property(`allTokens`);
        expect(platform).to.have.nested.property(`options.otherOption`, `platform option`);
        expect(file).to.have.nested.property(`options.otherOption`, `Test`);
        expect(options).to.have.property(`otherOption`, `Test`);
      });
    });
  });
});
