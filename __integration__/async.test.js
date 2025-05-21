import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';
import { fs } from 'style-dictionary/fs';
import { resolve } from '../lib/resolve.js';
import { buildPath } from './_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { transforms, propertyFormatNames, transformTypes } from '../lib/enums/index.js';

const sleep = async (time) => {
  await new Promise((resolve) => setTimeout(resolve, time));
};
const { attributeCti, nameKebab, timeSeconds, htmlIcon, sizeRem, colorCss } = transforms;
const textFile = resolve(`${buildPath}text.txt`);

// Tests all hooks async, into a single config
describe('integration', async function () {
  this.timeout(10000);
  before(async () => {
    // so we don't accidentally create side-effects on the StyleDictionary class
    // that will affect outputs of other tests.
    const SDExtension = class extends StyleDictionary {};

    SDExtension.registerParser({
      name: 'json-parser',
      pattern: /^.+\.json$/g,
      parser: async ({ contents }) => {
        await sleep(10);
        // TODO: verify this is called
        return JSON.parse(contents);
      },
    });

    SDExtension.registerPreprocessor({
      name: 'foo-processor',
      preprocessor: async (tokens) => {
        await sleep(10);
        return {
          ...tokens,
          foo: {
            value: 'foo',
            type: 'other',
          },
        };
      },
    });

    SDExtension.registerTransform({
      name: 'foo-value-transform',
      type: transformTypes.value,
      filter: (token) => token.value === 'foo',
      transform: async () => {
        await sleep(10);
        return 'bar';
      },
    });

    SDExtension.registerFormat({
      name: 'custom/css',
      format: async function ({ dictionary, file, options }) {
        await sleep(10);
        const { outputReferences } = options;
        return (
          (await fileHeader({ file })) +
          ':root {\n' +
          formattedVariables({
            format: propertyFormatNames.css,
            dictionary,
            outputReferences,
          }) +
          '\n}\n'
        );
      },
    });

    SDExtension.registerAction({
      name: 'custom/action',
      do: async function () {
        await fs.promises.writeFile(textFile, 'foo', 'UTF-8');
      },
      undo: async function () {
        await fs.promises.unlink(textFile);
      },
    });

    const sd = new SDExtension({
      source: [`__integration__/tokens/**/[!_]*.json?(c)`],
      preprocessors: ['foo-processor'],
      platforms: {
        css: {
          transforms: [
            attributeCti,
            nameKebab,
            timeSeconds,
            htmlIcon,
            sizeRem,
            colorCss,
            'foo-value-transform',
          ],
          buildPath,
          actions: ['custom/action'],
          files: [
            {
              destination: 'variables.css',
              format: 'custom/css',
              options: {
                fileHeader: async () => {
                  await sleep(10);
                  return ['foo', 'bar'];
                },
              },
              filter: async (token) => {
                await sleep(2);
                return token.attributes.item !== 'info';
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

  describe('async hooks', async () => {
    it(`should match snapshot`, async () => {
      const output = fs.readFileSync(resolve(`${buildPath}variables.css`), 'utf-8');
      const textFileContents = fs.readFileSync(textFile, 'utf-8');
      expect(textFileContents).to.equal('foo');
      await expect(output).to.matchSnapshot();
    });
  });
});
