import { expect } from 'chai';
import setSwiftFileProperties from '../../../lib/common/formatHelpers/setSwiftFileProperties.js';

describe('common', () => {
  describe('formatHelpers', () => {
    describe('setSwiftFileProperties', () => {
      it('should default accessControl be public', () => {
        const file = setSwiftFileProperties({}, undefined, 'ios-swift');
        expect(file.accessControl).to.equal('public');
      });

      it('should default objectType be class', () => {
        const file = setSwiftFileProperties({}, undefined, 'ios-swift');
        expect(file.objectType).to.equal('class');
      });

      it('should default import be ["UIKit"]', () => {
        const file = setSwiftFileProperties({}, undefined, 'ios-swift');
        const fileSeparate = setSwiftFileProperties({}, undefined, 'ios-swift-separate');
        expect(file.import).to.eql(['UIKit']);
        expect(fileSeparate.import).to.eql(['UIKit']);
      });

      it('should transform string import to array', () => {
        const file = setSwiftFileProperties({ import: 'SwiftUI' }, undefined, 'ios-swift');
        expect(file.import).to.eql(['SwiftUI']);
      });

      it('should file be properly configured', () => {
        const file = setSwiftFileProperties(
          {
            objectType: 'extension',
            import: ['SwiftUI'],
            accessControl: 'public',
          },
          undefined,
          'ios-swift',
        );
        expect(file.objectType).to.equal('extension');
        expect(file.import).to.eql(['SwiftUI']);
        expect(file.accessControl).to.equal('public');
      });
    });
  });
});
