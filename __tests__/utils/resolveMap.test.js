import { expect } from 'chai';
import { resolveMap } from '../../lib/utils/resolveMap.js';
import GroupMessages from '../../lib/utils/groupMessages.js';
import { convertTokenData } from '../../lib/utils/convertTokenData.js';

const PROPERTY_REFERENCE_WARNINGS = GroupMessages.GROUP.PropertyReferenceWarnings;

describe('utils', () => {
  describe('resolveMap', () => {
    beforeEach(() => {
      GroupMessages.clear(PROPERTY_REFERENCE_WARNINGS);
    });
    afterEach(() => {
      GroupMessages.clear(PROPERTY_REFERENCE_WARNINGS);
    });

    it('should mutate the original object, handle nested references', () => {
      const nestedRefs = {
        a: {
          b: {
            c: { value: 1 },
            d: { value: '{e.f.g}' },
          },
        },
        e: {
          f: {
            g: { value: 2 },
            h: { value: '{a.b.c}' },
          },
        },
        i: { value: '{e.f.g}' },
      };

      const tokenMap = convertTokenData(nestedRefs, {
        output: 'map',
      });

      expect(tokenMap.get('{a.b.d}').value).to.equal('{e.f.g}');
      resolveMap(tokenMap);
      expect(tokenMap.get('{a.b.d}').value).to.equal(2);
    });

    it('should do simple interpolation for both strings and numbers', () => {
      const test = convertTokenData(
        {
          a: { value: 'test1 value' },
          b: { value: 123 },
          c: { value: '{a} text after' },
          d: { value: 'text before {a}' },
          e: { value: 'text before {a} text after' },
          f: { value: '{b} text after' },
          g: { value: 'text before {b}' },
          h: { value: 'text before {b} text after' },
          i: { value: '{b}' },
        },
        { output: 'map' },
      );
      resolveMap(test);
      expect(test.get('{c}').value).to.equal('test1 value text after');
      expect(test.get('{d}').value).to.equal('text before test1 value');
      expect(test.get('{e}').value).to.equal('text before test1 value text after');
      expect(test.get('{f}').value).to.equal('123 text after');
      expect(test.get('{g}').value).to.equal('text before 123');
      expect(test.get('{h}').value).to.equal('text before 123 text after');
      expect(test.get('{i}').value).to.equal(123);
    });

    it('should handle deep nested references', () => {
      const testData = convertTokenData(
        {
          a: { value: '{b}' },
          b: { value: '{c}' },
          c: { value: '{d}' },
          d: { value: '{e}' },
          e: { value: '{f}' },
          f: { value: '{g}' },
          g: { value: 1 },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(testData.get('{a}').value).equal(1);
      expect(testData.get('{b}').value).equal(1);
      expect(testData.get('{c}').value).equal(1);
      expect(testData.get('{d}').value).equal(1);
      expect(testData.get('{e}').value).equal(1);
      expect(testData.get('{f}').value).equal(1);
      expect(testData.get('{g}').value).equal(1);
    });

    it('should handle deep nested pointers with string interpolation', () => {
      const testData = convertTokenData(
        {
          a: { value: '{b} bar' },
          b: { value: '{c} baz' },
          c: { value: '{d} bla' },
          d: { value: '{e} boo' },
          e: { value: '{f} bae' },
          f: { value: '{g} bee' },
          g: { value: 'foo bon' },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(testData.get('{a}').value).equal('foo bon bee bae boo bla baz bar');
      expect(testData.get('{b}').value).equal('foo bon bee bae boo bla baz');
      expect(testData.get('{c}').value).equal('foo bon bee bae boo bla');
      expect(testData.get('{d}').value).equal('foo bon bee bae boo');
      expect(testData.get('{e}').value).equal('foo bon bee bae');
      expect(testData.get('{f}').value).equal('foo bon bee');
      expect(testData.get('{g}').value).equal('foo bon');
    });

    it('should handle deep nested pointers and nested references', () => {
      const testData = convertTokenData(
        {
          a: {
            a: {
              a: { value: '{b.b.b}' },
            },
          },
          b: {
            b: {
              b: { value: '{c.c.c}' },
            },
          },
          c: {
            c: {
              c: { value: '{d.d.d}' },
            },
          },
          d: {
            d: {
              d: { value: '{e.e.e}' },
            },
          },
          e: {
            e: {
              e: { value: '{f.f.f}' },
            },
          },
          f: {
            f: {
              f: { value: '{g.g.g}' },
            },
          },
          g: {
            g: {
              g: { value: 1 },
            },
          },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(testData.get('{a.a.a}').value).equal(1);
      expect(testData.get('{b.b.b}').value).equal(1);
      expect(testData.get('{c.c.c}').value).equal(1);
      expect(testData.get('{d.d.d}').value).equal(1);
      expect(testData.get('{e.e.e}').value).equal(1);
      expect(testData.get('{f.f.f}').value).equal(1);
      expect(testData.get('{g.g.g}').value).equal(1);
    });

    it('should keep the type of the referenced property', () => {
      const testData = convertTokenData(
        {
          a: { value: '{b}' },
          b: { value: 1 },
          c: { value: '{d}' },
          d: { value: [1, 2, 3] },
          e: { value: '{f}' },
          f: { value: { foo: 'bar' } },
          g: { value: { foo: '{h}' } },
          h: { value: { qux: ['baz'] } },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(testData.get('{a}').value).equal(1);
      expect(testData.get('{c}').value).eql([1, 2, 3]);
      expect(testData.get('{e}').value).eql({ foo: 'bar' });
      expect(testData.get('{g}').value).eql({ foo: { qux: ['baz'] } });
    });

    it('should handle and evaluate items in an array', () => {
      const testData = convertTokenData(
        {
          a: { value: 1 },
          b: {
            c: { value: 2 },
          },
          d: { value: ['{b.c}', '{a}'] },
          e: {
            value: [
              {
                a: '{a}',
              },
              {
                a: '{b.c}',
              },
            ],
          },
        },
        { output: 'map' },
      );
      resolveMap(testData);

      expect(testData.get('{d}').value[0]).to.equal(2);
      expect(testData.get('{d}').value[1]).to.equal(1);
      expect(testData.get('{e}').value[0].a).to.equal(1);
      expect(testData.get('{e}').value[1].a).to.equal(2);
    });

    it("should throw if pointers don't exist", () => {
      const testData = convertTokenData(
        {
          foo: { value: '{bar}' },
          baz: { value: 'boo' },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData, { warnImmediately: true })).to.throw(
        `{foo} tries to reference {bar}, which is not defined.`,
      );
      const testData2 = convertTokenData(
        {
          a: {
            b: {
              c: { value: '1' },
            },
          },
          error: { value: '{a.b.d}' },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData2, { warnImmediately: true })).to.throw(
        `{error} tries to reference {a.b.d}, which is not defined.`,
      );
    });

    it('should gracefully handle basic circular references', () => {
      const testData = convertTokenData(
        {
          a: { value: '{b}' },
          b: { value: '{c}' },
          c: { value: '{d}' },
          d: { value: '{a}' },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData, { warnImmediately: true })).to.throw(
        `Circular definition cycle for {a} => {a}, {b}, {c}, {d}, {a}`,
      );
    });

    it('should gracefully handle nested circular references', () => {
      const testData = convertTokenData(
        {
          a: {
            b: {
              c: { value: '{j}' },
            },
          },
          j: { value: '{a.b.c}' },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData, { warnImmediately: true })).to.throw(
        `Circular definition cycle for {a.b.c} => {a.b.c}, {j}, {a.b.c}`,
      );
      const testData2 = convertTokenData(
        {
          a: {
            b: { value: '{c.d.e}' },
          },
          c: {
            d: {
              e: { value: '{a.b}' },
            },
          },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData2, { warnImmediately: true })).to.throw(
        `Circular definition cycle for {a.b} => {a.b}, {c.d.e}, {a.b}`,
      );
    });

    it('should gracefully handle multiple nested circular references', () => {
      const testData = convertTokenData(
        {
          a: {
            b: {
              c: {
                d: { value: '{e.f.g}' },
              },
            },
          },
          e: {
            f: {
              g: { value: '{h.i}' },
            },
          },
          h: {
            i: { value: '{a.b.c.d}' },
          },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData, { warnImmediately: true })).to.throw(
        `Circular definition cycle for {a.b.c.d} => {a.b.c.d}, {e.f.g}, {h.i}, {a.b.c.d}`,
      );
    });

    it('should gracefully handle down-chain circular references', () => {
      const testData = convertTokenData(
        {
          k: { value: '{l}' },
          l: { value: '{m}' },
          m: { value: '{l}' },
          n: { value: '{k}' },
        },
        { output: 'map' },
      );
      expect(() => resolveMap(testData, { warnImmediately: true })).to.throw(
        `Circular definition cycle for {k} => {l}, {m}, {l}`,
      );
    });

    it('should correctly replace multiple references without reference errors', function () {
      const testData = convertTokenData(
        {
          prop0: { value: 0 },
          prop01: { value: '' },
          prop1: { value: 'test1 value' },
          prop2: { value: 'test2 value' },
          prop3: { value: '{prop1}' },
          prop4: { value: '{prop3}' },
          prop5: { value: 5 },
          prop6: { value: 6 },
          prop7: { value: '{prop5}' },
          prop8: { value: '{prop7}' },
          prop12: { value: '{prop1}, {prop2} and some extra stuff' },
          prop124: { value: '{prop1}, {prop2} and {prop4}' },
          prop15: { value: '{prop1}, {prop5} and some extra stuff' },
          prop156: { value: '{prop1}, {prop5} and {prop6}' },
          prop1568: { value: '{prop1}, {prop5}, {prop6} and {prop8}' },
        },
        { output: 'map' },
      );
      resolveMap(testData);

      const resolvedObj = convertTokenData(testData, { output: 'object' });
      expect(resolvedObj).to.eql({
        prop0: { value: 0, key: '{prop0}' },
        prop01: { value: '', key: '{prop01}' },
        prop1: { value: 'test1 value', key: '{prop1}' },
        prop2: { value: 'test2 value', key: '{prop2}' },
        prop3: { value: 'test1 value', key: '{prop3}' },
        prop4: { value: 'test1 value', key: '{prop4}' },
        prop5: { value: 5, key: '{prop5}' },
        prop6: { value: 6, key: '{prop6}' },
        prop7: { value: 5, key: '{prop7}' },
        prop8: { value: 5, key: '{prop8}' },
        prop12: {
          value: 'test1 value, test2 value and some extra stuff',
          key: '{prop12}',
        },
        prop124: { value: 'test1 value, test2 value and test1 value', key: '{prop124}' },
        prop15: { value: 'test1 value, 5 and some extra stuff', key: '{prop15}' },
        prop156: { value: 'test1 value, 5 and 6', key: '{prop156}' },
        prop1568: { value: 'test1 value, 5, 6 and 5', key: '{prop1568}' },
      });
    });

    describe('ignorePaths', () => {
      it('should not resolve values containing variables in ignored paths', () => {
        const testData = convertTokenData(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
            },
          },
          { output: 'map' },
        );
        resolveMap(testData, { ignorePaths: new Set(['{foo}']) });
        expect(testData.get('{bar}').value).to.equal('{foo}');

        const testData2 = convertTokenData(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
            },
          },
          { output: 'map' },
        );
        resolveMap(testData2, { ignorePaths: new Set(['{foo}']) });
        expect(testData2.get('{bar}').value).to.equal('{foo}');
      });
    });

    describe('ignoreKeys', () => {
      it('should handle default value of original', () => {
        const testData = convertTokenData(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
              description: '{foo}',
            },
          },
          { output: 'map' },
        );
        resolveMap(testData);
        expect(testData.get('{bar}')).to.eql({
          description: 'bar',
          value: 'bar',
          original: '{foo}',
          key: '{bar}',
        });
      });

      it('should handle any nested keys under the ignoreKey', () => {
        const testData = convertTokenData(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: {
                value: '{foo}',
                foo: {
                  bar: '{foo}',
                },
              },
            },
          },
          { output: 'map' },
        );
        resolveMap(testData);
        expect(testData.get('{bar}')).to.eql({
          value: 'bar',
          key: '{bar}',
          original: {
            value: '{foo}',
            foo: {
              bar: '{foo}',
            },
          },
        });
      });

      it('should handle passing in custom ignoreKeys, which adds to defaults', () => {
        const testData = convertTokenData(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
              description: '{foo}',
            },
          },
          { output: 'map' },
        );
        // original and key also still get ignored, from the defaults
        resolveMap(testData, { ignoreKeys: new Set(['description']) });
        expect(testData.get('{bar}')).to.eql({
          description: '{foo}',
          value: 'bar',
          original: '{foo}',
          key: '{bar}',
        });
      });
    });

    it('should handle spaces', () => {
      const testData = convertTokenData(
        {
          foo: { value: 'bar' },
          bar: { value: '{ foo }' },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(testData.get('{bar}').value).to.eql('bar');
    });

    it('should collect multiple reference errors', () => {
      const testData = convertTokenData(
        {
          a: {
            b: { value: '{b.a}' },
            c: { value: '{b.c}' },
            d: { value: '{d}' },
          },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(3);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify([
          '{a.b} tries to reference {b.a}, which is not defined.',
          '{a.c} tries to reference {b.c}, which is not defined.',
          '{a.d} tries to reference {d}, which is not defined.',
        ]),
      );
    });

    it('should handle 0', () => {
      const testData = convertTokenData(
        {
          test: { value: '{zero}' },
          zero: { value: 0 },
        },
        { output: 'map' },
      );
      resolveMap(testData);
      expect(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS).length).to.equal(0);
      expect(testData.get('{test}').value).to.equal(0);
    });

    it('should support DTCG format', () => {
      const usesDtcg = true;
      const testData = convertTokenData(
        {
          test: { $value: '{zero}' },
          zero: { $value: 0 },
          test2: { $value: '{one}' },
          one: { $value: 1 },
        },
        { output: 'map', usesDtcg },
      );
      resolveMap(testData, { usesDtcg });

      expect(testData.get('{test}').$value).to.equal(0);
      expect(testData.get('{test2}').$value).to.equal(1);
    });
  });
});
