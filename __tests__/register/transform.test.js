import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { registerSuite } from './register.suite.js';
import transformBuiltins from '../../lib/common/transforms.js';
import { transformTypes } from '../../lib/enums/index.js';

const { value: transformTypeValue, name } = transformTypes;

const transformPxAppender = {
  name: 'px-appender',
  type: transformTypeValue,
  transform: (token) => `${token.value}px`,
};

const transformValueIncrementer = {
  name: 'value-incrementer',
  type: transformTypeValue,
  filter: (token) => typeof token.value === 'number',
  transform: (token) => token.value + 1,
};

registerSuite({
  config: {
    type: transformTypeValue,
    transform: () => {},
  },
  registerMethod: 'registerTransform',
  prop: 'transforms',
});

describe('register', () => {
  beforeEach(() => {
    StyleDictionary.hooks.transforms = transformBuiltins;
  });
  afterEach(() => {
    StyleDictionary.hooks.transforms = transformBuiltins;
  });

  describe('instance vs class registration', () => {
    it('should allow registering on class, affecting all instances', async () => {
      StyleDictionary.registerTransform(transformPxAppender);

      const baseCfg = {
        platforms: {
          test: {
            transforms: ['px-appender'],
          },
        },
      };

      const sd1 = new StyleDictionary({
        ...baseCfg,
        tokens: {
          size1: {
            value: 1,
            type: 'dimension',
          },
        },
      });
      const sd2 = new StyleDictionary({
        ...baseCfg,
        tokens: {
          size2: {
            value: 2,
            type: 'dimension',
          },
        },
      });
      const sd3 = await sd2.extend({
        ...baseCfg,
        tokens: {
          size3: {
            value: 3,
            type: 'dimension',
          },
        },
      });

      const [sd1After, sd2After, sd3After] = await Promise.all(
        [sd1, sd2, sd3].map((sd) => sd.exportPlatform('test')),
      );

      expect(sd1.hooks.transforms['px-appender']).to.not.be.undefined;
      expect(sd2.hooks.transforms['px-appender']).to.not.be.undefined;
      expect(sd3.hooks.transforms['px-appender']).to.not.be.undefined;

      expect(sd1After.size1.value).to.equal('1px');
      expect(sd2After.size2.value).to.equal('2px');
      expect(sd3After.size2.value).to.equal('2px');
      expect(sd3After.size3.value).to.equal('3px');
    });

    it('should allow registering on instance, affecting only that instance', async () => {
      const sd1 = new StyleDictionary();
      const sd2 = new StyleDictionary();
      const sd3 = await sd2.extend();

      sd2.registerTransform(transformPxAppender);

      expect(sd1.hooks.transforms['px-appender']).to.be.undefined;
      expect(sd2.hooks.transforms['px-appender']).to.not.be.undefined;
      expect(sd3.hooks.transforms['px-appender']).to.be.undefined;
    });

    it('should combine class and instance registrations on the instance', async () => {
      StyleDictionary.registerTransform(transformPxAppender);

      const sd1 = new StyleDictionary({
        platforms: {
          test: {
            transforms: ['px-appender'],
          },
        },
        tokens: {
          size1: {
            value: 1,
            type: 'dimension',
          },
        },
      });

      const sd2 = new StyleDictionary({
        platforms: {
          test: {
            transforms: ['value-incrementer', 'px-appender'],
          },
        },
        tokens: {
          size2: {
            value: 2,
            type: 'dimension',
          },
        },
      });
      sd2.registerTransform(transformValueIncrementer);

      const sd3 = await sd2.extend({
        tokens: {
          size3: {
            value: 3,
            type: 'dimension',
          },
        },
      });

      const [sd1After, sd2After, sd3After] = await Promise.all(
        [sd1, sd2, sd3].map((sd) => sd.exportPlatform('test')),
      );

      expect(sd1.hooks.transforms['px-appender']).to.not.be.undefined;
      expect(sd2.hooks.transforms['px-appender']).to.not.be.undefined;
      expect(sd3.hooks.transforms['px-appender']).to.not.be.undefined;
      // should not be registered on sd1, because we registered only on sd2
      expect(sd1.hooks.transforms['value-incrementer']).to.be.undefined;
      expect(sd2.hooks.transforms['value-incrementer']).to.not.be.undefined;
      // should be registered because sd3 extends sd2
      expect(sd3.hooks.transforms['value-incrementer']).to.not.be.undefined;

      expect(sd1After.size1.value).to.equal('1px');
      expect(sd2After.size2.value).to.equal('3px');
      expect(sd3After.size2.value).to.equal('3px');
      expect(sd3After.size3.value).to.equal('4px');
    });
  });

  describe('transform', async () => {
    const StyleDictionaryExtended = new StyleDictionary({});

    it('should error if type is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerTransform({
          type: 3,
        });
      }).to.throw('type must be a string');
    });

    it('should error if type is not a valid type', () => {
      expect(() => {
        StyleDictionaryExtended.registerTransform({
          type: 'foo',
        });
      }).to.throw('foo type is not one of: name, value, attribute');
    });

    it('should error if name is not a string', () => {
      expect(() => {
        StyleDictionaryExtended.registerTransform({
          type: name,
        });
      }).to.throw('name must be a string');
    });

    it('should error if filter is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerTransform({
          type: name,
          name: 'name',
          filter: 'foo',
        });
      }).to.throw('filter must be a function');
    });

    it('should error if transform is not a function', () => {
      expect(() => {
        StyleDictionaryExtended.registerTransform({
          type: name,
          name: 'name',
          filter: function () {
            return true;
          },
          transform: 'foo',
        });
      }).to.throw('transform must be a function');
    });

    it('should work if type, filter, and transform are all proper', () => {
      StyleDictionaryExtended.registerTransform({
        type: name,
        name: 'foo',
        filter: function () {
          return true;
        },
        transform: function () {
          return true;
        },
      });
      expect(typeof StyleDictionaryExtended.hooks.transforms.foo).to.equal('object');
      expect(StyleDictionaryExtended).to.have.nested.property('hooks.transforms.foo.type', name);
      expect(typeof StyleDictionaryExtended.hooks.transforms.foo.filter).to.equal('function');
      expect(typeof StyleDictionaryExtended.hooks.transforms.foo.transform).to.equal('function');
    });

    it('should properly pass the registered transform to instances', async () => {
      const SDE2 = await StyleDictionaryExtended.extend({});
      expect(typeof SDE2.hooks.transforms.foo).to.equal('object');
      expect(SDE2).to.have.nested.property('hooks.transforms.foo.type', name);
      expect(typeof SDE2.hooks.transforms.foo.filter).to.equal('function');
      expect(typeof SDE2.hooks.transforms.foo.transform).to.equal('function');
    });
  });
});
