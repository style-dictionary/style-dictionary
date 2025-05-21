import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { compileString } from 'sass';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { scssVariables, scssMapFlat, scssMapDeep } = formats;

describe(`integration`, async () => {
  before(async () => {
    const sd = new StyleDictionary({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      platforms: {
        css: {
          transformGroup: transformGroups.scss,
          buildPath,
          files: [
            {
              destination: `variables.scss`,
              format: scssVariables,
            },
            {
              destination: `variables-themeable.scss`,
              format: scssVariables,
              options: {
                themeable: true,
              },
            },
            {
              destination: `variables-with-references.scss`,
              format: scssVariables,
              options: {
                outputReferences: true,
              },
            },
            {
              destination: `filtered-variables-with-references.scss`,
              format: scssVariables,
              filter: (token) => token.path[1] === 'background',
              options: {
                outputReferences: true,
              },
            },
            {
              destination: `map-flat.scss`,
              format: scssMapFlat,
              options: {
                mapName: 'design-system-tokens',
              },
            },
            {
              destination: `map-deep.scss`,
              format: scssMapDeep,
              options: {
                mapName: 'design-system-tokens',
              },
            },
            {
              destination: `map-deep-with-references.scss`,
              format: scssMapDeep,
              options: {
                mapName: 'design-system-tokens',
                outputReferences: true,
              },
            },
            {
              destination: `map-deep-not-themeable.scss`,
              format: scssMapDeep,
              options: {
                mapName: 'design-system-tokens',
                themeable: false,
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

  describe(`scss`, async () => {
    describe(`scss/variables`, async () => {
      it(`should have a valid scss syntax`, () => {
        const output = fs.readFileSync(resolve(`${buildPath}variables.scss`), {
          encoding: 'UTF-8',
        });
        const result = compileString(output);
        expect(result.css).to.not.be.undefined;
      });

      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}variables.scss`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      describe(`with themeable`, async () => {
        it(`should have a valid scss syntax`, () => {
          const output = fs.readFileSync(resolve(`${buildPath}variables-themeable.scss`), {
            encoding: 'UTF-8',
          });
          const result = compileString(output);
          expect(result.css).to.not.be.undefined;
        });

        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}variables-themeable.scss`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });

      describe(`with outputReferences`, async () => {
        it(`should have a valid scss syntax`, () => {
          const output = fs.readFileSync(resolve(`${buildPath}variables-with-references.scss`), {
            encoding: 'UTF-8',
          });
          const result = compileString(output);
          expect(result.css).to.not.be.undefined;
        });

        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}variables-with-references.scss`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });

      describe(`with filter and output references`, async () => {
        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(
            resolve(`${buildPath}filtered-variables-with-references.scss`),
            {
              encoding: 'UTF-8',
            },
          );
          await expect(output).to.matchSnapshot();
        });
      });
    });

    describe(`scss/map-flat`, async () => {
      it(`should have a valid scss syntax`, () => {
        const output = fs.readFileSync(resolve(`${buildPath}map-flat.scss`), {
          encoding: 'UTF-8',
        });
        const result = compileString(output);
        expect(result.css).to.not.be.undefined;
      });

      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}map-flat.scss`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });
    });

    describe(`scss/map-deep`, async () => {
      it(`should have a valid scss syntax`, () => {
        const output = fs.readFileSync(resolve(`${buildPath}map-deep.scss`), {
          encoding: 'UTF-8',
        });
        const result = compileString(output);
        expect(result.css).to.not.be.undefined;
      });

      it(`should match snapshot`, async () => {
        const output = fs.readFileSync(resolve(`${buildPath}map-deep.scss`), {
          encoding: 'UTF-8',
        });
        await expect(output).to.matchSnapshot();
      });

      describe(`with outputReferences`, async () => {
        it(`should have a valid scss syntax`, () => {
          const output = fs.readFileSync(resolve(`${buildPath}map-deep-with-references.scss`), {
            encoding: 'UTF-8',
          });
          const result = compileString(output);
          expect(result.css).to.not.be.undefined;
        });

        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}map-deep-with-references.scss`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });

      describe(`without themeable`, async () => {
        it(`should have a valid scss syntax`, () => {
          const output = fs.readFileSync(resolve(`${buildPath}map-deep-not-themeable.scss`), {
            encoding: 'UTF-8',
          });
          const result = compileString(output);
          expect(result.css).to.not.be.undefined;
        });

        it(`should match snapshot`, async () => {
          const output = fs.readFileSync(resolve(`${buildPath}map-deep-not-themeable.scss`), {
            encoding: 'UTF-8',
          });
          await expect(output).to.matchSnapshot();
        });
      });
    });
  });
});
