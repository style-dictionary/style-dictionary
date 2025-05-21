import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fileToJSON, clearOutput, fileExists } from './__helpers.js';
import { formats, transforms, transformGroups } from '../lib/enums/index.js';

const config = fileToJSON('__tests__/__configs/test.json');
const StyleDictionaryExtended = new StyleDictionary(config);
const { cssVariables, json } = formats;
const { scss } = transformGroups;
const { attributeCti, sizePx, colorHex } = transforms;

describe('buildPlatform', () => {
  beforeEach(() => {
    clearOutput();
  });

  it("should throw if passed a platform that doesn't exist", async () => {
    await expect(StyleDictionaryExtended.buildPlatform('foobar')).to.eventually.rejectedWith(
      'Please supply a valid platform, "foobar" does not exist',
    );

    await expect(StyleDictionaryExtended.buildPlatform('web')).to.eventually.be.fulfilled;
  });

  it('should build web platform files', async () => {
    await StyleDictionaryExtended.buildPlatform('web');
    expect(fileExists('__tests__/__output/web/_icons.css')).to.be.true;
    expect(fileExists('__tests__/__output/web/_styles.js')).to.be.true;
    expect(fileExists('__tests__/__output/web/_variables.css')).to.be.true;
  });

  it('should build scss platform files', async () => {
    await StyleDictionaryExtended.buildPlatform('scss');
    expect(fileExists('__tests__/__output/scss/_icons.scss')).to.be.true;
    expect(fileExists('__tests__/__output/scss/_variables.scss')).to.be.true;
  });

  it('should build less platform files', async () => {
    await StyleDictionaryExtended.buildPlatform('less');
    expect(fileExists('__tests__/__output/less/_icons.less')).to.be.true;
    expect(fileExists('__tests__/__output/less/_variables.less')).to.be.true;
  });

  it('should do android stuff', async () => {
    await StyleDictionaryExtended.buildPlatform('android');
    expect(fileExists('__tests__/__output/android/main/res/drawable-hdpi/flag_us.png')).to.be.true;
    expect(fileExists('__tests__/__output/android/main/res/drawable-xhdpi/flag_us.png')).to.be.true;
    expect(fileExists('__tests__/__output/android/colors.xml')).to.be.true;
    expect(fileExists('__tests__/__output/android/dimens.xml')).to.be.true;
    expect(fileExists('__tests__/__output/android/font_dimen.xml')).to.be.true;
  });

  it('should do ios stuff', async () => {
    await StyleDictionaryExtended.buildPlatform('ios');
    expect(fileExists('__tests__/__output/ios/style_dictionary.plist')).to.be.true;
    expect(fileExists('__tests__/__output/ios/style_dictionary.h')).to.be.true;
  });

  it('should handle non-string values in tokens', async () => {
    const StyleDictionaryExtended = new StyleDictionary({
      source: ['__tests__/__tokens/nonString.json'],
      platforms: {
        test: {
          buildPath: '__tests__/__output/',
          transforms: [attributeCti, sizePx, colorHex],
          files: [
            {
              destination: 'output.json',
              format: json,
            },
          ],
        },
      },
    });
    await StyleDictionaryExtended.buildPlatform('test');
    expect(fileExists('__tests__/__output/output.json')).to.be.true;
    const output = fileToJSON('__tests__/__output/output.json');

    // Make sure transforms run on non-string values as they normally would
    expect(output).to.have.nested.property('color.red.value', output.color.otherRed.value);
    expect(output).to.have.nested.property('color.red.value', '#ff0000');
    expect(output).to.have.nested.property('size.large.value', output.size.otherLarge.value);
    expect(output).to.have.nested.property('size.large.value', '20px');

    expect(output.number.test.value).to.eql(output.number.otherTest.value);
    expect(typeof output.number.otherTest.value).to.equal('number');
    expect(output.array.test.value).to.eql(output.array.otherTest.value);
    expect(Array.isArray(output.array.otherTest.value)).to.be.true;
    expect(output.object.test.value).to.eql(output.object.otherTest.value);
    expect(typeof output.object.otherTest.value).to.equal('object');
  });

  it('should handle comments', async () => {
    const StyleDictionaryExtended = new StyleDictionary({
      source: ['__tests__/__tokens/comment.json'],
      platforms: {
        test: {
          buildPath: '__tests__/__output/',
          transformGroup: scss,
          files: [
            {
              destination: 'output.json',
              format: json,
            },
          ],
        },
      },
    });
    await StyleDictionaryExtended.buildPlatform('test');
    expect(fileExists('__tests__/__output/output.json')).to.be.true;
    const input = fileToJSON('__tests__/__tokens/comment.json');
    const output = fileToJSON('__tests__/__output/output.json');
    expect(output.size.large.comment).to.eql(input.size.large.comment);
  });

  it("should throw an error if given a transformGroup that doesn't exist", async () => {
    const StyleDictionaryExtended = new StyleDictionary({
      source: ['__tokens/**/*.json'],
      platforms: {
        foo: {
          transformGroup: 'bar',
          files: [
            {
              destination: '__tests__/__output/test.css',
              format: cssVariables,
            },
          ],
        },
      },
    });

    let err = `
Unknown transformGroup "bar" found in platform "foo":
"bar" does not match the name of a registered transformGroup.
`;

    await expect(StyleDictionaryExtended.buildPlatform('foo')).to.eventually.rejectedWith(err);
  });
});
