import { expect } from 'chai';
import getTypeScriptType from '../../../lib/common/formatHelpers/getTypeScriptType.js';

describe('common', () => {
  describe('formatHelpers', () => {
    describe('getTypeScriptType', () => {
      it('should recognize basic types', () => {
        expect(getTypeScriptType('a string')).to.equal('string');
        expect(getTypeScriptType(3.14159)).to.equal('number');
        expect(getTypeScriptType(true)).to.equal('boolean');
      });

      it('should recognize arrays consisting out of same-type primitives', () => {
        expect(getTypeScriptType(['an', 'array', 'of', 'strings'])).to.equal('string[]');
        expect(getTypeScriptType([3.14159])).to.equal('number[]');
        expect(getTypeScriptType([true, false, true, true])).to.equal('boolean[]');
      });

      it('should recognize arrays consisting out of different primitives', () => {
        expect(getTypeScriptType(['string', 3.14, false])).to.equal(
          '(string | number | boolean)[]',
        );
      });

      it('should support nested arrays', () => {
        expect(
          getTypeScriptType([
            [100, 200],
            [300, 400],
          ]),
        ).to.equal('number[][]');
      });

      it('should handle simple object types', () => {
        expect(getTypeScriptType({})).to.equal('{  }');
        expect(getTypeScriptType({ property1: '', property2: false })).to.equal(
          '{ property1: string, property2: boolean }',
        );
      });

      it('should handle complex object types', () => {
        const complexObject = {
          property1: 'foo',
          property2: ['foo', 'bar'],
          property3: { subProperty1: 'foo', subProperty2: ['foo', 'bar', 1] },
        };
        expect(getTypeScriptType(complexObject)).to.equal(
          '{ property1: string, property2: string[], property3: { subProperty1: string, subProperty2: (string | number)[] } }',
        );
      });

      it('should handle outputStringLiterals', () => {
        const stringValue = 'I "am" a string';
        const options = { outputStringLiterals: true };
        expect(getTypeScriptType(stringValue, options)).to.equal('"I \\"am\\" a string"');
      });
    });
  });
});
