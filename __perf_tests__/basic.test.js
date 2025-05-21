import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import path from 'path-unified/posix';
import { buildPath } from '../__integration__/_constants.js';
import { clearOutput } from '../__tests__/__helpers.js';
import { formats, transformGroups } from '../lib/enums/index.js';

const { cssVariables } = formats;
const { css } = transformGroups;

/**
 * The CI is significantly slower due to less CPU
 * Therefore, we allow twice as long as locally.
 * Since we test perf on Node (but we debug in browser, therefore optional chaining),
 * we have process.env.CI available to us here
 *
 * We also generally set the test timeout to the allowed time + half a second margin
 * in case the other test setup steps take slightly longer.
 */
const timeoutMultiplier = process?.env?.CI ? 2 : 1;

/**
 * Utility to programmatically generate large sets of tokens
 *
 * Example:
 * generateTokens({ key: 'fw', amount: 3000, value: 'Regular', type: 'fontWeight', refDepth: 3 });
 *
 * Result:
 *
 * {
 *   fw-ref0: { // base, minimum
 *     fw0: {
 *       value: 'Regular',
 *       type: 'fontWeight'
 *     },
 *     fw1: {
 *       value: 'Regular',
 *       type: 'fontWeight'
 *     },
 *     ...
 *   },
 *   fw-ref1: { // refs the previous sibling, if refDepth > 1
 *     fw0: {
 *       value: '{fw-ref0.fw0}',
 *       type: 'fontWeight'
 *     },
 *     fw1: {
 *       value: '{fw-ref0.fw1}',
 *       type: 'fontWeight'
 *     },
 *     ... (repeat, depends on `amount`)
 *   },
 *   ... (repeat, depends on `refDepth`)
 * }
 *
 * @param {*} param0
 * @returns
 */
const generateTokens = ({ key, type, value, amount, refDepth = 1 }) => {
  const result = {};
  Array(refDepth)
    .fill(null)
    .forEach((_, refIndex) => {
      result[`${key}-ref${refIndex}`] = Object.fromEntries(
        Array(amount)
          .fill(null)
          .map((_, index) => [
            `${key}${index}`,
            { value: refIndex > 0 ? `{${key}-ref${refIndex - 1}.${key}${index}}` : value, type },
          ]),
      );
    });

  return result;
};

