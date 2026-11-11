import { expect } from 'chai';
import { getTokenUnitAndValue } from '../../../lib/common/transform-utils/value-unit.js';

describe('common', () => {
  describe('transform-utils', () => {
    describe('value-unit', () => {
      describe('function getTokenUnitAndValue', () => {
        it('should return token value', () => {
          const allTokensNonDtcg = [
            { value: '42px' },
            { value: '42rem' },
            { value: '42em' },
            { value: '42unit' },

            // number tokens, which used to just be dimension tokens without units
            { value: 42 },
            { value: 0.42 },
            { value: '42' },
            { value: '0.42' },
          ];
          const allTokensDtcg = [
            { $value: '42px' },
            { $value: '42rem' },
            { $value: '42em' },
            { $value: '42unit' },

            // `deprecated` backwards compat for number tokens as dimensions
            { $value: 42 },
            { $value: 0.42 },
            { $value: '42' },
            { $value: '0.42' },

            // new DTCG dimension syntax
            { $value: { value: 42, unit: 'px' } },
            { $value: { value: 42, unit: 'rem' } },
          ];

          const expected = [
            { value: '42', unit: 'px' },
            { value: '42', unit: 'rem' },
            { value: '42', unit: 'em' },
            { value: '42', unit: 'unit' },

            { value: 42, unit: undefined },
            { value: 0.42, unit: undefined },
            { value: '42', unit: undefined },
            { value: '0.42', unit: undefined },

            { value: 42, unit: 'px' },
            { value: 42, unit: 'rem' },
          ];

          allTokensDtcg.forEach((it, idx) => {
            expect(getTokenUnitAndValue(it.$value)).to.deep.equal(expected[idx]);
          });

          allTokensNonDtcg.forEach((it, idx) => {
            expect(getTokenUnitAndValue(it.value)).to.deep.equal(expected[idx]);
          });
        });

        it('should gracefully handle dimension values that cannot be parsed', () => {
          expect(getTokenUnitAndValue('something weird')).to.deep.equal({
            value: 'something weird',
            unit: undefined,
          });

          expect(getTokenUnitAndValue('calc(100% - 20px)')).to.deep.equal({
            value: 'calc(100% - 20px)',
            unit: undefined,
          });
        });
      });
    });
  });
});
