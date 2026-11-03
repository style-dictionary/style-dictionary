import { expect } from 'chai';
import { formatJS } from '../../../lib/common/formatHelpers/formatJS.js';

describe('common', () => {
  describe('formatHelpers', () => {
    describe('formatJS', () => {
      it('should format javascript contents', async () => {
        const formatted = await formatJS('const   a=1;');
        expect(formatted).to.be.a('string');
        expect(formatted).to.contain('const a = 1;');
      });
    });
  });
});