describe('cliBuildWithJsConfig', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should run basic Style Dictionary within 40ms', async () => {
    // -> within 40ms
    const start = performance.now();
    const sd = new StyleDictionary({
      tokens: {
        color: {
          black: {
            value: '#000',
            type: 'color',
          },
        },
      },
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.buildAllPlatforms();
    const end = performance.now();
    expect(end - start).to.be.below(40 * timeoutMultiplier);
  });

  it('should run tons of refs within 500 ms', async () => {
    // 9000 tokens, 6000 refs, 3 ref layers deep -> within 500ms
    // (first layer is raw values, other 2 layers are refs to previous layer)
    const fontWeightTokens = generateTokens({
      key: 'fw',
      amount: 3000,
      value: 'Regular',
      type: 'fontWeight',
      refDepth: 3,
    });

    const start = performance.now();
    const sd = new StyleDictionary({
      tokens: {
        ...fontWeightTokens,
      },
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.hasInitialized;
    await sd.buildPlatform('css');
    const end = performance.now();
    expect(end - start).to.be.below(500 * timeoutMultiplier);
  }).timeout(1000 * timeoutMultiplier);

  it('should run tons refs chaining within 2 seconds', async () => {
    // 9000 tokens, 8700 refs, 30 ref layers deep -> within 750ms
    const fontWeightTokens = generateTokens({
      key: 'fw',
      amount: 300,
      value: 'Regular',
      type: 'fontWeight',
      refDepth: 30,
    });

    const start = performance.now();
    const sd = new StyleDictionary({
      tokens: {
        ...fontWeightTokens,
      },
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.hasInitialized;
    await sd.buildPlatform('css');
    const end = performance.now();
    expect(end - start).to.be.below(750 * timeoutMultiplier);
  }).timeout(1250 * timeoutMultiplier);

  it('should run an obscene amount of tokens with refs refs chaining within 5 seconds', async () => {
    // 30000 tokens, 29700 refs, 100 ref layers deep -> within 5000ms
    const fontWeightTokens = generateTokens({
      key: 'fw',
      amount: 300,
      value: 'Regular',
      type: 'fontWeight',
      refDepth: 100,
    });

    const start = performance.now();
    const sd = new StyleDictionary({
      tokens: {
        ...fontWeightTokens,
      },
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.hasInitialized;
    await sd.buildPlatform('css');
    const end = performance.now();
    expect(end - start).to.be.below(5000 * timeoutMultiplier);
  }).timeout(5500 * timeoutMultiplier);

  it('should be fast even with transitive transforms', async () => {
    // 9000 tokens, 8700 refs, 30 ref layers deep -> within 750ms
    const fontWeightTokens = generateTokens({
      key: 'fw',
      amount: 300,
      value: 'Regular',
      type: 'fontWeight',
      refDepth: 30,
    });

    const start = performance.now();
    const sd = new StyleDictionary({
      hooks: {
        transforms: {
          test: {
            type: 'value',
            transitive: true,
            transform: (token) => {
              // append a character
              return token.value + '-';
            },
          },
        },
      },
      tokens: {
        ...fontWeightTokens,
      },
      platforms: {
        css: {
          transformGroup: css,
          transforms: ['test'],
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.hasInitialized;
    await sd.buildPlatform('css');
    const end = performance.now();
    const output = await fs.promises.readFile(path.resolve(buildPath, 'variables.css'), 'utf-8');
    // first layer of refs should only have a single -
    expect(output).to.include(`--fw-ref0-fw0: Regular-`);
    // last layer of refs should have 30 -'s
    expect(output).to.include(`--fw-ref29-fw0: Regular${Array(30).fill('-').join('')};`);
    expect(end - start).to.be.below(750 * timeoutMultiplier);
  }).timeout(1250 * timeoutMultiplier);

  it('should be fast even with composite token expansion', async () => {
    // 9000 tokens, 8700 refs, 30 ref layers deep -> within 1500ms
    const typographyTokens = {
      family: {
        sans: {
          value: 'Helvetica Neue, sans-serif',
          type: 'fontFamily',
        },
      },
      weight: {
        body: {
          value: 'Regular',
          type: 'fontWeight',
        },
      },
      lineHeights: {
        regular: {
          value: 1,
          type: 'lineHeight',
        },
      },
      size: {
        4: {
          value: '16px',
          type: 'dimension',
        },
      },
      ...generateTokens({
        key: 'fw',
        amount: 300,
        value: {
          // inner refs as well
          fontFamily: '{family.sans}',
          fontWeight: '{weight.body}',
          fontSize: '{size.4}',
          lineHeight: '{lineHeights.regular}',
        },
        type: 'typography',
        refDepth: 30,
      }),
    };

    const start = performance.now();
    const sd = new StyleDictionary({
      tokens: {
        ...typographyTokens,
      },
      expand: true,
      platforms: {
        css: {
          transformGroup: css,
          buildPath,
          files: [
            {
              destination: 'variables.css',
              format: cssVariables,
            },
          ],
        },
      },
    });
    await sd.hasInitialized;
    await sd.buildPlatform('css');
    const end = performance.now();
    const output = await fs.promises.readFile(path.resolve(buildPath, 'variables.css'), 'utf-8');
    expect(output).to.include(`--fw-ref0-fw0-font-family: 'Helvetica Neue', sans-serif;`);
    expect(output).to.include(`--fw-ref29-fw299-font-family: 'Helvetica Neue', sans-serif;`);
    expect(end - start).to.be.below(1500 * timeoutMultiplier);
  }).timeout(2000 * timeoutMultiplier);
});
