import { expect } from 'chai';
import { isDTCGColorObject } from '../../../lib/common/transform-utils/colors.js';

describe('common', () => {
  describe('transform-utils', () => {
    describe('colors', () => {
      describe('isDTCGColorObject', () => {
        it('should return true for valid DTCG color objects', () => {
          expect(isDTCGColorObject({ colorSpace: 'srgb', components: [1, 0, 0] })).to.be.true;
          expect(
            isDTCGColorObject({ colorSpace: 'oklch', components: [0.7, 0.15, 180], alpha: 0.5 }),
          ).to.be.true;
          expect(isDTCGColorObject({ colorSpace: 'display-p3', components: [0.5, 0.5, 0.5] })).to.be
            .true;
        });

        it('should return false for non-DTCG values', () => {
          expect(isDTCGColorObject('#ff0000')).to.be.false;
          expect(isDTCGColorObject('rgb(255, 0, 0)')).to.be.false;
          expect(isDTCGColorObject(null)).to.be.false;
          expect(isDTCGColorObject(undefined)).to.be.false;
          expect(isDTCGColorObject({ colorSpace: 'invalid', components: [1, 0, 0] })).to.be.false;
          expect(isDTCGColorObject({ colorSpace: 'srgb' })).to.be.false; // missing components
        });
      });
    });
  });
});
