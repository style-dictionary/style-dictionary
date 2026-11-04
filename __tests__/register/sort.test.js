import { expect } from 'chai';
import StyleDictionary from '../../lib/StyleDictionary.js';
import { registerSuite } from './register.suite.js';
import { formats, transformGroups } from '../../lib/enums/index.js';

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

    it('should allow overriding the built-in "name" sort like other built-in hooks', () => {
      const sort = {
        name: 'name',
        sort: (a, b) => b.name.localeCompare(a.name),
      };

      StyleDictionaryExtended.registerSort(sort);
      expect(StyleDictionaryExtended.hooks.sorts.name).to.equal(sort.sort);
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

  describe('sort integration with built-in formats', () => {
    const tokens = {
      b: { value: '2', type: 'x' },
      a: { value: '1', type: 'y' },
      c: { value: '3', type: 'x' },
    };

    const byType = (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name);

    /**
     * @param {object} [config]
     * @param {import('../../types/Sort.d.ts').SortOption} [sort]
     */
    const build = async (config = {}, sort) => {
      const sd = new StyleDictionary({
        tokens,
        log: { verbosity: 'silent' },
        ...config,
        platforms: {
          css: {
            transformGroup: transformGroups.css,
            files: [
              {
                destination: 'variables.css',
                format: formats.cssVariables,
                options: sort ? { sort } : {},
              },
            ],
          },
        },
      });
      const [file] = await sd.formatPlatform('css');
      return file.output.match(/--[a-z]+/g);
    };

    it('should apply a sort registered with registerSort when building css/variables', async () => {
      StyleDictionary.registerSort({ name: 'by-type', sort: byType });
      expect(await build({}, 'by-type')).to.eql(['--b', '--c', '--a']);
      delete StyleDictionary.hooks.sorts['by-type'];
    });

    it('should apply a sort defined inline in config hooks.sorts', async () => {
      const reverse = (a, b) => b.name.localeCompare(a.name);
      expect(await build({ hooks: { sorts: { reverse } } }, 'reverse')).to.eql([
        '--c',
        '--b',
        '--a',
      ]);
    });
  });
});
