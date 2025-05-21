import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { registerSuite } from './register.suite.js';

registerSuite({
  config: {
    filter: () => {},
  },
  registerMethod: 'registerFilter',
  prop: 'filters',
});

describe('register', () => {
  describe('filter', async () => {
    const StyleDictionaryExtended = new StyleDictionary({});

    it('should error if name is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerFilter({
          filter: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 1,
          filter: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: [],
          filter: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: {},
          filter: function () {},
        });
      }).to.throw('name must be a string');
    });

    it('should error if filter is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 'test',
        });
      }).to.throw('filter must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 'test',
          filter: 1,
        });
      }).to.throw('filter must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 'test',
          filter: 'name',
        });
      }).to.throw('filter must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 'test',
          filter: [],
        });
      }).to.throw('filter must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFilter({
          name: 'test',
          filter: {},
        });
      }).to.throw('filter must be a function');
    });

    it('should work if name and filter are good', () => {
      StyleDictionaryExtended.registerFilter({
        name: 'scss',
        filter: function () {},
      });
      expect(typeof StyleDictionaryExtended.hooks.filters['scss']).to.equal('function');
    });

    it('should properly pass the registered filter to instances', async () => {
      const SDE2 = await StyleDictionaryExtended.extend({});
      expect(typeof SDE2.hooks.filters['scss']).to.equal('function');
    });
  });
});
