import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { registerSuite } from './register.suite.js';

registerSuite({
  config: {
    do: () => {},
    undo: () => {},
  },
  registerMethod: 'registerAction',
  prop: 'actions',
});

describe('register', () => {
  describe('action', async () => {
    const StyleDictionaryExtended = new StyleDictionary({});

    it('should error if name is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerAction({
          do: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 1,
          do: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: [],
          do: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: {},
          do: function () {},
        });
      }).to.throw('name must be a string');
    });

    it('should error if do is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 'test',
        });
      }).to.throw('do must be a function');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 'test',
          do: 1,
        });
      }).to.throw('do must be a function');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 'test',
          do: 'name',
        });
      }).to.throw('do must be a function');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 'test',
          do: [],
        });
      }).to.throw('do must be a function');

      expect(() => {
        StyleDictionaryExtended.registerAction({
          name: 'test',
          do: {},
        });
      }).to.throw('do must be a function');
    });

    it('should work if name and do are good', () => {
      StyleDictionaryExtended.registerAction({
        name: 'scss',
        do: function () {},
      });
      expect(typeof StyleDictionaryExtended.hooks.actions['scss'].do).to.equal('function');
    });

    it('should handle an undo function', () => {
      StyleDictionaryExtended.registerAction({
        name: 'scss',
        do: function () {},
        undo: function () {},
      });
      expect(typeof StyleDictionaryExtended.hooks.actions['scss'].undo).to.equal('function');
    });

    it('should properly pass the registered format to instances', async () => {
      const SDE2 = await StyleDictionaryExtended.extend({});
      expect(typeof SDE2.hooks.actions['scss'].do).to.equal('function');
    });
  });
});
