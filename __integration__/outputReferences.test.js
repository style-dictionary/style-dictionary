import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { restore, stubMethod } from 'hanbi';
import { buildPath, cleanConsoleOutput } from './_constants.js';
import { resolve } from '../lib/resolve.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { outputReferencesFilter } from '../lib/utils/references/outputReferencesFilter.js';
import { outputReferencesTransformed } from '../lib/utils/index.js';
import {
  logVerbosityLevels,
  formats,
  transformGroups,
  transformTypes,
} from '../lib/enums/index.js';

const { cssVariables } = formats;
const { css } = transformGroups;
const { verbose } = logVerbosityLevels;

describe('integration', async () => {
  let stub;
  beforeEach(() => {
    stub = stubMethod(console, 'log');
  });

  afterEach(() => {
    clearOutput(buildPath);
    restore();
  });

  describe('output references', async () => {
    it('should allow using outputReferencesTransformed to not output refs when value has been transitively transformed', async () => {
      restore();
      const sd = new StyleDictionary({
        tokens: {
          base: {
            value: 'rgb(0,0,0)',
            type: 'color',
          },
          referred: {
            value: 'rgba({base},0.12)',
            type: 'color',
          },
        },
        hooks: {
          transforms: {
            'rgb-in-rgba': {
              type: transformTypes.value,
              transitive: true,
              filter: (token) => token.type === 'color',
              // quite naive transform to support rgb inside rgba
              transform: (token) => {
                const reg = /rgba\((rgb\((\d,\d,\d)\)),((0\.)?\d+?)\)/g;
                const match = reg.exec(token.value);
                if (match && match[1] && match[2]) {
                  return token.value.replace(match[1], match[2]);
                }
                return token.value;
              },
            },
          },
        },
        platforms: {
          css: {
            transforms: ['rgb-in-rgba'],
            buildPath,
            files: [
              {
                destination: 'transformedFilteredVariables.css',
                format: cssVariables,
                options: {
                  outputReferences: outputReferencesTransformed,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      const output = fs.readFileSync(resolve(`${buildPath}transformedFilteredVariables.css`), {
        encoding: 'UTF-8',
      });
      await expect(output).to.matchSnapshot();
    });

    it('should support outputReferencesTransformed for values that were originally objects', async () => {
      restore();
      const sd = new StyleDictionary({
        tokens: {
          axis: {
            0: {
              value: '0',
              type: 'number',
            },
          },
          shadow: {
            value: {
              x: '{axis.0}',
              y: '{axis.0}',
              blur: '{axis.0}',
              spread: '{axis.0}',
              color: 'rgba(0,0,0,0.4)',
              type: 'innerShadow',
            },
            type: 'shadow',
          },
        },
        platforms: {
          css: {
            transforms: ['shadow/css/shorthand', 'name/kebab'],
            buildPath,
            files: [
              {
                destination: 'transformedShadowVars.css',
                format: 'css/variables',
                options: {
                  outputReferences: outputReferencesTransformed,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      const output = fs.readFileSync(resolve(`${buildPath}transformedShadowVars.css`), {
        encoding: 'UTF-8',
      });
      await expect(output).to.matchSnapshot();
    });

    it('should warn the user if filters out references briefly', async () => {
      const sd = new StyleDictionary({
        // we are only testing showFileHeader options so we don't need
        // the full source.
        source: [`__integration__/tokens/**/[!_]*.json?(c)`],
        platforms: {
          css: {
            transformGroup: css,
            buildPath,
            files: [
              {
                destination: 'filteredVariables.css',
                format: cssVariables,
                // filter tokens and use outputReferences
                // Style Dictionary should build this file ok
                // but warn the user
                filter: (token) => token.attributes.type === 'background',
                options: {
                  outputReferences: true,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      await expect(stub.lastCall.args.map(cleanConsoleOutput).join('\n')).to.matchSnapshot();
    });

    it('should not warn the user if filters out references is prevented with outputReferencesFilter', async () => {
      const sd = new StyleDictionary({
        // we are only testing showFileHeader options so we don't need
        // the full source.
        log: { verbosity: verbose },
        source: [`__integration__/tokens/**/[!_]*.json?(c)`],
        platforms: {
          css: {
            transformGroup: css,
            buildPath,
            files: [
              {
                destination: 'filteredVariables.css',
                format: cssVariables,
                // filter tokens and use outputReferences
                // Style Dictionary should build this file ok
                // but warn the user
                filter: (token) => token.attributes.type === 'background',
                options: {
                  outputReferences: outputReferencesFilter,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      await expect(
        [...stub.calls].map((cal) => cal.args.map(cleanConsoleOutput)).join('\n'),
      ).to.matchSnapshot();
    });

    it('should warn the user if filters out references with a detailed message when using verbose logging', async () => {
      const sd = new StyleDictionary({
        log: { verbosity: verbose },
        // we are only testing showFileHeader options so we don't need
        // the full source.
        source: [`__integration__/tokens/**/[!_]*.json?(c)`],
        platforms: {
          css: {
            transformGroup: css,
            buildPath,
            files: [
              {
                destination: 'filteredVariables.css',
                format: cssVariables,
                // filter tokens and use outputReferences
                // Style Dictionary should build this file ok
                // but warn the user
                filter: (token) => token.attributes.type === 'background',
                options: {
                  outputReferences: true,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      await expect(stub.lastCall.args.map(cleanConsoleOutput).join('\n')).to.matchSnapshot();
    });

    it('should properly reference tokens in dtcg format', async () => {
      const sd = new StyleDictionary({
        tokens: {
          base: {
            $value: '#FF0000',
            $type: 'color',
          },
          referred: {
            $value: '{base}',
            $type: 'color',
          },
        },
        platforms: {
          css: {
            transformGroup: css,
            buildPath,
            files: [
              {
                destination: 'dtcgOutputRef.css',
                format: cssVariables,
                options: {
                  outputReferences: true,
                  usesDtcg: true,
                },
              },
            ],
          },
        },
      });
      await sd.buildAllPlatforms();
      const output = fs.readFileSync(resolve(`${buildPath}dtcgOutputRef.css`), {
        encoding: 'UTF-8',
      });
      await expect(output).to.matchSnapshot();
    });
  });
});
