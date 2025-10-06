import { expect } from 'chai';
import { restore, stubMethod } from 'hanbi';
import { getReferences } from '../../../lib/utils/references/getReferences.js';
import { convertTokenData } from '../../../lib/utils/convertTokenData.js';

const tokens = {
  color: {
    red: { value: '#f00' },
    danger: { value: '{color.red}' },
  },
  size: {
    border: { value: '2px' },
  },
  border: {
    primary: {
      // getReferences should work on objects like this:
      value: {
        color: '{color.red}',
        width: '{size.border}',
        style: 'solid',
      },
    },
    secondary: {
      // and objects that have a non-string
      value: {
        color: '{color.red}',
        width: 2,
        style: 'solid',
      },
    },
    tertiary: {
      // getReferences should work on interpolated values like this:
      value: '{size.border} solid {color.red}',
    },
  },
};

describe('utils', () => {
  describe('reference', () => {
    describe('getReferences()', () => {
      describe('public API', () => {
        beforeEach(() => {
          restore();
        });

        it('should not collect errors but rather throw immediately when using public API', () => {
          expect(() => getReferences('{foo.bar}', tokens)).to.throw(
            `Tries to reference foo.bar, which is not defined.`,
          );
        });

        it('should not collect errors but rather throw immediately when using public API', async () => {
          const badFn = () => getReferences('{foo.bar}', tokens);
          expect(badFn).to.throw(`Tries to reference foo.bar, which is not defined.`);
        });

        it('should allow warning immediately when references are filtered out', async () => {
          const stub = stubMethod(console, 'warn');
          const clonedTokens = structuredClone(tokens);
          delete clonedTokens.color.red;
          getReferences('{color.red}', clonedTokens, {
            unfilteredTokens: tokens,
            warnImmediately: true,
          });
          expect(stub.firstCall.args[0]).to.equal(
            `Filtered out token references were found: color.red`,
          );
        });
      });

      it(`should return an empty array if the value has no references`, () => {
        expect(getReferences(tokens.color.red.value, tokens)).to.eql([]);
      });

      it(`should work with a single reference`, () => {
        expect(getReferences(tokens.color.danger.value, tokens)).to.eql([
          { ref: ['color', 'red'], value: '#f00' },
        ]);
      });

      it(`should work with object values`, () => {
        expect(getReferences(tokens.border.primary.value, tokens)).to.eql([
          { ref: ['color', 'red'], value: '#f00' },
          { ref: ['size', 'border'], value: '2px' },
        ]);
      });

      it(`should work with objects that have numbers`, () => {
        expect(getReferences(tokens.border.secondary.value, tokens)).to.eql([
          { ref: ['color', 'red'], value: '#f00' },
        ]);
      });

      it(`should work with interpolated values`, () => {
        expect(getReferences(tokens.border.tertiary.value, tokens)).to.eql([
          { ref: ['size', 'border'], value: '2px' },
          { ref: ['color', 'red'], value: '#f00' },
        ]);
      });

      it(`should work with Token Map input values`, () => {
        expect(
          getReferences(tokens.border.tertiary.value, convertTokenData(tokens, { output: 'map' })),
        ).to.eql([
          { key: '{size.border}', ref: ['size', 'border'], value: '2px' },
          { key: '{color.red}', ref: ['color', 'red'], value: '#f00' },
        ]);
      });

      describe('tokens with "value" in their name', () => {
        const tokensWithValueInName = {
          object_type: {
            value_chain: { value: '10px' },
            another: { value: '20px' },
          },
          reference: {
            to_value_chain: { value: '{object_type.value_chain}' },
            to_value_chain_explicit: { value: '{object_type.value_chain.value}' },
          },
        };

        it('should correctly resolve references to tokens with "value" in their name', () => {
          expect(
            getReferences(
              tokensWithValueInName.reference.to_value_chain.value,
              tokensWithValueInName,
            ),
          ).to.eql([{ ref: ['object_type', 'value_chain'], value: '10px' }]);
        });

        it('should correctly resolve explicit .value references to tokens with "value" in their name', () => {
          expect(
            getReferences(
              tokensWithValueInName.reference.to_value_chain_explicit.value,
              tokensWithValueInName,
            ),
          ).to.eql([{ ref: ['object_type', 'value_chain'], value: '10px' }]);
        });
      });

      describe('DTCG: tokens with "value" in their name', () => {
        const dtcgTokensWithValueInName = {
          object_type: {
            value_chain: { $value: '10px' },
            another: { $value: '20px' },
          },
          reference: {
            to_value_chain: { $value: '{object_type.value_chain}' },
            to_value_chain_explicit: { $value: '{object_type.value_chain.$value}' },
          },
        };

        it('should correctly resolve DTCG references to tokens with "value" in their name', () => {
          expect(
            getReferences(
              dtcgTokensWithValueInName.reference.to_value_chain.$value,
              dtcgTokensWithValueInName,
              { usesDtcg: true },
            ),
          ).to.eql([{ ref: ['object_type', 'value_chain'], $value: '10px' }]);
        });

        it('should correctly resolve explicit .$value references to tokens with "value" in their name', () => {
          expect(
            getReferences(
              dtcgTokensWithValueInName.reference.to_value_chain_explicit.$value,
              dtcgTokensWithValueInName,
              { usesDtcg: true },
            ),
          ).to.eql([{ ref: ['object_type', 'value_chain'], $value: '10px' }]);
        });
      });
    });
  });
});
