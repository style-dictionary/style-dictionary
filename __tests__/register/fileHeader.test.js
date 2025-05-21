import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { registerSuite } from './register.suite.js';

registerSuite({
  config: {
    fileHeader: () => {},
  },
  registerMethod: 'registerFileHeader',
  prop: 'fileHeaders',
});

describe('register', () => {
  describe('fileHeader', async () => {
    const StyleDictionaryExtended = new StyleDictionary({});

    it('should error if name is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          fileHeader: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 1,
          fileHeader: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: [],
          fileHeader: function () {},
        });
      }).to.throw('name must be a string');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: {},
          fileHeader: function () {},
        });
      }).to.throw('name must be a string');
    });

    it('should error if fileHeader is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 'myCustomHeader',
        });
      }).to.throw('fileHeader must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 'myCustomHeader',
          fileHeader: 1,
        });
      }).to.throw('fileHeader must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 'myCustomHeader',
          fileHeader: 'name',
        });
      }).to.throw('fileHeader must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 'myCustomHeader',
          fileHeader: [],
        });
      }).to.throw('fileHeader must be a function');

      expect(() => {
        StyleDictionaryExtended.registerFileHeader({
          name: 'myCustomHeader',
          fileHeader: {},
        });
      }).to.throw('fileHeader must be a function');
    });

    it('should work if name and fileHeader are good', () => {
      StyleDictionaryExtended.registerFileHeader({
        name: 'myCustomHeader',
        fileHeader: function () {},
      });
      expect(typeof StyleDictionaryExtended.hooks.fileHeaders['myCustomHeader']).to.equal(
        'function',
      );
    });

    it('should properly pass the registered fileHeader to instances', async () => {
      const SDE2 = await StyleDictionaryExtended.extend({});
      expect(typeof SDE2.hooks.fileHeaders['myCustomHeader']).to.equal('function');
    });
  });
});
