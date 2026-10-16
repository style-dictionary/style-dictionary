import { expect } from 'chai';
import StyleDictionary from '../../lib/StyleDictionary.js';
import { registerSuite } from './register.suite.js';

const configFoo = {
  name: 'foo',
  sort: (a, b) => a.name.localeCompare(b.name),
};

registerSuite({
  config: configFoo,
  registerMethod: 'registerSort',
  prop: 'sorts',
});

describe('register', () => {
  describe('sort', () => {
    const StyleDictionaryExtended = new StyleDictionary({});

    it('should error if name is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerSort({
          sort: function () {},
        });
      }).to.throw("Can't register sort; sorts.name must be a string");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 1,
          sort: function () {},
        });
      }).to.throw("Can't register sort; sorts.name must be a string");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: [],
          sort: function () {},
        });
      }).to.throw("Can't register sort; sorts.name must be a string");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: {},
          sort: function () {},
        });
      }).to.throw("Can't register sort; sorts.name must be a string");
    });

    it('should error if sort is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'test',
        });
      }).to.throw("Can't register sort; sorts.sort must be a function");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'test',
          sort: 1,
        });
      }).to.throw("Can't register sort; sorts.sort must be a function");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'test',
          sort: 'name',
        });
      }).to.throw("Can't register sort; sorts.sort must be a function");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'test',
          sort: [],
        });
      }).to.throw("Can't register sort; sorts.sort must be a function");

      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'test',
          sort: {},
        });
      }).to.throw("Can't register sort; sorts.sort must be a function");
    });

    it('should register a sort and make it available', () => {
      const sort = {
        name: 'test-sort',
        sort: (a, b) => a.name.localeCompare(b.name),
      };

      StyleDictionaryExtended.registerSort(sort);

      expect(StyleDictionaryExtended.hooks.sorts['test-sort']).to.equal(sort.sort);
    });

    it('should properly pass the registered sorter to instances', async () => {
      const sort = {
        name: 'test-sort-extend',
        sort: (a, b) => a.name.localeCompare(b.name),
      };

      StyleDictionaryExtended.registerSort(sort);
      const SDE2 = await StyleDictionaryExtended.extend({});
      expect(SDE2.hooks.sorts['test-sort-extend']).to.equal(sort.sort);
    });

    it('should error when trying to register a sort with a reserved built-in name', () => {
      expect(() => {
        StyleDictionaryExtended.registerSort({
          name: 'name',
          sort: (a, b) => a.name.localeCompare(b.name),
        });
      }).to.throw('Can\'t register sort; "name" is a reserved built-in sort name');
    });

    it('should allow overwriting an already registered sort', () => {
      const sort1 = {
        name: 'test-overwrite',
        sort: (a, b) => a.name.localeCompare(b.name),
      };

      const sort2 = {
        name: 'test-overwrite',
        sort: (a, b) => b.name.localeCompare(a.name), // reversed
      };

      StyleDictionaryExtended.registerSort(sort1);
      expect(StyleDictionaryExtended.hooks.sorts['test-overwrite']).to.equal(sort1.sort);

      // Overwrite with new sorter
      StyleDictionaryExtended.registerSort(sort2);
      expect(StyleDictionaryExtended.hooks.sorts['test-overwrite']).to.equal(sort2.sort);
      expect(StyleDictionaryExtended.hooks.sorts['test-overwrite']).to.not.equal(sort1.sort);
    });
  });
});
