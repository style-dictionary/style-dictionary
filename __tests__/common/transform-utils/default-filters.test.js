import { expect } from 'chai';
import { isColor } from '../../../lib/common/transform-utils/default-filters.js';

describe('common', () => {
  describe('transform-utils', () => {
    describe('default-filter', () => {
      describe('isColor', () => {
        it('should match short hex colors', () => {
          expect(isColor({ type: 'color', value: '369' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: '#369' }, {})).to.be.true;
        });

        it('should match standard hex colors', () => {
          expect(isColor({ type: 'color', value: 'e66465' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: '#e66465' }, {})).to.be.true;
        });

        it('should match 8-digit hex colors', () => {
          expect(isColor({ type: 'color', value: 'e66465FF' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: '#e66465FF' }, {})).to.be.true;
        });

        it('should match legacy rgb/rgba colors', () => {
          expect(isColor({ type: 'color', value: 'rgb(132, 99, 255)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'rgb(132, 99, 255, 0.5)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'rgba(132, 99, 255, 0.5)' }, {})).to.be.true;
        });

        it('should match rgb colors', () => {
          expect(isColor({ type: 'color', value: 'rgb(132 99 255)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'rgb(132 99 255 / .5)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'rgb(132 99 255 / 50%)' }, {})).to.be.true;
        });

        it('should match legacy hsl/hsla colors', () => {
          expect(isColor({ type: 'color', value: 'hsl(30, 100%, 50%, 0.6)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'hsla(30, 100%, 50%, 0.6)' }, {})).to.be.true;
        });

        it('should match hsl colors', () => {
          expect(isColor({ type: 'color', value: 'hsl(30 100% 50% / .6)' }, {})).to.be.true;
          expect(isColor({ type: 'color', value: 'hsl(30.2 100% 50% / 60%)' }, {})).to.be.true;
        });

        it('should match named colors', () => {
          expect(isColor({ type: 'color', value: 'red' }, {})).to.be.true;
        });

        it('should ignore gradients', () => {
          expect(isColor({ type: 'color', value: 'linear-gradient(#e66465, #9198e5)' }, {})).to.be
            .false;
          expect(isColor({ type: 'color', value: 'linear-gradient(red, yellow)' }, {})).to.be.false;
          expect(
            isColor(
              { type: 'color', value: 'linear-gradient(rgba(0, 0, 0, 0.00), rgba(0, 0, 0, 0.60))' },
              {},
            ),
          ).to.be.false;
          expect(
            isColor({ type: 'color', value: 'repeating-linear-gradient(#e66465, #9198e5)' }, {}),
          ).to.be.false;
          expect(isColor({ type: 'color', value: 'radial-gradient(#e66465, #9198e5)' }, {})).to.be
            .false;
          expect(
            isColor({ type: 'color', value: 'repeating-radial-gradient(#e66465, #9198e5)' }, {}),
          ).to.be.false;
        });

        it('should ignore values that cannot convert to a color', () => {
          expect(isColor({ type: 'color', value: 'currentColor' }, {})).to.be.false;
        });

        it('should match DTCG object format colors', () => {
          expect(
            isColor(
              {
                $type: 'color',
                $value: { colorSpace: 'srgb', components: [1, 0.42, 0.21], alpha: 1 },
              },
              { usesDtcg: true },
            ),
          ).to.be.true;
          expect(
            isColor(
              {
                $type: 'color',
                $value: { colorSpace: 'oklch', components: [0.7, 0.15, 180], alpha: 0.5 },
              },
              { usesDtcg: true },
            ),
          ).to.be.true;
          expect(
            isColor(
              {
                $type: 'color',
                $value: { colorSpace: 'display-p3', components: [0.5, 0.5, 0.5] },
              },
              { usesDtcg: true },
            ),
          ).to.be.true;
        });

        it('should reject DTCG objects with invalid colorSpace', () => {
          expect(
            isColor(
              {
                $type: 'color',
                $value: { colorSpace: 'invalid', components: [1, 0, 0] },
              },
              { usesDtcg: true },
            ),
          ).to.be.false;
        });
      });
    });
  });
});
