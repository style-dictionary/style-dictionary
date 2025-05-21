import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import chalk from 'chalk';
import { fileToJSON, clearOutput, fileExists, clearSDMeta } from './__helpers.js';
import { resolve } from '../lib/resolve.js';
import GroupMessages from '../lib/utils/groupMessages.js';
import { convertTokenData } from '../lib/utils/convertTokenData.js';
import { stripMeta } from '../lib/utils/stripMeta.js';
import formats from '../lib/common/formats.js';
import { restore, stubMethod } from 'hanbi';
import {
  logWarningLevels,
  logVerbosityLevels,
  logBrokenReferenceLevels,
  formats as fileFormats,
  transformGroups,
} from '../lib/enums/index.js';

const { console: logToConsole } = logBrokenReferenceLevels;
const { silent, verbose } = logVerbosityLevels;
const { error: errorLog, warn } = logWarningLevels;

function traverseObj(obj, fn) {
  for (let key in obj) {
    fn.apply(this, [obj, key, obj[key]]);
    if (obj[key] && typeof obj[key] === 'object') {
      traverseObj(obj[key], fn);
    }
  }
}

const test_props = {
  size: {
    padding: {
      tiny: { value: '0' },
    },
  },
};

// extend method is called by StyleDictionary constructor, therefore we're basically testing both things here
describe('StyleDictionary class', () => {
  beforeEach(() => {
    restore();
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should accept a string as a path to a JSON5 file', async () => {
    const StyleDictionaryExtended = new StyleDictionary('__tests__/__configs/test.json5');
    await StyleDictionaryExtended.hasInitialized;
    expect(StyleDictionaryExtended).to.have.nested.property('platforms.web');
  });

  it('should accept a string as a path to a JSONC file', async () => {
    const StyleDictionaryExtended = new StyleDictionary('__tests__/__configs/test.jsonc');
    await StyleDictionaryExtended.hasInitialized;
    expect(StyleDictionaryExtended).to.have.nested.property('platforms.web');
  });

  it('should allow for chained extends and not mutate the original', async () => {
    const StyleDictionary1 = new StyleDictionary({
      foo: 'bar',
      bar: 'other',
    });
    const StyleDictionary2 = await StyleDictionary1.extend({
      foo: 'baz',
    });
    const StyleDictionary3 = await (
      await StyleDictionary2.extend({
        foo: 'bar',
      })
    ).extend({
      foo: 'boo',
    });
    expect(StyleDictionary1.foo).to.equal('bar');
    expect(StyleDictionary2.foo).to.equal('baz');
    expect(StyleDictionary3.foo).to.equal('boo');
    // check that the bar prop from SD1 is not lost in SD3
    expect(StyleDictionary3.bar).to.equal('other');
    expect(StyleDictionary).not.to.have.property('foo');
  });

  it(`should not pollute the prototype`, async () => {
    const obj = {};
    // method 1
    new StyleDictionary(JSON.parse('{"__proto__":{"polluted":"yes"}}'));
    // method 2, which executes a deepmerge under the hood
    // this verifies that this deepmerge util is also protected against prototype pollution
    const sd = new StyleDictionary();
    await sd.hasInitialized;
    await sd.extend(JSON.parse('{"__proto__":{"polluted":"yes"}}'));

    // FIXME: method 3, by putting it into a design token, currently not tested
    // for these we use our own deepExtend utility, which must be prototype pollution protected
    // however, we don't actually test this here..

    expect(obj.polluted).to.be.undefined;
  });

  it('should not merge tokens together but rather override on collision', async () => {
    const sd = new StyleDictionary({
      source: [
        '__tests__/__json_files/token-collision-1.json',
        '__tests__/__json_files/token-collision-2.json',
      ],
    });
    await sd.hasInitialized;
    expect(sd.tokens.test.value).to.equal('#ff0000');
    expect(sd.tokens.test.$extensions).to.be.undefined;
  });

  describe('method signature', () => {
    it('should accept a string as a path to a JSON file', async () => {
      const StyleDictionaryExtended = new StyleDictionary('__tests__/__configs/test.json');
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended).to.have.nested.property('platforms.web');
    });

    it('should accept an object as options', () => {
      const config = fileToJSON('__tests__/__configs/test.json');
      const StyleDictionaryExtended = new StyleDictionary(config);
      expect(StyleDictionaryExtended).to.have.nested.property('platforms.web');
    });

    it('should override config props', () => {
      const StyleDictionaryExtended = new StyleDictionary({
        tokens: {
          foo: 'bar',
        },
      });
      expect(StyleDictionaryExtended).to.have.nested.property('tokens.foo', 'bar');
    });
  });

  describe('includes', () => {
    it('should throw if include isnt an array', async () => {
      const sd = new StyleDictionary({ include: {} }, { init: false });
      await expect(sd.init()).to.eventually.be.rejectedWith('include must be an array');
    });

    it('should not update tokens if include glob paths dont resolve to anything', () => {
      const StyleDictionaryExtended = new StyleDictionary({
        include: ['foo'],
      });
      expect(typeof StyleDictionaryExtended.tokens.size).to.equal('undefined');
    });

    it('should properly glob paths', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        include: ['__tests__/__tokens/*.json'],
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(typeof StyleDictionaryExtended.tokens.size.padding.tiny).to.equal('object');
    });

    it('should build the tokens object if an include is given', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        include: ['__tests__/__tokens/paddings.json'],
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = '__tests__/__tokens/paddings.json';
          obj.isSource = false;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });

    it('should override existing tokens if include is given', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        tokens: test_props,
        include: ['__tests__/__tokens/paddings.json'],
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = '__tests__/__tokens/paddings.json';
          obj.isSource = false;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });

    it('should update tokens if there are includes', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        include: ['__tests__/__configs/include.json'],
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(typeof StyleDictionaryExtended.tokens.size.padding.tiny).to.equal('object');
    });

    it('should override existing tokens if there are includes', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        tokens: test_props,
        include: ['__tests__/__configs/include.json'],
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended).to.have.nested.property(
        'tokens.size.padding.tiny.value',
        '3',
      );
    });
  });

  describe('source', () => {
    it('should throw if source isnt an array', async () => {
      const sd = new StyleDictionary({ source: {} }, { init: false });
      await expect(sd.init()).to.eventually.be.rejectedWith('source must be an array');
    });

    it("should not update tokens if source glob paths don't resolve to anything", async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        source: ['foo'],
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(typeof StyleDictionaryExtended.tokens.size).to.equal('undefined');
    });

    it('should build the tokens object if a source is given', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        source: ['__tests__/__tokens/paddings.json'],
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = '__tests__/__tokens/paddings.json';
          obj.isSource = true;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });

    it('should use relative filePaths for the filePath property', async () => {
      const filePath = '__tests__/__tokens/paddings.json';
      const StyleDictionaryExtended = new StyleDictionary({
        source: [filePath],
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = filePath;
          obj.isSource = true;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });

    it('should override existing tokens source is given', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        tokens: test_props,
        source: ['__tests__/__tokens/paddings.json'],
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = '__tests__/__tokens/paddings.json';
          obj.isSource = true;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });
  });

  describe('collisions', () => {
    it('should not throw a collision error if a source file collides with an include', async () => {
      const StyleDictionaryExtended = new StyleDictionary({
        include: ['__tests__/__tokens/paddings.json'],
        source: ['__tests__/__tokens/paddings.json'],
        log: errorLog,
      });
      const output = fileToJSON('__tests__/__tokens/paddings.json');
      traverseObj(output, (obj) => {
        if (Object.hasOwn(obj, 'value') && !obj.filePath) {
          obj.filePath = '__tests__/__tokens/paddings.json';
          obj.isSource = true;
        }
      });
      await StyleDictionaryExtended.hasInitialized;
      expect(StyleDictionaryExtended.tokens).to.eql(output);
    });

    it('should throw an error if the collision is in source files and log is set to error', async () => {
      const sd = new StyleDictionary(
        {
          source: ['__tests__/__tokens/paddings.json', '__tests__/__tokens/_paddings.json'],
          log: { warnings: errorLog, verbosity: verbose },
        },
        { init: false },
      );
      let error;
      try {
        await sd.init();
      } catch (e) {
        error = e;
      }
      await expect(error.message).to.matchSnapshot();
    });

    it('should throw a brief error if the collision is in source files and log is set to error and verbosity default', async () => {
      const sd = new StyleDictionary(
        {
          source: ['__tests__/__tokens/paddings.json', '__tests__/__tokens/_paddings.json'],
          log: { warnings: errorLog },
        },
        { init: false },
      );
      let error;
      try {
        await sd.init();
      } catch (e) {
        error = e;
      }
      await expect(error.message).to.matchSnapshot();
    });

    it('should throw a warning if the collision is in source files and log is set to warn', async () => {
      const sd = new StyleDictionary(
        {
          source: ['__tests__/__tokens/paddings.json', '__tests__/__tokens/paddings.json'],
          log: warn,
        },
        { init: false },
      );
      await expect(sd.init()).to.eventually.be.fulfilled;
    });
  });

  describe('reference errors', () => {
    // This is because some of those broken refs might get fixed in the preprocessor lifecycle hook by the user
    // or by the built-in object-value token expand preprocessor
    it('should tolerate broken references in the initialization phase', async () => {
      let err;
      let sd;
      try {
        sd = new StyleDictionary(
          {
            tokens: {
              foo: {
                value: '{bar}',
                type: 'typography',
              },
            },
            expand: true,
          },
          { init: false },
        );

        await sd.init();
      } catch (e) {
        err = e;
      }
      expect(err).to.be.undefined;
    });

    it('should throw an error by default if broken references are encountered', async () => {
      const sd = new StyleDictionary({
        tokens: {
          foo: {
            value: '{bar}',
            type: 'other',
          },
        },
        platforms: {
          css: {},
        },
      });

      await expect(sd.exportPlatform('css')).to.eventually.be.rejectedWith(`
Reference Errors:
Some token references (1) could not be found.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
`);
    });

    it('should only log an error if broken references are encountered and log.errors.brokenReferences is set to console', async () => {
      const stub = stubMethod(console, 'error');
      const sd = new StyleDictionary({
        log: {
          errors: {
            brokenReferences: logToConsole,
          },
        },
        tokens: {
          foo: {
            value: '{bar}',
            type: 'other',
          },
        },
        platforms: {
          css: {},
        },
      });
      await sd.exportPlatform('css');
      expect(stub.firstCall.args[0]).to.equal(`
Reference Errors:
Some token references (1) could not be found.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`);
    });

    it('should allow silencing broken references errors with log.verbosity set to silent and log.errors.brokenReferences set to console', async () => {
      const stub = stubMethod(console, 'error');
      const sd = new StyleDictionary({
        log: {
          verbosity: silent,
          errors: {
            brokenReferences: logToConsole,
          },
        },
        tokens: {
          foo: {
            value: '{bar}',
            type: 'other',
          },
        },
        platforms: {
          css: {},
        },
      });
      await sd.exportPlatform('css');
      expect(stub.callCount).to.equal(0);
    });

    it('should resolve correct references when the tokenset contains broken references and log.errors.brokenReferences is set to console', async () => {
      const stub = stubMethod(console, 'error');
      const sd = new StyleDictionary({
        log: {
          errors: {
            brokenReferences: logToConsole,
          },
        },
        tokens: {
          foo: {
            value: '{bar}',
            type: 'other',
          },
          baz: {
            value: '8px',
            type: 'dimension',
          },
          qux: {
            value: '{baz}',
            type: 'dimension',
          },
        },
        platforms: {
          css: {},
        },
      });
      const transformed = await sd.exportPlatform('css');
      expect(stub.firstCall.args[0]).to.equal(`
Reference Errors:
Some token references (1) could not be found.
Use log.verbosity "verbose" or use CLI option --verbose for more details.
Refer to: https://styledictionary.com/reference/logging/
`);

      expect(clearSDMeta(transformed)).to.eql({
        foo: {
          value: '{bar}',
          type: 'other',
        },
        baz: {
          value: '8px',
          type: 'dimension',
        },
        qux: {
          value: '8px',
          type: 'dimension',
        },
      });
    });
  });

  describe('expand object value tokens', () => {
    it('should not expand object value tokens by default', async () => {
      const input = {
        border: {
          type: 'border',
          value: {
            width: '2px',
            style: 'solid',
            color: '#000',
          },
        },
      };
      const sd = new StyleDictionary({
        tokens: input,
      });
      await sd.hasInitialized;
      expect(sd.tokens).to.eql(input);
    });

    it('should allow expanding tokens globally', async () => {
      const input = {
        border: {
          type: 'border',
          value: {
            width: '2px',
            style: 'solid',
            color: '#000',
          },
        },
      };
      const sd = new StyleDictionary({
        tokens: input,
        expand: true,
      });
      await sd.hasInitialized;
      expect(sd.tokens).to.eql({
        border: {
          color: {
            type: 'color',
            value: '#000',
            key: '{border.color}',
          },
          style: {
            type: 'strokeStyle',
            value: 'solid',
            key: '{border.style}',
          },
          width: {
            type: 'dimension',
            value: '2px',
            key: '{border.width}',
          },
        },
      });
    });

    it('should allow expanding tokens on a per platform basis', async () => {
      const input = {
        border: {
          type: 'border',
          value: {
            width: '2px',
            style: 'solid',
            color: '#000',
          },
        },
      };
      const sd = new StyleDictionary({
        tokens: input,
        platforms: {
          css: {
            expand: true,
          },
          js: {},
        },
      });
      await sd.hasInitialized;
      const cssTokens = await sd.exportPlatform('css');
      const jsTokens = await sd.exportPlatform('js');
      expect(stripMeta(cssTokens, { keep: ['type', 'value'] })).to.eql({
        border: {
          color: {
            type: 'color',
            value: '#000',
          },
          style: {
            type: 'strokeStyle',
            value: 'solid',
          },
          width: {
            type: 'dimension',
            value: '2px',
          },
        },
      });
      expect(stripMeta(jsTokens, { keep: ['type', 'value'] })).to.eql(input);
    });

    it('should allow combining global expand with per platform expand', async () => {
      const input = {
        border: {
          type: 'border',
          value: {
            width: '2px',
            style: 'solid',
            color: '#000',
          },
        },
        borderTwo: {
          type: 'border',
          value: {
            width: '1px',
            style: 'dashed',
            color: '#ccc',
          },
        },
      };
      const sd = new StyleDictionary({
        tokens: input,
        expand: {
          include: (token) => {
            return token.value.width === '2px';
          },
        },
        platforms: {
          css: {},
          js: {
            expand: {
              typesMap: true,
            },
          },
        },
      });
      await sd.hasInitialized;
      const cssTokens = await sd.exportPlatform('css');
      const jsTokens = await sd.exportPlatform('js');

      expect(stripMeta(cssTokens, { keep: ['type', 'value'] })).to.eql({
        border: {
          color: {
            type: 'color',
            value: '#000',
          },
          style: {
            type: 'strokeStyle',
            value: 'solid',
          },
          width: {
            type: 'dimension',
            value: '2px',
          },
        },
        borderTwo: input.borderTwo,
      });
      expect(stripMeta(jsTokens, { keep: ['type', 'value'] })).to.eql({
        border: {
          color: {
            type: 'color',
            value: '#000',
          },
          style: {
            type: 'strokeStyle',
            value: 'solid',
          },
          width: {
            type: 'dimension',
            value: '2px',
          },
        },
        borderTwo: {
          color: {
            type: 'color',
            value: '#ccc',
          },
          style: {
            type: 'strokeStyle',
            value: 'dashed',
          },
          width: {
            type: 'dimension',
            value: '1px',
          },
        },
      });
    });
  });

  describe('DTCG integration', () => {
    it('should allow using $type value on a token group, children inherit, local overrides take precedence', async () => {
      const sd = new StyleDictionary({
        tokens: {
          dimensions: {
            $type: 'dimension',
            sm: {
              $value: '5',
            },
            md: {
              $value: '10',
            },
            nested: {
              deep: {
                lg: {
                  $value: '15',
                },
              },
            },
            nope: {
              $value: '20',
              $type: 'spacing',
            },
          },
        },
        platforms: {
          css: {
            transformGroup: transformGroups.css,
          },
        },
      });
      await sd.hasInitialized;

      expect(sd.tokens.dimensions.sm.$type).to.equal('dimension');
      expect(sd.tokens.dimensions.md.$type).to.equal('dimension');
      expect(sd.tokens.dimensions.nested.deep.lg.$type).to.equal('dimension');
      expect(sd.tokens.dimensions.nope.$type).to.equal('spacing');
    });

    it('should detect usage of DTCG draft spec tokens', async () => {
      const sd = new StyleDictionary({
        tokens: {
          datalist: {
            key: { color: { $value: '#222' } },
            value: { color: { $value: '#000' } },
          },
        },
      });
      await sd.hasInitialized;
      expect(sd.usesDtcg).to.be.true;
    });

    it('should expand references when using DTCG format', async () => {
      const sd = new StyleDictionary({
        tokens: {
          $type: 'typography',
          typo: {
            $value: {
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'Arial Black, sans-serif',
            },
          },
          ref: {
            $value: '{typo}',
          },
        },
        expand: true,
      });
      await sd.hasInitialized;
      expect(sd.tokens).to.eql({
        typo: {
          fontFamily: {
            $type: 'fontFamily',
            $value: 'Arial Black, sans-serif',
            key: '{typo.fontFamily}',
          },
          fontSize: {
            $type: 'dimension',
            $value: '16px',
            key: '{typo.fontSize}',
          },
          fontWeight: {
            $type: 'fontWeight',
            $value: 700,
            key: '{typo.fontWeight}',
          },
        },
        ref: {
          fontFamily: {
            $type: 'fontFamily',
            $value: 'Arial Black, sans-serif',
            key: '{ref.fontFamily}',
          },
          fontSize: {
            $type: 'dimension',
            $value: '16px',
            key: '{ref.fontSize}',
          },
          fontWeight: {
            $type: 'fontWeight',
            $value: 700,
            key: '{ref.fontWeight}',
          },
        },
      });
    });
  });

  describe('buildPlatform', () => {
    const dictionary = {
      tokens: {
        foo: { value: 'bar' },
        bingo: { value: 'bango' },
      },
    };

    const hooks = {
      formats: {
        foo: (dictionary) => JSON.stringify(dictionary.tokens),
      },
    };

    const platform = {
      files: [
        {
          destination: '__tests__/__output/test.json',
          format: 'foo',
        },
      ],
    };

    const platformWithBuildPath = {
      buildPath: '__tests__/__output/',
      files: [
        {
          destination: 'test.json',
          format: 'foo',
        },
      ],
    };

    const platformWithFilter = {
      buildPath: '__tests__/__output/',
      files: [
        {
          destination: 'test.json',
          filter: function (property) {
            return property.value === 'bango';
          },
          format: 'foo',
        },
      ],
    };

    const platformWithoutFormat = {
      buildPath: '__tests__/__output/',
      files: [
        {
          destination: 'test.json',
        },
      ],
    };

    const platformWithoutFiles = {
      buildPath: '__tests__/__output/',
    };

    it('should throw if there is no files property', async () => {
      const sd = new StyleDictionary({
        ...dictionary,
        hooks,
        platforms: {
          foo: platformWithoutFiles,
        },
      });
      await expect(sd.buildPlatform('foo')).to.eventually.rejectedWith(
        'Cannot format platform foo due to missing "files" property',
      );
    });

    it('should throw if missing a format', async () => {
      const sd = new StyleDictionary({
        ...dictionary,
        hooks,
        platforms: {
          foo: platformWithoutFormat,
        },
      });
      await expect(sd.buildPlatform('foo')).to.eventually.rejectedWith('Please supply a format');
    });

    it('should work without buildPath', async () => {
      const sd = new StyleDictionary({
        ...dictionary,
        hooks,
        platforms: {
          foo: platform,
        },
      });
      await sd.buildPlatform('foo');
      expect(fileExists('__tests__/__output/test.json')).to.be.true;
    });

    it('should work with buildPath', async () => {
      const sd = new StyleDictionary({
        ...dictionary,
        hooks,
        platforms: {
          foo: platformWithBuildPath,
        },
      });
      await sd.buildPlatform('foo');
      expect(fileExists('__tests__/__output/test.json')).to.be.true;
    });

    it('should work with a filter', async () => {
      const sd = new StyleDictionary({
        ...dictionary,
        hooks,
        platforms: {
          foo: platformWithFilter,
        },
      });
      await sd.buildPlatform('foo');
      expect(fileExists('__tests__/__output/test.json')).to.be.true;
      const output = JSON.parse(fs.readFileSync(resolve('__tests__/__output/test.json')));
      expect(output).to.have.property('bingo');
      expect(output).to.not.have.property('foo');
      Object.values(output).forEach((property) => {
        expect(property.value).to.equal('bango');
      });
    });
  });

  describe('formatFile', () => {
    function format() {
      return 'hi';
    }

    function nestedFormat() {
      return 'hi';
    }

    nestedFormat.nested = true;

    it('should error if format doesnt exist or isnt a function', async () => {
      const sd = new StyleDictionary({
        platforms: {
          foo: {},
        },
      });
      await expect(
        sd.formatFile({ destination: '__tests__output/test.txt' }, {}, {}),
      ).to.eventually.rejectedWith('Please enter a valid file format');
      await expect(
        sd.formatFile({ destination: '__tests__output/test.txt', format: {} }, {}, {}),
      ).to.eventually.rejectedWith('Please enter a valid file format');
      await expect(
        sd.formatFile({ destination: '__tests__/__output/test.txt', format: [] }, {}, {}),
      ).to.eventually.rejectedWith('Please enter a valid file format');
    });

    it('should error if destination isnt a string', async () => {
      const sd = new StyleDictionary({
        platforms: {
          foo: {},
        },
      });
      await expect(sd.formatFile({ format, destination: [] }, {}, {})).to.eventually.rejectedWith(
        'Please enter a valid destination',
      );
      await expect(sd.formatFile({ format, destination: {} }, {}, {})).to.eventually.rejectedWith(
        'Please enter a valid destination',
      );
    });

    describe('name collisions', () => {
      const destination = '__tests__/__output/test.collisions';
      const PROPERTY_NAME_COLLISION_WARNINGS = `${GroupMessages.GROUP.PropertyNameCollisionWarnings}:${destination}`;
      const name = 'someName';
      const dictionary = {
        allTokens: [
          {
            name: name,
            path: ['some', 'name', 'path1'],
            value: 'value1',
          },
          {
            name: name,
            path: ['some', 'name', 'path2'],
            value: 'value2',
          },
        ],
      };

      it('should generate warning messages for output name collisions', async () => {
        GroupMessages.clear(PROPERTY_NAME_COLLISION_WARNINGS);
        const sd = new StyleDictionary();
        const { logs } = await sd.formatFile(
          { destination, format },
          { log: { verbosity: verbose } },
          dictionary,
        );

        expect(logs.warning.length).to.equal(1);
        expect(logs.warning[0]).to.matchSnapshot();
      });

      it('should not warn users if the format is a nested format', async () => {
        const sd = new StyleDictionary();
        const { logs } = await sd.formatFile({ destination, format: nestedFormat }, {}, dictionary);
        expect(logs.success[0]).to.equal(chalk.bold.green(`✔︎ ${destination}`));
      });
    });

    const destEmptyTokens = '__tests__/__output/test.emptyTokens';
    it('should warn when a file is not created because of empty tokens', async () => {
      const dictionary = {
        allTokens: [
          {
            name: 'someName',
            type: 'color',
            path: ['some', 'name', 'path1'],
            value: 'value1',
          },
        ],
      };

      const filter = function (token) {
        return token.type === 'color2';
      };

      const sd = new StyleDictionary();
      const { logs, output } = await sd.formatFile(
        {
          destination: destEmptyTokens,
          format,
          filter,
        },
        {},
        dictionary,
      );

      expect(output).to.be.undefined;

      const warn = chalk.rgb(255, 140, 0)(`No tokens for ${destEmptyTokens}. File not created.`);
      expect(logs.warning[0]).to.equal(warn);
    });

    it('should warn when a file is not created because of empty tokens using async filters', async () => {
      const dictionary = {
        allTokens: [
          {
            name: 'someName',
            type: 'color',
            path: ['some', 'name', 'path1'],
            value: 'value1',
          },
        ],
      };

      const filter = async (token) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return token.type === 'color2';
      };

      const sd = new StyleDictionary();
      const { logs, output } = await sd.formatFile(
        {
          destination: destEmptyTokens,
          format,
          filter,
        },
        {},
        dictionary,
      );
      expect(output).to.be.undefined;

      const warn = chalk.rgb(255, 140, 0)(`No tokens for ${destEmptyTokens}. File not created.`);
      expect(logs.warning[0]).to.equal(warn);
    });

    it('should create file output properly', async () => {
      const sd = new StyleDictionary();
      const { output } = await sd.formatFile(
        {
          destination: 'test.txt',
          format,
        },
        {
          buildPath: '__tests__/__output/',
        },
        {},
      );
      expect(output).to.equal('hi');
    });

    it('should support asynchronous formats', async () => {
      const tokens = {
        size: {
          font: {
            small: {
              value: '12rem',
              original: {
                value: '12px',
              },
              name: 'size-font-small',
              path: ['size', 'font', 'small'],
            },
            large: {
              value: '18rem',
              original: {
                value: '18px',
              },
              name: 'size-font-large',
              path: ['size', 'font', 'large'],
            },
          },
        },
        color: {
          base: {
            red: {
              value: '#ff0000',
              comment: 'comment',
              original: {
                value: '#FF0000',
                comment: 'comment',
              },
              name: 'color-base-red',
              path: ['color', 'base', 'red'],
            },
          },
          white: {
            value: '#ffffff',
            original: {
              value: '#ffffff',
            },
            name: 'color-white',
            path: ['color', 'white'],
          },
        },
      };

      const customCSSFormat = async ({ dictionary }) => {
        return `:root {
${dictionary.allTokens.map((tok) => `  ${tok.name}: "${tok.value}";`).join('\n')}
}\n`;
      };

      const sd = new StyleDictionary();
      const { output } = await sd.formatFile(
        {
          destination: 'test.css',
          format: customCSSFormat,
        },
        {
          buildPath: '__tests__/__output/',
        },
        {
          tokens: tokens,
          allTokens: convertTokenData(tokens, { output: 'array' }),
        },
      );
      await expect(output).to.matchSnapshot();
    });

    it('should support asynchronous fileHeader', async () => {
      const dictionary = {
        allTokens: [
          {
            name: 'someName',
            type: 'color',
            path: ['some', 'name', 'path1'],
            original: { value: 'value1' },
            value: 'value1',
          },
        ],
      };

      const sd = new StyleDictionary();
      const { output } = await sd.formatFile(
        {
          destination: 'test.css',
          format: formats[fileFormats.cssVariables],
          options: {
            fileHeader: async () => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return ['foo', 'bar'];
            },
          },
        },
        {
          buildPath: '__tests__/__output/',
        },
        dictionary,
      );
      await expect(output).to.matchSnapshot();
    });
  });

  // most of the functionality in this method is tested already with buildPlatform tests
  // here we just need to check if it works without outputting to files
  describe('formatPlatform', () => {
    const cfg = {
      tokens: {
        colors: {
          red: {
            type: 'color',
            value: '#ff0000',
          },
          blue: {
            type: 'color',
            value: '#0000ff',
          },
        },
      },
      hooks: {
        formats: {
          foo: ({ dictionary }) => dictionary.allTokens.map(({ value, name }) => ({ value, name })),
        },
      },
      platforms: {
        foo: {
          files: [
            {
              format: 'foo',
            },
          ],
        },
      },
    };

    it('should allow outputting JS data with no file destination', async () => {
      const sd = new StyleDictionary(cfg);
      const output = await sd.formatPlatform('foo');
      expect(output).to.eql([
        {
          output: [
            {
              value: '#ff0000',
              name: 'red',
            },
            {
              value: '#0000ff',
              name: 'blue',
            },
          ],
          destination: '',
        },
      ]);
    });

    it('should allow outputting JS for multiple files, and annotate by destination', async () => {
      const sd = new StyleDictionary({
        ...cfg,
        platforms: {
          ...cfg.platforms,
          foo: {
            ...cfg.platforms.foo,
            files: [
              { ...cfg.platforms.foo.files[0], destination: 'output1' },
              { ...cfg.platforms.foo.files[0], destination: 'output2' },
            ],
          },
        },
      });
      const output = await sd.formatPlatform('foo');
      expect(output).to.eql([
        {
          output: [
            {
              value: '#ff0000',
              name: 'red',
            },
            {
              value: '#0000ff',
              name: 'blue',
            },
          ],
          destination: 'output1',
        },
        {
          output: [
            {
              value: '#ff0000',
              name: 'red',
            },
            {
              value: '#0000ff',
              name: 'blue',
            },
          ],
          destination: 'output2',
        },
      ]);
    });
  });

  describe('formatAllPlatforms', () => {
    it('should allow formatting multiple platforms, giving output as JS data', async () => {
      const cfg = {
        tokens: {
          colors: {
            red: {
              type: 'color',
              value: '#ff0000',
            },
            blue: {
              type: 'color',
              value: '#0000ff',
            },
          },
        },
        hooks: {
          formats: {
            qux: ({ dictionary }) =>
              dictionary.allTokens.map(({ value, name }) => ({ value, name })),
          },
        },
        platforms: {
          foo: {
            files: [
              {
                format: 'qux',
                destination: 'foo/output1',
              },
              {
                format: 'qux',
                destination: 'foo/output2',
              },
            ],
          },
          bar: {
            files: [
              {
                format: 'qux',
                destination: 'bar/output1',
              },
              {
                format: 'qux',
                destination: 'bar/output2',
              },
            ],
          },
        },
      };
      const sd = new StyleDictionary(cfg);
      const output = await sd.formatAllPlatforms();

      expect(output).to.eql({
        foo: [
          {
            destination: 'foo/output1',
            output: [
              {
                value: '#ff0000',
                name: 'red',
              },
              {
                value: '#0000ff',
                name: 'blue',
              },
            ],
          },
          {
            destination: 'foo/output2',
            output: [
              {
                value: '#ff0000',
                name: 'red',
              },
              {
                value: '#0000ff',
                name: 'blue',
              },
            ],
          },
        ],
        bar: [
          {
            destination: 'bar/output1',
            output: [
              {
                value: '#ff0000',
                name: 'red',
              },
              {
                value: '#0000ff',
                name: 'blue',
              },
            ],
          },
          {
            destination: 'bar/output2',
            output: [
              {
                value: '#ff0000',
                name: 'red',
              },
              {
                value: '#0000ff',
                name: 'blue',
              },
            ],
          },
        ],
      });
    });
  });
});
