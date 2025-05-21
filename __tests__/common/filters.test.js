import { expect } from 'chai';
import filters from '../../lib/common/filters.js';

describe('common', () => {
  describe('filters', () => {
    describe('removePrivate', () => {
      it('should keep a regular token in for distribution', () => {
        const regularToken = {
          name: 'color-border',
          value: '#1a1aed',
        };

        expect(filters['removePrivate'](regularToken)).to.be.true;
      });

      it('should keep an unfiltered token in for distribution', () => {
        const unfilteredToken = {
          name: 'color-border',
          value: '#1a1aed',
          private: false,
        };

        expect(filters['removePrivate'](unfilteredToken)).to.be.true;
      });

      it('should remove a filtered token from the distribution output', () => {
        const filteredToken = {
          name: 'color-border',
          value: '#1a1aed',
          private: true,
        };

        expect(filters['removePrivate'](filteredToken)).to.be.false;
      });
    });
  });
});
