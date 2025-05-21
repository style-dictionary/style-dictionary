import { expect } from 'chai';
import sortByReference from '../../../lib/common/formatHelpers/sortByReference.js';

const TRANSFORMED_TOKENS = (usesDtcg) => {
  const valueKey = usesDtcg ? '$value' : 'value';
  const typeKey = usesDtcg ? '$type' : 'type';

  return {
    color: {
      primary: {
        [valueKey]: '#FF0000',
        [typeKey]: 'color',
        original: {
          [valueKey]: '{color.red}',
          [typeKey]: 'color',
        },
      },
      green: {
        [valueKey]: '#00FF00',
        [typeKey]: 'color',
        original: {
          [valueKey]: '#00FF00',
          [typeKey]: 'color',
        },
      },
      red: {
        [valueKey]: '#FF0000',
        [typeKey]: 'color',
        original: {
          [valueKey]: '#FF0000',
          [typeKey]: 'color',
        },
      },
    },
  };
};

describe('common', () => {
  describe('formatHelpers', () => {
    describe('sortByReference', () => {
      [
        ['default', false, TRANSFORMED_TOKENS(false)],
        ['dtcg', true, TRANSFORMED_TOKENS(true)],
      ].forEach(([tokenFormat, usesDtcg, tokens]) => {
        it(`should keep order when idx0 and idx1 have no reference(${tokenFormat})`, () => {
          const allTokens = [tokens.color.green, tokens.color.red];

          const sorted = [...allTokens].sort(
            sortByReference(tokens, {
              usesDtcg,
            }),
          );

          expect(sorted).to.eql([tokens.color.green, tokens.color.red]);
        });
        it(`should keep order when idx0 has no reference(${tokenFormat})`, () => {
          const allTokens = [tokens.color.red, tokens.color.primary];

          const sorted = [...allTokens].sort(
            sortByReference(tokens, {
              usesDtcg,
            }),
          );

          expect(sorted).to.eql([tokens.color.red, tokens.color.primary]);
        });
        it(`should reorder, if idx0 references idx1 (${tokenFormat})`, () => {
          const allTokens = [tokens.color.primary, tokens.color.red];

          const sorted = [...allTokens].sort(
            sortByReference(tokens, {
              usesDtcg,
            }),
          );

          expect(sorted).to.eql([tokens.color.red, tokens.color.primary]);
        });
      });
      it('should reorder when idx0 is undefined', () => {
        const tokens = TRANSFORMED_TOKENS(false);
        const tokensWithAnUndefinedValue = {
          ...tokens,
          color: { ...tokens.color, primary: undefined },
        };
        const allTokens = [
          tokensWithAnUndefinedValue.color.primary,
          tokensWithAnUndefinedValue.color.red,
        ];

        const sorted = [...allTokens].sort(sortByReference(tokensWithAnUndefinedValue));

        expect(sorted).to.eql([
          tokensWithAnUndefinedValue.color.red,
          tokensWithAnUndefinedValue.color.primary,
        ]);
      });
      it('should keep order when idx1 is undefined', () => {
        const tokens = TRANSFORMED_TOKENS(false);
        const tokensWithUndefinedValue = {
          ...tokens,
          color: { ...tokens.color, primary: undefined },
        };
        const allTokens = [
          tokensWithUndefinedValue.color.red,
          tokensWithUndefinedValue.color.primary,
        ];

        const sorted = [...allTokens].sort(sortByReference(tokensWithUndefinedValue));

        expect(sorted).to.eql([
          tokensWithUndefinedValue.color.red,
          tokensWithUndefinedValue.color.primary,
        ]);
      });
    });
  });
});
