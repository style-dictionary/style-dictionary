import { expect } from 'chai';
import StyleDictionary from 'style-dictionary';
import { fs } from 'style-dictionary/fs';
import { clearOutput, fileExists } from './__helpers.js';
import memfs from '@bundled-es-modules/memfs';
import { formats, transformGroups } from '../lib/enums/index.js';

const { cssVariables } = formats;
const { css } = transformGroups;

describe('buildAllPlatforms', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should work with json config', async () => {
    const StyleDictionaryExtended = new StyleDictionary('__tests__/__configs/test.json');
    await StyleDictionaryExtended.hasInitialized;
    await StyleDictionaryExtended.buildAllPlatforms();
    expect(fileExists('__tests__/__output/web/_icons.css')).to.be.true;
    expect(fileExists('__tests__/__output/android/colors.xml')).to.be.true;
  }).timeout(20000);

  it('should work with js config', async () => {
    const StyleDictionaryExtended = new StyleDictionary('__tests__/__configs/test.js');
    await StyleDictionaryExtended.buildAllPlatforms();
    expect(fileExists('__tests__/__output/web/_icons.css')).to.be.true;
    expect(fileExists('__tests__/__output/android/colors.xml')).to.be.true;
  }).timeout(20000);

  it('should work with volume override', async () => {
    const vol1 = new memfs.Volume();
    vol1.mkdirSync('__tests__/__tokens', { recursive: true });
    vol1.writeFileSync(
      '__tests__/__tokens/colors.json',
      fs.readFileSync('__tests__/__tokens/colors.json', 'utf-8'),
      'utf-8',
    );
    const sd1 = new StyleDictionary(
      {
        source: ['__tests__/__tokens/colors.json'],
        platforms: {
          web: {
            transformGroup: css,
            buildPath: '__tests__/__output/css/',
            files: [
              {
                destination: 'vars1.css',
                format: cssVariables,
              },
            ],
          },
        },
      },
      { volume: vol1 },
    );
    await sd1.buildAllPlatforms();

    const vol2 = new memfs.Volume();
    vol2.mkdirSync('__tests__/__tokens', { recursive: true });
    vol2.writeFileSync(
      '__tests__/__tokens/colors.json',
      fs.readFileSync('__tests__/__tokens/colors.json', 'utf-8'),
      'utf-8',
    );
    const sd2 = new StyleDictionary(
      {
        source: ['__tests__/__tokens/colors.json'],
        platforms: {
          web: {
            transformGroup: css,
            buildPath: '__tests__/__output/css/',
            files: [
              {
                destination: 'vars2.css',
                format: cssVariables,
              },
            ],
          },
        },
      },
      { volume: vol2 },
    );
    await sd2.buildAllPlatforms();
    expect(fileExists('__tests__/__output/css/vars1.css', vol1)).to.be.true;
    expect(fileExists('__tests__/__output/css/vars2.css', vol1)).to.be.false;
    expect(fileExists('__tests__/__output/css/vars1.css', vol2)).to.be.false;
    expect(fileExists('__tests__/__output/css/vars2.css', vol2)).to.be.true;
  });
});
