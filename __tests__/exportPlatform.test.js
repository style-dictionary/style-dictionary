import { expect } from 'chai';
import { stubMethod, restore } from 'hanbi';
import StyleDictionary from 'style-dictionary';
import { usesReferences } from 'style-dictionary/utils';
import { fileToJSON, cleanConsoleOutput } from './__helpers.js';
import {
  logWarningLevels,
  logVerbosityLevels,
  transforms,
  transformGroups,
  transformTypes,
} from '../lib/enums/index.js';

const config = fileToJSON('__tests__/__configs/test.json');
const { default: defaultVerbosity, silent, verbose } = logVerbosityLevels;
const { error: errorLog, disabled } = logWarningLevels;
const { css, web } = transformGroups;
const {
  colorCss,
  nameKebab,
  typographyCssShorthand,
  borderCssShorthand,
  shadowCssShorthand,
  cubicBezierCss,
  transitionCssShorthand,
} = transforms;
const { value: transformTypeValue } = transformTypes;

describe('exportPlatform', () => {
  let styleDictionary;
  beforeEach(async () => {
    restore();
    styleDictionary = new StyleDictionary(config);
    await styleDictionary.hasInitialized;
  });

  it('should throw if not given a platform', async () => {
    await expect(styleDictionary.exportPlatform()).to.eventually.be.rejectedWith(
      'Please supply a valid platform',
    );
  });

  it('should throw if not given a proper platform', async () => {
    await expect(styleDictionary.exportPlatform('foo')).to.eventually.be.rejectedWith(
      'Please supply a valid platform',
    );
  });

  it('should not throw if given a proper platform', async () => {
    await expect(styleDictionary.exportPlatform('web')).to.eventually.be.fulfilled;
  });

  it('should return an object', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    expect(typeof dictionary).to.equal('object');
  });

  it('should have the same structure as the original tokens', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    expect(Object.keys(dictionary)).to.eql(Object.keys(styleDictionary.tokens));
  });

  it('should have resolved references', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    expect(dictionary.color.font.link.value).to.eql(dictionary.color.base.blue['100'].value);
  });

  it('should have applied transforms', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    expect(dictionary.size.padding.base.value.endsWith('px')).to.be.true;
  });

  describe('transitive transforms', () => {
    it('should have applied transforms for props with refs in it', async () => {
      const StyleDictionaryExtended = await styleDictionary.extend({
        platforms: {
          test: {
            transforms: [colorCss, 'color/darken'],
          },
        },
      });
      await StyleDictionaryExtended.hasInitialized;
      StyleDictionary.registerTransform({
        type: transformTypeValue,
        name: 'color/darken',
        transitive: true,
        filter: function (prop) {
          return !!prop.original.transformColor;
        },
        transform: function (prop) {
          return prop.value + '-darker';
        },
      });
      const dictionary = await StyleDictionaryExtended.exportPlatform('test');
      expect(dictionary.color.button.active.value).to.equal('#0077cc-darker');
      expect(dictionary.color.button.hover.value).to.equal('#0077cc-darker-darker');
    });

    it('should have transitive transforms applied without .value in references', async () => {
      const sd = new StyleDictionary({
        tokens: {
          one: { value: 'foo' },
          two: { value: '{one}' },
          three: { value: '{two}' },
          four: { value: '{one}' },
          five: { value: '{four}' },
          six: { value: '{one}' },
          seven: { value: '{six}' },
          eight: { value: '{one}' },
          nine: { value: '{eight}' },
        },
        hooks: {
          transforms: {
            transitive: {
              type: transformTypeValue,
              transitive: true,
              transform: (token) => `${token.value}-bar`,
            },
          },
        },
        platforms: {
          test: {
            transforms: ['transitive'],
          },
        },
      });
      const dictionary = await sd.exportPlatform('test');
      expect(dictionary.one.value).to.equal('foo-bar');
      expect(dictionary.two.value).to.equal('foo-bar-bar');
      expect(dictionary.three.value).to.equal('foo-bar-bar-bar');
      expect(dictionary.four.value).to.equal('foo-bar-bar');
      expect(dictionary.five.value).to.equal('foo-bar-bar-bar');
      expect(dictionary.six.value).to.equal('foo-bar-bar');
      expect(dictionary.seven.value).to.equal('foo-bar-bar-bar');
      expect(dictionary.eight.value).to.equal('foo-bar-bar');
      expect(dictionary.nine.value).to.equal('foo-bar-bar-bar');
    });

    it('should apply transitive transforms with references nested beyond "value" prop, so transforms can consume the resolved value', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        tokens: {
          a: {
            value: 0.5,
          },
          b: {
            value: '#fff',
            type: 'color',
            $extensions: {
              'bar.foo': {
                darken: '{a}',
              },
            },
          },
        },
        platforms: {
          test: {
            transforms: ['color/darken'],
          },
        },
      });
      StyleDictionaryExtended.registerTransform({
        type: transformTypeValue,
        name: 'color/darken',
        transitive: true,
        filter: (token) => token.type === 'color',
        transform: (token) => {
          const darkenMod = token?.$extensions?.['bar.foo']?.darken;
          if (usesReferences(darkenMod)) {
            // defer this transform, because our darken value is a ref
            return undefined;
          }
          if (typeof darkenMod === 'number') {
            // don't actually darken, just return darken value for this test
            return '#000';
          }
          return token.value;
        },
      });
      const dictionary = await StyleDictionaryExtended.exportPlatform('test');
      expect(dictionary.b.value).to.equal('#000');
    });
  });

  it('should not have mutated the original tokens', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    expect(dictionary.color.font.link.value).to.not.equal(
      styleDictionary.tokens.color.font.link.value,
    );
    expect(styleDictionary.tokens.size.padding.base.value.endsWith('px')).to.be.false;
  });
  // Make sure when we perform transforms and resolve references
  // we don't mutate the original object added to the property.
  it('tokens should have original value untouched', async () => {
    const dictionary = await styleDictionary.exportPlatform('web');
    const tokens = fileToJSON('__tests__/__tokens/colors.json');
    expect(dictionary.color.font.link.original.value).to.equal(tokens.color.font.link.value);
  });

  it('should not mutate original value if value is an object', async () => {
    const sd = new StyleDictionary({
      tokens: {
        color: {
          red: {
            value: {
              h: '{hue.red}',
              s: 50,
              l: 50,
            },
          },
        },
        hue: {
          red: { value: 20 },
        },
      },
      platforms: {
        web: {
          transformGroup: web,
        },
      },
    });
    const dictionary = await sd.exportPlatform('web');
    expect(dictionary.color.red.original.value.h).to.equal('{hue.red}');
    expect(dictionary.color.red.value.h).to.equal(20);
  });

  it('should handle .value and non .value references per the DTCG spec', async () => {
    const tokens = {
      colors: {
        red: { value: '#f00' },
        error: { value: '{colors.red}' },
        danger: { value: '{colors.error}' },
        alert: { value: '{colors.error}' },
      },
    };
    const expected = {
      colors: {
        red: {
          value: '#f00',
          name: 'colors-red',
          key: '{colors.red}',
          path: ['colors', 'red'],
          original: {
            value: '#f00',
            key: '{colors.red}',
          },
          attributes: {
            category: 'colors',
            type: 'red',
          },
        },
        error: {
          value: '#f00',
          name: 'colors-error',
          key: '{colors.error}',
          path: ['colors', 'error'],
          original: {
            value: '{colors.red}',
            key: '{colors.error}',
          },
          attributes: {
            category: 'colors',
            type: 'error',
          },
        },
        danger: {
          value: '#f00',
          name: 'colors-danger',
          key: '{colors.danger}',
          path: ['colors', 'danger'],
          original: {
            value: '{colors.error}',
            key: '{colors.danger}',
          },
          attributes: {
            category: 'colors',
            type: 'danger',
          },
        },
        alert: {
          value: '#f00',
          name: 'colors-alert',
          key: '{colors.alert}',
          path: ['colors', 'alert'],
          original: {
            value: '{colors.error}',
            key: '{colors.alert}',
          },
          attributes: {
            category: 'colors',
            type: 'alert',
          },
        },
      },
    };
    const actual = await new StyleDictionary({
      tokens,
      platforms: {
        css: {
          transformGroup: css,
        },
      },
    }).exportPlatform('css');
    expect(actual).to.eql(expected);
  });

  describe('token references without .value', async () => {
    const tokens = {
      color: {
        red: { value: '#f00', type: 'color' },
        error: { value: '{color.red}', type: 'color' },
        errorWithValue: { value: '{color.red}', type: 'color' },
        danger: { value: '{color.error}', type: 'color' },
        dangerWithValue: { value: '{color.error}', type: 'color' },
        dangerErrorValue: { value: '{color.errorWithValue}', type: 'color' },
      },
    };

    const sd = new StyleDictionary({
      tokens,
      platforms: {
        css: {
          transformGroup: css,
        },
      },
    });
    const actual = await sd.exportPlatform('css');

    it('should work if referenced directly', () => {
      expect(actual.color.error.value).to.equal('#ff0000');
    });

    it('should work if there is a transitive reference', () => {
      expect(actual.color.danger.value).to.equal('#ff0000');
    });

    it('should work if there is a transitive reference with .value', () => {
      expect(actual.color.errorWithValue.value).to.equal('#ff0000');
      expect(actual.color.dangerWithValue.value).to.equal('#ff0000');
      expect(actual.color.dangerErrorValue.value).to.equal('#ff0000');
    });
  });

  describe('reference warnings', () => {
    const errorMessage = (amount = 1) => `Reference Errors:
Some token references (${amount}) could not be found.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/`;
    const platforms = {
      css: {
        transformGroup: css,
      },
    };

    it('should throw if there are simple property reference errors', async () => {
      const tokens = {
        a: { value: '#ff0000' },
        b: { value: '{c}' },
      };

      const sd = new StyleDictionary({
        tokens,
        platforms,
      });

      await expect(sd.exportPlatform('css')).to.eventually.be.rejectedWith(errorMessage());
    });

    it('should throw if there are circular reference errors', async () => {
      const tokens = {
        a: { value: '{b}' },
        b: { value: '{a}' },
      };

      const sd = new StyleDictionary({
        tokens,
        platforms,
      });
      await expect(sd.exportPlatform('css')).to.eventually.be.rejectedWith(errorMessage());
    });

    it('should throw if there are complex property reference errors', async () => {
      const tokens = {
        color: {
          core: {
            red: { valuer: '#ff0000' }, // notice misspelling
            blue: { 'value:': '#0000ff' },
          },
          danger: { value: '{color.core.red}' },
          warning: { value: '{color.base.red.valuer}' },
          info: { value: '{color.core.blue}' },
          error: { value: '{color.danger}' },
        },
      };
      const sd = new StyleDictionary({
        tokens,
        platforms,
      });
      await expect(sd.exportPlatform('css')).to.eventually.be.rejectedWith(errorMessage(4));
    });
  });

  describe('CSS shorthand transforms integration', () => {
    describe('typography', () => {
      it('should warn the user about CSS Font shorthand unknown properties', async () => {
        const logStub = stubMethod(console, 'log');
        const sd = new StyleDictionary({
          tokens: {
            foo: {
              bar: {
                value: {
                  fontWeight: '500',
                  fontSize: '20px',
                  letterSpacing: 'normal',
                  paragraphSpacing: '20px',
                  textColor: '#000000',
                },
                type: 'typography',
              },
            },
          },
          platforms: {
            css: {
              transforms: [typographyCssShorthand],
            },
          },
        });
        await sd.hasInitialized;

        // keep track of the original tokenMap for subsequent tests
        // to re-execute the transforms
        const originalMap = structuredClone(sd.tokenMap);

        await sd.exportPlatform('css');

        expect(cleanConsoleOutput(logStub.firstCall.args[0])).to.equal(`
Unknown CSS Font Shorthand properties found for 1 tokens, CSS output for Font values will be missing some typography token properties as a result:
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`);

        sd.log.verbosity = verbose;
        // use structuredClone again here or the transformMap will also mutate the originalMap
        sd.tokenMap = structuredClone(originalMap);
        await sd.exportPlatform('css', { cache: false });
        expect(cleanConsoleOutput(Array.from(logStub.calls)[1].args[0])).to.equal(`
Unknown CSS Font Shorthand properties found for 1 tokens, CSS output for Font values will be missing some typography token properties as a result:

letterSpacing, paragraphSpacing, textColor for token at foo.bar
`);

        sd.tokenMap = structuredClone(originalMap);
        sd.tokenMap.set('{foo.bar}', { ...sd.tokenMap.get('{foo.bar}'), filePath: '/tokens.json' });
        await sd.exportPlatform('css', { cache: false });
        expect(cleanConsoleOutput(Array.from(logStub.calls)[2].args[0])).to.equal(`
Unknown CSS Font Shorthand properties found for 1 tokens, CSS output for Font values will be missing some typography token properties as a result:

letterSpacing, paragraphSpacing, textColor for token at foo.bar in /tokens.json
`);

        sd.log.verbosity = silent;
        sd.tokenMap = structuredClone(originalMap);
        await sd.exportPlatform('css', { cache: false });
        expect(Array.from(logStub.calls)[3]).to.be.undefined;

        sd.log.verbosity = defaultVerbosity;
        sd.log.warnings = disabled;
        sd.tokenMap = structuredClone(originalMap);
        await sd.exportPlatform(css, { cache: false });
        expect(Array.from(logStub.calls)[3]).to.be.undefined;

        sd.log.warnings = errorLog;
        sd.tokenMap = structuredClone(originalMap);
        await expect(sd.exportPlatform(css, { cache: false })).to.be.eventually.rejectedWith(`
Unknown CSS Font Shorthand properties found for 1 tokens, CSS output for Font values will be missing some typography token properties as a result:
Use log.verbosity "verbose" or use CLI option --verbose for more details.
`);
      });

      it('should properly transform typography tokens that are references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '{foo}',
              type: 'typography',
            },
            foo: {
              value: {
                fontWeight: '500',
                fontSize: '20px',
                letterSpacing: 'normal',
                paragraphSpacing: '20px',
                textColor: '#000000',
              },
              type: 'typography',
            },
          },
          platforms: {
            css: {
              transforms: [typographyCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.bar.value).to.equal('500 20px sans-serif');
      });

      it('should properly transform typography tokens that contain references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '500',
              type: 'fontWeight',
            },
            foo: {
              value: {
                fontWeight: '{bar}',
                fontSize: '20px',
                letterSpacing: 'normal',
                paragraphSpacing: '20px',
                textColor: '#000000',
              },
              type: 'typography',
            },
          },
          platforms: {
            css: {
              transforms: [typographyCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.foo.value).to.equal('500 20px sans-serif');
      });
    });

    describe('border', () => {
      it('should properly transform typography tokens that are references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '{foo}',
              type: 'border',
            },
            foo: {
              value: {
                style: 'dashed',
                color: '#000',
                width: '2px',
              },
              type: 'border',
            },
          },
          platforms: {
            css: {
              transforms: [borderCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.bar.value).to.equal('2px dashed #000');
      });

      it('should properly transform typography tokens that contain references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: 'dashed',
              type: 'strokeStyle',
            },
            foo: {
              value: {
                style: '{bar}',
                color: '#000',
                width: '2px',
              },
              type: 'border',
            },
          },
          platforms: {
            css: {
              transforms: [borderCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.foo.value).to.equal('2px dashed #000');
      });
    });

    describe('transition', () => {
      it('should properly transform transition tokens that are references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '{foo}',
              type: 'transition',
            },
            foo: {
              value: {
                duration: '200ms',
                delay: '0ms',
                timingFunction: [0.5, 0, 1, 1],
              },
              type: 'transition',
            },
          },
          platforms: {
            css: {
              transforms: [cubicBezierCss, transitionCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.bar.value).to.equal('200ms cubic-bezier(0.5, 0, 1, 1) 0ms');
      });

      it('should properly transform transition tokens that contain references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: [0.5, 0, 1, 1],
              type: 'cubicBezier',
            },
            foo: {
              value: {
                duration: '200ms',
                delay: '0ms',
                timingFunction: '{bar}',
              },
              type: 'transition',
            },
          },
          platforms: {
            css: {
              transforms: [cubicBezierCss, transitionCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.foo.value).to.equal('200ms cubic-bezier(0.5, 0, 1, 1) 0ms');
      });
    });

    describe('shadow', () => {
      it('should properly transform typography tokens that are references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '{foo}',
              type: 'shadow',
            },
            foo: {
              value: {
                offsetX: '2px',
                offsetY: '4px',
                blur: '10px',
                color: '#000',
              },
              type: 'shadow',
            },
          },
          platforms: {
            css: {
              transforms: [shadowCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.bar.value).to.equal('2px 4px 10px #000');
      });

      it('should properly transform typography tokens that contain references', async () => {
        const sd = new StyleDictionary({
          tokens: {
            bar: {
              value: '#000',
              type: 'color',
            },
            foo: {
              value: [
                {
                  offsetX: '2px',
                  offsetY: '4px',
                  blur: '10px',
                  color: '{bar}',
                },
                {
                  offsetX: '4px',
                  offsetY: '8px',
                  blur: '12px',
                  color: '{bar}',
                },
              ],
              type: 'shadow',
            },
          },
          platforms: {
            css: {
              transforms: [shadowCssShorthand],
            },
          },
        });

        const transformed = await sd.exportPlatform('css');
        expect(transformed.foo.value).to.equal('2px 4px 10px #000, 4px 8px 12px #000');
      });
    });
  });

  describe('DTCG forward compatibility', () => {
    it('should allow using $value instead of value', async () => {
      const sd = new StyleDictionary({
        tokens: {
          $type: 'dimension',
          dimensions: {
            sm: {
              $value: '5',
            },
            md: {
              $value: '10',
              value: '2000',
            },
            value: {
              $value: '20',
            },
            nested: {
              value: {
                deep: {
                  $value: '30',
                },
              },
            },
          },
          reftest: { $value: '{zero}' },
          zero: { $value: '0' },
          reftest2: { $value: '{one}' },
          one: { $value: '1' },
        },
        hooks: {
          transforms: {
            'custom/add/px': {
              type: transformTypeValue,
              filter: (token) => {
                return token.$type === 'dimension';
              },
              transform: (token) => {
                return `${sd.usesDtcg ? token.$value : token}px`;
              },
            },
          },
        },
        platforms: {
          css: {
            transforms: [nameKebab, 'custom/add/px'],
          },
        },
      });

      const tokens = await sd.exportPlatform('css');

      expect(tokens.dimensions.sm.$value).to.equal('5px');
      expect(tokens.dimensions.md.$value).to.equal('10px');

      // unaffected, because "metadata" property
      expect(tokens.dimensions.md.value).to.equal('2000');

      // considers "value" a token name here
      expect(tokens.dimensions.value.$value).to.equal('20px');

      // considers "value" a token group here
      expect(tokens.dimensions.nested.value.deep.$value).to.equal('30px');

      expect(tokens.reftest.$value).to.equal('0px');
      expect(tokens.reftest2.$value).to.equal('1px');
    });
  });
});
