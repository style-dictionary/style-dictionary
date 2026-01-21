import { expect } from 'chai';
import formattedVariables from '../../../lib/common/formatHelpers/formattedVariables.js';
import { convertTokenData } from '../../../lib/utils/convertTokenData.js';
import { propertyFormatNames } from '../../../lib/enums/index.js';

const { css, sass, less } = propertyFormatNames;

const tokens = {
  color: {
    base: {
      red: {
        400: {
          name: 'color-base-red-400',
          value: '#EF5350',
          original: { value: '#EF5350' },
          path: ['color', 'base', 'red', '400'],
        },
      },
      blue: {
        500: {
          name: 'color-base-blue-500',
          value: '#2196F3',
          original: { value: '#2196F3' },
          path: ['color', 'base', 'blue', '500'],
        },
      },
    },
  },
};

describe('formatHelpers', () => {
  describe('formattedVariables', () => {
    it('should format variables with CSS format and match snapshot', async () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      const result = formattedVariables({
        format: css,
        dictionary,
      });
      await expect(result).to.matchSnapshot();
    });

    it('should format variables with SASS format and match snapshot', async () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      const result = formattedVariables({
        format: sass,
        dictionary,
      });
      await expect(result).to.matchSnapshot();
    });

    it('should format variables with LESS format and match snapshot', async () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      const result = formattedVariables({
        format: less,
        dictionary,
      });

      expect(result).to.include('@color-base-red-400');
      expect(result).to.include('@color-base-blue-500');
      expect(result).to.include('#EF5350');
      expect(result).to.include('#2196F3');
      await expect(result).to.matchSnapshot();
    });

    it('should sort variables by name when sort option is "name" and match snapshot', async () => {
      const tokensForSort = {
        color: {
          z: {
            name: 'color-z',
            value: '#111111',
            original: { value: '#111111' },
            path: ['color', 'z'],
          },
          a: {
            name: 'color-a',
            value: '#000000',
            original: { value: '#000000' },
            path: ['color', 'a'],
          },
        },
      };

      // convertTokenData preserves insertion order: z comes before a, so result is [z, a] (not alphabetical)
      const allTokensForSort = convertTokenData(tokensForSort, { output: 'array' });

      const dictionary = {
        tokens: tokensForSort,
        allTokens: allTokensForSort,
        unfilteredTokens: tokensForSort,
      };

      const result = formattedVariables({
        format: css,
        dictionary,
        sort: 'name',
      });

      // ensure "--color-a" comes before "--color-z"
      expect(result.indexOf('--color-a')).to.be.lessThan(result.indexOf('--color-z'));
      await expect(result).to.matchSnapshot();
    });

    it('should accept sort as an array and chain as tie-breakers (custom -> name)', () => {
      const tokensForChain = {
        color: {
          // value decides this is sorted down, even though it's at the top of insertion here
          a: {
            name: 'color-a',
            value: '#111111',
            original: { value: '#111111' },
            path: ['color', 'a'],
          },
          // c & b have same value => custom value sorter returns 0 (tiebreak), so "name" sorter decides order
          // and places c down and b up
          c: {
            name: 'color-c',
            value: '#000000',
            original: { value: '#000000' },
            path: ['color', 'c'],
          },
          b: {
            name: 'color-b',
            value: '#000000',
            original: { value: '#000000' },
            path: ['color', 'b'],
          },
        },
      };

      // primary sorter: value
      const byValue = (t1, t2) => String(t1.value).localeCompare(String(t2.value));

      const dictionary = {
        tokens: tokensForChain,
        allTokens: convertTokenData(tokensForChain, { output: 'array' }),
        unfilteredTokens: tokensForChain,
      };

      const result = formattedVariables({
        format: css,
        dictionary,
        sort: [byValue, 'name'],
      });

      // extrapolate the token names into chars a, b, c etc.
      const keys = result.split('\n').map((_k) => {
        const k = _k.trim().split(':')[0];
        return k.replace('--color-', '');
      });

      // Order insertion: a -> c -> b
      // Expectation: value sorter: c -> b -> a, then name sorter: b -> c -> a
      expect(keys).to.eql(['b', 'c', 'a']);
    });

    it('should keep reference-safe ordering first when outputReferences=true even if sort="name"', () => {
      // semantic is defined before base (insertion order), but semantic references base
      // name order is also "a-semantic" before "z-base"
      const tokensWithRef = {
        color: {
          semantic: {
            primary: {
              name: 'a-semantic',
              value: '#EF5350',
              original: { value: '{color.base.red.400.value}' },
              path: ['color', 'semantic', 'primary'],
            },
          },
          base: {
            red: {
              400: {
                name: 'z-base',
                value: '#EF5350',
                original: { value: '#EF5350' },
                path: ['color', 'base', 'red', '400'],
              },
            },
          },
        },
      };

      const dictionary = {
        tokens: tokensWithRef,
        unfilteredTokens: tokensWithRef,
        allTokens: convertTokenData(tokensWithRef, { output: 'array' }),
      };

      // Test with outputReferences: true - reference-safe order takes precedence
      const resultWithRefs = formattedVariables({
        format: css,
        dictionary,
        outputReferences: true,
        sort: 'name', // would normally put a-semantic first, but outputReferences requires reference-safe order
      });

      // base definition must appear before the referencing token
      expect(resultWithRefs.indexOf('--z-base')).to.be.lessThan(
        resultWithRefs.indexOf('--a-semantic'),
      );
      // should output reference
      expect(resultWithRefs).to.include('var(--z-base)');

      // Test with outputReferences: false - name sorting should apply
      const resultWithoutRefs = formattedVariables({
        format: css,
        dictionary,
        outputReferences: false,
        sort: 'name',
      });

      // name order should apply: a-semantic comes before z-base
      expect(resultWithoutRefs.indexOf('--a-semantic')).to.be.lessThan(
        resultWithoutRefs.indexOf('--z-base'),
      );
      // should output raw value, not reference
      expect(resultWithoutRefs).to.include('#EF5350');
      expect(resultWithoutRefs).to.not.include('var(--z-base)');
    });

    it('should output references when outputReferences=true and match snapshot', async () => {
      const tokensWithRef = {
        color: {
          base: {
            red: {
              400: {
                name: 'color-base-red-400',
                value: '#EF5350',
                original: { value: '#EF5350' },
                path: ['color', 'base', 'red', '400'],
              },
            },
          },
          semantic: {
            primary: {
              name: 'color-semantic-primary',
              value: '{color.base.red.400.value}',
              original: { value: '{color.base.red.400.value}' },
              path: ['color', 'semantic', 'primary'],
            },
          },
        },
      };

      const dictionary = {
        tokens: tokensWithRef,
        unfilteredTokens: tokensWithRef,
        allTokens: convertTokenData(tokensWithRef, { output: 'array' }),
      };

      const result = formattedVariables({
        format: css,
        dictionary,
        outputReferences: true,
      });
      await expect(result).to.matchSnapshot();
    });

    it('should throw for invalid sort option (fail loudly)', () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      let error;
      try {
        formattedVariables({
          format: css,
          dictionary,
          sort: 'naem',
        });
      } catch (err) {
        error = err;
      }

      expect(error, 'Expected formattedVariables() to throw').to.exist;
      expect(String(error)).to.include('Invalid "sort" option');
    });

    it('should throw for invalid sort option type', () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      let error;
      try {
        formattedVariables({
          format: css,
          dictionary,
          sort: 123, // invalid type
        });
      } catch (err) {
        error = err;
      }

      expect(error, 'Expected formattedVariables() to throw').to.exist;
      expect(String(error)).to.include('Invalid "sort" option type');
    });

    it('should use custom lineSeparator from formatting options', () => {
      const dictionary = {
        tokens,
        allTokens: convertTokenData(tokens, { output: 'array' }),
        unfilteredTokens: tokens,
      };

      const result = formattedVariables({
        format: css,
        dictionary,
        formatting: {
          lineSeparator: '\n\n',
        },
      });

      // Should have double newlines between variables
      // Note: CSS format may include indentation, so we check for the pattern more flexibly
      const lines = result.split('\n\n');
      expect(lines.length).to.be.greaterThan(1);
      expect(result).to.matchSnapshot();
    });

    it('should handle themeable tokens with SASS format', () => {
      const themeableTokens = {
        color: {
          base: {
            red: {
              400: {
                name: 'color-base-red-400',
                value: '#EF5350',
                original: { value: '#EF5350' },
                path: ['color', 'base', 'red', '400'],
                themeable: true,
              },
            },
          },
        },
      };

      const allTokens = convertTokenData(themeableTokens, { output: 'array' });
      allTokens[0].themeable = true;

      const dictionary = {
        tokens: themeableTokens,
        allTokens,
        unfilteredTokens: themeableTokens,
      };

      const result = formattedVariables({
        format: sass,
        dictionary,
        themeable: true,
      });

      expect(result).to.include('!default');
    });
  });
});
