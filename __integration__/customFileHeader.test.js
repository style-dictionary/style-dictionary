import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { cssVariables, javascriptModule } = formats;
const { css, js } = transformGroups;

describe(`integration`, async () => {
  before(async () => {
    // Adding a custom file header with the `.registerFileHeader`
    StyleDictionary.registerFileHeader({
      name: `valid custom file headers test fileHeader`,
      fileHeader: (defaultMessage) => {
        return [`hello`, ...defaultMessage];
      },
    });

    const sd = new StyleDictionary({
      hooks: {
        fileHeaders: {
          configFileHeader: (defaultMessage) => {
            return [...defaultMessage, 'hello, world!'];
          },
        },
      },

      // only testing the file header in these tests so we are
      // using a small tokens object with a single token
      tokens: {
        color: {
          red: { value: '#ff0000' },
        },
      },

      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: `registeredFileHeader.css`,
              format: cssVariables,
              options: {
                fileHeader: `valid custom file headers test fileHeader`,
              },
            },
            {
              destination: `configFileHeader.css`,
              format: cssVariables,
              options: {
                fileHeader: `configFileHeader`,
              },
            },
            {
              destination: `inlineFileHeader.css`,
              format: cssVariables,
              options: {
                fileHeader: () => {
                  return [`build version 1.0.0`];
                },
              },
            },
          ],
        },
        js: {
          transformGroup: js,
          buildPath,
          options: {
            fileHeader: `configFileHeader`,
          },
          files: [
            {
              destination: `noOptions.js`,
              format: javascriptModule,
            },
            {
              destination: `showFileHeader.js`,
              format: javascriptModule,
              options: {
                showFileHeader: false,
              },
            },
            {
              destination: `fileHeaderOverride.js`,
              format: javascriptModule,
              options: {
                fileHeader: () => [`Header overridden`],
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

  describe(`valid custom file headers`, async () => {
    describe('file options', async () => {
      it(`registered file header should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}registeredFileHeader.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`config file header should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}configFileHeader.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`inline file header should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}inlineFileHeader.css`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
    });

    describe('platform options', async () => {
      it(`no file options should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}noOptions.js`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`showFileHeader should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}showFileHeader.js`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      it(`file header override should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}fileHeaderOverride.js`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
    });
  });

  describe(`invalid custom file headers`, async () => {
    it(`should throw if trying to use an undefined file header`, async () => {
      const sd = new StyleDictionary({
        platforms: {
          css: {
            buildPath,
            files: [
              {
                destination: `variables.css`,
                options: {
                  fileHeader: `nonexistentFileHeader`,
                },
              },
            ],
          },
        },
      });

      await expect(sd.buildAllPlatforms()).to.eventually.be.rejectedWith(
        `Can't find fileHeader: nonexistentFileHeader`,
      );
    });
  });
});
