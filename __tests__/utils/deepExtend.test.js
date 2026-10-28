import { expect } from 'chai';
import deepExtend from '../../lib/utils/deepExtend.js';

describe('utils', () => {
  describe('deepExtend', () => {
    it('should return an object', () => {
      const test = deepExtend();
      expect(typeof test).to.equal('object');
    });

    it('should override tokens from right to left', () => {
      const test = deepExtend([{ foo: 'bar' }, { foo: 'baz' }]);
      expect(test).to.have.property('foo', 'baz');

      const test2 = deepExtend([{ foo: 'bar' }, { foo: 'baz' }, { foo: 'blah' }]);
      expect(test2).to.have.property('foo', 'blah');
    });

    it('overrides nested tokens', () => {
      const test = deepExtend([{ foo: { foo: 'bar' } }, { foo: { foo: 'baz' } }]);
      expect(test).to.have.nested.property('foo.foo', 'baz');

      const test2 = deepExtend([
        { foo: { foo: 'bar' } },
        { foo: { foo: 'baz' } },
        { foo: { foo: 'blah' } },
      ]);
      expect(test2).to.have.nested.property('foo.foo', 'blah');
    });

    it('properly merges nested tokens', () => {
      const test = deepExtend([{ foo: { bar: 'bar' } }, { foo: { baz: 'baz' } }]);
      expect(test).to.have.nested.property('foo.baz', 'baz');
      expect(test).to.have.nested.property('foo.bar', 'bar');

      const test2 = deepExtend([
        { foo: { bar: 'bar' } },
        { foo: { baz: 'baz' } },
        { foo: { blah: 'blah' } },
      ]);
      expect(test2).to.have.nested.property('foo.baz', 'baz');
      expect(test2).to.have.nested.property('foo.bar', 'bar');
      expect(test2).to.have.nested.property('foo.blah', 'blah');
    });

    it("shouldn't fail loudly if it is a normal deep extend", () => {
      const test = deepExtend([{ foo: { bar: 'bar' } }, { foo: { baz: 'baz' } }], {
        collision: function () {},
      });
      expect(test).to.have.nested.property('foo.baz', 'baz');
      expect(test).to.have.nested.property('foo.bar', 'bar');
    });

    it("shouldn't merge when keys collide that should override rather than merge", () => {
      const test = deepExtend(
        [
          { foo: { type: 'other', value: 'bar', metadata: 'meta' } },
          { foo: { type: 'other', value: 'baz' } },
        ],
        { collision: function () {}, overrideKeys: ['value'] },
      );
      expect(test.foo).to.eql({
        type: 'other',
        value: 'baz',
      });
      expect(test).to.have.nested.property('foo.value', 'baz');
      // we do not want to inherit this metadata from the prop we are overriding
      expect(test).to.not.have.nested.property('foo.metadata');

      const testDTCG = deepExtend(
        [
          { foo: { $type: 'other', $value: 'bar', metadata: 'meta' } },
          { foo: { $type: 'other', $value: 'baz' } },
        ],
        { collision: function () {}, overrideKeys: ['$value'] },
      );

      expect(testDTCG.foo).to.eql({
        $type: 'other',
        $value: 'baz',
      });
      expect(testDTCG).to.have.nested.property('foo.$value', 'baz');
      expect(testDTCG).to.not.have.nested.property('foo.metadata');
    });

    it("shouldn't merge object or array values when keys collide that should override rather than merge", () => {
      const test = deepExtend(
        [
          {
            group: {
              foo: { $value: { fontSize: '16px', fontWeight: 700 } },
              bar: { $value: [{ blur: '2px' }, { blur: '8px' }] },
              qux: { $value: 'qux' },
            },
          },
          {
            group: {
              foo: { $value: { fontSize: '14px' } },
              bar: { $value: [{ blur: '4px' }] },
            },
          },
        ],
        { collision: function () {}, overrideKeys: ['$value'] },
      );
      expect(test.group.foo.$value).to.eql({ fontSize: '14px' });
      expect(test.group.bar.$value).to.eql([{ blur: '4px' }]);
      // groups are still merged
      expect(test.group.qux.$value).to.equal('qux');
    });

    describe('collision detection', () => {
      it('should call the collision function if a collision happens', () => {
        expect(() =>
          deepExtend([{ foo: { bar: 'bar' } }, { foo: { bar: 'baz' } }], {
            collision: function () {
              throw new Error('danger danger. high voltage.');
            },
          }),
        ).to.throw('danger danger. high voltage.');
      });

      it('should not call the collision function if a collision is irrelevant because the values are identical', () => {
        expect(() =>
          deepExtend([{ foo: { bar: 'bar' } }, { foo: { bar: 'bar' } }], {
            collision: function () {
              throw new Error('danger danger. high voltage.');
            },
          }),
        ).to.not.throw();
      });

      it('the collision function should have the proper arguments', () => {
        const test = deepExtend([{ foo: { bar: 'bar' } }, { foo: { bar: 'baz' } }], {
          collision: function (opts) {
            expect(opts).to.have.nested.property('target.bar', 'bar');
            expect(opts).to.have.nested.property('copy.bar', 'baz');
            expect(opts.path[0]).to.equal('foo');
            expect(opts).to.have.property('key', 'bar');
          },
        });
        expect(test).to.have.nested.property('foo.bar', 'baz');
      });

      it('should call the collision function for the value when an object value overrides another', () => {
        const keys = [];
        deepExtend([{ foo: { $value: { a: 1, b: 2 } } }, { foo: { $value: { a: 3 } } }], {
          collision: function (opts) {
            keys.push(opts.key);
          },
          overrideKeys: ['$value'],
        });
        expect(keys).to.eql(['$value']);
      });
    });
  });
});
