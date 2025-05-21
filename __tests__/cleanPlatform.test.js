import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fileToJSON, clearOutput, fileExists } from './__helpers.js';

const config = fileToJSON('__tests__/__configs/test.json');
const StyleDictionaryExtended = new StyleDictionary(config);

describe('cleanPlatform', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should delete the proper files', async () => {
    await StyleDictionaryExtended.buildPlatform('web');
    await StyleDictionaryExtended.cleanPlatform('web');
    expect(fileExists('__tests__/__output/web/_icons.scss')).to.be.false;
    expect(fileExists('__tests__/__output/web/_styles.js')).to.be.false;
    expect(fileExists('__tests__/__output/web/_variables.scss')).to.be.false;
  });

  it('should delete android stuff', async () => {
    await StyleDictionaryExtended.buildPlatform('android');
    await StyleDictionaryExtended.cleanPlatform('android');
    expect(fileExists('__tests__/__output/android/main/res/drawable-hdpi/flag_us.png')).to.be.false;
    expect(fileExists('__tests__/__output/android/main/res/drawable-xhdpi/flag_us.png')).to.be
      .false;
    expect(fileExists('__tests__/__output/android/colors.xml')).to.be.false;
    expect(fileExists('__tests__/__output/android/dimens.xml')).to.be.false;
    expect(fileExists('__tests__/__output/android/font_dimen.xml')).to.be.false;
  });

  it('should delete ios stuff', async () => {
    await StyleDictionaryExtended.buildPlatform('ios');
    await StyleDictionaryExtended.cleanPlatform('ios');
    expect(fileExists('__tests__/__output/ios/style_dictionary.plist')).to.be.false;
    expect(fileExists('__tests__/__output/ios/style_dictionary.h')).to.be.false;
  });
});
