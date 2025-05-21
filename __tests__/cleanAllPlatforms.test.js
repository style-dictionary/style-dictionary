import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fileToJSON, clearOutput, fileExists } from './__helpers.js';

const config = fileToJSON('__tests__/__configs/test.json');
const StyleDictionaryExtended = new StyleDictionary(config);

describe('cleanAllPlatforms', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should work', async () => {
    await StyleDictionaryExtended.buildAllPlatforms();
    await StyleDictionaryExtended.cleanAllPlatforms();
    expect(fileExists('__tests__/__output/web/_icons.css')).to.be.false;
    expect(fileExists('__tests__/__output/android/colors.xml')).to.be.false;
  }).timeout(20000);
});
