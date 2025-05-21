import { expect } from 'chai';
import { fileToJSON } from '../__helpers.js';
import resolveObject from '../../lib/utils/resolveObject.js';
import GroupMessages from '../../lib/utils/groupMessages.js';

const PROPERTY_REFERENCE_WARNINGS = GroupMessages.GROUP.PropertyReferenceWarnings;

describe('utils', () => {
  describe('resolveObject', () => {
    beforeEach(() => {
      GroupMessages.clear(PROPERTY_REFERENCE_WARNINGS);
    });
    afterEach(() => {
      GroupMessages.clear(PROPERTY_REFERENCE_WARNINGS);
    });

    it('should error on non-objects', () => {
      expect(resolveObject.bind(null)).to.throw('Please pass an object in');
      expect(resolveObject.bind(null, 'foo')).to.throw('Please pass an object in');
      expect(resolveObject.bind(null, 0)).to.throw('Please pass an object in');
    });

    it('should not mutate the original object', () => {
      const original = fileToJSON('__tests__/__json_files/nested_references.json');
      const test = resolveObject(original);
      expect(original).to.have.nested.property('a.b.d', '{e.f.g}');
      expect(test).to.have.nested.property('a.b.d', 2);
    });

    it('should do simple references', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/simple.json'));
      expect(test).to.have.property('bar', 'bar');
    });

    it('should do simple interpolation for both strings and numbers', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/interpolation.json'));
      expect(test).to.have.property('c', 'test1 value text after');
      expect(test).to.have.property('d', 'text before test1 value');
      expect(test).to.have.property('e', 'text before test1 value text after');
      expect(test).to.have.property('f', '123 text after');
      expect(test).to.have.property('g', 'text before 123');
      expect(test).to.have.property('h', 'text before 123 text after');
    });

    it('should do nested references', () => {
      const obj = fileToJSON('__tests__/__json_files/nested_references.json');
      const test = resolveObject(obj);
      expect(test).to.have.property('i', 2);
      expect(test).to.have.nested.property('a.b.d', 2);
      expect(test).to.have.nested.property('e.f.h', 1);
    });

    it('should handle nested pointers', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/nested_pointers.json'));
      expect(test).to.have.property('b', 1);
      expect(test).to.have.property('c', 1);
    });

    it('should handle deep nested pointers', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/nested_pointers_2.json'));
      expect(test).to.have.property('a', 1);
      expect(test).to.have.property('b', 1);
      expect(test).to.have.property('c', 1);
      expect(test).to.have.property('d', 1);
      expect(test).to.have.property('e', 1);
      expect(test).to.have.property('f', 1);
      expect(test).to.have.property('g', 1);
    });

    it('should handle deep nested pointers with string interpolation', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/nested_pointers_3.json'));
      expect(test).to.have.property('a', 'foo bon bee bae boo bla baz bar');
      expect(test).to.have.property('b', 'foo bon bee bae boo bla baz');
      expect(test).to.have.property('c', 'foo bon bee bae boo bla');
      expect(test).to.have.property('d', 'foo bon bee bae boo');
      expect(test).to.have.property('e', 'foo bon bee bae');
      expect(test).to.have.property('f', 'foo bon bee');
      expect(test).to.have.property('g', 'foo bon');
    });

    it('should handle deep nested pointers and nested references', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/nested_pointers_4.json'));
      expect(test).to.have.nested.property('a.a.a', 1);
      expect(test).to.have.nested.property('b.b.b', 1);
      expect(test).to.have.nested.property('c.c.c', 1);
      expect(test).to.have.nested.property('d.d.d', 1);
      expect(test).to.have.nested.property('e.e.e', 1);
      expect(test).to.have.nested.property('f.f.f', 1);
      expect(test).to.have.nested.property('g.g.g', 1);
    });

    it('should keep the type of the referenced property', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/reference_type.json'));
      expect(test).to.have.property('d', 1);
      expect(typeof test.d).to.equal('number');
      expect(typeof test.e).to.equal('object');
      expect(Array.isArray(test.f)).to.be.true;
      expect(test).to.have.nested.property('e.c', 2);
    });

    it('should handle and evaluate items in an array', () => {
      const test = resolveObject(fileToJSON('__tests__/__json_files/array.json'));
      expect(test.d[0]).to.equal(2);
      expect(test.d[1]).to.equal(1);
      expect(test.e[0].a).to.equal(1);
      expect(test.e[1].a).to.equal(2);
    });

    it("should throw if pointers don't exist", () => {
      expect(resolveObject.bind(fileToJSON('__tests__/__json_files/non_existent.json'))).to.throw();
    });

    it('should gracefully handle basic circular references', () => {
      resolveObject(fileToJSON('__tests__/__json_files/circular.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(1);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify(['Circular definition cycle:  a, b, c, d, a']),
      );
    });

    it('should gracefully handle basic and nested circular references', () => {
      resolveObject(fileToJSON('__tests__/__json_files/circular_2.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(1);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify(['Circular definition cycle:  a.b.c, j, a.b.c']),
      );
    });

    it('should gracefully handle nested circular references', () => {
      resolveObject(fileToJSON('__tests__/__json_files/circular_3.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(1);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify(['Circular definition cycle:  a.b, c.d.e, a.b']),
      );
    });

    it('should gracefully handle multiple nested circular references', () => {
      resolveObject(fileToJSON('__tests__/__json_files/circular_4.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(1);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify(['Circular definition cycle:  a.b.c.d, e.f.g, h.i, a.b.c.d']),
      );
    });

    it('should gracefully handle down-chain circular references', () => {
      resolveObject(fileToJSON('__tests__/__json_files/circular_5.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(1);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify(['Circular definition cycle:  l, m, l']),
      );
    });

    it('should correctly replace multiple references without reference errors', function () {
      const obj = resolveObject(fileToJSON('__tests__/__json_files/not_circular.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(0);
      expect(JSON.stringify(obj)).to.equal(
        JSON.stringify({
          prop0: { value: 0 },
          prop01: { value: '' },
          prop1: { value: 'test1 value' },
          prop2: { value: 'test2 value' },
          prop3: { value: 'test1 value' },
          prop4: { value: 'test1 value' },
          prop5: { value: 5 },
          prop6: { value: 6 },
          prop7: { value: 5 },
          prop8: { value: 5 },
          prop12: { value: 'test1 value, test2 value and some extra stuff' },
          prop124: { value: 'test1 value, test2 value and test1 value' },
          prop15: { value: 'test1 value, 5 and some extra stuff' },
          prop156: { value: 'test1 value, 5 and 6' },
          prop1568: { value: 'test1 value, 5, 6 and 5' },
        }),
      );
    });

    describe('ignorePaths', () => {
      it('should not resolve values containing variables in ignored paths', () => {
        const test = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
            },
          },
          { ignorePaths: ['foo.value'] },
        );

        expect(test).to.have.nested.property('bar.value', '{foo}');
      });
    });

    describe('ignoreKeys', () => {
      it('should handle default value of original', () => {
        const test = resolveObject({
          foo: { value: 'bar' },
          bar: {
            value: '{foo}',
            original: '{foo}',
          },
        });
        expect(test).to.have.nested.property('bar.original', '{foo}');
      });

      it('should handle any nested keys under the ignoreKey', () => {
        const test = resolveObject({
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
        });
        expect(test).to.have.nested.property('bar.original.value', '{foo}');
        expect(test).to.have.nested.property('bar.original.foo.bar', '{foo}');
      });

      it('should handle passing in custom ignoreKeys', () => {
        const test = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              baz: '{foo}',
            },
          },
          {
            ignoreKeys: ['baz'],
          },
        );
        expect(test).to.have.nested.property('bar.baz', '{foo}');
      });

      it('should handle multiple keys', () => {
        const test = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
              baz: '{foo}',
            },
          },
          {
            ignoreKeys: ['baz', 'original'],
          },
        );
        expect(test).to.have.nested.property('bar.original', '{foo}');
        expect(test).to.have.nested.property('bar.baz', '{foo}');
      });

      it('should not ignore anything if set to null or empty array', () => {
        const test = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
            },
          },
          {
            ignoreKeys: [],
          },
        );
        expect(test).to.have.nested.property('bar.original', 'bar');

        const test2 = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
            },
          },
          {
            ignoreKeys: null,
          },
        );
        expect(test2).to.have.nested.property('bar.original', 'bar');

        const test3 = resolveObject(
          {
            foo: { value: 'bar' },
            bar: {
              value: '{foo}',
              original: '{foo}',
            },
          },
          {
            ignoreKeys: undefined,
          },
        );
        expect(test3).to.have.nested.property('bar.original', 'bar');
      });
    });

    it('should handle spaces', () => {
      const test = resolveObject({
        foo: { value: 'bar' },
        bar: { value: '{ foo.value }' },
      });
      expect(test).to.have.nested.property('foo.value', test.bar.value);
    });

    it('should collect multiple reference errors', () => {
      resolveObject(fileToJSON('__tests__/__json_files/multiple_reference_errors.json'));
      expect(GroupMessages.count(PROPERTY_REFERENCE_WARNINGS)).to.equal(3);
      expect(JSON.stringify(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS))).to.equal(
        JSON.stringify([
          'a.b tries to reference b.a, which is not defined.',
          'a.c tries to reference b.c, which is not defined.',
          'a.d tries to reference d, which is not defined.',
        ]),
      );
    });

    it('should handle 0', () => {
      const test = resolveObject({
        test: { value: '{zero}' },
        zero: { value: 0 },
      });
      expect(GroupMessages.fetchMessages(PROPERTY_REFERENCE_WARNINGS).length).to.equal(0);
      expect(test.test.value).to.equal(0);
    });

    it('should support DTCG format', () => {
      const test = resolveObject(
        {
          test: { $value: '{zero.$value}' },
          zero: { $value: 0 },
          test2: { $value: '{one}' },
          one: { $value: 1 },
        },
        { usesDtcg: true },
      );
      expect(test.test.$value).to.equal(0);
      expect(test.test2.$value).to.equal(1);
    });
  });
});
