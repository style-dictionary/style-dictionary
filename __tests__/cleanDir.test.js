import { expect } from 'chai';
import { clearOutput, dirExists } from './__helpers.js';
import StyleDictionary from '../lib/StyleDictionary.js';
import cleanFile from '../lib/cleanFile.js';
import cleanDir from '../lib/cleanDir.js';

describe('cleanDir', () => {
  beforeEach(() => {
    clearOutput();
  });

  afterEach(() => {
    clearOutput();
  });

  it('should delete a dir properly', async () => {
    const file = { destination: 'test.txt', format: 'foo' };
    const buildPath = '__tests__/__output/extradir1/extradir2/';
    const sd = new StyleDictionary({
      hooks: {
        formats: {
          foo: () => 'foo',
        },
      },
      platforms: {
        foo: {
          buildPath,
          files: [file],
        },
      },
    });
    await sd.buildPlatform('foo');
    await cleanFile(file, { buildPath });
    await cleanDir(file, { buildPath });
    expect(dirExists(buildPath)).to.be.false;
    expect(dirExists('__tests__/__output/extradir1')).to.be.false;
  });
});
