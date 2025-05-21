import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { registerSuite } from './register.suite.js';
import { formats } from '../../lib/enums/index.js';

registerSuite({
  config: {
    preprocessor: () => {},
  },
  registerMethod: 'registerPreprocessor',
  prop: 'preprocessors',
});

describe('register/transformGroup', async () => {
  let sdInstance;
  beforeEach(async () => {
    StyleDictionary.hooks.preprocessors = {};
    sdInstance = new StyleDictionary({});
    await sdInstance.hasInitialized;
  });

  it('should support registering preprocessor on StyleDictionary class', () => {
    StyleDictionary.registerPreprocessor({
      name: 'example-preprocessor',
      preprocessor: (dict) => dict,
    });
    expect(StyleDictionary.hooks.preprocessors['example-preprocessor']).to.not.be.undefined;
    expect(sdInstance.hooks.preprocessors['example-preprocessor']).to.not.be.undefined;
  });

  it('should throw if the preprocessor name is not a string', () => {
    expect(() => {
      sdInstance.registerPreprocessor({
        name: true,
        preprocessor: (dict) => dict,
      });
    }).to.throw('Cannot register preprocessor; Preprocessor.name must be a string');
  });

  it('should throw if the preprocessor is not a function', () => {
    expect(() => {
      sdInstance.registerPreprocessor({
        name: 'example-preprocessor',
        preprocessor: 'foo',
      });
    }).to.throw('Cannot register preprocessor; Preprocessor.preprocessor must be a function');
  });

  it('should preprocess the dictionary as specified', async () => {
    StyleDictionary.registerPreprocessor({
      name: 'strip-descriptions',
      preprocessor: (dict) => {
        // recursively traverse token objects and delete description props
        function removeDescription(slice) {
          delete slice.description;
          Object.values(slice).forEach((value) => {
            if (typeof value === 'object') {
              removeDescription(value);
            }
          });
          return slice;
        }
        return removeDescription(dict);
      },
    });

    sdInstance = new StyleDictionary({
      preprocessors: ['strip-descriptions'],
      tokens: {
        foo: {
          value: '4px',
          type: 'dimension',
          description: 'Foo description',
        },
        description: 'My dictionary',
      },
    });
    await sdInstance.hasInitialized;
    expect(sdInstance.tokens).to.eql({
      foo: {
        value: '4px',
        type: 'dimension',
      },
    });
  });

  it('should support async preprocessors', async () => {
    StyleDictionary.registerPreprocessor({
      name: 'strip-descriptions',
      preprocessor: async (dict) => {
        // recursively traverse token objects and delete description props
        async function removeDescription(slice) {
          // Arbitrary delay, act as though this action is asynchronous and takes some time
          await new Promise((resolve) => setTimeout(resolve, 100));
          delete slice.description;

          await Promise.all(
            Object.values(slice).map((value) => {
              if (typeof value === 'object') {
                return removeDescription(value);
              } else {
                return Promise.resolve();
              }
            }),
          );
          return slice;
        }
        return removeDescription(dict);
      },
    });

    sdInstance = new StyleDictionary({
      preprocessors: ['strip-descriptions'],
      tokens: {
        foo: {
          value: '4px',
          type: 'dimension',
          description: 'Foo description',
        },
        description: 'My dictionary',
      },
    });
    await sdInstance.hasInitialized;
    expect(sdInstance.tokens).to.eql({
      foo: {
        value: '4px',
        type: 'dimension',
      },
    });
  });

  it('should pass options to preprocessor function as second argument', async () => {
    let opts;
    StyleDictionary.registerPreprocessor({
      name: 'foo-processor',
      preprocessor: async (dict, options) => {
        opts = options;
        return dict;
      },
    });

    sdInstance = new StyleDictionary({
      preprocessors: ['foo-processor'],
      tokens: {
        foo: {
          $value: '4px',
          $type: 'dimension',
          $description: 'Foo description',
        },
      },
    });
    await sdInstance.hasInitialized;
    expect(opts.usesDtcg).to.be.true;
  });

  it('should pass platform config options to preprocessor function as second argument for platform preprocessors', async () => {
    let opts;
    StyleDictionary.registerPreprocessor({
      name: 'foo-processor',
      preprocessor: async (dict, options) => {
        opts = options;
        return dict;
      },
    });

    sdInstance = new StyleDictionary({
      tokens: {
        foo: {
          $value: '4px',
          $type: 'dimension',
          $description: 'Foo description',
        },
      },
      platforms: {
        css: {
          preprocessors: ['foo-processor'],
          prefix: 'foo',
          files: [
            {
              format: formats.cssVariables,
            },
          ],
        },
      },
    });
    await sdInstance.formatAllPlatforms();
    expect(opts.prefix).to.equal('foo');
  });
});
