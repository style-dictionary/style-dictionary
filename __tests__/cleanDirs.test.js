import { expect } from 'chai';
import { clearOutput, dirExists } from './__helpers.js';
import cleanFiles from '../lib/cleanFiles.js';
import cleanDirs from '../lib/cleanDirs.js';
import StyleDictionary from '../lib/StyleDictionary.js';

const dictionary = {
  tokens: {
    foo: 'bar',
  },
};

const platform = {
  files: [
    {
      destination: '__tests__/__output/extradir1/extradir2/extradir1/extradir2/test.json',
      format: 'foo',
    },
  ],
};

const platformWithBuildPath = {
  buildPath: '__tests__/__output/extradir1/extradir2/',
  files: [
    {
      destination: 'test.json',
      format: 'foo',
    },
  ],
};

describe('cleanDirs', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should delete without buildPath', async () => {
    const sd = new StyleDictionary({
      hooks: {
        formats: {
          foo: (dictionary) => JSON.stringify(dictionary.tokens),
        },
      },
      tokens: dictionary.tokens,
      platforms: {
        bar: platform,
      },
    });
    await sd.buildAllPlatforms();
    await cleanFiles(platform);
    await cleanDirs(platform);
    expect(dirExists('__tests__/__output/extradir1/extradir2')).to.be.false;
    expect(dirExists('__tests__/__output/extradir1')).to.be.false;
  });

  it('should delete with buildPath', async () => {
    const sd = new StyleDictionary({
      hooks: {
        formats: {
          foo: (dictionary) => JSON.stringify(dictionary.tokens),
        },
      },
      tokens: dictionary.tokens,
      platforms: {
        bar: platformWithBuildPath,
      },
    });
    await sd.buildAllPlatforms();
    await cleanFiles(platformWithBuildPath);
    await cleanDirs(platformWithBuildPath);
    expect(dirExists('__tests__/__output/extradir1/extradir2')).to.be.false;
    expect(dirExists('__tests__/t__/__output/extradir1')).to.be.false;
  });
});
